'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import { CoinMarketData } from '@/types';
import { History, Sparkles, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface TimeMachineProps {
  coins: CoinMarketData[];
}

// Approximate historical baseline prices for major assets
const HISTORICAL_PRICE_ARCHIVE: Record<string, { '1y': number; '2y': number; '3y': number; '5y': number; 'genesis': number }> = {
  bitcoin: { '1y': 27000, '2y': 19500, '3y': 43000, '5y': 8200, 'genesis': 0.08 },
  ethereum: { '1y': 1600, '2y': 1300, '3y': 3100, '5y': 180, 'genesis': 0.31 },
  solana: { '1y': 22, '2y': 32, '3y': 140, '5y': 1.5, 'genesis': 0.5 },
  binancecoin: { '1y': 215, '2y': 280, '3y': 380, '5y': 22, 'genesis': 0.15 },
  cardano: { '1y': 0.25, '2y': 0.45, '3y': 2.15, '5y': 0.04, 'genesis': 0.02 },
  dogecoin: { '1y': 0.06, '2y': 0.06, '3y': 0.22, '5y': 0.002, 'genesis': 0.0002 },
};

export function TimeMachine({ coins }: TimeMachineProps) {
  const [mode, setMode] = useState<'lump_sum' | 'dca'>('lump_sum');
  const [selectedCoinId, setSelectedCoinId] = useState<string>('bitcoin');
  const [timeframe, setTimeframe] = useState<'1y' | '2y' | '3y' | '5y'>('2y');
  const [investmentAmount, setInvestmentAmount] = useState<string>('1000'); // $1,000 lump sum or $100/mo DCA
  const [dcaFrequency, setDcaFrequency] = useState<'weekly' | 'monthly'>('monthly');

  const currentCoin = coins.find((c) => c.id === selectedCoinId) || coins[0];
  const livePrice = currentCoin?.live_price ?? currentCoin?.current_price ?? 60000;

  const calculation = useMemo(() => {
    const historicalData = HISTORICAL_PRICE_ARCHIVE[selectedCoinId] || {
      '1y': livePrice * 0.6,
      '2y': livePrice * 0.4,
      '3y': livePrice * 0.7,
      '5y': livePrice * 0.15,
      genesis: 1,
    };

    const pastPrice = historicalData[timeframe];
    const amountNum = parseFloat(investmentAmount) || 0;

    if (mode === 'lump_sum') {
      const tokensBought = pastPrice > 0 ? amountNum / pastPrice : 0;
      const currentValue = tokensBought * livePrice;
      const profit = currentValue - amountNum;
      const roi = amountNum > 0 ? (profit / amountNum) * 100 : 0;
      const multiplier = amountNum > 0 ? currentValue / amountNum : 1;

      // Trajectory points for chart
      const chartPoints = [
        { label: `${timeframe} ago`, value: amountNum },
        { label: '6m later', value: amountNum * (1 + (multiplier - 1) * 0.3) },
        { label: '1y later', value: amountNum * (1 + (multiplier - 1) * 0.6) },
        { label: 'Today', value: currentValue },
      ];

      return {
        totalInvested: amountNum,
        currentValue,
        profit,
        roi,
        multiplier,
        chartPoints,
      };
    } else {
      // DCA Mode
      const months = timeframe === '1y' ? 12 : timeframe === '2y' ? 24 : timeframe === '3y' ? 36 : 60;
      const intervals = dcaFrequency === 'weekly' ? months * 4.33 : months;
      const totalInvested = amountNum * intervals;

      // Average DCA execution price discount estimate
      const avgDcaPrice = (pastPrice + livePrice) / 2;
      const tokensBought = avgDcaPrice > 0 ? totalInvested / avgDcaPrice : 0;
      const currentValue = tokensBought * livePrice;
      const profit = currentValue - totalInvested;
      const roi = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;
      const multiplier = totalInvested > 0 ? currentValue / totalInvested : 1;

      const chartPoints = [
        { label: `${timeframe} ago`, value: amountNum },
        { label: 'Midway', value: totalInvested * 0.5 * 1.2 },
        { label: 'Today', value: currentValue },
      ];

      return {
        totalInvested,
        currentValue,
        profit,
        roi,
        multiplier,
        chartPoints,
      };
    }
  }, [selectedCoinId, timeframe, investmentAmount, mode, dcaFrequency, livePrice]);

  return (
    <Card className="bg-card/70 border-border/80 shadow-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <History className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">Time Machine Simulator</CardTitle>
              <CardDescription className="text-xs">
                Simulate historical returns for lump-sum buys and Dollar-Cost Averaging (DCA).
              </CardDescription>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 p-1 bg-muted rounded-xl">
            <button
              onClick={() => setMode('lump_sum')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                mode === 'lump_sum' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Lump Sum (&quot;What If&quot;)
            </button>
            <button
              onClick={() => setMode('dca')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                mode === 'dca' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              DCA Simulator
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Asset */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Asset</label>
            <select
              value={selectedCoinId}
              onChange={(e) => setSelectedCoinId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border bg-background text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {coins.slice(0, 15).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.symbol.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Timeframe */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Start Date</label>
            <div className="grid grid-cols-4 gap-1">
              {(['1y', '2y', '3y', '5y'] as const).map((t) => (
                <Button
                  key={t}
                  type="button"
                  variant={timeframe === t ? 'default' : 'outline'}
                  size="sm"
                  className="h-10 text-xs font-bold font-mono"
                  onClick={() => setTimeframe(t)}
                >
                  {t.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>

          {/* Investment Amount */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">
              {mode === 'lump_sum' ? 'Investment ($)' : 'Recurring Amount ($)'}
            </label>
            <Input
              type="number"
              min="10"
              step="50"
              value={investmentAmount}
              onChange={(e) => setInvestmentAmount(e.target.value)}
              placeholder="1000"
            />
          </div>
        </div>

        {/* Results Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-muted/40 border">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase">Total Invested</p>
            <h3 className="text-2xl font-bold font-mono text-foreground mt-1">
              {formatCurrency(calculation.totalInvested)}
            </h3>
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase">Value Today</p>
            <h3 className="text-2xl font-bold font-mono text-primary mt-1">
              {formatCurrency(calculation.currentValue)}
            </h3>
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase">Total Profit & Multiplier</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-bold font-mono text-emerald-500">
                +{formatCurrency(calculation.profit)}
              </h3>
              <Badge variant="success" className="font-mono text-xs">
                {calculation.multiplier.toFixed(2)}x ({formatPercentage(calculation.roi)})
              </Badge>
            </div>
          </div>
        </div>

        {/* Trajectory Area Chart */}
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={calculation.chartPoints}>
              <defs>
                <linearGradient id="timeMachineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" stroke="#888888" fontSize={11} tickLine={false} />
              <YAxis stroke="#888888" fontSize={11} tickLine={false} tickFormatter={(val) => `$${val}`} />
              <Tooltip formatter={(value: any) => [formatCurrency(Number(value)), 'Portfolio Value']} />
              <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#timeMachineGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
