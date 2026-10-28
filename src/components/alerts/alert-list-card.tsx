'use client';

import React from 'react';
import { PriceAlert, CoinMarketData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { formatCurrency, formatDateTime } from '@/lib/formatters';
import {
  Bell,
  BellRing,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface AlertListCardProps {
  alerts: PriceAlert[];
  coins: CoinMarketData[];
  onDelete: (id: string) => Promise<void>;
  onToggleActive: (id: string) => Promise<void>;
  onOpenCreate: () => void;
}

export function AlertListCard({
  alerts,
  coins,
  onDelete,
  onToggleActive,
  onOpenCreate,
}: AlertListCardProps) {
  const priceMap = new Map<string, number>();
  coins.forEach((c) => {
    const live = c.live_price ?? c.current_price;
    priceMap.set(c.id.toLowerCase(), live);
    priceMap.set(c.symbol.toLowerCase(), live);
  });

  return (
    <Card className="bg-card/60 border-border/80 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <BellRing className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">Active Price Alerts</CardTitle>
            <p className="text-xs text-muted-foreground">
              Monitored in real-time with WebSocket price ticks.
            </p>
          </div>
        </div>
        <Button size="sm" onClick={onOpenCreate} className="gap-1.5">
          <Bell className="h-3.5 w-3.5" />
          Create Alert
        </Button>
      </CardHeader>
      <CardContent className="space-y-3 pt-2">
        {alerts.length === 0 ? (
          <div className="py-10 text-center text-muted-foreground">
            <p className="text-sm">No price alerts set</p>
            <p className="text-xs mt-1">Set a target price to get notified instantly when it hits.</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const currentPrice = priceMap.get(alert.coin_id.toLowerCase()) ?? 0;
            const isAbove = alert.condition === 'ABOVE';

            return (
              <div
                key={alert.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border transition-all ${
                  alert.is_triggered
                    ? 'bg-amber-500/5 border-amber-500/30'
                    : alert.is_active
                    ? 'bg-background/70 border-border'
                    : 'bg-muted/30 border-dashed opacity-60'
                }`}
              >
                {/* Left info */}
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl ${
                      alert.is_triggered
                        ? 'bg-amber-500/10 text-amber-500'
                        : isAbove
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-rose-500/10 text-rose-500'
                    }`}
                  >
                    {alert.is_triggered ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : isAbove ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{alert.coin_name}</span>
                      <Badge variant="outline" className="text-[10px] uppercase font-mono px-1 py-0 h-4">
                        {alert.coin_symbol}
                      </Badge>
                      {alert.is_triggered && (
                        <Badge variant="default" className="bg-amber-500 text-black text-[10px] px-1.5 py-0">
                          Triggered
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 font-mono">
                      <span>
                        Target:{' '}
                        <strong className="text-foreground">
                          {isAbove ? '≥' : '≤'} {formatCurrency(alert.target_price)}
                        </strong>
                      </span>
                      <span>•</span>
                      <span>Live: {formatCurrency(currentPrice)}</span>
                    </div>
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center justify-between sm:justify-end gap-3 mt-3 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0">
                  {alert.triggered_at ? (
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                      <Clock className="h-3 w-3" />
                      {formatDateTime(alert.triggered_at)}
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {alert.is_active ? 'Active' : 'Paused'}
                      </span>
                      <Switch
                        checked={alert.is_active}
                        onCheckedChange={() => onToggleActive(alert.id)}
                      />
                    </div>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                    onClick={() => onDelete(alert.id)}
                    title="Delete alert"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
