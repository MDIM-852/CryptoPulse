'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './auth-context';
import { toast } from 'sonner';

export type TradingMode = 'paper' | 'real_exchange' | 'fiat_onramp';
export type EmotionTag = 'Calm' | 'FOMO' | 'Panic' | 'Conviction' | 'Greed' | 'Disciplined';

export interface TradeOrder {
  id: string;
  mode: TradingMode;
  symbol: string;
  coinId: string;
  coinName: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT';
  amount: number;
  price: number;
  totalCost: number;
  fee: number;
  slippageEstimated: number;
  status: 'FILLED' | 'PENDING' | 'CANCELLED';
  emotionTag?: EmotionTag;
  notes?: string;
  executedAt: string;
}

interface TradeContextType {
  tradingMode: TradingMode;
  setTradingMode: (mode: TradingMode) => void;
  paperBalance: number;
  resetPaperBalance: () => void;
  orders: TradeOrder[];
  executeOrder: (params: {
    symbol: string;
    coinId: string;
    coinName: string;
    side: 'BUY' | 'SELL';
    type: 'MARKET' | 'LIMIT';
    amount: number;
    price: number;
    emotionTag?: EmotionTag;
    notes?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  exchangeApiConnected: boolean;
  exchangeMaskedKey: string | null;
  connectExchangeKeys: (apiKey: string, apiSecret: string) => Promise<{ success: boolean; error?: string; balances?: any[] }>;
  disconnectExchangeKeys: () => Promise<void>;
  regretThreshold: number;
  setRegretThreshold: (val: number) => void;
  killSwitchActive: boolean;
  toggleKillSwitch: (active: boolean) => Promise<void>;
}

const TradeContext = createContext<TradeContextType | undefined>(undefined);

const STORAGE_PAPER_BALANCE = 'cryptopulse_paper_balance';
const STORAGE_ORDERS = 'cryptopulse_trade_orders';
const STORAGE_REGRET_THRESHOLD = 'cryptopulse_regret_threshold';

export function TradeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [tradingMode, setTradingMode] = useState<TradingMode>('paper');
  const [paperBalance, setPaperBalance] = useState<number>(10000);
  const [orders, setOrders] = useState<TradeOrder[]>([]);
  const [exchangeApiConnected, setExchangeApiConnected] = useState<boolean>(false);
  const [exchangeMaskedKey, setExchangeMaskedKey] = useState<string | null>(null);
  const [regretThreshold, setRegretThreshold] = useState<number>(8);
  const [killSwitchActive, setKillSwitchActive] = useState<boolean>(false);

  // Load state and sync exchange connection status from server
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedBal = localStorage.getItem(STORAGE_PAPER_BALANCE);
      if (storedBal) setPaperBalance(parseFloat(storedBal));

      const storedOrders = localStorage.getItem(STORAGE_ORDERS);
      if (storedOrders) {
        try {
          setOrders(JSON.parse(storedOrders));
        } catch {}
      }

      const storedThresh = localStorage.getItem(STORAGE_REGRET_THRESHOLD);
      if (storedThresh) setRegretThreshold(parseFloat(storedThresh));
    }

    // 1. Sync global kill-switch status from server
    fetch('/api/trade/killswitch')
      .then((r) => r.json())
      .then((d) => setKillSwitchActive(Boolean(d.killSwitchActive)))
      .catch(() => {});

