'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { CoinMarketData, TransactionType, AlertCondition } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FlashPrice } from '@/components/market/flash-price';
import { Sparkline } from '@/components/market/sparkline';
import { formatCompactCurrency, formatPercentage } from '@/lib/formatters';
import {
  Star,
  Search,
  TrendingUp,
  TrendingDown,
  PlusCircle,
  Bell,
  ArrowUpDown,
} from 'lucide-react';
import { AddTransactionModal } from '@/components/portfolio/add-transaction-modal';
import { CreateAlertModal } from '@/components/alerts/create-alert-modal';

interface CoinTableProps {
  coins: CoinMarketData[];
  watchlistIds: string[];
  onToggleWatchlist: (coin: { id: string; symbol: string; name: string }) => void;
  onAddTransaction: (data: {
    coin_id: string;
    coin_symbol: string;
    coin_name: string;
    type: TransactionType;
    amount: number;
    price_per_unit: number;
    transaction_date: string;
    notes?: string;
  }) => Promise<void>;
  onCreateAlert: (data: {
    coin_id: string;
    coin_symbol: string;
    coin_name: string;
    target_price: number;
    condition: AlertCondition;
  }) => Promise<void>;
}

type SortField = 'rank' | 'price' | 'change24h' | 'marketCap';
type SortOrder = 'asc' | 'desc';

