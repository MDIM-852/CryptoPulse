'use client';

import React from 'react';
import { useCoins } from '@/hooks/use-coins';
import { useWatchlist } from '@/hooks/use-watchlist';
import { usePortfolio } from '@/hooks/use-portfolio';
import { useAlerts } from '@/hooks/use-alerts';
import { MarketStatsCards } from '@/components/market/market-stats-cards';
import { CoinTable } from '@/components/market/coin-table';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { coins, isLoading, error, refetch, wsStatus } = useCoins();
  const { watchlist, toggleWatchlist } = useWatchlist();
  const { addTransaction } = usePortfolio(coins);
  const { createAlert } = useAlerts(coins);

  const watchlistIds = watchlist.map((w) => w.coin_id);

  if (isLoading && coins.length === 0) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (error && coins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="p-4 rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h3 className="text-xl font-bold">Unable to load cryptocurrency markets</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          There was an error connecting to the market data feed. Please try refreshing.
        </p>
        <Button onClick={() => refetch()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry Connection
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Market Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time cryptocurrency prices powered by CoinGecko & Binance WebSocket feeds.
          </p>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <MarketStatsCards coins={coins} wsStatus={wsStatus} />

      {/* Main Table */}
      <CoinTable
        coins={coins}
        watchlistIds={watchlistIds}
        onToggleWatchlist={toggleWatchlist}
        onAddTransaction={addTransaction}
        onCreateAlert={createAlert}
      />
    </div>
  );
}
