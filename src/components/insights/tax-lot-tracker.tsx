'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Transaction } from '@/types';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { FileSpreadsheet, Download, Calculator, ShieldCheck, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';

interface TaxLotTrackerProps {
  transactions: Transaction[];
}

type AccountingMethod = 'FIFO' | 'LIFO' | 'HIFO';

interface MatchedTaxLot {
  id: string;
  coinSymbol: string;
  coinName: string;
  buyDate: string;
  sellDate: string;
  amount: number;
  costBasis: number;
  proceeds: number;
  gainOrLoss: number;
  isLongTerm: boolean;
}

export function TaxLotTracker({ transactions }: TaxLotTrackerProps) {
  const [method, setMethod] = useState<AccountingMethod>('HIFO');

  const taxAnalysis = useMemo(() => {
    // Group transactions by coin
    const buyPool: Record<string, { date: string; amount: number; price: number }[]> = {};
    const matchedLots: MatchedTaxLot[] = [];

    // Sort transactions
    const sortedTxs = [...transactions].sort(
      (a, b) => new Date(a.transaction_date).getTime() - new Date(b.transaction_date).getTime()
    );

    for (const tx of sortedTxs) {
      const symbol = tx.coin_symbol.toUpperCase();
      if (!buyPool[symbol]) buyPool[symbol] = [];

      if (tx.type === 'BUY') {
        buyPool[symbol].push({
          date: tx.transaction_date,
          amount: tx.amount,
          price: tx.price_per_unit,
        });
      } else if (tx.type === 'SELL') {
        let remainingToSell = tx.amount;
        const availableLots = buyPool[symbol];

        // Sort lots based on chosen accounting method
        if (method === 'FIFO') {
          availableLots.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        } else if (method === 'LIFO') {
          availableLots.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        } else if (method === 'HIFO') {
          availableLots.sort((a, b) => b.price - a.price); // Highest cost basis first
        }

        for (let i = 0; i < availableLots.length && remainingToSell > 0; i++) {
          const lot = availableLots[i];
          if (lot.amount <= 0) continue;

          const matchedQty = Math.min(remainingToSell, lot.amount);
          const costBasis = matchedQty * lot.price;
          const proceeds = matchedQty * tx.price_per_unit;
          const gainOrLoss = proceeds - costBasis;

          const buyTime = new Date(lot.date).getTime();
          const sellTime = new Date(tx.transaction_date).getTime();
          const isLongTerm = (sellTime - buyTime) >= 365 * 86400000;

          matchedLots.push({
            id: `lot-${matchedLots.length + 1}`,
            coinSymbol: symbol,
            coinName: tx.coin_name,
            buyDate: lot.date,
            sellDate: tx.transaction_date,
            amount: matchedQty,
            costBasis,
            proceeds,
            gainOrLoss,
            isLongTerm,
          });

          lot.amount -= matchedQty;
          remainingToSell -= matchedQty;
        }
      }
    }

    let totalGains = 0;
    let shortTermGains = 0;
    let longTermGains = 0;

    matchedLots.forEach((l) => {
      totalGains += l.gainOrLoss;
      if (l.isLongTerm) {
        longTermGains += l.gainOrLoss;
      } else {
        shortTermGains += l.gainOrLoss;
      }
    });

    return {
      matchedLots,
      totalGains,
      shortTermGains,
      longTermGains,
    };
  }, [transactions, method]);

  const handleExportCSV = () => {
    if (taxAnalysis.matchedLots.length === 0) {
      toast.info('No closed tax lots to export yet.');
      return;
    }

    const headers = 'Asset,Buy Date,Sell Date,Quantity,Cost Basis (USD),Proceeds (USD),Gain/Loss (USD),Holding Type\n';
    const rows = taxAnalysis.matchedLots
      .map(
        (l) =>
          `${l.coinSymbol},${l.buyDate.split('T')[0]},${l.sellDate.split('T')[0]},${l.amount.toFixed(4)},${l.costBasis.toFixed(2)},${l.proceeds.toFixed(2)},${l.gainOrLoss.toFixed(2)},${l.isLongTerm ? 'LONG_TERM' : 'SHORT_TERM'}`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `cryptopulse_tax_lots_${method}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${taxAnalysis.matchedLots.length} tax lots to CSV`);
  };

  return (
    <Card className="bg-card/70 border-border/80 shadow-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">Auto Tax-Lot Tracker</CardTitle>
              <CardDescription className="text-xs">
                FIFO / LIFO / HIFO cost-basis matching and IRS Form 8949 CSV export.
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Method Switcher */}
            <div className="flex items-center gap-1 p-1 bg-muted rounded-xl">
              {(['HIFO', 'FIFO', 'LIFO'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`px-2.5 py-1 text-xs font-bold font-mono rounded-lg transition-all ${
                    method === m
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title={m === 'HIFO' ? 'Highest-In First-Out (Minimizes tax)' : m}
                >
                  {m}
                </button>
              ))}
            </div>

            <Button size="sm" variant="outline" onClick={handleExportCSV} className="gap-1.5 text-xs">
              <Download className="h-3.5 w-3.5" />
              CSV Export
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Tax Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-muted/40 border">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase">Net Realized Gain / Loss</p>
            <h3
              className={`text-2xl font-bold font-mono mt-1 ${
                taxAnalysis.totalGains >= 0 ? 'text-emerald-500' : 'text-rose-500'
              }`}
            >
              {taxAnalysis.totalGains >= 0 ? '+' : ''}
              {formatCurrency(taxAnalysis.totalGains)}
            </h3>
            <p className="text-[11px] text-muted-foreground font-mono">Matched using {method}</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase">Short-Term Gains (&lt;1 Year)</p>
            <h3 className="text-xl font-bold font-mono text-foreground mt-1">
              {formatCurrency(taxAnalysis.shortTermGains)}
            </h3>
            <p className="text-[11px] text-muted-foreground">Taxed at ordinary income rates</p>
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase">Long-Term Gains (&gt;1 Year)</p>
            <h3 className="text-xl font-bold font-mono text-foreground mt-1">
              {formatCurrency(taxAnalysis.longTermGains)}
            </h3>
            <p className="text-[11px] text-muted-foreground">Preferential capital gains rate</p>
          </div>
        </div>

        {/* Matched Tax Lots Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold flex items-center gap-1.5">
              <FileSpreadsheet className="h-4 w-4 text-primary" />
              Matched Disposals & Tax Lots ({taxAnalysis.matchedLots.length})
            </h4>
          </div>

          {taxAnalysis.matchedLots.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground border rounded-xl bg-card/30">
              <p className="text-xs">No SELL orders matched yet. Sell transactions will generate tax lots here.</p>
            </div>
          ) : (
            <div className="rounded-xl border bg-card/60 overflow-hidden">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-muted/40 border-b">
                  <tr>
                    <th className="p-3">Asset</th>
                    <th className="p-3">Acquired</th>
                    <th className="p-3">Sold</th>
                    <th className="p-3 text-right">Cost Basis</th>
                    <th className="p-3 text-right">Proceeds</th>
                    <th className="p-3 text-right">Net Gain</th>
                    <th className="p-3 text-right">Classification</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {taxAnalysis.matchedLots.map((lot) => (
                    <tr key={lot.id} className="hover:bg-muted/30">
                      <td className="p-3 font-bold font-sans text-foreground">{lot.coinSymbol}</td>
                      <td className="p-3 text-muted-foreground">{formatDate(lot.buyDate)}</td>
                      <td className="p-3 text-muted-foreground">{formatDate(lot.sellDate)}</td>
                      <td className="p-3 text-right">{formatCurrency(lot.costBasis)}</td>
                      <td className="p-3 text-right">{formatCurrency(lot.proceeds)}</td>
                      <td
                        className={`p-3 text-right font-bold ${
                          lot.gainOrLoss >= 0 ? 'text-emerald-500' : 'text-rose-500'
                        }`}
                      >
                        {lot.gainOrLoss >= 0 ? '+' : ''}
                        {formatCurrency(lot.gainOrLoss)}
                      </td>
                      <td className="p-3 text-right">
                        <Badge
                          variant={lot.isLongTerm ? 'success' : 'outline'}
                          className="text-[9px] font-mono px-1.5 py-0"
                        >
                          {lot.isLongTerm ? 'LONG-TERM' : 'SHORT-TERM'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
