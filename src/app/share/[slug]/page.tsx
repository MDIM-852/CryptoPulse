'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPercentage } from '@/lib/formatters';
import { Zap, ShieldCheck, TrendingUp, PieChart, Lock, EyeOff, Activity } from 'lucide-react';
import { ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, Tooltip } from 'recharts';

const DEMO_PUBLIC_ALLOCATION = [
  { name: 'Bitcoin', symbol: 'BTC', allocation: 55, color: '#3b82f6' },
  { name: 'Ethereum', symbol: 'ETH', allocation: 25, color: '#10b981' },
  { name: 'Solana', symbol: 'SOL', allocation: 15, color: '#8b5cf6' },
  { name: 'Cardano', symbol: 'ADA', allocation: 5, color: '#f59e0b' },
];

export default function PublicSharePage({ params }: { params: { slug: string } }) {
  const returnPercentage = 34.8;
  const isPositive = returnPercentage >= 0;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b bg-card/60 backdrop-blur-md px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-8 w-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
              <Zap className="h-4 w-4 fill-current" />
            </div>
            <span className="font-bold text-base">CryptoPulse</span>
          </Link>
          <Badge variant="outline" className="gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
            <ShieldCheck className="h-3.5 w-3.5" />
            Zero-Knowledge Public View
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-3xl py-10 px-4 space-y-8 flex-1">
        {/* Banner */}
        <div className="text-center space-y-2">
          <Badge variant="secondary" className="font-mono text-xs uppercase px-3 py-1">
            Verified Trader Portfolio
          </Badge>
          <h1 className="text-3xl font-extrabold tracking-tight">Performance Showcase</h1>
          <p className="text-xs text-muted-foreground">
            Shared via CryptoPulse Privacy Guard (Dollar amounts & trade sizes are strictly obfuscated).
          </p>
        </div>

        {/* Public Performance Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-card/70 border-border shadow-sm p-5 text-center">
            <p className="text-xs font-semibold text-muted-foreground uppercase">All-Time Return</p>
            <h2 className="text-3xl font-extrabold font-mono text-emerald-500 mt-2">
              +{formatPercentage(returnPercentage)}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">Verified Net Gain</p>
          </Card>

          <Card className="bg-card/70 border-border shadow-sm p-5 text-center">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Risk Rating</p>
            <h2 className="text-2xl font-bold font-mono text-primary mt-2">Low Risk</h2>
            <p className="text-xs text-muted-foreground mt-1">Risk Pulse: 24/100</p>
          </Card>

          <Card className="bg-card/70 border-border shadow-sm p-5 text-center">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Asset Diversity</p>
            <h2 className="text-2xl font-bold font-mono text-foreground mt-2">4 Major Coins</h2>
            <p className="text-xs text-muted-foreground mt-1">Blue-chip Focus</p>
          </Card>
        </div>

        {/* Public Allocation Chart */}
        <Card className="bg-card/70 border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              <CardTitle className="text-base font-bold">Public Asset Allocation (%)</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Relative portfolio weighting by percentage only.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-center justify-around gap-6">
            <div className="h-52 w-52 relative">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={DEMO_PUBLIC_ALLOCATION}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="allocation"
                  >
                    {DEMO_PUBLIC_ALLOCATION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`${value}%`, 'Weight']} />
                </RechartsPie>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2.5 w-full md:w-1/2 font-mono text-xs">
              {DEMO_PUBLIC_ALLOCATION.map((item) => (
                <div key={item.symbol} className="flex items-center justify-between p-2 rounded-lg bg-muted/40">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-bold text-foreground">{item.name}</span>
                  </div>
                  <span className="font-bold text-primary">{item.allocation}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA to track your own crypto */}
        <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20 text-center space-y-3">
          <h3 className="text-lg font-bold">Want to track your crypto portfolio in real-time?</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Get live Binance WebSocket feeds, automated tax-lot accounting, and paper trading with zero setup cost.
          </p>
          <Button asChild className="font-semibold shadow-md">
            <Link href="/register">Create Free Account</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
