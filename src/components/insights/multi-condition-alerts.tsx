'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CoinMarketData, PortfolioHolding } from '@/types';
import { formatCurrency } from '@/lib/formatters';
import { GitBranch, Plus, Bell, Trash2, CheckCircle, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface SmartAlert {
  id: string;
  name: string;
  ruleA: { coinSymbol: string; condition: 'ABOVE' | 'BELOW'; price: number };
  logic: 'AND' | 'OR';
  ruleB: { type: 'ALLOCATION' | 'CHANGE24H'; target: number };
  isActive: boolean;
  isTriggered: boolean;
}

interface MultiConditionAlertsProps {
  coins: CoinMarketData[];
  holdings: PortfolioHolding[];
}

export function MultiConditionAlerts({ coins, holdings }: MultiConditionAlertsProps) {
  const [smartAlerts, setSmartAlerts] = useState<SmartAlert[]>([
    {
      id: 'sa-01',
      name: 'BTC ATH & ETH Overweight Protection',
      ruleA: { coinSymbol: 'BTC', condition: 'ABOVE', price: 68000 },
      logic: 'AND',
      ruleB: { type: 'ALLOCATION', target: 35 },
      isActive: true,
      isTriggered: false,
    },
    {
      id: 'sa-02',
      name: 'SOL Breakout with Momentum',
      ruleA: { coinSymbol: 'SOL', condition: 'ABOVE', price: 165 },
      logic: 'AND',
      ruleB: { type: 'CHANGE24H', target: 8 },
      isActive: true,
      isTriggered: false,
    },
  ]);

  const [name, setName] = useState('');
  const [coinSymbol, setCoinSymbol] = useState('BTC');
  const [condition, setCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [targetPrice, setTargetPrice] = useState('70000');
  const [logic, setLogic] = useState<'AND' | 'OR'>('AND');
  const [secondaryType, setSecondaryType] = useState<'ALLOCATION' | 'CHANGE24H'>('ALLOCATION');
  const [secondaryTarget, setSecondaryTarget] = useState('30');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newAlert: SmartAlert = {
      id: `sa-${Date.now()}`,
      name: name || `${coinSymbol} Smart Condition`,
      ruleA: {
        coinSymbol: coinSymbol.toUpperCase(),
        condition,
        price: parseFloat(targetPrice) || 0,
      },
      logic,
      ruleB: {
        type: secondaryType,
        target: parseFloat(secondaryTarget) || 0,
      },
      isActive: true,
      isTriggered: false,
    };

    setSmartAlerts([newAlert, ...smartAlerts]);
    setIsCreating(false);
    setName('');
    toast.success('Smart multi-condition alert created!');
  };

  const handleDelete = (id: string) => {
    setSmartAlerts(smartAlerts.filter((a) => a.id !== id));
    toast.info('Alert deleted');
  };

  return (
    <Card className="bg-card/70 border-border/80 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <GitBranch className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">Smart Multi-Condition Alerts</CardTitle>
              <CardDescription className="text-xs">
                Combine price targets with portfolio allocation thresholds or 24h momentum.
              </CardDescription>
            </div>
          </div>
          <Button size="sm" onClick={() => setIsCreating(!isCreating)} className="gap-1 text-xs">
            <Plus className="h-3.5 w-3.5" />
            New Compound Rule
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Create Rule Form */}
        {isCreating && (
          <form onSubmit={handleCreate} className="p-4 rounded-xl border bg-muted/40 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Alert Title</label>
              <Input
                placeholder="e.g. BTC Bull Run & Rebalance Signal"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Condition Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Rule 1 (Asset)</label>
                <select
                  value={coinSymbol}
                  onChange={(e) => setCoinSymbol(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border bg-background text-sm font-semibold"
                >
                  {coins.slice(0, 10).map((c) => (
                    <option key={c.id} value={c.symbol.toUpperCase()}>
                      {c.name} ({c.symbol.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Condition</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-lg border bg-background text-sm font-semibold"
                >
                  <option value="ABOVE">Price Rises ABOVE</option>
                  <option value="BELOW">Price Drops BELOW</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Target Price ($)</label>
                <Input
                  type="number"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Logic Joiner & Condition Row 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Logic Gate</label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={logic === 'AND' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 text-xs font-bold font-mono"
                    onClick={() => setLogic('AND')}
                  >
                    AND
                  </Button>
                  <Button
                    type="button"
                    variant={logic === 'OR' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 text-xs font-bold font-mono"
                    onClick={() => setLogic('OR')}
                  >
                    OR
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Rule 2 Type</label>
                <select
                  value={secondaryType}
                  onChange={(e) => setSecondaryType(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-lg border bg-background text-sm font-semibold"
                >
                  <option value="ALLOCATION">Portfolio Allocation % &gt;</option>
                  <option value="CHANGE24H">24h Gain % &gt;</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Target % Value</label>
                <Input
                  type="number"
                  value={secondaryTarget}
                  onChange={(e) => setSecondaryTarget(e.target.value)}
                  placeholder="30"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save Rule
              </Button>
            </div>
          </form>
        )}

        {/* Active Smart Alerts List */}
        <div className="space-y-2.5">
          {smartAlerts.map((sa) => (
            <div
              key={sa.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border bg-card/60 gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-foreground">{sa.name}</span>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    Active
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                  <span>
                    {sa.ruleA.coinSymbol} {sa.ruleA.condition === 'ABOVE' ? '≥' : '≤'} {formatCurrency(sa.ruleA.price)}
                  </span>
                  <Badge variant="secondary" className="text-[9px] px-1 py-0 font-bold">
                    {sa.logic}
                  </Badge>
                  <span>
                    {sa.ruleB.type === 'ALLOCATION'
                      ? `Portfolio Weight > ${sa.ruleB.target}%`
                      : `24h Gain > +${sa.ruleB.target}%`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(sa.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
