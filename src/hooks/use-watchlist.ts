'use client';

import { useState, useEffect, useCallback } from 'react';
import { WatchlistItem, CoinMarketData } from '@/types';
import { useAuth } from '@/context/auth-context';
import { createClient } from '@/lib/supabase/client';
import { INITIAL_WATCHLIST } from '@/lib/supabase/mock-store';
import { toast } from 'sonner';

const STORAGE_KEY_WATCHLIST = 'cryptopulse_watchlist';

export function useWatchlist() {
  const { user, isConfigured } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load Watchlist
  useEffect(() => {
    async function load() {
      if (!user) {
        setWatchlist([]);
        setIsLoading(false);
        return;
      }

      if (isConfigured) {
        const supabase = createClient();
        if (supabase) {
          try {
            const { data, error } = await supabase
              .from('watchlists')
              .select('*')
              .eq('user_id', user.id);

            if (!error && data) {
              setWatchlist(data as WatchlistItem[]);
              setIsLoading(false);
              return;
            }
          } catch (err) {
            console.warn('Failed to load Supabase watchlist:', err);
          }
        }
      }

      // Local storage fallback
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(`${STORAGE_KEY_WATCHLIST}_${user.id}`);
        if (stored) {
          try {
            setWatchlist(JSON.parse(stored));
          } catch {
            setWatchlist(INITIAL_WATCHLIST);
          }
        } else {
          setWatchlist(INITIAL_WATCHLIST);
          localStorage.setItem(`${STORAGE_KEY_WATCHLIST}_${user.id}`, JSON.stringify(INITIAL_WATCHLIST));
        }
      }
      setIsLoading(false);
    }

    load();
  }, [user, isConfigured]);

  const toggleWatchlist = useCallback(async (coin: { id: string; symbol: string; name: string }) => {
    if (!user) {
      toast.error('Please log in to manage your watchlist.');
      return;
    }

    const isAlreadySaved = watchlist.some((item) => item.coin_id === coin.id);

    if (isAlreadySaved) {
      // Remove
      if (isConfigured) {
        const supabase = createClient();
        if (supabase) {
          await supabase.from('watchlists').delete().match({ user_id: user.id, coin_id: coin.id });
        }
      }

      const updated = watchlist.filter((item) => item.coin_id !== coin.id);
      setWatchlist(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`${STORAGE_KEY_WATCHLIST}_${user.id}`, JSON.stringify(updated));
      }
      toast.info(`Removed ${coin.name} from watchlist`);
    } else {
      // Add
      const newItem: WatchlistItem = {
        id: `wl-${Date.now()}`,
        user_id: user.id,
        coin_id: coin.id,
        coin_symbol: coin.symbol.toUpperCase(),
        coin_name: coin.name,
        created_at: new Date().toISOString(),
      };

      if (isConfigured) {
        const supabase = createClient();
        if (supabase) {
          const { data } = await supabase.from('watchlists').insert([
            {
              user_id: user.id,
              coin_id: coin.id,
              coin_symbol: coin.symbol.toUpperCase(),
              coin_name: coin.name,
            }
          ]).select().single();
          if (data) newItem.id = data.id;
        }
      }

      const updated = [...watchlist, newItem];
      setWatchlist(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`${STORAGE_KEY_WATCHLIST}_${user.id}`, JSON.stringify(updated));
      }
      toast.success(`Added ${coin.name} to watchlist`);
    }
  }, [user, watchlist, isConfigured]);

  const isWatchlisted = useCallback(
    (coinId: string) => watchlist.some((item) => item.coin_id === coinId),
    [watchlist]
  );

  return {
    watchlist,
    isLoading,
    toggleWatchlist,
    isWatchlisted,
  };
}
