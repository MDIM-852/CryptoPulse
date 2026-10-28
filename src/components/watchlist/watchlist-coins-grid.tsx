'use client';

import React from 'react';
import Image from 'next/image';
import { WatchlistItem, CoinMarketData } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FlashPrice } from '@/components/market/flash-price';
import { Sparkline } from '@/components/market/sparkline';
import { formatPercentage, formatCompactCurrency } from '@/lib/formatters';
import { Star, TrendingUp, TrendingDown, Bell, PlusCircle } from 'lucide-react';

interface WatchlistCoinsGridProps {
  watchlist: WatchlistItem[];
  coins: CoinMarketData[];
  onToggleWatchlist: (coin: { id: string; symbol: string; name: string }) => void;
  onOpenAlertModal: (coin: CoinMarketData) => void;
  onOpenTradeModal: (coin: CoinMarketData) => void;
}

export function WatchlistCoinsGrid({
  watchlist,
  coins,
  onToggleWatchlist,
  onOpenAlertModal,
  onOpenTradeModal,
}: WatchlistCoinsGridProps) {
  const coinMap = new Map<string, CoinMarketData>();
  coins.forEach((c) => coinMap.set(c.id.toLowerCase(), c));

  const watchlistedCoins = watchlist
    .map((w) => coinMap.get(w.coin_id.toLowerCase()))
    .filter(Boolean) as CoinMarketData[];

  if (watchlistedCoins.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground border rounded-2xl bg-card/40">
        <Star className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
        <p className="text-base font-semibold text-foreground">Your watchlist is empty</p>
        <p className="text-xs text-muted-foreground mt-1">
          Click the star icon next to any coin on the Market Dashboard to track it here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {watchlistedCoins.map((coin) => {
        const livePrice = coin.live_price ?? coin.current_price;
        const change24h = coin.price_change_percentage_24h || 0;
        const isPositive = change24h >= 0;

        return (
          <Card
            key={coin.id}
            className="bg-card/70 border-border/80 hover:border-primary/40 transition-all shadow-sm hover:shadow-md group"
          >
            <CardContent className="p-4 space-y-4">
              {/* Top Row: Coin Info + Star */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative h-9 w-9 rounded-full overflow-hidden bg-muted flex-shrink-0">
                    {coin.image ? (
                      <Image
                        src={coin.image}
                        alt={coin.name}
                        fill
                        sizes="36px"
                        className="object-contain"
                        unoptimized
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center font-bold text-xs">
                        {coin.symbol[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm leading-tight">{coin.name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Badge variant="outline" className="text-[10px] uppercase font-mono px-1 py-0 h-4">
                        {coin.symbol}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        #{coin.market_cap_rank || '—'}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() =>
                    onToggleWatchlist({
                      id: coin.id,
                      symbol: coin.symbol,
                      name: coin.name,
                    })
                  }
                  className="p-1.5 rounded-lg hover:bg-muted text-amber-400"
                  title="Remove from Watchlist"
                >
                  <Star className="h-4 w-4 fill-amber-400" />
                </button>
              </div>

              {/* Middle Row: Price & 24h Change */}
              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <FlashPrice
                    price={livePrice}
                    flash={coin.price_flash}
                    className="text-xl font-bold font-mono"
                  />
                  <div className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                    MCap: {formatCompactCurrency(coin.market_cap)}
                  </div>
                </div>

                <div
                  className={`flex items-center gap-0.5 px-2 py-1 rounded-lg text-xs font-mono font-bold ${
                    isPositive
                      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                      : 'text-rose-600 dark:text-rose-400 bg-rose-500/10'
                  }`}
                >
                  {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  {formatPercentage(change24h)}
                </div>
              </div>

              {/* Sparkline */}
              <div className="py-1">
                <Sparkline
                  data={coin.sparkline_in_7d?.price}
                  isPositive={isPositive}
                  width={240}
                  height={40}
                />
              </div>

              {/* Bottom Quick Actions */}
              <div className="flex items-center gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 text-xs gap-1.5"
                  onClick={() => onOpenTradeModal(coin)}
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  Trade
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 text-xs gap-1.5"
                  onClick={() => onOpenAlertModal(coin)}
                >
                  <Bell className="h-3.5 w-3.5" />
                  Alert
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
