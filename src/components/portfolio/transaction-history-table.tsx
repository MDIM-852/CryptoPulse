'use client';

import React from 'react';
import { Transaction } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatDate, formatNumber } from '@/lib/formatters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface TransactionHistoryTableProps {
  transactions: Transaction[];
  onDelete: (id: string) => Promise<void>;
}

export function TransactionHistoryTable({
  transactions,
  onDelete,
}: TransactionHistoryTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground border rounded-2xl bg-card/40">
        <p className="text-base font-semibold text-foreground">No transaction history</p>
        <p className="text-xs text-muted-foreground mt-1">
          Transactions will appear here as you buy or sell cryptocurrencies.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card/80 backdrop-blur-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 text-xs hover:bg-transparent">
            <TableHead>Type</TableHead>
            <TableHead>Asset</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Execution Price</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead className="text-right pr-6">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => {
            const isBuy = tx.type === 'BUY';
            const total = tx.amount * tx.price_per_unit;

            return (
              <TableRow key={tx.id} className="hover:bg-muted/30 transition-colors">
                {/* Type Badge */}
                <TableCell>
                  <Badge
                    variant={isBuy ? 'success' : 'destructive'}
                    className="font-mono text-[10px] font-bold uppercase px-2 py-0.5"
                  >
                    {tx.type}
                  </Badge>
                </TableCell>

                {/* Asset */}
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">{tx.coin_name}</span>
                    <span className="text-[11px] font-mono text-muted-foreground uppercase">{tx.coin_symbol}</span>
                  </div>
                </TableCell>

                {/* Amount */}
                <TableCell className="text-right font-mono text-sm font-medium">
                  {formatNumber(tx.amount, 6)}
                </TableCell>

                {/* Execution Price */}
                <TableCell className="text-right font-mono text-sm text-muted-foreground">
                  {formatCurrency(tx.price_per_unit)}
                </TableCell>

                {/* Total */}
                <TableCell className="text-right font-mono text-sm font-bold">
                  {formatCurrency(total)}
                </TableCell>

                {/* Date */}
                <TableCell className="text-xs text-muted-foreground">
                  {formatDate(tx.transaction_date)}
                </TableCell>

                {/* Notes */}
                <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">
                  {tx.notes || '—'}
                </TableCell>

                {/* Action */}
                <TableCell className="text-right pr-6">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                    onClick={() => onDelete(tx.id)}
                    title="Delete transaction"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
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
