'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { LiveTickerUpdate } from '@/types';

export type TickerStatus = 'connected' | 'connecting' | 'disconnected' | 'reconnecting' | 'polling';

interface LivePriceRecord {
  price: number;
  prevPrice: number;
  priceChangePercent: number;
  flash: 'up' | 'down' | null;
  lastUpdated: number;
}

export function useBinanceTicker() {
  const [tickerMap, setTickerMap] = useState<Record<string, LivePriceRecord>>({});
  const [status, setStatus] = useState<TickerStatus>('connecting');
  const [lastMessageTime, setLastMessageTime] = useState<number | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef<number>(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const flashTimers = useRef<Record<string, NodeJS.Timeout>>({});
  const isUnmounted = useRef<boolean>(false);

  // Clear all flash timers on unmount
  const clearFlashTimers = useCallback(() => {
    Object.values(flashTimers.current).forEach((timer) => clearTimeout(timer));
    flashTimers.current = {};
  }, []);

  const connect = useCallback(() => {
    if (isUnmounted.current) return;

    try {
      // Connect to Binance's all-market mini-ticker array stream
      // Format: wss://stream.binance.com:9443/ws/!miniTicker@arr
      const wsUrl = 'wss://stream.binance.com:9443/ws/!miniTicker@arr';
      setStatus(reconnectAttempts.current > 0 ? 'reconnecting' : 'connecting');

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (isUnmounted.current) return;
        setStatus('connected');
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        if (isUnmounted.current) return;
        try {
          const rawData = JSON.parse(event.data);
          if (!Array.isArray(rawData)) return;

          const now = Date.now();
          setLastMessageTime(now);

          setTickerMap((prev) => {
            const next = { ...prev };

            for (const item of rawData) {
              // item.s: Symbol (e.g., BTCUSDT)
              // item.c: Close price (current price)
              // item.o: Open price (24h)
              const symbol: string = item.s;
              if (!symbol.endsWith('USDT')) continue;

              const cleanSymbol = symbol.replace('USDT', '').toLowerCase();
              const newPrice = parseFloat(item.c);
              const openPrice = parseFloat(item.o);
              const priceChangePercent = openPrice > 0 ? ((newPrice - openPrice) / openPrice) * 100 : 0;

              const existing = prev[cleanSymbol];
              let flash: 'up' | 'down' | null = null;

              if (existing && existing.price !== newPrice) {
                flash = newPrice > existing.price ? 'up' : 'down';

                // Clear previous timer for this symbol
                if (flashTimers.current[cleanSymbol]) {
                  clearTimeout(flashTimers.current[cleanSymbol]);
                }

                // Reset flash after 1200ms
                flashTimers.current[cleanSymbol] = setTimeout(() => {
                  setTickerMap((current) => {
                    if (current[cleanSymbol]) {
                      return {
                        ...current,
                        [cleanSymbol]: { ...current[cleanSymbol], flash: null },
                      };
                    }
                    return current;
                  });
                }, 1200);
              }

              next[cleanSymbol] = {
                price: newPrice,
                prevPrice: existing ? existing.price : newPrice,
                priceChangePercent,
                flash: flash ?? (existing ? existing.flash : null),
                lastUpdated: now,
              };
            }

            return next;
          });
        } catch (err) {
          console.warn('Error parsing Binance ticker packet:', err);
        }
      };

      ws.onerror = (err) => {
        console.warn('Binance WebSocket error, preparing reconnect:', err);
      };

      ws.onclose = (event) => {
        if (isUnmounted.current) return;
        setStatus('disconnected');

        // Automatic exponential backoff reconnection up to 10 attempts
        if (reconnectAttempts.current < 10) {
          const delay = Math.min(1000 * Math.pow(1.5, reconnectAttempts.current), 15000);
          reconnectAttempts.current += 1;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          // Fallback to polling mode
          setStatus('polling');
        }
      };
    } catch (err) {
      console.warn('Failed to initiate Binance WebSocket:', err);
      setStatus('polling');
    }
  }, []);

  useEffect(() => {
    isUnmounted.current = false;
    connect();

    return () => {
      isUnmounted.current = true;
      clearFlashTimers();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect, clearFlashTimers]);

  return {
    tickerMap,
    status,
    lastMessageTime,
    reconnect: () => {
      reconnectAttempts.current = 0;
      connect();
    },
  };
}
