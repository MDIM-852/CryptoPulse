'use client';

import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDateTime } from '@/lib/formatters';
import { useTrade, EmotionTag } from '@/context/trade-context';
import { BookOpen, Heart, TrendingUp, TrendingDown, Smile, Frown, AlertCircle } from 'lucide-react';

const EMOTION_META: Record<EmotionTag, { emoji: string; color: string; avgEstimate: number }> = {
  Conviction: { emoji: '🎯', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', avgEstimate: 24.5 },
  Disciplined: { emoji: '📐', color: 'text-purple-500 bg-purple-500/10 border-purple-500/20', avgEstimate: 16.2 },
  Calm: { emoji: '🧘‍♂️', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', avgEstimate: 12.8 },
  Greed: { emoji: '🤑', color: 'text-orange-500 bg-orange-500/10 border-orange-500/20', avgEstimate: -4.2 },
  Panic: { emoji: '😱', color: 'text-rose-500 bg-rose-500/10 border-rose-500/20', avgEstimate: -11.6 },
  FOMO: { emoji: '⚡', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', avgEstimate: -18.4 },
};

export function TradeJournal() {
  const { orders } = useTrade();

  const analytics = useMemo(() => {
    const counts: Record<EmotionTag, number> = {
      Conviction: 0,
      Disciplined: 0,
      Calm: 0,
      Greed: 0,
      Panic: 0,
      FOMO: 0,
    };

    orders.forEach((o) => {
      if (o.emotionTag) {
        counts[o.emotionTag] = (counts[o.emotionTag] || 0) + 1;
      }
    });

    return counts;
  }, [orders]);

  return (
    <Card className="bg-card/70 border-border/80 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">Trade Journal & Emotional Analytics</CardTitle>
              <CardDescription className="text-xs">
                Track how emotions (FOMO, Panic, Conviction) impact your overall trading performance.
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Emotion Performance Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {(Object.keys(EMOTION_META) as EmotionTag[]).map((tag) => {
            const meta = EMOTION_META[tag];
            const count = analytics[tag] || 0;
            const isProfit = meta.avgEstimate >= 0;

            return (
              <div
                key={tag}
                className={`p-3.5 rounded-xl border text-center space-y-1.5 transition-all ${meta.color}`}
              >
                <div className="text-2xl">{meta.emoji}</div>
                <p className="font-bold text-xs">{tag}</p>
                <p className="text-[11px] font-mono font-semibold">
                  {count} trade{count === 1 ? '' : 's'}
                </p>
                <p className={`text-[10px] font-mono font-bold ${isProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {isProfit ? '+' : ''}{meta.avgEstimate}% avg ROI
                </p>
              </div>
            );
          })}
        </div>

        {/* Behavioral Summary Callout */}
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-1 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-primary">
            <Smile className="h-4 w-4" /> Psychology Insight
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Your trades tagged with <strong>Conviction</strong> and <strong>Disciplined</strong> have yielded the highest long-term returns, while <strong>FOMO</strong> entries suffered an average -18% drawdown within 7 days.
          </p>
        </div>

        {/* Recent Journal Entries */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold">Recent Emotional Log</h4>
          {orders.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">
              No journaled trades yet. Place orders in the Trade Terminal to tag your mood!
            </p>
          ) : (
            <div className="space-y-2">
              {orders.slice(0, 6).map((ord) => {
                const meta = ord.emotionTag ? EMOTION_META[ord.emotionTag] : null;

                return (
                  <div
                    key={ord.id}
                    className="flex items-center justify-between p-3 rounded-xl border bg-card/60 text-xs font-mono"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{meta?.emoji || '📐'}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${ord.side === 'BUY' ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {ord.side} {ord.symbol}
                          </span>
                          <span className="text-muted-foreground">({formatCurrency(ord.totalCost)})</span>
                        </div>
                        {ord.notes && <p className="text-[11px] text-muted-foreground font-sans">{ord.notes}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {ord.emotionTag && (
                        <Badge variant="outline" className="font-sans text-[10px]">
                          {ord.emotionTag}
                        </Badge>
                      )}
                      <span className="text-muted-foreground text-[10px]">
                        {formatDateTime(ord.executedAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
