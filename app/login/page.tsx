'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Lock, Delete, Coffee, ShieldCheck, User } from 'lucide-react';
import { APP_CONFIG } from '@/lib/config';
import { Role } from '@/lib/types';

const roleRedirects: Record<Role, string> = {
  super_admin: '/super-admin',
  admin: '/admin',
  cashier: '/cashier',
  kitchen: '/kitchen',
  chef: '/chef',
  customer: '/menu',
};

export default function StaffLoginPage() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { loginWithPin, switchRoleDirect } = useAuth();
  const router = useRouter();

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError('');
      if (nextPin.length === 4) {
        attemptLogin(nextPin);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  const attemptLogin = (pinToTest: string) => {
    const success = loginWithPin(pinToTest);
    if (success) {
      const savedUserRole = localStorage.getItem('smol_auth_user_id');
      if (savedUserRole) {
        router.push('/cashier');
      } else {
        router.push('/cashier');
      }
    } else {
      setError('incorrect PIN, please try again');
      setPin('');
    }
  };

  const handleQuickDemoRole = (role: Role) => {
    switchRoleDirect(role);
    router.push(roleRedirects[role]);
  };

  return (
    <div className="px-4 py-8 space-y-6 animate-in fade-in duration-200">
      {/* Brand Header */}
      <div className="text-center space-y-2 flex flex-col items-center">
        <img
          src="/logo-transparent.png"
          alt="smol café official logo (day)"
          className="h-16 w-auto object-contain drop-shadow-md hover:scale-105 transition-transform dark:hidden"
        />
        <img
          src="/logo-dark-transparent.png"
          alt="smol café official logo (night)"
          className="h-16 w-auto object-contain drop-shadow-[0_0_16px_rgba(117,76,255,0.7)] hover:scale-105 transition-transform hidden dark:block"
        />
        <h2 className="font-serif text-2xl font-bold text-brand-espresso dark:text-brand-creme lowercase">
          smol café staff login
        </h2>
        <p className="text-xs text-brand-walnut dark:text-brand-biscuit font-sans">
          enter your 4-digit staff PIN to access your workspace
        </p>
      </div>

      {/* PIN Input Dots */}
      <div className="flex justify-center items-center gap-3 py-4">
        {[0, 1, 2, 3].map((idx) => (
          <div
            key={idx}
            className={`w-4 h-4 rounded-full border-2 transition-all ${
              idx < pin.length
                ? 'bg-brand-cherry border-brand-cherry scale-110'
                : 'border-brand-biscuit/60 dark:border-brand-biscuit/30 bg-transparent'
            }`}
          />
        ))}
      </div>

      {error && (
        <div className="text-center text-xs font-sans text-brand-cherry dark:text-brand-butter bg-red-50 dark:bg-red-950/40 p-2.5 rounded-xl border border-brand-cherry/30">
          {error}
        </div>
      )}

      {/* Numeric Keypad */}
      <div className="max-w-xs mx-auto grid grid-cols-3 gap-3">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <button
            key={digit}
            onClick={() => handleDigit(digit)}
            className="h-14 rounded-2xl bg-brand-biscuit/20 dark:bg-brand-espresso/80 border border-brand-biscuit/40 dark:border-brand-biscuit/20 text-lg font-mono font-bold text-brand-espresso dark:text-brand-creme active:scale-95 hover:bg-brand-biscuit/30 transition-all flex items-center justify-center shadow-sm"
          >
            {digit}
          </button>
        ))}
        <div />
        <button
          onClick={() => handleDigit('0')}
          className="h-14 rounded-2xl bg-brand-biscuit/20 dark:bg-brand-espresso/80 border border-brand-biscuit/40 dark:border-brand-biscuit/20 text-lg font-mono font-bold text-brand-espresso dark:text-brand-creme active:scale-95 hover:bg-brand-biscuit/30 transition-all flex items-center justify-center shadow-sm"
        >
          0
        </button>
        <button
          onClick={handleDelete}
          className="h-14 rounded-2xl bg-brand-biscuit/20 dark:bg-brand-espresso/80 border border-brand-biscuit/40 dark:border-brand-biscuit/20 text-sm font-sans text-brand-walnut dark:text-brand-biscuit active:scale-95 hover:bg-brand-biscuit/30 transition-all flex items-center justify-center shadow-sm"
        >
          <Delete className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Demo Access (for convenience) */}
      <div className="pt-6 border-t border-brand-biscuit/30 dark:border-brand-biscuit/10 space-y-3">
        <span className="font-mono text-[10px] text-brand-walnut dark:text-brand-biscuit uppercase tracking-wider block text-center">
          quick staff demo accounts
        </span>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {APP_CONFIG.demoUsers.map((u) => (
            <button
              key={u.id}
              onClick={() => handleQuickDemoRole(u.role as Role)}
              className="p-2.5 rounded-xl border border-brand-biscuit/40 dark:border-brand-biscuit/20 bg-brand-creme dark:bg-brand-espresso hover:border-brand-cherry/50 text-left transition-all flex items-center gap-2 shadow-sm"
            >
              <div className="w-6 h-6 rounded-full bg-brand-biscuit/30 flex items-center justify-center font-mono text-[10px] font-bold text-brand-cherry">
                {u.pin}
              </div>
              <div className="overflow-hidden">
                <div className="font-semibold text-brand-espresso dark:text-brand-creme text-xs truncate">
                  {u.name}
                </div>
                <div className="text-[10px] text-brand-walnut dark:text-brand-biscuit capitalize">
                  {u.role.replace('_', ' ')}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
