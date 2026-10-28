'use client';

import React, { useState } from 'react';
import { useCoins } from '@/hooks/use-coins';
import { usePortfolio } from '@/hooks/use-portfolio';
import { PortfolioSummaryCards } from '@/components/portfolio/portfolio-summary-cards';
import { AllocationChart } from '@/components/portfolio/allocation-chart';
import { HoldingsTable } from '@/components/portfolio/holdings-table';
import { TransactionHistoryTable } from '@/components/portfolio/transaction-history-table';
import { AddTransactionModal } from '@/components/portfolio/add-transaction-modal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, PieChart, History } from 'lucide-react';
import { CoinMarketData, PortfolioHolding } from '@/types';

export default function PortfolioPage() {
  const { coins, isLoading: isCoinsLoading } = useCoins();
  const {
    transactions,
    holdings,
    summary,
    isLoading: isPortfolioLoading,
    addTransaction,
    deleteTransaction,
  } = usePortfolio(coins);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedCoinForModal, setSelectedCoinForModal] = useState<CoinMarketData | null>(null);

  const handleOpenTradeForHolding = (holding: PortfolioHolding) => {
    const coin = coins.find((c) => c.id === holding.coin_id) || null;
    setSelectedCoinForModal(coin);
    setIsModalOpen(true);
  };

  const handleOpenGeneralAdd = () => {
    setSelectedCoinForModal(null);
    setIsModalOpen(true);
  };

  if (isPortfolioLoading && transactions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Add Transaction Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Portfolio Tracker</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time balance, profit & loss, and asset allocation across all your holdings.
          </p>
        </div>
        <Button onClick={handleOpenGeneralAdd} className="gap-1.5 shadow-sm font-semibold">
          <Plus className="h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      {/* Metric Cards */}
      <PortfolioSummaryCards summary={summary} />

      {/* Allocation Chart and Key Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <AllocationChart holdings={holdings} totalValue={summary.total_value} />
        </div>
      </div>

      {/* Tabs: Holdings vs Transaction History */}
      <Tabs defaultValue="holdings" className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <TabsList className="bg-muted/80 p-1">
            <TabsTrigger value="holdings" className="gap-2 text-xs font-semibold">
              <PieChart className="h-3.5 w-3.5" />
              Holdings ({holdings.length})
            </TabsTrigger>
            <TabsTrigger value="transactions" className="gap-2 text-xs font-semibold">
              <History className="h-3.5 w-3.5" />
              Transaction History ({transactions.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="holdings" className="mt-0 space-y-4">
          <HoldingsTable holdings={holdings} onOpenTrade={handleOpenTradeForHolding} />
        </TabsContent>

        <TabsContent value="transactions" className="mt-0 space-y-4">
          <TransactionHistoryTable transactions={transactions} onDelete={deleteTransaction} />
        </TabsContent>
      </Tabs>

      {/* Transaction Modal */}
      {isModalOpen && (
        <AddTransactionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          coins={coins}
          preselectedCoin={selectedCoinForModal}
          onAdd={addTransaction}
        />
      )}
    </div>
  );
}
