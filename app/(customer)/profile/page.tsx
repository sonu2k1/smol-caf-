'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { customerStore } from '@/lib/customer-store';
import { useTheme } from '@/context/ThemeContext';
import { Award, Music, History, Heart, MapPin, Settings, LogOut, ChevronRight, Sparkles, Sun, Moon, Check } from 'lucide-react';

export default function CustomerProfilePage() {
  const { theme, setTheme } = useTheme();
  const [points, setPoints] = useState(487);
  const [rewardsUnlocked, setRewardsUnlocked] = useState(3);
  const [joinedEvent, setJoinedEvent] = useState(false);
  const [showSettings, setShowSettings] = useState(true);

  useEffect(() => {
    const state = customerStore.getState();
    setPoints(state.loyaltyPoints);
    setRewardsUnlocked(state.rewardsUnlocked);
  }, []);

  const handleJoinEvent = () => {
    setJoinedEvent(true);
    setTimeout(() => setJoinedEvent(false), 4000);
  };

  return (
    <div className="animate-in fade-in duration-300 pb-28 min-h-[85vh] bg-brand-creme dark:bg-brand-espresso transition-colors">
      {/* Sticky / Fixed Top Header */}
      <div className="sticky top-0 z-30 bg-brand-creme/95 dark:bg-brand-espresso/95 backdrop-blur px-4 pt-4 pb-3 border-b border-brand-biscuit/30 dark:border-brand-espressoCard flex items-center justify-between">
        <div>
          <span className="font-mono text-[10px] text-brand-electricViolet dark:text-purple-400 uppercase tracking-widest block">
            what&apos;s on / profile
          </span>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-brand-espresso dark:text-brand-creme lowercase">
            my smol
          </h2>
          <p className="font-serif italic text-xs text-brand-walnut dark:text-brand-biscuit">
            hello, rishikesh
          </p>
        </div>

        <div className="w-10 h-10 rounded-full bg-brand-cherry text-white flex items-center justify-center font-serif text-lg font-bold shadow-md">
          R
        </div>
      </div>

      <div className="px-4 py-4 space-y-6">

      {/* WHAT'S ON Banner: Live Listening Session */}
      <div className="space-y-2">
        <span className="font-mono text-[10px] text-brand-walnut dark:text-brand-biscuit uppercase tracking-wider block">
          what&apos;s on at smol café
        </span>

        <div className="p-4 rounded-3xl bg-gradient-to-r from-purple-950 via-indigo-950 to-brand-espresso border border-purple-500/50 text-white space-y-3 relative overflow-hidden shadow-neonViolet group">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="bg-purple-500/20 text-purple-300 font-mono text-[9px] px-2 py-0.5 rounded-full border border-purple-400/40 uppercase tracking-wider">
                LIVE TONIGHT
              </span>
              <h3 className="font-serif text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-200">
                live listening session ft. armaan malik
              </h3>
              <p className="text-xs text-purple-200/80 font-sans">
                tonight • 10:00 PM onwards • acoustic coffee session
              </p>
            </div>

            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 flex-shrink-0">
              <Music className="w-5 h-5 animate-bounce" />
            </div>
          </div>

          <button
            onClick={handleJoinEvent}
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-sans text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{joinedEvent ? '✓ RSVP Confirmed!' : 'join in'}</span>
          </button>
        </div>
      </div>

      {/* LOYALTY CARD: Smol Regular */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-brand-cherry/20 via-brand-espressoLight to-brand-espresso border border-brand-cherry/40 space-y-2 shadow-lg relative">
        <div className="flex items-center justify-between border-b border-brand-biscuit/20 pb-2">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-brand-butter" />
            <span className="font-serif text-base font-bold text-brand-creme capitalize">
              smol regular
            </span>
          </div>
          <span className="font-mono text-xs text-brand-butter font-bold">
            LEVEL 2
          </span>
        </div>

        <div className="flex items-baseline justify-between pt-1">
          <div>
            <span className="font-mono text-2xl font-bold text-brand-butter block">
              {points}
            </span>
            <span className="text-[11px] font-sans text-brand-biscuit">
              smol points earned
            </span>
          </div>

          <span className="bg-brand-butter/20 text-brand-butter border border-brand-butter/40 font-mono text-[10px] px-2.5 py-1 rounded-full font-bold">
            {rewardsUnlocked} rewards unlocked
          </span>
        </div>
      </div>

      {/* SETTINGS & THEME PREFERENCES */}
      <div className="space-y-3">
        <span className="font-mono text-[10px] text-brand-walnut dark:text-brand-biscuit uppercase tracking-wider block">
          settings &amp; appearance
        </span>

        {/* Theme Selector (Light & Dark Mode) */}
        <div className="p-4 rounded-3xl bg-brand-cremeMuted/50 dark:bg-brand-espressoLight border border-brand-biscuit/40 dark:border-brand-espressoCard space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Settings className="w-4 h-4 text-brand-cherry dark:text-brand-butter" />
              <div>
                <h4 className="font-serif font-bold text-sm text-brand-espresso dark:text-brand-creme">
                  Theme Mode
                </h4>
                <p className="font-sans text-[11px] text-brand-walnut/70 dark:text-brand-biscuit">
                  Choose between Light (Day) and Dark (Night) aesthetic
                </p>
              </div>
            </div>
          </div>

          {/* Theme Option Toggle Cards */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            {/* Light Mode Option */}
            <button
              type="button"
              onClick={() => setTheme('day')}
              className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-2 text-center relative ${
                theme === 'day'
                  ? 'border-brand-cherry bg-white dark:bg-brand-espresso text-brand-espresso shadow-md'
                  : 'border-brand-biscuit/30 bg-transparent text-brand-walnut hover:border-brand-biscuit'
              }`}
            >
              {theme === 'day' && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-brand-cherry text-white flex items-center justify-center">
                  <Check className="w-2.5 h-2.5" />
                </div>
              )}
              <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <span className="font-serif font-bold text-xs block text-brand-espresso dark:text-brand-creme">
                  Light Mode
                </span>
                <span className="font-mono text-[9px] text-brand-walnut/70 dark:text-brand-biscuit">
                  Warm Creme
                </span>
              </div>
            </button>

            {/* Dark Mode Option */}
            <button
              type="button"
              onClick={() => setTheme('night')}
              className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-2 text-center relative ${
                theme === 'night'
                  ? 'border-brand-butter bg-brand-espresso dark:bg-brand-espressoCard text-brand-creme shadow-neonButter'
                  : 'border-brand-biscuit/30 bg-transparent text-brand-walnut hover:border-brand-biscuit'
              }`}
            >
              {theme === 'night' && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-brand-butter text-brand-espresso flex items-center justify-center">
                  <Check className="w-2.5 h-2.5" />
                </div>
              )}
              <div className="w-8 h-8 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 flex items-center justify-center">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <span className="font-serif font-bold text-xs block text-brand-espresso dark:text-brand-creme">
                  Dark Mode
                </span>
                <span className="font-mono text-[9px] text-brand-walnut/70 dark:text-brand-biscuit">
                  Deep Espresso
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* PROFILE NAVIGATION LINKS */}
      <div className="space-y-2">
        <span className="font-mono text-[10px] text-brand-walnut dark:text-brand-biscuit uppercase tracking-wider block">
          account &amp; options
        </span>

        <div className="space-y-2">
          <Link
            href="/order-status"
            className="p-3.5 rounded-2xl bg-brand-creme dark:bg-brand-espressoLight border border-brand-biscuit/40 dark:border-brand-espressoCard flex items-center justify-between hover:border-brand-cherry/60 transition-all group shadow-sm"
          >
            <div className="flex items-center gap-3">
              <History className="w-4 h-4 text-brand-cherry dark:text-brand-butter" />
              <span className="font-sans text-xs font-medium text-brand-espresso dark:text-brand-creme">
                order history
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-brand-walnut/40 dark:text-brand-biscuit/40" />
          </Link>

          <Link
            href="/menu?fav=true"
            className="p-3.5 rounded-2xl bg-brand-creme dark:bg-brand-espressoLight border border-brand-biscuit/40 dark:border-brand-espressoCard flex items-center justify-between hover:border-brand-cherry/60 transition-all group shadow-sm"
          >
            <div className="flex items-center gap-3">
              <Heart className="w-4 h-4 text-brand-cherry dark:text-brand-butter" />
              <span className="font-sans text-xs font-medium text-brand-espresso dark:text-brand-creme">
                favourites
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-brand-walnut/40 dark:text-brand-biscuit/40" />
          </Link>

          <div className="p-3.5 rounded-2xl bg-brand-creme dark:bg-brand-espressoLight border border-brand-biscuit/40 dark:border-brand-espressoCard flex items-center justify-between hover:border-brand-cherry/60 transition-all group shadow-sm cursor-pointer">
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-brand-cherry dark:text-brand-butter" />
              <span className="font-sans text-xs font-medium text-brand-espresso dark:text-brand-creme">
                saved addresses
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-brand-walnut/40 dark:text-brand-biscuit/40" />
          </div>

          <Link
            href="/welcome"
            className="p-3.5 rounded-2xl bg-red-950/20 border border-red-800/30 flex items-center justify-between hover:bg-red-950/40 transition-all text-red-500"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-4 h-4" />
              <span className="font-sans text-xs font-medium">log out</span>
            </div>
            <ChevronRight className="w-4 h-4 text-red-400" />
          </Link>
        </div>
      </div>
      </div>
    </div>
  );
}
