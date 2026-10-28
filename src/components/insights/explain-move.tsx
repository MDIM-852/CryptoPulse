'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import { CoinMarketData } from '@/types';
import { Sparkles, TrendingUp, TrendingDown, ExternalLink, Newspaper, Zap, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface ExplainMoveProps {
  coins: CoinMarketData[];
}

interface CatalystResponse {
  coinName: string;
  symbol: string;
  change24h: number;
  summary: string;
  sentiment: string;
  primaryDriver: string;
  headlines: { title: string; source: string; url: string; published: string }[];
}

export function ExplainMove({ coins }: ExplainMoveProps) {
  const [selectedCoinId, setSelectedCoinId] = useState<string>('bitcoin');
  const [catalystData, setCatalystData] = useState<CatalystResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const currentCoin = coins.find((c) => c.id === selectedCoinId) || coins[0];
  const livePrice = currentCoin?.live_price ?? currentCoin?.current_price ?? 0;
  const change24h = currentCoin?.price_change_percentage_24h || 0;
  const isPositive = change24h >= 0;

  const handleAnalyzeMove = async (coin: CoinMarketData) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/explain-move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coinName: coin.name,
          symbol: coin.symbol.toUpperCase(),
          change24h: coin.price_change_percentage_24h || 0,
          currentPrice: coin.live_price ?? coin.current_price,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setCatalystData(data);
      } else {
        toast.error('Failed to generate analysis');
      }
    } catch (err) {
      toast.error('Network error requesting explanation');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-analyze first time
  React.useEffect(() => {
    if (currentCoin && !catalystData) {
      handleAnalyzeMove(currentCoin);
    }
  }, [currentCoin]);

  return (
    <Card className="bg-card/70 border-border/80 shadow-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">Explain the Move</CardTitle>
              <CardDescription className="text-xs">
                Plain-English explanation of market catalysts, on-chain dynamics, and news headlines.
              </CardDescription>
            </div>
          </div>

          {/* Quick Coin Picker */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-md">
            {coins.slice(0, 5).map((c) => (
              <Button
                key={c.id}
                variant={selectedCoinId === c.id ? 'default' : 'outline'}
                size="sm"
                className="h-8 text-xs font-mono shrink-0"
                onClick={() => {
                  setSelectedCoinId(c.id);
                  handleAnalyzeMove(c);
                }}
              >
                {c.symbol.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Active Coin Header */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40 border">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">{currentCoin?.name}</h3>
                <Badge variant="outline" className="font-mono text-xs uppercase">
                  {currentCoin?.symbol}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                Current: {formatCurrency(livePrice)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                isPositive
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              }`}
            >
              {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {formatPercentage(change24h)} (24h)
            </span>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleAnalyzeMove(currentCoin)}
              disabled={isLoading}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* AI Catalyst Analysis Box */}
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground space-y-2">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-primary" />
            <p className="text-xs">Analyzing news feeds, on-chain volume, and market catalysts...</p>
          </div>
        ) : catalystData ? (
          <div className="space-y-4">
            {/* Catalyst Summary */}
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-primary uppercase tracking-wide flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5" /> Key Driver: {catalystData.primaryDriver}
                </span>
                <Badge variant="secondary" className="text-[10px]">
                  {catalystData.sentiment}
                </Badge>
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                {catalystData.summary}
              </p>
            </div>

            {/* Cited News Headlines */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                <Newspaper className="h-3.5 w-3.5" /> Cited Market Headlines
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {catalystData.headlines.map((item, idx) => (
                  <a
                    key={idx}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl border bg-card/60 hover:bg-muted/50 transition-colors space-y-1 block group"
                  >
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span className="font-semibold text-primary">{item.source}</span>
                      <span>{item.published}</span>
                    </div>
                    <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {item.title}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
