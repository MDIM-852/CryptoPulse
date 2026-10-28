-- ==============================================================================
-- CryptoPulse Complete Supabase PostgreSQL Schema & Security Policies
-- Includes: Profiles, Transactions, Watchlist, Price Alerts, Activity Logs, User Exchange Keys
-- Security: Row Level Security (RLS) with User Isolation & Admin Role Overrides
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create PROFILES table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  is_disabled boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Profiles
alter table public.profiles enable row level security;

-- Profile Policies
create policy "Users can view own profile or admins view all"
  on public.profiles for select
  using (
    auth.uid() = id
    or exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    -- Regular users cannot elevate their role or un-disable themselves
    and (role = (select role from public.profiles where id = auth.uid()))
  );

create policy "Admins can update any profile"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Admins can delete any profile"
  on public.profiles for delete
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Trigger: Automatically create a Profile when a new User signs up via Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    -- First created user can optionally be made admin or default to user
    case
      when not exists (select 1 from public.profiles) then 'admin'
      else 'user'
    end
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. Create TRANSACTIONS table (Portfolio)
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  coin_id text not null, -- e.g. "bitcoin"
  coin_symbol text not null, -- e.g. "BTC"
  coin_name text not null, -- e.g. "Bitcoin"
  type text not null check (type in ('BUY', 'SELL')),
  amount numeric not null check (amount > 0),
  price_per_unit numeric not null check (price_per_unit >= 0),
  transaction_date timestamp with time zone default timezone('utc'::text, now()) not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_transactions_user_id on public.transactions(user_id);
create index if not exists idx_transactions_coin on public.transactions(coin_id);

alter table public.transactions enable row level security;

create policy "Users can manage own transactions"
  on public.transactions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admins can view all transactions"
  on public.transactions for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );


-- 3. Create WATCHLIST table
create table if not exists public.watchlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  coin_id text not null,
  coin_symbol text not null,
  coin_name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, coin_id)
);

create index if not exists idx_watchlists_user on public.watchlists(user_id);

alter table public.watchlists enable row level security;

create policy "Users can manage own watchlist"
  on public.watchlists for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- 4. Create PRICE_ALERTS table
create table if not exists public.price_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  coin_id text not null,
  coin_symbol text not null,
  coin_name text not null,
  target_price numeric not null check (target_price > 0),
  condition text not null check (condition in ('ABOVE', 'BELOW')),
  is_active boolean not null default true,
  is_triggered boolean not null default false,
  triggered_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_price_alerts_user on public.price_alerts(user_id);
create index if not exists idx_price_alerts_active on public.price_alerts(is_active);

alter table public.price_alerts enable row level security;

create policy "Users can manage own price alerts"
  on public.price_alerts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- 5. Create USER_EXCHANGE_KEYS table (Encrypted Exchange API Credentials)
create table if not exists public.user_exchange_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  exchange_name text not null default 'binance_testnet',
  api_key text not null,
  encrypted_api_secret text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, exchange_name)
);

create index if not exists idx_user_exchange_keys_user on public.user_exchange_keys(user_id);

alter table public.user_exchange_keys enable row level security;

-- Strict Isolation: Users can ONLY manage their own exchange credentials
create policy "Users can manage own exchange credentials"
  on public.user_exchange_keys for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- 6. Create ACTIVITY_LOGS table
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  user_email text,
  action text not null,
  details jsonb default '{}'::jsonb,
  ip_address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_activity_logs_created_at on public.activity_logs(created_at desc);

alter table public.activity_logs enable row level security;

create policy "Users can view own activity logs"
  on public.activity_logs for select
  using (auth.uid() = user_id);

create policy "Users and system can insert activity logs"
  on public.activity_logs for insert
  with check (auth.uid() = user_id or auth.uid() is null);

create policy "Admins can view all activity logs"
  on public.activity_logs for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );


-- 7. Supabase Realtime Publication configuration
-- Enable Realtime replication for dynamic updates
alter publication supabase_realtime add table public.price_alerts;
alter publication supabase_realtime add table public.activity_logs;
alter publication supabase_realtime add table public.transactions;
