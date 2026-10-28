'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PortfolioSummary } from '@/types';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Award,
} from 'lucide-react';

interface PortfolioSummaryCardsProps {
  summary: PortfolioSummary;
}

export function PortfolioSummaryCards({ summary }: PortfolioSummaryCardsProps) {
  const isTotalProfit = summary.total_pnl >= 0;
  const isUnrealizedProfit = summary.unrealized_pnl >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Portfolio Value */}
      <Card className="bg-gradient-to-br from-card to-card/60 border-border/80 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase">
            <span>Portfolio Value</span>
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold font-mono mt-2 tracking-tight">
            {formatCurrency(summary.total_value)}
          </h2>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-mono">
            <span
              className={`font-semibold inline-flex items-center gap-0.5 ${
                isTotalProfit
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              {isTotalProfit ? (
                <ArrowUpRight className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5" />
              )}
              {formatPercentage(summary.total_pnl_percentage)}
            </span>
            <span className="text-muted-foreground">all-time return</span>
          </div>
        </CardContent>
      </Card>

      {/* 2. Total Profit & Loss */}
      <Card className="bg-card/60 border-border/80 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase">
            <span>Total P&L</span>
            <div
              className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                isTotalProfit
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : 'bg-rose-500/10 text-rose-500'
              }`}
            >
              {isTotalProfit ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
            </div>
          </div>
          <h3
            className={`text-2xl font-bold font-mono mt-2 ${
              isTotalProfit
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {isTotalProfit ? '+' : ''}
            {formatCurrency(summary.total_pnl)}
          </h3>
          <p className="text-xs text-muted-foreground mt-2">
            Invested: <strong className="font-mono text-foreground">{formatCurrency(summary.total_invested)}</strong>
          </p>
        </CardContent>
      </Card>

      {/* 3. Realized vs Unrealized */}
      <Card className="bg-card/60 border-border/80 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase">
            <span>P&L Breakdown</span>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-1.5 mt-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-muted-foreground">Unrealized:</span>
              <span
                className={`font-semibold ${
                  isUnrealizedProfit
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {formatCurrency(summary.unrealized_pnl)}
              </span>
            </div>
            <div className="flex justify-between text-xs font-mono">
              <span className="text-muted-foreground">Realized:</span>
              <span
                className={`font-semibold ${
                  summary.realized_pnl >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {formatCurrency(summary.realized_pnl)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Top Performer */}
      <Card className="bg-card/60 border-border/80 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase">
            <span>Top Asset</span>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Award className="h-4 w-4" />
            </div>
          </div>
          {summary.best_performer ? (
            <div className="mt-2">
              <h4 className="text-lg font-bold font-mono">
                {summary.best_performer.name}{' '}
                <span className="text-xs text-muted-foreground font-normal">
                  ({summary.best_performer.symbol})
                </span>
              </h4>
              <p className="text-xs font-semibold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                {formatPercentage(summary.best_performer.pnl_percentage)} total return
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground mt-4">No holdings recorded yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
