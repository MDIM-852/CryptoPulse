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
import { CoinMarketData, TransactionType } from '@/types';
import { formatCurrency } from '@/lib/formatters';
import { transactionSchema } from '@/lib/validations';
import { toast } from 'sonner';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: CoinMarketData[];
  onAdd: (data: {
    coin_id: string;
    coin_symbol: string;
    coin_name: string;
    type: TransactionType;
    amount: number;
    price_per_unit: number;
    transaction_date: string;
    notes?: string;
  }) => Promise<void>;
  preselectedCoin?: CoinMarketData | null;
}

export function AddTransactionModal({
  isOpen,
  onClose,
  coins,
  onAdd,
  preselectedCoin,
}: AddTransactionModalProps) {
  const [selectedCoinId, setSelectedCoinId] = useState<string>('bitcoin');
  const [type, setType] = useState<TransactionType>('BUY');
  const [amount, setAmount] = useState<string>('1');
  const [pricePerUnit, setPricePerUnit] = useState<string>('');
  const [transactionDate, setTransactionDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (preselectedCoin) {
      setSelectedCoinId(preselectedCoin.id);
      setPricePerUnit(String(preselectedCoin.live_price ?? preselectedCoin.current_price ?? ''));
    } else if (coins.length > 0) {
      const firstCoin = coins[0];
      setSelectedCoinId(firstCoin.id);
      setPricePerUnit(String(firstCoin.live_price ?? firstCoin.current_price ?? ''));
    }
  }, [preselectedCoin, coins, isOpen]);

  const handleCoinChange = (coinId: string) => {
    setSelectedCoinId(coinId);
    const found = coins.find((c) => c.id === coinId);
    if (found) {
      setPricePerUnit(String(found.live_price ?? found.current_price ?? ''));
    }
  };

  const currentCoin = coins.find((c) => c.id === selectedCoinId) || coins[0];
  const numAmount = parseFloat(amount) || 0;
  const numPrice = parseFloat(pricePerUnit) || 0;
  const totalValue = numAmount * numPrice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCoin) return;

    try {
      const validated = transactionSchema.parse({
        coin_id: currentCoin.id,
        coin_symbol: currentCoin.symbol.toUpperCase(),
        coin_name: currentCoin.name,
        type,
        amount: numAmount,
        price_per_unit: numPrice,
        transaction_date: new Date(transactionDate).toISOString(),
        notes,
      });

      setIsSubmitting(true);
      await onAdd({
        coin_id: validated.coin_id,
        coin_symbol: validated.coin_symbol,
        coin_name: validated.coin_name,
        type: validated.type,
        amount: validated.amount,
        price_per_unit: validated.price_per_unit,
        transaction_date: validated.transaction_date,
        notes: validated.notes,
      });
      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      if (err.errors && err.errors[0]) {
        toast.error(err.errors[0].message);
      } else {
        toast.error('Please check your input values.');
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add Transaction</DialogTitle>
          <DialogDescription>
            Record a cryptocurrency purchase or sale in your portfolio.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* BUY / SELL Switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl">
            <button
              type="button"
              onClick={() => setType('BUY')}
              className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                type === 'BUY'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Buy
            </button>
            <button
              type="button"
              onClick={() => setType('SELL')}
              className={`py-2 text-sm font-semibold rounded-lg transition-all ${
                type === 'SELL'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sell
            </button>
          </div>

          {/* Coin Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Asset</label>
            <select
              value={selectedCoinId}
              onChange={(e) => handleCoinChange(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {coins.map((coin) => (
                <option key={coin.id} value={coin.id}>
                  {coin.name} ({coin.symbol.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Amount & Price Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Quantity ({currentCoin?.symbol?.toUpperCase() || 'Asset'})
              </label>
              <Input
                type="number"
                step="any"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Price Per Unit ($)
              </label>
              <Input
                type="number"
                step="any"
                min="0"
                placeholder="0.00"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Date & Total Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Date</label>
              <Input
                type="date"
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Total Cost</label>
              <div className="h-10 px-3 rounded-lg bg-muted/50 border flex items-center font-mono font-bold text-sm">
                {formatCurrency(totalValue)}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Notes (Optional)</label>
            <Input
              type="text"
              placeholder="e.g. Binance DCA purchase, cold wallet transfer"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className={type === 'BUY' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}
            >
              {isSubmitting ? 'Saving...' : `Record ${type}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
