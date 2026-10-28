'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { PriceAlert, CoinMarketData } from '@/types';
import { useAuth } from '@/context/auth-context';
import { createClient } from '@/lib/supabase/client';
import { INITIAL_PRICE_ALERTS } from '@/lib/supabase/mock-store';
import { formatCurrency } from '@/lib/formatters';
import { toast } from 'sonner';

const STORAGE_KEY_ALERTS = 'cryptopulse_price_alerts';

export function useAlerts(coins: CoinMarketData[]) {
  const { user, isConfigured } = useAuth();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const notifiedAlertIds = useRef<Set<string>>(new Set());

  // Load Alerts
  useEffect(() => {
    async function loadAlerts() {
      if (!user) {
        setAlerts([]);
        setIsLoading(false);
        return;
      }

      if (isConfigured) {
        const supabase = createClient();
        if (supabase) {
          try {
            const { data, error } = await supabase
              .from('price_alerts')
              .select('*')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false });

            if (!error && data) {
              setAlerts(data as PriceAlert[]);
              setIsLoading(false);
              return;
            }
          } catch (err) {
            console.warn('Failed to load Supabase price alerts:', err);
          }
        }
      }

      // Local storage fallback
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(`${STORAGE_KEY_ALERTS}_${user.id}`);
        if (stored) {
          try {
            setAlerts(JSON.parse(stored));
          } catch {
            setAlerts(INITIAL_PRICE_ALERTS);
          }
        } else {
          setAlerts(INITIAL_PRICE_ALERTS);
          localStorage.setItem(`${STORAGE_KEY_ALERTS}_${user.id}`, JSON.stringify(INITIAL_PRICE_ALERTS));
        }
      }
      setIsLoading(false);
    }

    loadAlerts();
  }, [user, isConfigured]);

  const persistAlerts = useCallback((updated: PriceAlert[]) => {
    setAlerts(updated);
    if (user && typeof window !== 'undefined') {
      localStorage.setItem(`${STORAGE_KEY_ALERTS}_${user.id}`, JSON.stringify(updated));
    }
  }, [user]);

  // Create new Price Alert
  const createAlert = async (data: {
    coin_id: string;
    coin_symbol: string;
    coin_name: string;
    target_price: number;
    condition: 'ABOVE' | 'BELOW';
  }) => {
    if (!user) {
      toast.error('Please log in to set price alerts.');
      return;
    }

    const newAlert: PriceAlert = {
      id: `alt-${Date.now()}`,
      user_id: user.id,
      coin_id: data.coin_id,
      coin_symbol: data.coin_symbol.toUpperCase(),
      coin_name: data.coin_name,
      target_price: data.target_price,
      condition: data.condition,
      is_active: true,
      is_triggered: false,
      triggered_at: null,
      created_at: new Date().toISOString(),
    };

    if (isConfigured) {
      const supabase = createClient();
      if (supabase) {
        const { data: inserted, error } = await supabase.from('price_alerts').insert([
          {
            user_id: user.id,
            coin_id: data.coin_id,
            coin_symbol: data.coin_symbol.toUpperCase(),
            coin_name: data.coin_name,
            target_price: data.target_price,
            condition: data.condition,
          }
        ]).select().single();

        if (error) {
          toast.error(`Error saving alert: ${error.message}`);
          return;
        }
        if (inserted) {
          newAlert.id = inserted.id;
        }
      }
    }

    const updated = [newAlert, ...alerts];
    persistAlerts(updated);
    toast.success(
      `Alert created: Notify when ${data.coin_name} is ${data.condition.toLowerCase()} ${formatCurrency(data.target_price)}`
    );
  };

  // Delete Alert
  const deleteAlert = async (id: string) => {
    if (isConfigured) {
      const supabase = createClient();
      if (supabase) {
        await supabase.from('price_alerts').delete().eq('id', id);
      }
    }
    const updated = alerts.filter((a) => a.id !== id);
    persistAlerts(updated);
    toast.info('Price alert deleted');
  };

  // Toggle Alert Active status
  const toggleAlertActive = async (id: string) => {
    const target = alerts.find((a) => a.id === id);
    if (!target) return;

    const nextActive = !target.is_active;

    if (isConfigured) {
      const supabase = createClient();
      if (supabase) {
        await supabase.from('price_alerts').update({ is_active: nextActive }).eq('id', id);
      }
    }

    const updated = alerts.map((a) => (a.id === id ? { ...a, is_active: nextActive } : a));
    persistAlerts(updated);
  };

  // REAL-TIME ALERT MONITOR: Evaluate live prices against active alerts
  useEffect(() => {
    if (!coins.length || !alerts.length) return;

    const priceMap = new Map<string, number>();
    coins.forEach((c) => {
      const current = c.live_price ?? c.current_price;
      priceMap.set(c.id.toLowerCase(), current);
      priceMap.set(c.symbol.toLowerCase(), current);
    });

    let hasUpdates = false;
    const updatedAlerts = alerts.map((alert) => {
      if (!alert.is_active || alert.is_triggered) return alert;

      const livePrice = priceMap.get(alert.coin_id.toLowerCase()) || priceMap.get(alert.coin_symbol.toLowerCase());
      if (livePrice === undefined) return alert;

      let isConditionMet = false;
      if (alert.condition === 'ABOVE' && livePrice >= alert.target_price) {
        isConditionMet = true;
      } else if (alert.condition === 'BELOW' && livePrice <= alert.target_price) {
        isConditionMet = true;
      }

      if (isConditionMet && !notifiedAlertIds.current.has(alert.id)) {
        notifiedAlertIds.current.add(alert.id);
        hasUpdates = true;

        // Trigger in-app notification toast
        toast.warning(
          `🔔 Price Alert Triggered! ${alert.coin_name} (${alert.coin_symbol}) has crossed ${formatCurrency(alert.target_price)} (Current: ${formatCurrency(livePrice)})`,
          {
            duration: 8000,
          }
        );

        return {
          ...alert,
          is_triggered: true,
          is_active: false,
          triggered_at: new Date().toISOString(),
        };
      }

      return alert;
    });

    if (hasUpdates) {
      persistAlerts(updatedAlerts);
    }
  }, [coins, alerts, persistAlerts]);

  return {
    alerts,
    isLoading,
    createAlert,
    deleteAlert,
    toggleAlertActive,
  };
}
