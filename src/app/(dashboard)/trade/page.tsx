'use client';

import React, { useState, useEffect } from 'react';
import { useCoins } from '@/hooks/use-coins';
import { useTrade, TradingMode, EmotionTag } from '@/context/trade-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FlashPrice } from '@/components/market/flash-price';
import { formatCurrency, formatNumber, formatDateTime } from '@/lib/formatters';
import { RegretGuardModal } from '@/components/trade/regret-guard-modal';
import { OrderConfirmModal } from '@/components/trade/order-confirm-modal';
import { ConnectExchangeModal } from '@/components/trade/connect-exchange-modal';
import { FiatOnRampCard } from '@/components/trade/fiat-onramp-card';
import {
  Wallet,
  ArrowRightLeft,
  ShieldCheck,
  CreditCard,
  RotateCcw,
  PlusCircle,
  Key,
  TrendingUp,
  History,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';

export default function TradePage() {
  const { coins } = useCoins();
  const {
    tradingMode,
    setTradingMode,
    paperBalance,
    resetPaperBalance,
    orders,
    executeOrder,
    exchangeApiConnected,
    exchangeMaskedKey,
    disconnectExchangeKeys,
    regretThreshold,
    killSwitchActive,
  } = useTrade();

  const [selectedCoinId, setSelectedCoinId] = useState<string>('bitcoin');
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET');
  const [amount, setAmount] = useState<string>('0.1');
  const [limitPrice, setLimitPrice] = useState<string>('');

  // Modals
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isRegretGuardOpen, setIsRegretGuardOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const currentCoin = coins.find((c) => c.id === selectedCoinId) || coins[0];
  const livePrice = currentCoin?.live_price ?? currentCoin?.current_price ?? 0;
  const executionPrice = orderType === 'MARKET' ? livePrice : parseFloat(limitPrice) || livePrice;
  const numAmount = parseFloat(amount) || 0;
  const totalCost = numAmount * executionPrice;
  const change24h = currentCoin?.price_change_percentage_24h || 0;

  useEffect(() => {
    if (currentCoin && !limitPrice) {
      setLimitPrice(String(currentCoin.live_price ?? currentCoin.current_price ?? ''));
    }
  }, [currentCoin]);

  const handlePercentageSelect = (pct: number) => {
    if (tradingMode === 'paper' && side === 'BUY') {
      const budget = paperBalance * (pct / 100);
      if (executionPrice > 0) {
        setAmount((budget / executionPrice).toFixed(4));
      }
    } else if (side === 'SELL') {
      // Find paper or wallet holdings
      setAmount((1 * (pct / 100)).toFixed(4));
    }
  };

  const handleInitiateTrade = () => {
    if (killSwitchActive) {
      toast.error('Trading is currently halted by system administrators.');
      return;
    }

    if (numAmount <= 0) {
      toast.error('Please enter a valid trade amount.');
      return;
    }

    // Regret Guard FOMO Check: If buying and 24h pump > regretThreshold
    if (side === 'BUY' && change24h >= regretThreshold) {
      setIsRegretGuardOpen(true);
      return;
    }

    setIsConfirmModalOpen(true);
  };

  const handleFinalOrderExecution = async (emotionTag: EmotionTag, notes?: string) => {
    if (!currentCoin) return;
    await executeOrder({
      symbol: currentCoin.symbol.toUpperCase(),
      coinId: currentCoin.id,
      coinName: currentCoin.name,
      side,
      type: orderType,
      amount: numAmount,
      price: executionPrice,
      emotionTag,
      notes,
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Buy & Trade Terminal</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Non-custodial trading via Paper Simulation, Binance Spot Testnet, or Instant Fiat On-Ramp.
          </p>
        </div>

        {/* 3-Way Mode Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-muted/80 rounded-xl border">
          <button
            onClick={() => setTradingMode('paper')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              tradingMode === 'paper'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            1. Paper ($10k)
          </button>
          <button
            onClick={() => setTradingMode('real_exchange')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              tradingMode === 'real_exchange'
                ? 'bg-background text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            2. Testnet API
          </button>
          <button
            onClick={() => setTradingMode('fiat_onramp')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              tradingMode === 'fiat_onramp'
                ? 'bg-background text-emerald-600 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            3. Fiat On-Ramp
          </button>
        </div>
      </div>

      {/* Mode Banner Overview */}
      {tradingMode === 'paper' && (
        <Card className="bg-gradient-to-r from-card to-card/60 border-primary/20 shadow-sm">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase">
                  Virtual Paper Trading Balance
                </p>
                <h3 className="text-2xl font-bold font-mono text-foreground">
                  {formatCurrency(paperBalance)} <span className="text-xs text-muted-foreground font-normal">USDT</span>
                </h3>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={resetPaperBalance}
              className="gap-1.5 text-xs self-start sm:self-center"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset to $10,000
            </Button>
          </CardContent>
        </Card>
      )}

      {tradingMode === 'real_exchange' && (
        <Card className="bg-gradient-to-r from-card to-card/60 border-border shadow-sm">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground font-semibold uppercase">
                    Exchange API Connection
                  </p>
                  <Badge variant={exchangeApiConnected ? 'success' : 'outline'} className="text-[10px] uppercase font-mono">
                    {exchangeApiConnected ? 'Connected (Binance Testnet)' : 'Not Connected'}
                  </Badge>
                </div>
                <p className="text-sm font-mono mt-0.5">
                  {exchangeApiConnected ? `API Key: ${exchangeMaskedKey}` : 'Connect your Binance Spot Testnet keys to trade.'}
                </p>
              </div>
            </div>
            {exchangeApiConnected ? (
              <Button
                variant="outline"
                size="sm"
                onClick={disconnectExchangeKeys}
                className="text-xs text-destructive hover:bg-destructive/10"
              >
                Disconnect Keys
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => setIsConnectModalOpen(true)}
                className="gap-1.5 text-xs"
              >
                <Key className="h-3.5 w-3.5" />
                Connect Keys
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Trading Area */}
      {tradingMode === 'fiat_onramp' ? (
        <FiatOnRampCard />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Placement Terminal */}
          <Card className="lg:col-span-2 bg-card/80 border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold">Execution Form</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Market Price:</span>
                  <FlashPrice price={livePrice} flash={currentCoin?.price_flash} className="font-mono font-bold text-sm" />
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Asset Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Cryptocurrency</label>
                <select
                  value={selectedCoinId}
                  onChange={(e) => {
                    setSelectedCoinId(e.target.value);
                    const found = coins.find((c) => c.id === e.target.value);
                    if (found) {
                      setLimitPrice(String(found.live_price ?? found.current_price ?? ''));
                    }
                  }}
                  className="w-full h-11 px-3 rounded-xl border bg-background text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {coins.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.symbol.toUpperCase()}) — {formatCurrency(c.live_price ?? c.current_price)}
                    </option>
                  ))}
                </select>
              </div>

              {/* BUY / SELL Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl">
                <button
                  type="button"
                  onClick={() => setSide('BUY')}
                  className={`py-2 text-sm font-bold rounded-lg transition-all ${
                    side === 'BUY'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Buy {currentCoin?.symbol?.toUpperCase()}
                </button>
                <button
                  type="button"
                  onClick={() => setSide('SELL')}
                  className={`py-2 text-sm font-bold rounded-lg transition-all ${
                    side === 'SELL'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Sell {currentCoin?.symbol?.toUpperCase()}
                </button>
              </div>

              {/* MARKET vs LIMIT Order Switcher */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOrderType('MARKET')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                    orderType === 'MARKET'
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:bg-muted'
                  }`}
                >
                  Market Order
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('LIMIT')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                    orderType === 'LIMIT'
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:bg-muted'
                  }`}
                >
                  Limit Order
                </button>
              </div>

              {/* Limit Price Input if Limit Order */}
              {orderType === 'LIMIT' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Limit Price ($)</label>
                  <Input
                    type="number"
                    step="any"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    placeholder="Enter limit price"
                  />
                </div>
              )}

              {/* Quantity Amount Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground uppercase font-semibold">
                  <span>Quantity ({currentCoin?.symbol?.toUpperCase()})</span>
                  <span>Est. Value: {formatCurrency(totalCost)}</span>
                </div>
                <Input
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              {/* Percentage Quick Presets */}
              <div className="grid grid-cols-4 gap-2 pt-1">
                {[25, 50, 75, 100].map((pct) => (
                  <Button
                    key={pct}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-mono"
                    onClick={() => handlePercentageSelect(pct)}
                  >
                    {pct}%
                  </Button>
                ))}
              </div>

              {/* Submit Order Button */}
              <Button
                onClick={handleInitiateTrade}
                className={`w-full h-11 text-base font-bold shadow-md ${
                  side === 'BUY'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                Place {side} Order ({formatCurrency(totalCost)})
              </Button>
            </CardContent>
          </Card>

          {/* Asset Live Quick Stats */}
          <Card className="bg-card/70 border-border/80 shadow-sm space-y-4 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base">{currentCoin?.name}</h3>
                <Badge variant="outline" className="font-mono text-[10px] uppercase">
                  Rank #{currentCoin?.market_cap_rank || '—'}
                </Badge>
              </div>

              <div className="mt-4 space-y-3 font-mono text-xs">
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground font-sans">Live Ticker:</span>
                  <span className="font-bold text-foreground">{formatCurrency(livePrice)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground font-sans">24h Change:</span>
                  <span className={change24h >= 0 ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                    {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground font-sans">24h High:</span>
                  <span>{formatCurrency(currentCoin?.high_24h)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b">
                  <span className="text-muted-foreground font-sans">24h Low:</span>
                  <span>{formatCurrency(currentCoin?.low_24h)}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-muted-foreground font-sans">Regret Guard:</span>
                  <span className="text-amber-500 font-bold">Triggers @ +{regretThreshold}%</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-muted/50 border text-[11px] text-muted-foreground leading-relaxed">
              <Lock className="h-3.5 w-3.5 inline mr-1 text-primary" />
              Non-custodial execution ensures complete control of your capital.
            </div>
          </Card>
        </div>
      )}

      {/* Order History Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold">Execution History ({orders.length})</h2>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground border rounded-2xl bg-card/40">
            <p className="text-sm font-semibold text-foreground">No executed orders yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Place a paper trade or testnet order above to start building your record.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border bg-card/80 backdrop-blur-sm overflow-hidden">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-muted/40 border-b">
                <tr>
                  <th className="p-3">Mode</th>
                  <th className="p-3">Side</th>
                  <th className="p-3">Asset</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3 text-right">Price</th>
                  <th className="p-3 text-right">Total</th>
                  <th className="p-3">Emotion Tag</th>
                  <th className="p-3 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <Badge variant="outline" className="text-[10px] uppercase font-mono">
                        {ord.mode}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded font-bold ${ord.side === 'BUY' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                        {ord.side}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-foreground font-sans">
                      {ord.coinName} ({ord.symbol})
                    </td>
                    <td className="p-3 text-right">{formatNumber(ord.amount, 4)}</td>
                    <td className="p-3 text-right">{formatCurrency(ord.price)}</td>
                    <td className="p-3 text-right font-bold">{formatCurrency(ord.totalCost)}</td>
                    <td className="p-3 font-sans">
                      {ord.emotionTag && (
                        <Badge variant="secondary" className="text-[10px]">
                          {ord.emotionTag}
                        </Badge>
                      )}
                    </td>
                    <td className="p-3 text-right text-muted-foreground">
                      {formatDateTime(ord.executedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Regret Guard Modal */}
      {isRegretGuardOpen && (
        <RegretGuardModal
          isOpen={isRegretGuardOpen}
          onClose={() => setIsRegretGuardOpen(false)}
          coinName={currentCoin?.name || 'Asset'}
          coinSymbol={currentCoin?.symbol?.toUpperCase() || ''}
          change24h={change24h}
          onProceed={() => setIsConfirmModalOpen(true)}
        />
      )}

      {/* Order Confirmation Modal */}
      {isConfirmModalOpen && (
        <OrderConfirmModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          mode={tradingMode}
          coinName={currentCoin?.name || 'Asset'}
          coinSymbol={currentCoin?.symbol?.toUpperCase() || ''}
          side={side}
          type={orderType}
          amount={numAmount}
          price={executionPrice}
          onConfirm={handleFinalOrderExecution}
        />
      )}

      {/* Connect Exchange Modal */}
      {isConnectModalOpen && (
        <ConnectExchangeModal
          isOpen={isConnectModalOpen}
          onClose={() => setIsConnectModalOpen(false)}
        />
      )}
    </div>
  );
}
