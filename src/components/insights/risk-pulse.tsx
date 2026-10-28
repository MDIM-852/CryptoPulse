'use client';

import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PortfolioHolding } from '@/types';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import { ShieldAlert, Activity, ArrowRight, CheckCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface RiskPulseProps {
  holdings: PortfolioHolding[];
  totalValue: number;
}

export function RiskPulse({ holdings, totalValue }: RiskPulseProps) {
  const analysis = useMemo(() => {
    if (!holdings.length || totalValue <= 0) {
      return {
        score: 15,
        rating: 'Low Risk',
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
        concentration: 0,
        topHoldingName: 'None',
        volatilityScore: 10,
        rebalanceSuggestions: [],
      };
    }

    // 1. Concentration calculation (Herfindahl Index)
    let herfindahl = 0;
    let topHolding = holdings[0];

    holdings.forEach((h) => {
      const share = h.current_value / totalValue;
      herfindahl += share * share;
      if (h.current_value > topHolding.current_value) {
        topHolding = h;
      }
    });

    // Score from 0 to 100
    // If 1 asset is 100% of portfolio, concentration score is 50
    const concentrationScore = Math.min(60, herfindahl * 60);

    // 2. Volatility factor (BTC/ETH have lower beta than low-cap meme coins)
    let weightedVolatility = 0;
    holdings.forEach((h) => {
      const share = h.current_value / totalValue;
      const isBlueChip = ['BTC', 'ETH'].includes(h.coin_symbol.toUpperCase());
      const assetVol = isBlueChip ? 20 : 45;
      weightedVolatility += share * assetVol;
    });

    const totalScore = Math.min(100, Math.round(concentrationScore + weightedVolatility));

    let rating = 'Low Risk';
    let color = 'text-emerald-500';
    let bg = 'bg-emerald-500/10';

    if (totalScore > 65) {
      rating = 'High Risk';
      color = 'text-rose-500';
      bg = 'bg-rose-500/10';
    } else if (totalScore > 35) {
      rating = 'Moderate Risk';
      color = 'text-amber-500';
      bg = 'bg-amber-500/10';
    }

    // Target balanced model: BTC 50%, ETH 30%, Alts 20%
    const rebalanceSuggestions: {
      asset: string;
      currentAllocation: number;
      targetAllocation: number;
      action: 'BUY' | 'SELL';
      amountUSD: number;
    }[] = [];

    const topWeight = (topHolding.current_value / totalValue) * 100;
    if (topWeight > 60) {
      rebalanceSuggestions.push({
        asset: topHolding.coin_symbol,
        currentAllocation: topWeight,
        targetAllocation: 45,
        action: 'SELL',
        amountUSD: totalValue * ((topWeight - 45) / 100),
      });
    }

    return {
      score: totalScore,
      rating,
      color,
      bg,
      concentration: topWeight,
      topHoldingName: topHolding.coin_name,
      volatilityScore: Math.round(weightedVolatility),
      rebalanceSuggestions,
    };
  }, [holdings, totalValue]);

  return (
    <Card className="bg-card/70 border-border/80 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">Portfolio Risk Pulse</CardTitle>
              <CardDescription className="text-xs">
                Quantitative 0-100 safety score evaluating asset concentration, beta, and volatility.
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className={`font-mono font-bold text-xs ${analysis.color}`}>
            {analysis.rating}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Score & Gauge Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-muted/40 border">
          {/* Score Meter */}
          <div className="flex items-center gap-4">
            <div className={`h-16 w-16 rounded-2xl ${analysis.bg} ${analysis.color} flex flex-col items-center justify-center font-bold text-2xl font-mono shadow-inner`}>
              {analysis.score}
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Risk Rating</p>
              <h3 className={`text-lg font-bold ${analysis.color}`}>{analysis.rating}</h3>
            </div>
          </div>

          {/* Concentration Metric */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase">Max Concentration</p>
            <h3 className="text-xl font-bold font-mono text-foreground mt-1">
              {analysis.concentration.toFixed(1)}%
            </h3>
            <p className="text-xs text-muted-foreground">In {analysis.topHoldingName}</p>
          </div>

          {/* Volatility Index */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase">Asset Volatility</p>
            <h3 className="text-xl font-bold font-mono text-foreground mt-1">
              {analysis.volatilityScore} / 100
            </h3>
            <p className="text-xs text-muted-foreground">Weighted Beta Index</p>
          </div>
        </div>

        {/* Rebalance Engine Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold flex items-center gap-1.5">
              <RefreshCw className="h-4 w-4 text-primary" />
              Smart Rebalancing Recommendations
            </h4>
          </div>

          {analysis.rebalanceSuggestions.length === 0 ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              <span>Your portfolio is well-balanced across assets! No urgent rebalancing required.</span>
            </div>
          ) : (
            <div className="space-y-2">
              {analysis.rebalanceSuggestions.map((rec, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border bg-card/60 text-xs font-mono gap-2"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant={rec.action === 'BUY' ? 'success' : 'destructive'} className="font-bold">
                      {rec.action}
                    </Badge>
                    <span className="font-bold text-foreground">{rec.asset}</span>
                    <span className="text-muted-foreground">
                      Current: {rec.currentAllocation.toFixed(1)}% → Target: {rec.targetAllocation}%
                    </span>
                  </div>

                  <div className="flex items-center gap-3 justify-end">
                    <span className="font-bold text-primary">{formatCurrency(rec.amountUSD)}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => toast.success(`Simulated rebalance order queued for ${rec.asset}`)}
                    >
                      Execute
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
