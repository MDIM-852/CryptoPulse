export type UserRole = 'user' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_disabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CoinMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  sparkline_in_7d?: {
    price: number[];
  };
  last_updated: string;
  // Dynamic live fields updated via Binance WebSocket
  live_price?: number;
  price_flash?: 'up' | 'down' | null;
}

export interface LiveTickerUpdate {
  symbol: string; // e.g. BTCUSDT
  price: number;
  priceChangePercent: number;
  timestamp: number;
}

export type TransactionType = 'BUY' | 'SELL';

export interface Transaction {
  id: string;
  user_id: string;
  coin_id: string;
  coin_symbol: string;
  coin_name: string;
  type: TransactionType;
  amount: number;
  price_per_unit: number;
  transaction_date: string;
  notes?: string;
  created_at: string;
}

export interface PortfolioHolding {
  coin_id: string;
  coin_symbol: string;
  coin_name: string;
  coin_image?: string;
  total_amount: number;
  total_invested: number;
  average_buy_price: number;
  current_price: number;
  current_value: number;
  total_pnl: number;
  total_pnl_percentage: number;
  allocation_percentage: number;
  realized_pnl: number;
}

export interface PortfolioSummary {
  total_value: number;
  total_invested: number;
  total_pnl: number;
  total_pnl_percentage: number;
  realized_pnl: number;
  unrealized_pnl: number;
  best_performer?: {
    name: string;
    symbol: string;
    pnl_percentage: number;
  };
  worst_performer?: {
    name: string;
    symbol: string;
    pnl_percentage: number;
  };
}

export type AlertCondition = 'ABOVE' | 'BELOW';

export interface PriceAlert {
  id: string;
  user_id: string;
  coin_id: string;
  coin_symbol: string;
  coin_name: string;
  target_price: number;
  condition: AlertCondition;
  is_active: boolean;
  is_triggered: boolean;
  triggered_at: string | null;
  created_at: string;
}

export interface WatchlistItem {
  id: string;
  user_id: string;
  coin_id: string;
  coin_symbol: string;
  coin_name: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  action: string;
  details: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

export interface OnlineUserPresence {
  user_id: string;
  email: string;
  full_name: string;
  role: UserRole;
  online_at: string;
}
