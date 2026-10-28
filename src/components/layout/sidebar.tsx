'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  ArrowRightLeft,
  PieChart,
  BellRing,
  Sparkles,
  ShieldAlert,
  User,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  badge?: string;
}

const navItems: NavItem[] = [
  {
    title: 'Market Overview',
    href: '/',
    icon: TrendingUp,
  },
  {
    title: 'Buy & Trade',
    href: '/trade',
    icon: ArrowRightLeft,
    badge: 'Paper/$10k',
  },
  {
    title: 'Portfolio Tracker',
    href: '/portfolio',
    icon: PieChart,
  },
  {
    title: 'Watchlist & Alerts',
    href: '/watchlist',
    icon: BellRing,
  },
  {
    title: 'Insights & AI Hub',
    href: '/insights',
    icon: Sparkles,
  },
  {
    title: 'Admin Terminal',
    href: '/admin',
    icon: ShieldAlert,
    adminOnly: true,
    badge: 'Admin',
  },
  {
    title: 'Profile Settings',
    href: '/profile',
    icon: User,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { role } = useAuth();

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 border-r bg-card/40 min-h-[calc(100vh-4rem)] p-4 space-y-6">
      <div className="space-y-1">
        <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Navigation
        </p>
        <nav className="space-y-1">
          {navItems.map((item) => {
            if (item.adminOnly && role !== 'admin') return null;

            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20 font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn('h-4 w-4', isActive ? 'text-primary-foreground' : 'text-muted-foreground')} />
                  <span>{item.title}</span>
                </div>
                {item.badge && (
                  <Badge
                    variant={isActive ? 'outline' : 'secondary'}
                    className={cn(
                      'text-[9px] px-1.5 py-0 h-4 font-mono uppercase',
                      isActive && 'border-primary-foreground/30 text-primary-foreground'
                    )}
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Minimal Footer */}
      <div className="mt-auto pt-4 border-t">
        <div className="px-3 py-2 flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-mono text-[11px]">v1.0.0 Pro</span>
          <span className="flex items-center gap-1 text-[11px] text-emerald-500 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active
          </span>
        </div>
      </div>
    </aside>
  );
}
