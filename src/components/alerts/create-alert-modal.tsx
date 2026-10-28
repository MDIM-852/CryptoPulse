'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CoinMarketData, AlertCondition } from '@/types';
import { formatCurrency } from '@/lib/formatters';
import { priceAlertSchema } from '@/lib/validations';
import { toast } from 'sonner';
import { Bell, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface CreateAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: CoinMarketData[];
  onCreate: (data: {
    coin_id: string;
    coin_symbol: string;
    coin_name: string;
    target_price: number;
    condition: AlertCondition;
  }) => Promise<void>;
  preselectedCoin?: CoinMarketData | null;
}

export function CreateAlertModal({
  isOpen,
  onClose,
  coins,
  onCreate,
  preselectedCoin,
}: CreateAlertModalProps) {
  const [selectedCoinId, setSelectedCoinId] = useState<string>('bitcoin');
  const [condition, setCondition] = useState<AlertCondition>('ABOVE');
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const currentCoin = coins.find((c) => c.id === selectedCoinId) || coins[0];
  const livePrice = currentCoin?.live_price ?? currentCoin?.current_price ?? 0;

  useEffect(() => {
    if (preselectedCoin) {
      setSelectedCoinId(preselectedCoin.id);
      const curr = preselectedCoin.live_price ?? preselectedCoin.current_price ?? 0;
      setTargetPrice(String((curr * (condition === 'ABOVE' ? 1.05 : 0.95)).toFixed(2)));
    } else if (coins.length > 0 && !targetPrice) {
      const firstCoin = coins[0];
      setSelectedCoinId(firstCoin.id);
      const curr = firstCoin.live_price ?? firstCoin.current_price ?? 0;
      setTargetPrice(String((curr * 1.05).toFixed(2)));
    }
  }, [preselectedCoin, coins, isOpen]);

  const handleCoinChange = (coinId: string) => {
    setSelectedCoinId(coinId);
    const found = coins.find((c) => c.id === coinId);
    if (found) {
      const curr = found.live_price ?? found.current_price ?? 0;
      setTargetPrice(String((curr * (condition === 'ABOVE' ? 1.05 : 0.95)).toFixed(2)));
    }
  };

  const handleConditionChange = (newCondition: AlertCondition) => {
    setCondition(newCondition);
    if (livePrice > 0) {
      const multiplier = newCondition === 'ABOVE' ? 1.05 : 0.95;
      setTargetPrice(String((livePrice * multiplier).toFixed(2)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCoin) return;

    try {
      const numTarget = parseFloat(targetPrice);
      const validated = priceAlertSchema.parse({
        coin_id: currentCoin.id,
        coin_symbol: currentCoin.symbol.toUpperCase(),
        coin_name: currentCoin.name,
        target_price: numTarget,
        condition,
      });

      setIsSubmitting(true);
      await onCreate(validated);
      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      if (err.errors && err.errors[0]) {
        toast.error(err.errors[0].message);
      } else {
        toast.error('Please check your target price.');
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Set Price Alert</DialogTitle>
              <DialogDescription>
                Get instant browser notifications when a coin hits your target.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Asset Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Cryptocurrency</label>
            <select
              value={selectedCoinId}
              onChange={(e) => handleCoinChange(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {coins.map((coin) => (
                <option key={coin.id} value={coin.id}>
                  {coin.name} ({coin.symbol.toUpperCase()}) — {formatCurrency(coin.live_price ?? coin.current_price)}
                </option>
              ))}
            </select>
          </div>

          {/* Condition Selector: Rises Above / Drops Below */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Condition</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleConditionChange('ABOVE')}
                className={`py-2.5 px-3 flex items-center justify-center gap-1.5 text-xs font-semibold rounded-xl border transition-all ${
                  condition === 'ABOVE'
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 ring-2 ring-emerald-500/20'
                    : 'bg-muted/40 text-muted-foreground border-transparent hover:bg-muted'
                }`}
              >
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                Price rises above
              </button>
              <button
                type="button"
                onClick={() => handleConditionChange('BELOW')}
                className={`py-2.5 px-3 flex items-center justify-center gap-1.5 text-xs font-semibold rounded-xl border transition-all ${
                  condition === 'BELOW'
                    ? 'bg-rose-500/10 text-rose-600 border-rose-500/30 ring-2 ring-rose-500/20'
                    : 'bg-muted/40 text-muted-foreground border-transparent hover:bg-muted'
                }`}
              >
                <ArrowDownRight className="h-4 w-4 text-rose-500" />
                Price drops below
              </button>
            </div>
          </div>

          {/* Target Price */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Target Price ($)</label>
              <span className="text-xs text-muted-foreground">
                Current: <strong className="font-mono text-foreground">{formatCurrency(livePrice)}</strong>
              </span>
            </div>
            <Input
              type="number"
              step="any"
              min="0"
              placeholder="0.00"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              required
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Alert'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
