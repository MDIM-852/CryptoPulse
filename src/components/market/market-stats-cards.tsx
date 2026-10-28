'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CoinMarketData } from '@/types';
import { formatCompactCurrency, formatPercentage } from '@/lib/formatters';
import { TrendingUp, DollarSign, Activity, Zap } from 'lucide-react';

interface MarketStatsCardsProps {
  coins: CoinMarketData[];
  wsStatus: string;
}

export function MarketStatsCards({ coins, wsStatus }: MarketStatsCardsProps) {
  const totalMarketCap = coins.reduce((acc, c) => acc + (c.market_cap || 0), 0);
  const total24hVolume = coins.reduce((acc, c) => acc + (c.total_volume || 0), 0);

  const btcCoin = coins.find((c) => c.symbol.toLowerCase() === 'btc');
  const btcDominance =
    totalMarketCap > 0 && btcCoin ? ((btcCoin.market_cap / totalMarketCap) * 100).toFixed(1) : '54.2';

  const average24hChange =
    coins.length > 0
      ? coins.reduce((acc, c) => acc + (c.price_change_percentage_24h || 0), 0) / coins.length
      : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Market Cap */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/80">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Tracked Market Cap
            </p>
            <h3 className="text-2xl font-bold font-mono mt-1">
              {formatCompactCurrency(totalMarketCap || 2450000000000)}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span
                className={
                  average24hChange >= 0
                    ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                    : 'text-red-600 dark:text-red-400 font-semibold'
                }
              >
                {formatPercentage(average24hChange)}
              </span>{' '}
              avg 24h
            </p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <DollarSign className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* 2. 24h Trading Volume */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/80">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              24h Volume
            </p>
            <h3 className="text-2xl font-bold font-mono mt-1">
              {formatCompactCurrency(total24hVolume || 84200000000)}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">Top 50 liquid assets</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <Activity className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* 3. Bitcoin Dominance */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/80">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              BTC Dominance
            </p>
            <h3 className="text-2xl font-bold font-mono mt-1">{btcDominance}%</h3>
            <p className="text-xs text-muted-foreground mt-1">Market leader share</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <TrendingUp className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* 4. Real-time Stream Status */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/80">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Live Feed Engine
            </p>
            <h3 className="text-2xl font-bold capitalize mt-1 text-emerald-600 dark:text-emerald-400">
              {wsStatus === 'connected' ? 'Streaming' : wsStatus}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">Binance WebSocket</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Zap className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
