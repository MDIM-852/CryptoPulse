'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Transaction, PortfolioHolding, PortfolioSummary, CoinMarketData } from '@/types';
import { useAuth } from '@/context/auth-context';
import { createClient } from '@/lib/supabase/client';
import { INITIAL_TRANSACTIONS } from '@/lib/supabase/mock-store';
import { toast } from 'sonner';

const STORAGE_KEY_TRANSACTIONS = 'cryptopulse_transactions';

export function usePortfolio(coins: CoinMarketData[]) {
  const { user, isConfigured } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load transactions
  useEffect(() => {
    async function loadTransactions() {
      if (!user) {
        setTransactions([]);
        setIsLoading(false);
        return;
      }

      if (isConfigured) {
        const supabase = createClient();
        if (supabase) {
          try {
            const { data, error } = await supabase
              .from('transactions')
              .select('*')
              .eq('user_id', user.id)
              .order('transaction_date', { ascending: false });

            if (!error && data) {
              setTransactions(data as Transaction[]);
              setIsLoading(false);
              return;
            }
          } catch (err) {
            console.warn('Failed to load Supabase transactions:', err);
          }
        }
      }

      // Local storage fallback
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(`${STORAGE_KEY_TRANSACTIONS}_${user.id}`);
        if (stored) {
          try {
            setTransactions(JSON.parse(stored));
          } catch {
            setTransactions(INITIAL_TRANSACTIONS);
          }
        } else {
          setTransactions(INITIAL_TRANSACTIONS);
          localStorage.setItem(`${STORAGE_KEY_TRANSACTIONS}_${user.id}`, JSON.stringify(INITIAL_TRANSACTIONS));
        }
      }
      setIsLoading(false);
    }

    loadTransactions();
  }, [user, isConfigured]);

  // Persist local transactions helper
  const persistTransactions = useCallback((updatedList: Transaction[]) => {
    setTransactions(updatedList);
    if (user && typeof window !== 'undefined') {
      localStorage.setItem(`${STORAGE_KEY_TRANSACTIONS}_${user.id}`, JSON.stringify(updatedList));
    }
  }, [user]);

  // Add transaction
  const addTransaction = async (data: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) {
      toast.error('You must be logged in to add a transaction.');
      return;
    }

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      user_id: user.id,
      ...data,
      created_at: new Date().toISOString(),
    };

    if (isConfigured) {
      const supabase = createClient();
      if (supabase) {
        const { data: inserted, error } = await supabase.from('transactions').insert([
          {
            user_id: user.id,
            coin_id: data.coin_id,
            coin_symbol: data.coin_symbol,
            coin_name: data.coin_name,
            type: data.type,
            amount: data.amount,
            price_per_unit: data.price_per_unit,
            transaction_date: data.transaction_date,
            notes: data.notes || null,
          }
        ]).select().single();

        if (error) {
          toast.error(`Error saving transaction: ${error.message}`);
          return;
        }
        if (inserted) {
          newTx.id = inserted.id;
        }
      }
    }

    const updated = [newTx, ...transactions];
    persistTransactions(updated);
    toast.success(`Added ${data.type} order for ${data.amount} ${data.coin_symbol}`);
  };

  // Delete transaction
  const deleteTransaction = async (id: string) => {
    if (isConfigured) {
      const supabase = createClient();
      if (supabase) {
        const { error } = await supabase.from('transactions').delete().eq('id', id);
        if (error) {
          toast.error(`Failed to delete transaction: ${error.message}`);
          return;
        }
      }
    }

    const updated = transactions.filter((tx) => tx.id !== id);
    persistTransactions(updated);
    toast.success('Transaction removed');
  };

  // Compute live holdings & portfolio analytics
  const { holdings, summary } = useMemo(() => {
    // Map coin prices by coin_id or symbol
    const priceMap = new Map<string, { price: number; image?: string; change24h?: number }>();
    coins.forEach((c) => {
      const livePrice = c.live_price ?? c.current_price;
      priceMap.set(c.id.toLowerCase(), { price: livePrice, image: c.image, change24h: c.price_change_percentage_24h });
      priceMap.set(c.symbol.toLowerCase(), { price: livePrice, image: c.image, change24h: c.price_change_percentage_24h });
    });

    // Group transactions by coin_id
    const grouped: Record<string, {
      coin_id: string;
      coin_symbol: string;
      coin_name: string;
      total_amount: number;
      total_cost: number;
      realized_pnl: number;
    }> = {};

    // Sort chronologically to compute realized PnL correctly
    const chronologicalTxs = [...transactions].sort(
      (a, b) => new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime()
    );

    for (const tx of chronologicalTxs) {
      const cid = tx.coin_id.toLowerCase();
      if (!grouped[cid]) {
        grouped[cid] = {
          coin_id: tx.coin_id,
          coin_symbol: tx.coin_symbol,
          coin_name: tx.coin_name,
          total_amount: 0,
          total_cost: 0,
          realized_pnl: 0,
        };
      }

      const g = grouped[cid];
      if (tx.type === 'BUY') {
        g.total_amount += tx.amount;
        g.total_cost += tx.amount * tx.price_per_unit;
      } else if (tx.type === 'SELL') {
        const avgCost = g.total_amount > 0 ? g.total_cost / g.total_amount : 0;
        const sellProfit = (tx.price_per_unit - avgCost) * tx.amount;
        g.realized_pnl += sellProfit;

        g.total_amount = Math.max(0, g.total_amount - tx.amount);
        g.total_cost = Math.max(0, g.total_cost - avgCost * tx.amount);
      }
    }

    // Build Holdings list
    const holdingsList: PortfolioHolding[] = [];
    let totalPortfolioValue = 0;
    let totalPortfolioInvested = 0;
    let totalRealizedPnL = 0;

    for (const key in grouped) {
      const g = grouped[key];
      totalRealizedPnL += g.realized_pnl;

      if (g.total_amount <= 0.000001) continue; // Skip liquidated positions

      const marketInfo = priceMap.get(g.coin_id.toLowerCase()) || priceMap.get(g.coin_symbol.toLowerCase());
      const currentPrice = marketInfo?.price ?? (g.total_cost / g.total_amount);
      const currentValue = g.total_amount * currentPrice;
      const avgBuyPrice = g.total_amount > 0 ? g.total_cost / g.total_amount : 0;
      const totalPnL = currentValue - g.total_cost;
      const totalPnLPercentage = g.total_cost > 0 ? (totalPnL / g.total_cost) * 100 : 0;

      totalPortfolioValue += currentValue;
      totalPortfolioInvested += g.total_cost;

      holdingsList.push({
        coin_id: g.coin_id,
        coin_symbol: g.coin_symbol.toUpperCase(),
        coin_name: g.coin_name,
        coin_image: marketInfo?.image,
        total_amount: g.total_amount,
        total_invested: g.total_cost,
        average_buy_price: avgBuyPrice,
        current_price: currentPrice,
        current_value: currentValue,
        total_pnl: totalPnL,
        total_pnl_percentage: totalPnLPercentage,
        allocation_percentage: 0, // Computed below
        realized_pnl: g.realized_pnl,
      });
    }

    // Calculate allocation percentage
    holdingsList.forEach((h) => {
      h.allocation_percentage = totalPortfolioValue > 0 ? (h.current_value / totalPortfolioValue) * 100 : 0;
    });

    // Sort by largest holding value
    holdingsList.sort((a, b) => b.current_value - a.current_value);

    // Calculate Summary
    const totalUnrealizedPnL = totalPortfolioValue - totalPortfolioInvested;
    const totalCombinedPnL = totalUnrealizedPnL + totalRealizedPnL;
    const totalCombinedPnLPercentage =
      totalPortfolioInvested > 0 ? (totalCombinedPnL / totalPortfolioInvested) * 100 : 0;

    let bestPerformer = undefined;
    let worstPerformer = undefined;

    if (holdingsList.length > 0) {
      const sortedByReturn = [...holdingsList].sort((a, b) => b.total_pnl_percentage - a.total_pnl_percentage);
      bestPerformer = {
        name: sortedByReturn[0].coin_name,
        symbol: sortedByReturn[0].coin_symbol,
        pnl_percentage: sortedByReturn[0].total_pnl_percentage,
      };
      worstPerformer = {
        name: sortedByReturn[sortedByReturn.length - 1].coin_name,
        symbol: sortedByReturn[sortedByReturn.length - 1].coin_symbol,
        pnl_percentage: sortedByReturn[sortedByReturn.length - 1].total_pnl_percentage,
      };
    }

    const portfolioSummary: PortfolioSummary = {
      total_value: totalPortfolioValue,
      total_invested: totalPortfolioInvested,
      total_pnl: totalCombinedPnL,
      total_pnl_percentage: totalCombinedPnLPercentage,
      realized_pnl: totalRealizedPnL,
      unrealized_pnl: totalUnrealizedPnL,
      best_performer: bestPerformer,
      worst_performer: worstPerformer,
    };

    return { holdings: holdingsList, summary: portfolioSummary };
  }, [transactions, coins]);

  return {
    transactions,
    holdings,
    summary,
    isLoading,
    addTransaction,
    deleteTransaction,
  };
}