export function CoinTable({
  coins,
  watchlistIds,
  onToggleWatchlist,
  onAddTransaction,
  onCreateAlert,
}: CoinTableProps) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'gainers' | 'losers'>('all');
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Modal states
  const [selectedTxCoin, setSelectedTxCoin] = useState<CoinMarketData | null>(null);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [selectedAlertCoin, setSelectedAlertCoin] = useState<CoinMarketData | null>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(field === 'rank' ? 'asc' : 'desc');
    }
  };

  const filteredCoins = useMemo(() => {
    return coins
      .filter((coin) => {
        const matchesSearch =
          coin.name.toLowerCase().includes(search.toLowerCase()) ||
          coin.symbol.toLowerCase().includes(search.toLowerCase());

        if (!matchesSearch) return false;

        const change = coin.price_change_percentage_24h || 0;
        if (filterType === 'gainers') return change > 0;
        if (filterType === 'losers') return change < 0;

        return true;
      })
      .sort((a, b) => {
        let valA = 0;
        let valB = 0;

        switch (sortField) {
          case 'rank':
            valA = a.market_cap_rank || 999;
            valB = b.market_cap_rank || 999;
            break;
          case 'price':
            valA = a.live_price ?? a.current_price ?? 0;
            valB = b.live_price ?? b.current_price ?? 0;
            break;
          case 'change24h':
            valA = a.price_change_percentage_24h || 0;
            valB = b.price_change_percentage_24h || 0;
            break;
          case 'marketCap':
            valA = a.market_cap || 0;
            valB = b.market_cap || 0;
            break;
        }

        return sortOrder === 'asc' ? valA - valB : valB - valA;
      });
  }, [coins, search, filterType, sortField, sortOrder]);

  return (
    <div className="space-y-4">
      {/* Controls Bar: Search & Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search coin by name or symbol (e.g. BTC, Solana)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card/60"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterType === 'all'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All Coins ({coins.length})
          </button>
          <button
            onClick={() => setFilterType('gainers')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ${
              filterType === 'gainers'
                ? 'bg-background text-emerald-600 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <TrendingUp className="h-3 w-3" />
            Gainers
          </button>
          <button
            onClick={() => setFilterType('losers')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ${
              filterType === 'losers'
                ? 'bg-background text-red-600 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <TrendingDown className="h-3 w-3" />
            Losers
          </button>
        </div>
      </div>

      {/* Main Responsive Table */}
      <div className="rounded-2xl border bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-muted/40 text-xs">
              <TableHead className="w-12 text-center">#</TableHead>
              <TableHead className="w-10"></TableHead>
              <TableHead>Asset</TableHead>
              <TableHead
                className="cursor-pointer select-none text-right font-semibold"
                onClick={() => handleSort('price')}
              >
                <div className="inline-flex items-center gap-1 justify-end">
                  Price
                  <ArrowUpDown className="h-3 w-3 opacity-60" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-right font-semibold"
                onClick={() => handleSort('change24h')}
              >
                <div className="inline-flex items-center gap-1 justify-end">
                  24h Change
                  <ArrowUpDown className="h-3 w-3 opacity-60" />
                </div>
              </TableHead>
              <TableHead
                className="hidden md:table-cell cursor-pointer select-none text-right font-semibold"
                onClick={() => handleSort('marketCap')}
              >
                <div className="inline-flex items-center gap-1 justify-end">
                  Market Cap
                  <ArrowUpDown className="h-3 w-3 opacity-60" />
                </div>
              </TableHead>
              <TableHead className="hidden lg:table-cell text-center">7D Trend</TableHead>
              <TableHead className="text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredCoins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  No cryptocurrencies found matching &quot;{search}&quot;.
                </TableCell>
              </TableRow>
            ) : (
              filteredCoins.map((coin) => {
                const isStarred = watchlistIds.includes(coin.id);
                const livePrice = coin.live_price ?? coin.current_price;
                const change24h = coin.price_change_percentage_24h || 0;
                const isPositive = change24h >= 0;

                return (
                  <TableRow
                    key={coin.id}
                    className="hover:bg-muted/30 transition-colors group"
                  >
                    {/* Rank */}
                    <TableCell className="text-center font-mono text-xs text-muted-foreground font-medium">
                      {coin.market_cap_rank || '—'}
                    </TableCell>

                    {/* Watchlist Star Toggle */}
                    <TableCell className="p-0 text-center">
                      <button
                        onClick={() =>
                          onToggleWatchlist({
                            id: coin.id,
                            symbol: coin.symbol,
                            name: coin.name,
                          })
                        }
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-amber-400 transition-colors"
                        title={isStarred ? 'Remove from Watchlist' : 'Add to Watchlist'}
                      >
                        <Star
                          className={`h-4 w-4 ${
                            isStarred ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40'
                          }`}
                        />
                      </button>
                    </TableCell>

                    {/* Asset Name & Icon */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-7 w-7 rounded-full overflow-hidden bg-muted/60 flex-shrink-0">
                          {coin.image ? (
                            <Image
                              src={coin.image}
                              alt={coin.name}
                              fill
                              sizes="28px"
                              className="object-contain"
                              unoptimized
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center font-bold text-xs">
                              {coin.symbol[0]?.toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm leading-none flex items-center gap-1.5">
                            {coin.name}
                            <Badge variant="outline" className="text-[10px] uppercase font-mono px-1 py-0 h-4">
                              {coin.symbol}
                            </Badge>
                          </span>
                          <span className="text-[11px] text-muted-foreground mt-0.5 md:hidden font-mono">
                            MCap: {formatCompactCurrency(coin.market_cap)}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Price with Binance Live Flash */}
                    <TableCell className="text-right">
                      <FlashPrice price={livePrice} flash={coin.price_flash} className="text-sm font-semibold" />
                    </TableCell>

                    {/* 24h Change */}
                    <TableCell className="text-right">
                      <span
                        className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-xs font-mono font-bold ${
                          isPositive
                            ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                            : 'text-rose-600 dark:text-rose-400 bg-rose-500/10'
                        }`}
                      >
                        {isPositive ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {formatPercentage(change24h)}
                      </span>
                    </TableCell>

                    {/* Market Cap */}
                    <TableCell className="hidden md:table-cell text-right font-mono text-sm text-muted-foreground">
                      {formatCompactCurrency(coin.market_cap)}
                    </TableCell>

                    {/* 7D Sparkline */}
                    <TableCell className="hidden lg:table-cell text-center p-2">
                      <div className="flex justify-center">
                        <Sparkline
                          data={coin.sparkline_in_7d?.price}
                          isPositive={isPositive}
                          width={110}
                          height={32}
                        />
                      </div>
                    </TableCell>

                    {/* Action Buttons */}
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2.5 text-xs gap-1 hover:bg-primary/10 hover:text-primary rounded-lg"
                          onClick={() => {
                            setSelectedTxCoin(coin);
                            setIsTxModalOpen(true);
                          }}
                          title="Record Buy/Sell transaction in portfolio"
                        >
                          <PlusCircle className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Trade</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-amber-500/10 hover:text-amber-500 rounded-lg text-muted-foreground"
                          onClick={() => {
                            setSelectedAlertCoin(coin);
                            setIsAlertModalOpen(true);
                          }}
                          title="Set Price Alert"
                        >
                          <Bell className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Transaction Modal */}
      {isTxModalOpen && (
        <AddTransactionModal
          isOpen={isTxModalOpen}
          onClose={() => setIsTxModalOpen(false)}
          coins={coins}
          preselectedCoin={selectedTxCoin}
          onAdd={onAddTransaction}
        />
      )}

      {/* Alert Modal */}
      {isAlertModalOpen && (
        <CreateAlertModal
          isOpen={isAlertModalOpen}
          onClose={() => setIsAlertModalOpen(false)}
          coins={coins}
          preselectedCoin={selectedAlertCoin}
          onCreate={onCreateAlert}
        />
      )}
    </div>
  );
}
