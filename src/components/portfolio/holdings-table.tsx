'use client';

import React from 'react';
import Image from 'next/image';
import { PortfolioHolding } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/formatters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, PlusCircle } from 'lucide-react';

interface HoldingsTableProps {
  holdings: PortfolioHolding[];
  onOpenTrade: (holding: PortfolioHolding) => void;
}

export function HoldingsTable({ holdings, onOpenTrade }: HoldingsTableProps) {
  if (holdings.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground border rounded-2xl bg-card/40">
        <p className="text-base font-semibold text-foreground">No active crypto holdings</p>
        <p className="text-xs text-muted-foreground mt-1">
          Record your first BUY transaction to start tracking profit & loss.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card/80 backdrop-blur-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 text-xs hover:bg-transparent">
            <TableHead>Asset</TableHead>
            <TableHead className="text-right">Balance</TableHead>
            <TableHead className="text-right">Avg Buy Price</TableHead>
            <TableHead className="text-right">Current Price</TableHead>
            <TableHead className="text-right">Total Value</TableHead>
            <TableHead className="text-right">Unrealized P&L</TableHead>
            <TableHead className="text-right">Allocation</TableHead>
            <TableHead className="text-right pr-6">Trade</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {holdings.map((h) => {
            const isProfit = h.total_pnl >= 0;

            return (
              <TableRow key={h.coin_id} className="hover:bg-muted/30 transition-colors">
                {/* Asset */}
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="relative h-7 w-7 rounded-full overflow-hidden bg-muted flex-shrink-0">
                      {h.coin_image ? (
                        <Image
                          src={h.coin_image}
                          alt={h.coin_name}
                          fill
                          sizes="28px"
                          className="object-contain"
                          unoptimized
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center font-bold text-xs">
                          {h.coin_symbol[0]}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm leading-none flex items-center gap-1.5">
                        {h.coin_name}
                        <Badge variant="outline" className="text-[10px] uppercase font-mono px-1 py-0 h-4">
                          {h.coin_symbol}
                        </Badge>
                      </span>
                    </div>
                  </div>
                </TableCell>

                {/* Balance */}
                <TableCell className="text-right font-mono text-sm font-medium">
                  {formatNumber(h.total_amount, 6)} <span className="text-xs text-muted-foreground">{h.coin_symbol}</span>
                </TableCell>

                {/* Avg Buy Price */}
                <TableCell className="text-right font-mono text-xs text-muted-foreground">
                  {formatCurrency(h.average_buy_price)}
                </TableCell>

                {/* Current Price */}
                <TableCell className="text-right font-mono text-sm font-semibold">
                  {formatCurrency(h.current_price)}
                </TableCell>

                {/* Total Current Value */}
                <TableCell className="text-right font-mono text-sm font-bold">
                  {formatCurrency(h.current_value)}
                </TableCell>

                {/* Total P&L */}
                <TableCell className="text-right">
                  <div className="flex flex-col items-end">
                    <span
                      className={`text-xs font-mono font-bold inline-flex items-center gap-0.5 ${
                        isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isProfit ? '+' : ''}
                      {formatCurrency(h.total_pnl)}
                    </span>
                    <span
                      className={`text-[11px] font-mono ${
                        isProfit ? 'text-emerald-600/80 dark:text-emerald-400/80' : 'text-rose-600/80 dark:text-rose-400/80'
                      }`}
                    >
                      {formatPercentage(h.total_pnl_percentage)}
                    </span>
                  </div>
                </TableCell>

                {/* Allocation */}
                <TableCell className="text-right font-mono text-xs">
                  <div className="flex flex-col items-end gap-1">
                    <span>{h.allocation_percentage.toFixed(1)}%</span>
                    <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${Math.min(100, Math.max(5, h.allocation_percentage))}%` }}
                      />
                    </div>
                  </div>
                </TableCell>

                {/* Action */}
                <TableCell className="text-right pr-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2.5 text-xs gap-1 rounded-lg hover:bg-primary/10 hover:text-primary"
                    onClick={() => onOpenTrade(h)}
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    Trade
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
