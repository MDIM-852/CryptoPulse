'use client';

import React, { useState } from 'react';
import { useCoins } from '@/hooks/use-coins';
import { usePortfolio } from '@/hooks/use-portfolio';
import { TimeMachine } from '@/components/insights/time-machine';
import { ExplainMove } from '@/components/insights/explain-move';
import { RiskPulse } from '@/components/insights/risk-pulse';
import { TradeJournal } from '@/components/insights/trade-journal';
import { MultiConditionAlerts } from '@/components/insights/multi-condition-alerts';
import { TaxLotTracker } from '@/components/insights/tax-lot-tracker';
import { PrivacyShareModal } from '@/components/insights/privacy-share-modal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  History,
  Activity,
  BookOpen,
  GitBranch,
  Calculator,
  Share2,
} from 'lucide-react';

export default function InsightsPage() {
  const { coins } = useCoins();
  const { transactions, holdings, summary } = usePortfolio(coins);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Intelligence & Insights</h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              <Sparkles className="h-3.5 w-3.5" />
              AI & Analytics Hub
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Behavioral trading psychology, historical simulations, automated tax-lots, and risk management.
          </p>
        </div>

        <Button
          onClick={() => setIsShareModalOpen(true)}
          variant="outline"
          className="gap-1.5 text-xs font-semibold border-primary/30 text-primary hover:bg-primary/5"
        >
          <Share2 className="h-3.5 w-3.5" />
          Share Public Portfolio
        </Button>
      </div>

      {/* Unified Minimalist Tabs Container */}
      <Tabs defaultValue="time_machine" className="space-y-6">
        <div className="border-b pb-2 overflow-x-auto">
          <TabsList className="bg-muted/80 p-1">
            <TabsTrigger value="time_machine" className="gap-2 text-xs font-semibold">
              <History className="h-3.5 w-3.5" />
              Time Machine
            </TabsTrigger>
            <TabsTrigger value="explain_move" className="gap-2 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              Explain the Move
            </TabsTrigger>
            <TabsTrigger value="risk_pulse" className="gap-2 text-xs font-semibold">
              <Activity className="h-3.5 w-3.5" />
              Risk Pulse
            </TabsTrigger>
            <TabsTrigger value="journal" className="gap-2 text-xs font-semibold">
              <BookOpen className="h-3.5 w-3.5" />
              Trade Journal
            </TabsTrigger>
            <TabsTrigger value="smart_alerts" className="gap-2 text-xs font-semibold">
              <GitBranch className="h-3.5 w-3.5" />
              Smart Alerts
            </TabsTrigger>
            <TabsTrigger value="tax_tracker" className="gap-2 text-xs font-semibold">
              <Calculator className="h-3.5 w-3.5" />
              Tax-Lot Tracker
            </TabsTrigger>
          </TabsList>
        </div>

        {/* 1. Time Machine */}
        <TabsContent value="time_machine" className="mt-0">
          <TimeMachine coins={coins} />
        </TabsContent>

        {/* 2. Explain the Move */}
        <TabsContent value="explain_move" className="mt-0">
          <ExplainMove coins={coins} />
        </TabsContent>

        {/* 3. Risk Pulse */}
        <TabsContent value="risk_pulse" className="mt-0">
          <RiskPulse holdings={holdings} totalValue={summary.total_value} />
        </TabsContent>

        {/* 4. Trade Journal */}
        <TabsContent value="journal" className="mt-0">
          <TradeJournal />
        </TabsContent>

        {/* 5. Smart Multi-Condition Alerts */}
        <TabsContent value="smart_alerts" className="mt-0">
          <MultiConditionAlerts coins={coins} holdings={holdings} />
        </TabsContent>

        {/* 6. Tax-Lot Tracker */}
        <TabsContent value="tax_tracker" className="mt-0">
          <TaxLotTracker transactions={transactions} />
        </TabsContent>
      </Tabs>

      {/* Privacy Share Modal */}
      {isShareModalOpen && (
        <PrivacyShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          portfolioSlug="demo-trader"
        />
      )}
    </div>
  );
}
