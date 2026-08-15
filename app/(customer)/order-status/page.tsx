'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { customerStore } from '@/lib/customer-store';
import { Coffee, Clock, Bell, Sparkles, CheckCircle2, ArrowRight, Plus } from 'lucide-react';
import { APP_CONFIG } from '@/lib/config';

export default function OrderStatusPage() {
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [notified, setNotified] = useState(false);

  const syncOrder = () => {
    const state = customerStore.getState();
    setActiveOrder(state.activeOrder);
  };

  useEffect(() => {
    syncOrder();
    window.addEventListener('smol_customer_store_change', syncOrder);
    return () => window.removeEventListener('smol_customer_store_change', syncOrder);
  }, []);

  const handleNotifyMe = () => {
    setNotified(true);
    setTimeout(() => setNotified(false), 4000);
  };

  const addQuickRound = (name: string, price: number) => {
    customerStore.addToCart({
      id: `quick-${Date.now()}`,
      name,
      categoryId: 'cat-1',
      price,
      description: 'Quick add while you wait',
      available: true,
      isVeg: true,
    });
  };

  return (
    <div className="animate-in fade-in duration-300 pb-28 min-h-[85vh] bg-brand-creme dark:bg-brand-espresso transition-colors">
      {/* Sticky Top Header */}
      <div className="sticky top-0 z-30 bg-brand-creme/95 dark:bg-brand-espresso/95 backdrop-blur px-4 pt-4 pb-3 border-b border-brand-biscuit/30 dark:border-brand-espressoCard flex items-center justify-between">
        <div>
          <span className="font-mono text-[10px] text-brand-cherry dark:text-brand-butter uppercase tracking-widest block">
            4. order status
          </span>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-brand-espresso dark:text-brand-creme lowercase">
            your order
          </h2>
          <p className="font-serif italic text-xs text-brand-walnut dark:text-brand-biscuit">
            brewing happiness
          </p>
        </div>

        <span className="bg-emerald-900/40 text-emerald-400 font-mono text-[10px] uppercase px-2.5 py-1 rounded-full border border-emerald-500/40 flex items-center gap-1.5 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          live
        </span>
      </div>

      <div className="px-4 py-4 space-y-6">

      {/* Arched Frame with Glowing Neon Brewing Animation */}
      <div className="w-full relative flex flex-col items-center pt-2">
        <div className="w-full h-80 rounded-arch border-2 border-brand-cherry dark:border-brand-cherryGlow bg-gradient-to-b from-brand-espressoLight to-brand-espresso p-6 flex flex-col items-center justify-between shadow-neonCherry relative overflow-hidden text-center group">
          {/* Neon Grid Glow Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#B72E35_1px,transparent_1px)] [background-size:20px_20px] opacity-20 pointer-events-none" />

          {/* Animated Pour-over Illustration */}
          <div className="my-auto space-y-4 relative">
            <div className="flex flex-col items-center">
              <img
                src="/logo-transparent.png"
                alt="smol café official logo (day)"
                className="w-20 h-auto object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.4)] animate-brew-pulse dark:hidden"
              />
              <img
                src="/logo-dark-transparent.png"
                alt="smol café official logo (night)"
                className="w-20 h-auto object-contain drop-shadow-[0_0_16px_rgba(117,76,255,0.8)] animate-brew-pulse hidden dark:block"
              />
            </div>

            <div className="space-y-1">
              <h3 className="font-serif text-2xl font-bold text-brand-creme capitalize">
                brewing your pour over
              </h3>
              <p className="text-xs text-brand-biscuit font-sans">
                single-origin South Indian estate beans
              </p>
            </div>
          </div>

          {/* Order Info Cards Grid */}
          <div className="grid grid-cols-2 gap-3 w-full z-10 pt-2 border-t border-brand-biscuit/20">
            <div className="bg-black/50 backdrop-blur p-2.5 rounded-xl border border-brand-biscuit/20 text-center">
              <span className="text-[10px] font-mono text-brand-biscuit uppercase block">
                your order no.
              </span>
              <span className="font-mono text-sm font-bold text-brand-butter">
                {activeOrder?.orderNo || '#SMOL 0427'}
              </span>
            </div>

            <div className="bg-black/50 backdrop-blur p-2.5 rounded-xl border border-brand-biscuit/20 text-center">
              <span className="text-[10px] font-mono text-brand-biscuit uppercase block">
                est. ready time
              </span>
              <span className="font-mono text-sm font-bold text-brand-cherryGlow flex items-center justify-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {activeOrder?.estimatedMinutes || 8}-10 mins
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* "another round? while you wait" Horizontal Recommendation */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-sm font-bold text-brand-espresso dark:text-brand-creme lowercase">
            another round? <span className="font-sans font-normal text-xs text-brand-walnut dark:text-brand-biscuit">while you wait</span>
          </h3>
          <Sparkles className="w-4 h-4 text-brand-butter" />
        </div>

        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
          <div className="p-3 rounded-2xl bg-brand-creme dark:bg-brand-espressoLight border border-brand-biscuit/40 dark:border-brand-espressoCard min-w-[150px] flex-shrink-0 space-y-2">
            <span className="font-sans text-xs font-semibold text-brand-espresso dark:text-brand-creme block capitalize">
              smol espresso
            </span>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-brand-cherry dark:text-brand-butter">
                ₹120
              </span>
              <button
                onClick={() => addQuickRound('smol espresso', 120)}
                className="w-7 h-7 rounded-full bg-brand-cherry text-white flex items-center justify-center hover:scale-105 transition-transform"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-brand-creme dark:bg-brand-espressoLight border border-brand-biscuit/40 dark:border-brand-espressoCard min-w-[150px] flex-shrink-0 space-y-2">
            <span className="font-sans text-xs font-semibold text-brand-espresso dark:text-brand-creme block capitalize">
              jaggery latte
            </span>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-brand-cherry dark:text-brand-butter">
                ₹150
              </span>
              <button
                onClick={() => addQuickRound('jaggery sea-salt latte', 150)}
                className="w-7 h-7 rounded-full bg-brand-cherry text-white flex items-center justify-center hover:scale-105 transition-transform"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-brand-creme dark:bg-brand-espressoLight border border-brand-biscuit/40 dark:border-brand-espressoCard min-w-[150px] flex-shrink-0 space-y-2">
            <span className="font-sans text-xs font-semibold text-brand-espresso dark:text-brand-creme block capitalize">
              triple decker
            </span>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-brand-cherry dark:text-brand-butter">
                ₹140
              </span>
              <button
                onClick={() => addQuickRound('triple decker masala toast', 140)}
                className="w-7 h-7 rounded-full bg-brand-cherry text-white flex items-center justify-center hover:scale-105 transition-transform"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notify Toast */}
      {notified && (
        <div className="bg-emerald-900 text-white p-3 rounded-xl text-xs flex items-center gap-2 animate-in zoom-in-95 shadow-xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Notification enabled! We&apos;ll ping you when your brew is ready. ☕</span>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleNotifyMe}
        className="w-full py-3.5 px-6 rounded-full bg-brand-cherry dark:bg-brand-cherryGlow text-white font-sans text-sm font-semibold shadow-neonCherry hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2"
      >
        <Bell className="w-4 h-4" />
        <span>notify me when ready</span>
      </button>
      </div>
    </div>
  );
}
