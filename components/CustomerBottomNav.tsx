'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Coffee, Armchair, ShoppingBag, User } from 'lucide-react';

export default function CustomerBottomNav() {
  const pathname = usePathname();

  // Hide on starting/welcome page, product detail page, table page, payment page & staff/admin routes
  if (
    pathname === '/' ||
    pathname === '/welcome' ||
    pathname.startsWith('/item/') ||
    pathname === '/table' ||
    pathname === '/payment' ||
    pathname === '/login' ||
    pathname === '/cashier' ||
    pathname === '/kitchen' ||
    pathname === '/chef' ||
    pathname === '/admin' ||
    pathname === '/super-admin'
  ) {
    return null;
  }

  const navItems = [
    {
      name: 'HOME',
      href: '/home',
      icon: Home,
    },
    {
      name: 'MENU',
      href: '/menu',
      icon: Coffee,
    },
    {
      name: 'TABLE',
      href: '/table',
      icon: Armchair,
    },
    {
      name: 'ORDERS',
      href: '/order-status',
      icon: ShoppingBag,
    },
    {
      name: 'PROFILE',
      href: '/profile',
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-50 bg-[#F3E7D3] dark:bg-brand-espresso border-t border-brand-biscuit/40 dark:border-brand-espressoCard px-2 py-2 transition-colors">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href === '/menu' && pathname.startsWith('/item/'));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 px-2 rounded-xl transition-all ${
                isActive
                  ? 'text-[#A62B2B] dark:text-brand-butter font-bold scale-105'
                  : 'text-brand-walnut/70 dark:text-brand-biscuit/70 hover:text-brand-espresso dark:hover:text-brand-creme'
              }`}
            >
              <Icon className={`w-5 h-5 stroke-[1.8] ${isActive ? 'stroke-[2.2]' : ''}`} />
              <span className="font-mono text-[9px] tracking-wider uppercase font-semibold">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
