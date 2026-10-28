'use client';

import React from 'react';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface FlashPriceProps {
  price: number;
  flash?: 'up' | 'down' | null;
  className?: string;
  minimumFractionDigits?: number;
}

export function FlashPrice({
  price,
  flash,
  className,
  minimumFractionDigits,
}: FlashPriceProps) {
  const formatted = formatCurrency(price, 'USD', minimumFractionDigits);

  return (
    <span
      className={cn(
        'inline-block px-1.5 py-0.5 rounded font-mono font-medium transition-all duration-300',
        flash === 'up' && 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold',
        flash === 'down' && 'bg-red-500/20 text-red-600 dark:text-red-400 font-bold',
        className
      )}
    >
      {formatted}
    </span>
  );
}
