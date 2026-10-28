'use client';

import React, { useState } from 'react';
import { useCoins } from '@/hooks/use-coins';
import { useWatchlist } from '@/hooks/use-watchlist';
import { useAlerts } from '@/hooks/use-alerts';
import { usePortfolio } from '@/hooks/use-portfolio';
import { WatchlistCoinsGrid } from '@/components/watchlist/watchlist-coins-grid';
import { AlertListCard } from '@/components/alerts/alert-list-card';
import { CreateAlertModal } from '@/components/alerts/create-alert-modal';
import { AddTransactionModal } from '@/components/portfolio/add-transaction-modal';
import { CoinMarketData } from '@/types';

export default function WatchlistPage() {
  const { coins } = useCoins();
  const { watchlist, toggleWatchlist } = useWatchlist();
  const { alerts, createAlert, deleteAlert, toggleAlertActive } = useAlerts(coins);
  const { addTransaction } = usePortfolio(coins);

  // Modals state
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [selectedAlertCoin, setSelectedAlertCoin] = useState<CoinMarketData | null>(null);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [selectedTxCoin, setSelectedTxCoin] = useState<CoinMarketData | null>(null);

  const handleOpenAlertModal = (coin?: CoinMarketData) => {
    setSelectedAlertCoin(coin || null);
    setIsAlertModalOpen(true);
  };

  const handleOpenTradeModal = (coin: CoinMarketData) => {
    setSelectedTxCoin(coin);
    setIsTxModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Watchlist & Price Alerts</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Monitor your favorite cryptocurrencies and receive instant notifications when price targets are reached.
        </p>
      </div>

      {/* Section 1: Price Alerts List Card */}
      <AlertListCard
        alerts={alerts}
        coins={coins}
        onDelete={deleteAlert}
        onToggleActive={toggleAlertActive}
        onOpenCreate={() => handleOpenAlertModal()}
      />

      {/* Section 2: Starred Watchlist Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Watchlist Assets ({watchlist.length})</h2>
        </div>
        <WatchlistCoinsGrid
          watchlist={watchlist}
          coins={coins}
          onToggleWatchlist={toggleWatchlist}
          onOpenAlertModal={handleOpenAlertModal}
          onOpenTradeModal={handleOpenTradeModal}
        />
      </div>

      {/* Create Alert Modal */}
      {isAlertModalOpen && (
        <CreateAlertModal
          isOpen={isAlertModalOpen}
          onClose={() => setIsAlertModalOpen(false)}
          coins={coins}
          preselectedCoin={selectedAlertCoin}
          onCreate={createAlert}
        />
      )}

      {/* Add Transaction Modal */}
      {isTxModalOpen && (
        <AddTransactionModal
          isOpen={isTxModalOpen}
          onClose={() => setIsTxModalOpen(false)}
          coins={coins}
          preselectedCoin={selectedTxCoin}
          onAdd={addTransaction}
        />
      )}
    </div>
  );
}
