'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';
import { TrendingUp, ArrowRightLeft, PieChart, BellRing, Sparkles, User, ShieldAlert } from 'lucide-react';

export function MobileNav() {
  const pathname = usePathname();
  const { role } = useAuth();

  const links = [
    { title: 'Markets', href: '/', icon: TrendingUp },
    { title: 'Trade', href: '/trade', icon: ArrowRightLeft },
    { title: 'Portfolio', href: '/portfolio', icon: PieChart },
    { title: 'Watchlist', href: '/watchlist', icon: BellRing },
    { title: 'Insights', href: '/insights', icon: Sparkles },
    ...(role === 'admin' ? [{ title: 'Admin', href: '/admin', icon: ShieldAlert }] : []),
    { title: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur border-t px-2 py-2 flex items-center justify-around shadow-lg">
      {links.map((link) => {
        const isActive = pathname === link.href;
        const Icon = link.icon;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex flex-col items-center gap-1 px-2 py-1 rounded-xl text-[11px] font-medium transition-colors',
              isActive ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className={cn('h-4 w-4', isActive ? 'text-primary' : 'text-muted-foreground')} />
            <span>{link.title}</span>
          </Link>
        );
      })}
    </div>
  );
}
