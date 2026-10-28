'use client';

import { useQuery } from '@tanstack/react-query';
import { CoinMarketData } from '@/types';
import { useBinanceTicker } from './use-binance-ticker';
import { useMemo } from 'react';

async function fetchCoins(): Promise<CoinMarketData[]> {
  const res = await fetch('/api/coins');
  if (!res.ok) {
    throw new Error('Failed to fetch cryptocurrency data');
  }
  return res.json();
}

export function useCoins() {
  const { data: baseCoins, isLoading, error, refetch } = useQuery<CoinMarketData[]>({
    queryKey: ['crypto-coins-top50'],
    queryFn: fetchCoins,
    staleTime: 45 * 1000, // 45 seconds
    refetchInterval: 60 * 1000, // Polling fallback refresh
  });

  const { tickerMap, status: wsStatus, lastMessageTime, reconnect } = useBinanceTicker();

  // Merge CoinGecko metadata with live Binance WebSocket updates
  const coins: CoinMarketData[] = useMemo(() => {
    if (!baseCoins || !Array.isArray(baseCoins)) return [];

    return baseCoins.map((coin) => {
      const live = tickerMap[coin.symbol.toLowerCase()];
      if (!live) return coin;

      return {
        ...coin,
        live_price: live.price,
        price_flash: live.flash,
        // Override 24h change with live calculated % if available
        price_change_percentage_24h:
          live.priceChangePercent !== undefined && !isNaN(live.priceChangePercent)
            ? live.priceChangePercent
            : coin.price_change_percentage_24h,
      };
    });
  }, [baseCoins, tickerMap]);

  return {
    coins,
    isLoading,
    error,
    refetch,
    wsStatus,
    lastMessageTime,
    reconnectWs: reconnect,
    tickerMap,
  };
}
