'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/formatters';
import { EmotionTag, TradingMode } from '@/context/trade-context';
import { ShieldCheck, AlertCircle, Info, Heart } from 'lucide-react';

interface OrderConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: TradingMode;
  coinName: string;
  coinSymbol: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT';
  amount: number;
  price: number;
  onConfirm: (emotionTag: EmotionTag, notes?: string) => Promise<void>;
}

const EMOTIONS: { label: EmotionTag; emoji: string; color: string }[] = [
  { label: 'Calm', emoji: '🧘‍♂️', color: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  { label: 'Conviction', emoji: '🎯', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' },
  { label: 'Disciplined', emoji: '📐', color: 'bg-purple-500/10 text-purple-500 border-purple-500/30' },
  { label: 'FOMO', emoji: '⚡', color: 'bg-amber-500/10 text-amber-500 border-amber-500/30' },
  { label: 'Panic', emoji: '😱', color: 'bg-rose-500/10 text-rose-500 border-rose-500/30' },
  { label: 'Greed', emoji: '🤑', color: 'bg-orange-500/10 text-orange-500 border-orange-500/30' },
];

export function OrderConfirmModal({
  isOpen,
  onClose,
  mode,
  coinName,
  coinSymbol,
  side,
  type,
  amount,
  price,
  onConfirm,
}: OrderConfirmModalProps) {
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionTag>('Disciplined');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = amount * price;
  const estimatedFee = subtotal * 0.001; // 0.1% spot fee
  const estimatedSlippage = type === 'MARKET' ? subtotal * 0.0005 : 0; // 0.05%
  const totalCost = side === 'BUY' ? subtotal + estimatedFee : subtotal - estimatedFee;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    await onConfirm(selectedEmotion, notes);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">Confirm Order</DialogTitle>
            <Badge variant={mode === 'paper' ? 'secondary' : 'default'} className="uppercase font-mono text-[10px]">
              {mode === 'paper' ? 'Virtual Paper' : 'Binance Testnet'}
            </Badge>
          </div>
          <DialogDescription className="text-xs">
            Review order breakdown, fees, estimated slippage, and tag your emotion.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          {/* Summary Box */}
          <div className="p-4 rounded-xl bg-muted/50 border space-y-3 font-mono">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground uppercase font-sans font-semibold">Action</span>
              <span className={`font-bold px-2 py-0.5 rounded text-xs ${side === 'BUY' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                {side} {type}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground uppercase font-sans font-semibold">Asset</span>
              <span className="font-bold text-foreground">
                {coinName} ({coinSymbol})
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground uppercase font-sans font-semibold">Quantity</span>
              <span className="font-semibold text-foreground">
                {amount} {coinSymbol}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground uppercase font-sans font-semibold">Price per Unit</span>
              <span className="font-semibold text-foreground">{formatCurrency(price)}</span>
            </div>

            <div className="border-t pt-2 space-y-1.5 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Exchange Fee (0.1%):</span>
                <span>{formatCurrency(estimatedFee)}</span>
              </div>
              <div className="flex justify-between">
                <span>Est. Slippage:</span>
                <span>{type === 'MARKET' ? '~0.05%' : '0.00%'}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-foreground pt-1 border-t">
                <span>{side === 'BUY' ? 'Total Payable' : 'Net Proceeds'}:</span>
                <span className="text-primary">{formatCurrency(totalCost)}</span>
              </div>
            </div>
          </div>

          {/* Trade Journal Emotion Tag */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5 text-rose-500" />
              Journal Emotion Tag (Behavioral Tracker)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {EMOTIONS.map((e) => (
                <button
                  key={e.label}
                  type="button"
                  onClick={() => setSelectedEmotion(e.label)}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    selectedEmotion === e.label
                      ? `${e.color} ring-2 ring-primary/30 shadow-sm`
                      : 'bg-muted/30 text-muted-foreground border-transparent hover:bg-muted'
                  }`}
                >
                  <span>{e.emoji}</span>
                  <span>{e.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Risk Disclaimer */}
          <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 flex items-start gap-2 text-[11px] text-muted-foreground leading-relaxed">
            <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <span>
              CryptoPulse is strictly <strong>non-custodial</strong>. We never hold your fiat, coins, or private keys. All trades execute directly through your paper wallet or your own verified testnet API.
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={side === 'BUY' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}
          >
            {isSubmitting ? 'Executing...' : `Confirm ${side} Order`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
