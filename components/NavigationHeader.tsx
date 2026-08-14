'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Role } from '@/lib/types';
import {
  Sun,
  Moon,
  Coffee,
  ShoppingBag,
  ChefHat,
  Package,
  QrCode,
  BarChart3,
  LogOut,
  UserCheck,
  ChevronDown,
} from 'lucide-react';

const roleLabels: Record<Role, { label: string; badgeColor: string; path: string }> = {
  customer: { label: 'Customer Menu', badgeColor: 'bg-brand-biscuit/40 text-brand-walnut dark:text-brand-creme', path: '/menu' },
  cashier: { label: 'Cashier POS', badgeColor: 'bg-brand-cherry text-white', path: '/cashier' },
  kitchen: { label: 'Kitchen Queue', badgeColor: 'bg-brand-butter text-brand-espresso font-semibold', path: '/kitchen' },
  chef: { label: 'Chef Inventory', badgeColor: 'bg-brand-dustyPool text-white', path: '/chef' },
  admin: { label: 'Admin (Menu/QR)', badgeColor: 'bg-brand-walnut text-white', path: '/admin' },
  super_admin: { label: 'Super Admin', badgeColor: 'bg-brand-electricViolet text-white', path: '/super-admin' },
};

export default function NavigationHeader() {
  const { currentUser, role, switchRoleDirect, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-brand-creme/95 dark:bg-brand-espresso/95 backdrop-blur border-b border-brand-biscuit/30 dark:border-brand-biscuit/10 px-4 py-2.5 transition-colors">
      <div className="flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link href={roleLabels[role]?.path || '/menu'} className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-brand-cherry flex items-center justify-center text-brand-creme shadow-sm group-hover:scale-105 transition-transform">
            <Coffee className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold tracking-tight text-brand-espresso dark:text-brand-creme lowercase leading-none">
              smol café
            </h1>
            <span className="font-mono text-[10px] text-brand-walnut dark:text-brand-biscuit opacity-80">
              rishikesh
            </span>
          </div>
        </Link>

        {/* Controls: Theme & Role Switcher */}
        <div className="flex items-center gap-2">
          {/* Day / Night Toggle */}
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-full border border-brand-biscuit/40 dark:border-brand-biscuit/20 flex items-center justify-center text-brand-espresso dark:text-brand-creme hover:bg-brand-biscuit/20 transition-colors"
            title={theme === 'day' ? 'Switch to Night Mode' : 'Switch to Day Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'day' ? <Moon className="w-4 h-4 text-brand-walnut" /> : <Sun className="w-4 h-4 text-brand-butter" />}
          </button>

          {/* Role Badge Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm ${
                roleLabels[role]?.badgeColor
              }`}
            >
              <span>{roleLabels[role]?.label}</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {/* Role Selector Popup */}
            {showRoleDropdown && (
              <div
                className="absolute right-0 mt-2 w-48 bg-brand-creme dark:bg-brand-espresso border border-brand-biscuit/40 dark:border-brand-biscuit/20 rounded-xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setShowRoleDropdown(false)}
              >
                <div className="px-3 py-1 border-b border-brand-biscuit/20 dark:border-brand-biscuit/10 text-[10px] font-mono text-brand-walnut dark:text-brand-biscuit uppercase tracking-wider">
                  Switch Role View
                </div>
                {(Object.keys(roleLabels) as Role[]).map((r) => (
                  <Link
                    key={r}
                    href={roleLabels[r].path}
                    onClick={() => switchRoleDirect(r)}
                    className={`flex items-center justify-between px-3 py-1.5 text-xs font-sans hover:bg-brand-biscuit/20 dark:hover:bg-brand-biscuit/10 transition-colors ${
                      role === r ? 'font-bold text-brand-cherry dark:text-brand-butter' : 'text-brand-espresso dark:text-brand-creme'
                    }`}
                  >
                    <span>{roleLabels[r].label}</span>
                    {role === r && <UserCheck className="w-3.5 h-3.5 text-brand-cherry dark:text-brand-butter" />}
                  </Link>
                ))}

                {role !== 'customer' && (
                  <div className="border-t border-brand-biscuit/20 dark:border-brand-biscuit/10 mt-1 pt-1 px-1">
                    <button
                      onClick={logout}
                      className="w-full text-left px-2 py-1 rounded text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Staff Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Role Navigation Bar */}
      <nav className="flex items-center gap-1 mt-2 overflow-x-auto no-scrollbar pt-1 border-t border-brand-biscuit/20 dark:border-brand-biscuit/10 text-xs font-sans">
        <Link
          href="/menu"
          className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors flex items-center gap-1 ${
            pathname === '/menu'
              ? 'bg-brand-cherry text-white font-medium'
              : 'text-brand-walnut dark:text-brand-biscuit hover:bg-brand-biscuit/20'
          }`}
        >
          <Coffee className="w-3.5 h-3.5" />
          <span>menu (qr)</span>
        </Link>

        {(role === 'cashier' || role === 'super_admin' || role === 'admin') && (
          <Link
            href="/cashier"
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors flex items-center gap-1 ${
              pathname === '/cashier'
                ? 'bg-brand-cherry text-white font-medium'
                : 'text-brand-walnut dark:text-brand-biscuit hover:bg-brand-biscuit/20'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>cashier</span>
          </Link>
        )}

        {(role === 'kitchen' || role === 'super_admin' || role === 'admin' || role === 'cashier') && (
          <Link
            href="/kitchen"
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors flex items-center gap-1 ${
              pathname === '/kitchen'
                ? 'bg-brand-cherry text-white font-medium'
                : 'text-brand-walnut dark:text-brand-biscuit hover:bg-brand-biscuit/20'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>kitchen</span>
          </Link>
        )}

        {(role === 'chef' || role === 'super_admin' || role === 'admin') && (
          <Link
            href="/chef"
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors flex items-center gap-1 ${
              pathname === '/chef'
                ? 'bg-brand-cherry text-white font-medium'
                : 'text-brand-walnut dark:text-brand-biscuit hover:bg-brand-biscuit/20'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>inventory</span>
          </Link>
        )}

        {(role === 'admin' || role === 'super_admin') && (
          <Link
            href="/admin"
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors flex items-center gap-1 ${
              pathname === '/admin'
                ? 'bg-brand-cherry text-white font-medium'
                : 'text-brand-walnut dark:text-brand-biscuit hover:bg-brand-biscuit/20'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>qr admin</span>
          </Link>
        )}

        {role === 'super_admin' && (
          <Link
            href="/super-admin"
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors flex items-center gap-1 ${
              pathname === '/super-admin'
                ? 'bg-brand-cherry text-white font-medium'
                : 'text-brand-walnut dark:text-brand-biscuit hover:bg-brand-biscuit/20'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>analytics</span>
          </Link>
        )}
      </nav>
    </header>
  );
}
