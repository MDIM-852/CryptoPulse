'use client';

import React from 'react';
import { PortfolioHolding } from '@/types';
import { formatCurrency, formatPercentage } from '@/lib/formatters';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface AllocationChartProps {
  holdings: PortfolioHolding[];
  totalValue: number;
}

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#8b5cf6', // purple
  '#f59e0b', // amber
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#64748b', // slate
];

export function AllocationChart({ holdings, totalValue }: AllocationChartProps) {
  if (!holdings.length || totalValue <= 0) {
    return (
      <Card className="h-full bg-card/60 border-border/80 flex flex-col items-center justify-center p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No assets to allocate. Add a transaction to view portfolio breakdown.
        </p>
      </Card>
    );
  }

  const chartData = holdings.map((h, index) => ({
    name: h.coin_name,
    symbol: h.coin_symbol,
    value: h.current_value,
    allocation: h.allocation_percentage,
    color: COLORS[index % COLORS.length],
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-xl border bg-background/95 p-3 shadow-lg backdrop-blur-sm text-xs font-mono">
          <p className="font-bold text-foreground">
            {data.name} ({data.symbol})
          </p>
          <p className="text-muted-foreground mt-1">
            Value: <strong className="text-foreground">{formatCurrency(data.value)}</strong>
          </p>
          <p className="text-primary mt-0.5">
            Share: <strong>{formatPercentage(data.allocation)}</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="h-full bg-card/60 border-border/80 flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Asset Allocation</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col md:flex-row items-center justify-between gap-4 p-4 pt-0">
        {/* Pie/Donut Chart Container */}
        <div className="w-full md:w-1/2 h-56 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">Holdings</span>
            <span className="text-lg font-bold font-mono">{holdings.length}</span>
          </div>
        </div>

        {/* Legend List */}
        <div className="w-full md:w-1/2 space-y-2">
          {chartData.slice(0, 5).map((item) => (
            <div key={item.symbol} className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="font-medium text-foreground truncate max-w-[100px]">{item.name}</span>
              </div>
              <div className="text-right">
                <span className="font-semibold">{item.allocation.toFixed(1)}%</span>
                <span className="text-muted-foreground text-[10px] ml-1.5">
                  ({formatCurrency(item.value)})
                </span>
              </div>
            </div>
          ))}
          {chartData.length > 5 && (
            <p className="text-[11px] text-muted-foreground text-right pt-1">
              + {chartData.length - 5} more smaller assets
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
