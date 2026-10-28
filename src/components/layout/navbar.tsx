'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { PresenceBadge } from '@/components/layout/presence-badge';
import { UserNav } from '@/components/layout/user-nav';
import { Activity, Wifi, WifiOff, RefreshCw, Zap } from 'lucide-react';
import { useCoins } from '@/hooks/use-coins';
import { Badge } from '@/components/ui/badge';

export function Navbar() {
  const pathname = usePathname();
  const { wsStatus, reconnectWs } = useCoins();

  const getStatusBadge = () => {
    switch (wsStatus) {
      case 'connected':
        return (
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold">Binance Live</span>
          </div>
        );
      case 'connecting':
      case 'reconnecting':
        return (
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <RefreshCw className="h-3 w-3 animate-spin" />
            <span>Connecting...</span>
          </div>
        );
      case 'polling':
        return (
          <div
            onClick={reconnectWs}
            className="cursor-pointer hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
            title="Click to reconnect WebSocket"
          >
            <Activity className="h-3 w-3" />
            <span>Polling Mode (Click to retry)</span>
          </div>
        );
      default:
        return (
          <div
            onClick={reconnectWs}
            className="cursor-pointer hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
            title="Click to reconnect"
          >
            <WifiOff className="h-3 w-3" />
            <span>Disconnected</span>
          </div>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md transition-all">
      <div className="container flex h-16 items-center justify-between">
        {/* Left: Brand Logo & Tagline */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/30 group-hover:scale-105 transition-transform">
              <Zap className="h-5 w-5 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight tracking-tight flex items-center gap-1">
                Crypto<span className="text-primary font-extrabold">Pulse</span>
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono">
                Real-Time Terminal
              </span>
            </div>
          </Link>
        </div>

        {/* Right side: Live Feed Status, Online Presence, Theme Toggle, Profile */}
        <div className="flex items-center gap-3">
          {getStatusBadge()}
          <PresenceBadge />
          <ThemeToggle />
          <div className="h-5 w-px bg-border mx-1" />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
