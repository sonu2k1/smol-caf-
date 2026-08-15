'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, User, Heart, Sparkles } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function HomePage() {
  const { theme } = useTheme();
  const isNight = theme === 'night';
  const [showDrawer, setShowDrawer] = useState(false);

  return (
    <div className="px-4 py-4 space-y-5 animate-in fade-in duration-300 pb-24 min-h-[85vh] bg-brand-creme dark:bg-brand-espresso transition-colors">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-brand-biscuit/30 dark:border-brand-espressoCard pb-3">
        <button
          onClick={() => setShowDrawer(!showDrawer)}
          className="w-9 h-9 rounded-full bg-brand-biscuit/20 dark:bg-brand-espressoLight flex items-center justify-center text-brand-espresso dark:text-brand-creme hover:bg-brand-biscuit/30 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Logo Text / Arch */}
        <Link href="/" className="flex items-center gap-2 group">
          <img
            src="/logo-transparent.png"
            alt="smol café logo"
            className="h-8 w-auto object-contain dark:hidden group-hover:scale-105 transition-transform"
          />
          <img
            src="/logo-dark-transparent.png"
            alt="smol café logo dark"
            className="h-8 w-auto object-contain hidden dark:block group-hover:scale-105 transition-transform"
          />
          <h1 className="font-serif text-2xl font-bold tracking-tight text-brand-espresso dark:text-brand-creme lowercase">
            smol café
          </h1>
        </Link>

        <Link
          href="/profile"
          className="w-9 h-9 rounded-full bg-brand-biscuit/20 dark:bg-brand-espressoLight flex items-center justify-center text-brand-espresso dark:text-brand-creme hover:bg-brand-biscuit/30 transition-colors"
          aria-label="User profile"
        >
          <User className="w-5 h-5" />
        </Link>
      </div>

      {/* Slide-out Menu Drawer Popup */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-start animate-in fade-in">
          <div className="bg-brand-creme dark:bg-brand-espresso w-64 h-full p-5 space-y-4 shadow-2xl border-r border-brand-biscuit/30 dark:border-brand-espressoCard">
            <div className="flex items-center justify-between border-b border-brand-biscuit/30 pb-3">
              <h3 className="font-serif text-lg font-bold text-brand-espresso dark:text-brand-creme lowercase">
                smol café
              </h3>
              <button
                onClick={() => setShowDrawer(false)}
                className="text-xs font-mono text-brand-walnut dark:text-brand-biscuit uppercase"
              >
                close [✕]
              </button>
            </div>

            <nav className="space-y-2 font-serif text-sm">
              <Link href="/welcome" onClick={() => setShowDrawer(false)} className="block py-2 text-brand-espresso dark:text-brand-creme hover:text-brand-cherry">
                Welcome / Table 07
              </Link>
              <Link href="/home" onClick={() => setShowDrawer(false)} className="block py-2 text-brand-cherry font-bold">
                Home (Browse Moods)
              </Link>
              <Link href="/menu" onClick={() => setShowDrawer(false)} className="block py-2 text-brand-espresso dark:text-brand-creme hover:text-brand-cherry">
                Full Menu (QR)
              </Link>
              <Link href="/table" onClick={() => setShowDrawer(false)} className="block py-2 text-brand-espresso dark:text-brand-creme hover:text-brand-cherry">
                My Table / Cart
              </Link>
              <Link href="/order-status" onClick={() => setShowDrawer(false)} className="block py-2 text-brand-espresso dark:text-brand-creme hover:text-brand-cherry">
                Live Order Tracker
              </Link>
              <Link href="/ask-smol" onClick={() => setShowDrawer(false)} className="block py-2 text-brand-espresso dark:text-brand-creme hover:text-brand-cherry">
                Ask Smol Concierge
              </Link>
              <Link href="/login" onClick={() => setShowDrawer(false)} className="block py-2 text-brand-walnut dark:text-brand-biscuit pt-4 border-t border-brand-biscuit/20 text-xs font-mono">
                Staff Login →
              </Link>
            </nav>
          </div>
        </div>
      )}

      {/* Greeting Banner Header */}
      <div className="text-center space-y-1 py-1">
        <h2 className="font-serif text-2xl font-bold text-brand-espresso dark:text-brand-creme">
          {isNight ? 'Good evening, Rishikesh' : 'Good morning, Rishikesh'}
        </h2>
        <p className="font-serif italic text-sm text-brand-walnut dark:text-brand-biscuit">
          What&apos;re we feeling today?
        </p>
      </div>

      {/* 4 Arched Mood Cards (2x2 Grid) */}
      <div className="grid grid-cols-2 gap-3.5 pt-1">
        {/* Card 1: FEED ME */}
        <Link
          href="/menu?cat=cat-3"
          className="bg-[#F8ECE9] dark:bg-brand-espressoLight border border-[#EAC9C3] dark:border-brand-cherry/40 rounded-arch p-4 text-center space-y-2 hover:scale-[1.03] transition-all shadow-sm group flex flex-col items-center justify-between"
        >
          <div className="space-y-0.5 pt-2">
            <h3 className="font-serif text-sm font-bold text-brand-cherry uppercase tracking-wider block">
              FEED ME
            </h3>
            <span className="text-xs text-brand-walnut dark:text-brand-biscuit font-serif italic block">
              I&apos;m hungry
            </span>
          </div>

          <div className="w-full py-2 flex items-center justify-center">
            <img
              src="/mood-food-card.png"
              alt="Feed me - food & sandwiches"
              className="w-28 h-auto object-contain rounded-xl drop-shadow-sm group-hover:scale-105 transition-transform"
            />
          </div>
        </Link>

        {/* Card 2: COFFEE FIRST */}
        <Link
          href="/menu?cat=cat-1"
          className="bg-[#EBF3F3] dark:bg-brand-espressoLight border border-[#C5DEDD] dark:border-brand-dustyPool/40 rounded-arch p-4 text-center space-y-2 hover:scale-[1.03] transition-all shadow-sm group flex flex-col items-center justify-between"
        >
          <div className="space-y-0.5 pt-2">
            <h3 className="font-serif text-sm font-bold text-[#2C595B] dark:text-brand-dustyPool uppercase tracking-wider block">
              COFFEE FIRST
            </h3>
            <span className="text-xs text-brand-walnut dark:text-brand-biscuit font-serif italic block">
              But make it strong
            </span>
          </div>

          <div className="w-full py-2 flex items-center justify-center">
            <img
              src="/mood-coffee-card.png"
              alt="Coffee first - coffee cup"
              className="w-28 h-auto object-contain rounded-xl drop-shadow-sm group-hover:scale-105 transition-transform"
            />
          </div>
        </Link>

        {/* Card 3: CHAI SCENE */}
        <Link
          href="/menu?cat=cat-2"
          className="bg-[#FAF2E3] dark:bg-brand-espressoLight border border-[#EDE0C4] dark:border-brand-butter/40 rounded-arch p-4 text-center space-y-2 hover:scale-[1.03] transition-all shadow-sm group flex flex-col items-center justify-between"
        >
          <div className="space-y-0.5 pt-2">
            <h3 className="font-serif text-sm font-bold text-[#805D21] dark:text-brand-butter uppercase tracking-wider block">
              CHAI SCENE
            </h3>
            <span className="text-xs text-brand-walnut dark:text-brand-biscuit font-serif italic block">
              Spiced &amp; soothing
            </span>
          </div>

          <div className="w-full py-2 flex items-center justify-center">
            <img
              src="/mood-chai-card.png"
              alt="Chai scene - kulhad chai"
              className="w-28 h-auto object-contain rounded-xl drop-shadow-sm group-hover:scale-105 transition-transform"
            />
          </div>
        </Link>

        {/* Card 4: SOMETHING LIGHT */}
        <Link
          href="/menu?cat=cat-4"
          className="bg-[#F2F5EC] dark:bg-brand-espressoLight border border-[#D7E2CA] dark:border-emerald-500/40 rounded-arch p-4 text-center space-y-2 hover:scale-[1.03] transition-all shadow-sm group flex flex-col items-center justify-between"
        >
          <div className="space-y-0.5 pt-2">
            <h3 className="font-serif text-sm font-bold text-[#3B6667] dark:text-emerald-400 uppercase tracking-wider block">
              SOMETHING LIGHT
            </h3>
            <span className="text-xs text-brand-walnut dark:text-brand-biscuit font-serif italic block">
              Fresh &amp; easy
            </span>
          </div>

          <div className="w-full py-2 flex items-center justify-center">
            <img
              src="/mood-light-card.png"
              alt="Something light - salad bowl"
              className="w-28 h-auto object-contain rounded-xl drop-shadow-sm group-hover:scale-105 transition-transform"
            />
          </div>
        </Link>
      </div>

      {/* Today's Blackboard Card */}
      <div className="bg-[#211E1B] dark:bg-black text-white rounded-3xl p-5 border-2 border-[#3D3530] space-y-2 relative overflow-hidden shadow-xl mt-2">
        <div className="flex items-center justify-between border-b border-white/20 pb-2">
          <span className="font-serif text-sm font-semibold tracking-wider text-amber-200">
            Today&apos;s Blackboard
          </span>
          <Heart className="w-4 h-4 text-brand-cherry animate-pulse" />
        </div>

        <div className="pt-2 text-center space-y-1">
          <h4 className="font-serif text-2xl italic font-normal text-amber-100 leading-snug">
            Jaggery Sea-Salt Latte<br />
            is our new crush. ♡
          </h4>
        </div>
      </div>
    </div>
  );
}
