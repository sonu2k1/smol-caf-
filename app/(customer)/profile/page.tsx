'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { customerStore } from '@/lib/customer-store';
import { Award, Music, History, Heart, MapPin, Settings, LogOut, ChevronRight, Sparkles } from 'lucide-react';

export default function CustomerProfilePage() {
  const [points, setPoints] = useState(487);
  const [rewardsUnlocked, setRewardsUnlocked] = useState(3);
  const [joinedEvent, setJoinedEvent] = useState(false);

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
    <div className="px-4 py-4 space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-brand-biscuit/30 dark:border-brand-espressoCard pb-3">
        <div>
          <span className="font-mono text-[10px] text-brand-electricViolet dark:text-purple-400 uppercase tracking-widest block">
            6. what&apos;s on / profile
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

      {/* PROFILE NAVIGATION LINKS */}
      <div className="space-y-2">
        <span className="font-mono text-[10px] text-brand-walnut dark:text-brand-biscuit uppercase tracking-wider block">
          account & options
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

          <div className="p-3.5 rounded-2xl bg-brand-creme dark:bg-brand-espressoLight border border-brand-biscuit/40 dark:border-brand-espressoCard flex items-center justify-between hover:border-brand-cherry/60 transition-all group shadow-sm cursor-pointer">
            <div className="flex items-center gap-3">
              <Settings className="w-4 h-4 text-brand-cherry dark:text-brand-butter" />
              <span className="font-sans text-xs font-medium text-brand-espresso dark:text-brand-creme">
                settings & preferences
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
  );
}
