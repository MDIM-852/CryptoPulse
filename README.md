# ⚡ CryptoPulse — Real-Time Cryptocurrency Portfolio & Terminal

A complete, production-ready cryptocurrency management web application built from the ground up using **100% free-tier services and open-source tools**. Optimized for Apple Silicon (M2/M3/M1) macOS and ready for 1-click deployment to Vercel.

---

## 🚀 Live Tech Stack (100% Free)

| Layer | Technology | Free Tier Details |
|---|---|---|
| **Framework** | [Next.js 14+ (App Router)](https://nextjs.org/) + TypeScript | Free & Open Source |
| **Styling & UI** | [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) + Lucide Icons | Free & Open Source |
| **Charts** | [Recharts](https://recharts.org/) (Donut Allocation, Area simulations, Sparklines) | Free & Open Source |
| **Auth & Database** | [Supabase](https://supabase.com/) (PostgreSQL, Auth, RLS, Realtime Presence) | Free Tier (500MB DB, 50k MAU) |
| **Market Data** | [CoinGecko Free API](https://www.coingecko.com/en/api) | Free Public API (No credit card) |
| **Live Streaming** | [Binance Public WebSocket](https://stream.binance.com:9443) | Free Public Stream (No API key needed) |
| **Spot Execution** | [Binance Spot Testnet](https://testnet.binance.vision) | Free sandbox testing (Zero risk) |
| **Fiat On-Ramp** | [Transak](https://transak.com/) & [MoonPay](https://moonpay.com/) Sandbox | Free non-custodial widgets |
| **AI Intelligence** | [Google Gemini Free API](https://aistudio.google.com/) | 60 RPM Free Tier for Market Catalyst Analysis |
| **Deployment** | [Vercel](https://vercel.com/) | Free Hobby Tier |

---

## 🔒 Security & Trading Architecture

```text
[Browser / Frontend]
       │
       │ (1) Sends order parameters only { symbol, side, type, quantity, price }
       ▼
[Server Route: /api/trade/execute]
       │
       ├─► (2) Authenticates user via Supabase session cookie
       ├─► (3) Verifies Global Kill Switch is OFF (Active = HTTP 503 Halt)
       ├─► (4) Validates order shape via Zod (symbol format, positive qty, limit price)
       ├─► (5) Queries user_exchange_keys from DB by authenticated user_id
       ├─► (6) Decrypts API secret server-side using AES-256-GCM (ENCRYPTION_SECRET)
       ├─► (7) Dispatches HMAC-SHA256 signed order to Binance Spot Testnet
       ▼
[Binance Spot Testnet API]
       │
       ▼ (8) Safe order response returned to client (secrets never logged or returned)
[Browser UI Notification & Trade History Update]
```

### Key Security Guarantees:
1. **Zero Secret Leakage**: The frontend never receives, stores, or transmits exchange API secrets or masked placeholders.
2. **Non-Custodial Protection**: During key registration (`/api/trade/keys`), the server checks `canWithdraw` on Binance. Any key with withdrawal permissions enabled is **immediately rejected**.
3. **AES-256-GCM Server Encryption**: Exchange secrets are encrypted before persistence with a secure 12-byte IV and 16-byte authentication tag using `ENCRYPTION_SECRET` (>= 32 characters).
4. **Row Level Security (RLS)**: PostgreSQL tables (`profiles`, `portfolios`, `transactions`, `alerts`, `user_exchange_keys`) enforce that users can only read and write their own data.
5. **Admin-Only Global Kill Switch**: Halts platform trading server-side with strict `requireAdmin` role verification.

---

## 💎 Core Capabilities

### 1. Non-Custodial Buy & Trade Module
- **Mode 1 — Paper Trading (Default)**: Virtual $10,000 USDT balance, buy/sell at live market/limit prices with full P&L tracking.
- **Mode 2 — Binance Spot Testnet**: Connect trade-only API keys (encrypted server-side with AES-256-GCM). *Withdrawal permission is strictly verified and rejected to ensure non-custodial safety*.
- **Mode 3 — Fiat On-Ramp Sandbox**: Transak & MoonPay sandbox widgets for card/Apple Pay integration where KYC and payments are handled by regulated providers.
- **Order Confirmation Modal**: Complete breakdown of amounts, 0.1% fees, estimated slippage, risk disclaimers, and Emotion Tags.
- **Admin Global Kill-Switch**: One-click platform-wide trading halt toggle in Admin Terminal.

### 2. Differentiating Features (Insights Hub)
1. **Regret Guard**: FOMO check before buy orders when an asset is up >8% in 24h, offering a 10-minute cooling-off timer or explicit thesis override.
2. **Time Machine Simulator**: "What if I had bought $X on date Y?" calculator with interactive sliders and "What if I had DCA'd $X/mo" simulator.
3. **Explain the Move**: Plain-English AI market catalyst explainer analyzing news RSS feeds, on-chain dynamics, and cited headlines.
4. **Portfolio Risk Pulse**: 0-100 quantitative risk rating based on Herfindahl concentration, asset beta, and volatility, plus 1-click smart rebalance recommendations.
5. **Trade Journal with Emotion Tags**: Tag trades with `Calm`, `FOMO`, `Panic`, `Conviction`, `Greed`, or `Disciplined` to uncover which psychological moods generate your best and worst outcomes.
6. **Smart Multi-Condition Alerts**: Compound rules combining price thresholds with portfolio allocation % or 24h momentum.
7. **Privacy-Safe Share Links (`/share/[slug]`)**: Read-only public showcase displaying percentage returns and allocation % while strictly obfuscating dollar balances and trade sizes.
8. **Auto Tax-Lot Tracker**: Real-time FIFO, LIFO, and HIFO cost-basis matcher with short/long-term capital gains calculation and 1-click IRS Form 8949 CSV export.

---

## 💻 Step-by-Step Setup for macOS (Apple Silicon M2)

### 1. Prerequisites
Ensure you have Node.js 18+ and npm installed:
```bash
node -v
npm -v
```

### 2. Configure Environment Variables
Copy the template and configure your secrets:
```bash
cp .env.example .env.local
```

Edit `.env.local` and configure:
- `ENCRYPTION_SECRET`: Set to any random 32+ character string (e.g. run `openssl rand -hex 32`).
- `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (Optional for local demo mode, required for Supabase live persistence).
- `GEMINI_API_KEY`: (Optional, for live Gemini market catalyst explanations).

### 3. Apply Supabase Database Schema (When using Supabase)
Open the SQL Editor in your Supabase project dashboard and execute the entire contents of:
```
src/lib/supabase/schema.sql
```
This sets up:
- Tables: `profiles`, `portfolios`, `transactions`, `alerts`, `user_exchange_keys`
- RLS Policies for secure multi-tenant isolation
- Seed data with initial market assets

### 4. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

- Instant Demo Access: Click **Admin Demo** (`admin@cryptopulse.io`) or **User Demo** (`user@cryptopulse.io`) to test all features with simulated demo data and role enforcement without needing Supabase configuration.

---

## 🧪 Automated Verification Suite

Run TypeScript validation, code linting, unit tests, and the production build:

```bash
# 1. Type Check
npx tsc --noEmit

# 2. Lint Check
npm run lint

# 3. Unit Tests (Vitest)
npm test

# 4. Production Next.js Build
npm run build
```

---

## 🚢 Deploying to Vercel (Free Tier)

1. Push your repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Add the environment variables from `.env.local` in the Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ENCRYPTION_SECRET`
   - `NEXT_PUBLIC_APP_URL`
4. Click **Deploy**.