    // 2. Sync exchange connection status securely from server
    fetch('/api/trade/keys')
      .then((r) => r.json())
      .then((d) => {
        if (d.connected) {
          setExchangeApiConnected(true);
          setExchangeMaskedKey(d.maskedKey || '****');
        } else {
          setExchangeApiConnected(false);
          setExchangeMaskedKey(null);
        }
      })
      .catch(() => {});
  }, [user]);

  const resetPaperBalance = useCallback(() => {
    setPaperBalance(10000);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_PAPER_BALANCE, '10000');
    }
    toast.success('Paper trading balance reset to $10,000.00 USDT');
  }, []);

  const connectExchangeKeys = async (apiKey: string, apiSecret: string) => {
    try {
      const res = await fetch('/api/trade/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          apiSecret,
          exchange: 'binance_testnet',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error };
      }

      setExchangeApiConnected(true);
      setExchangeMaskedKey(data.maskedKey);

      toast.success('Binance Testnet connected safely! Keys verified and encrypted server-side.');
      return { success: true, balances: data.balances };
    } catch (err: any) {
      return { success: false, error: err.message || 'Connection failed' };
    }
  };

  const disconnectExchangeKeys = async () => {
    try {
      await fetch('/api/trade/keys', { method: 'DELETE' });
    } catch {}

    setExchangeApiConnected(false);
    setExchangeMaskedKey(null);
    toast.info('Disconnected exchange API keys.');
  };

  const executeOrder = async (params: {
    symbol: string;
    coinId: string;
    coinName: string;
    side: 'BUY' | 'SELL';
    type: 'MARKET' | 'LIMIT';
    amount: number;
    price: number;
    emotionTag?: EmotionTag;
    notes?: string;
  }) => {
    if (killSwitchActive) {
      toast.error('Trading is currently halted by system administrators.');
      return { success: false, error: 'Trading halted by global kill switch.' };
    }

    const totalCost = params.amount * params.price;
    const fee = totalCost * 0.001; // 0.1% spot fee
    const slippageEstimated = params.type === 'MARKET' ? 0.05 : 0;

    // A. Paper Trading Mode
    if (tradingMode === 'paper') {
      if (params.side === 'BUY' && totalCost + fee > paperBalance) {
        toast.error(`Insufficient virtual balance! Available: $${paperBalance.toFixed(2)}`);
        return { success: false, error: 'Insufficient paper funds' };
      }

      const newBalance = params.side === 'BUY'
        ? paperBalance - (totalCost + fee)
        : paperBalance + (totalCost - fee);

      setPaperBalance(newBalance);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_PAPER_BALANCE, String(newBalance));
      }

      const newOrder: TradeOrder = {
        id: `ord-paper-${Date.now()}`,
        mode: 'paper',
        symbol: params.symbol.toUpperCase(),
        coinId: params.coinId,
        coinName: params.coinName,
        side: params.side,
        type: params.type,
        amount: params.amount,
        price: params.price,
        totalCost,
        fee,
        slippageEstimated,
        status: 'FILLED',
        emotionTag: params.emotionTag || 'Disciplined',
        notes: params.notes,
        executedAt: new Date().toISOString(),
      };

      const updated = [newOrder, ...orders];
      setOrders(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_ORDERS, JSON.stringify(updated));
      }

      toast.success(
        `Paper ${params.side} Filled: ${params.amount} ${params.symbol} at $${params.price.toFixed(2)}`
      );
      return { success: true };
    }

    // B. Real Exchange Mode (Binance Spot Testnet)
    if (tradingMode === 'real_exchange') {
      if (!exchangeApiConnected) {
        toast.error('Please connect your Binance Spot Testnet API keys first.');
        return { success: false, error: 'Exchange not connected' };
      }

      try {
        // Send ONLY the required order parameters - never send secrets or masked keys!
        const res = await fetch('/api/trade/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'real_exchange',
            symbol: `${params.symbol.toUpperCase()}USDT`,
            side: params.side,
            type: params.type,
            quantity: params.amount,
            price: params.price,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          toast.error(`Order failed: ${data.error}`);
          return { success: false, error: data.error };
        }

        const executedPrice = data.price || params.price;
        const executedCost = executedPrice * params.amount;

        const newOrder: TradeOrder = {
          id: data.orderId || `ord-real-${Date.now()}`,
          mode: 'real_exchange',
          symbol: params.symbol.toUpperCase(),
          coinId: params.coinId,
          coinName: params.coinName,
          side: params.side,
          type: params.type,
          amount: data.executedQty || params.amount,
          price: executedPrice,
          totalCost: executedCost,
          fee: executedCost * 0.001,
          slippageEstimated: 0.02,
          status: 'FILLED',
          emotionTag: params.emotionTag || 'Disciplined',
          notes: params.notes,
          executedAt: data.executedAt || new Date().toISOString(),
        };

        const updated = [newOrder, ...orders];
        setOrders(updated);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_ORDERS, JSON.stringify(updated));
        }

        toast.success(`Spot Testnet Order Filled: ${params.amount} ${params.symbol}!`);
        return { success: true };
      } catch (err: any) {
        toast.error(`Execution error: ${err.message}`);
        return { success: false, error: err.message };
      }
    }

    return { success: false, error: 'Unsupported mode' };
  };

  const toggleKillSwitch = async (active: boolean) => {
    try {
      const res = await fetch('/api/trade/killswitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to toggle kill switch.');
        return;
      }
      setKillSwitchActive(Boolean(data.killSwitchActive));
      toast.warning(data.message);
    } catch (err: any) {
      toast.error('Failed to update kill switch');
    }
  };

  return (
    <TradeContext.Provider
      value={{
        tradingMode,
        setTradingMode,
        paperBalance,
        resetPaperBalance,
        orders,
        executeOrder,
        exchangeApiConnected,
        exchangeMaskedKey,
        connectExchangeKeys,
        disconnectExchangeKeys,
        regretThreshold,
        setRegretThreshold,
        killSwitchActive,
        toggleKillSwitch,
      }}
    >
      {children}
    </TradeContext.Provider>
  );
}

export function useTrade() {
  const context = useContext(TradeContext);
  if (!context) {
    throw new Error('useTrade must be used within a TradeProvider');
  }
  return context;
}
