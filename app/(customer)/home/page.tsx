'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, User } from 'lucide-react';

export default function HomePage() {
  const [showDrawer, setShowDrawer] = useState(false);

  return (
    <div className="animate-in fade-in duration-300 pb-24 min-h-[85vh] bg-[#F5EDE1] dark:bg-brand-espresso transition-colors">
      {/* ====== STICKY / FIXED TOP HEADER BAR ====== */}
      <div className="sticky top-0 z-30 bg-[#F5EDE1]/95 dark:bg-brand-espresso/95 backdrop-blur px-4 pt-4 pb-3 border-b border-brand-biscuit/30 dark:border-brand-espressoCard flex items-center justify-between">
        <button
          onClick={() => setShowDrawer(!showDrawer)}
          className="w-9 h-9 rounded-full flex items-center justify-center text-brand-espresso dark:text-brand-creme hover:bg-brand-biscuit/20 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5 stroke-[2]" />
        </button>

        {/* Centered Brand Title */}
        <h1 className="font-serif text-2xl font-bold tracking-tight text-brand-espresso dark:text-brand-creme lowercase">
          smol café
        </h1>

        <Link
          href="/profile"
          className="w-9 h-9 rounded-full flex items-center justify-center text-brand-espresso dark:text-brand-creme hover:bg-brand-biscuit/20 transition-colors"
          aria-label="User profile"
        >
          <User className="w-5 h-5 stroke-[2]" />
        </Link>
      </div>

      {/* Main Scrollable Home Body */}
      <div className="px-4 py-3 space-y-4">
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
                  Your Table (Cart)
                </Link>
                <Link href="/payment" onClick={() => setShowDrawer(false)} className="block py-2 text-brand-espresso dark:text-brand-creme hover:text-brand-cherry">
                  Settle Up & Pay
                </Link>
                <Link href="/order-status" onClick={() => setShowDrawer(false)} className="block py-2 text-brand-espresso dark:text-brand-creme hover:text-brand-cherry">
                  Track Live Order
                </Link>
                <Link href="/profile" onClick={() => setShowDrawer(false)} className="block py-2 text-brand-espresso dark:text-brand-creme hover:text-brand-cherry">
                  Profile & Events
                </Link>
                <div className="pt-4 border-t border-brand-biscuit/30">
                  <span className="text-[10px] font-mono uppercase text-brand-walnut tracking-widest block pb-1">Staff Portals</span>
                  <Link href="/cashier" onClick={() => setShowDrawer(false)} className="block py-1 text-xs text-brand-walnut hover:text-brand-cherry">Cashier / POS</Link>
                  <Link href="/kitchen" onClick={() => setShowDrawer(false)} className="block py-1 text-xs text-brand-walnut hover:text-brand-cherry">Kitchen Display (KDS)</Link>
                  <Link href="/chef" onClick={() => setShowDrawer(false)} className="block py-1 text-xs text-brand-walnut hover:text-brand-cherry">Chef Special Board</Link>
                  <Link href="/admin" onClick={() => setShowDrawer(false)} className="block py-1 text-xs text-brand-walnut hover:text-brand-cherry">Manager Admin</Link>
                  <Link href="/super-admin" onClick={() => setShowDrawer(false)} className="block py-1 text-xs text-brand-walnut hover:text-brand-cherry">Super Admin Ops</Link>
                </div>
              </nav>
            </div>
          </div>
        )}

        {/* Ambient Greeting Headings */}
        <div className="text-center pt-1 pb-1 space-y-0.5">
          <h2 className="font-serif text-[22px] font-medium text-brand-espresso dark:text-brand-creme">
            Good morning, Rishikesh
          </h2>
          <p className="font-serif italic text-base text-brand-walnut/90 dark:text-brand-biscuit">
            What&apos;re we feeling today?
          </p>
        </div>

        {/* 2x2 Grid of Arched Mood Cards matching exact reference design */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {/* Card 1 (Top-Left): FEED ME */}
          <Link
            href="/menu?cat=Food"
            className="group block rounded-t-[70px] rounded-b-lg overflow-hidden shadow-sm hover:scale-[1.02] active:scale-98 transition-transform"
          >
            <img
              src="/home_card_feedme.png"
              alt="FEED ME - I'm hungry"
              className="w-full h-auto object-contain rounded-t-[70px] rounded-b-lg"
            />
          </Link>

          {/* Card 2 (Top-Right): COFFEE FIRST */}
          <Link
            href="/menu?cat=Coffee"
            className="group block rounded-t-[70px] rounded-b-lg overflow-hidden shadow-sm hover:scale-[1.02] active:scale-98 transition-transform"
          >
            <img
              src="/home_card_coffee.png"
              alt="COFFEE FIRST - But make it strong"
              className="w-full h-auto object-contain rounded-t-[70px] rounded-b-lg"
            />
          </Link>

          {/* Card 3 (Bottom-Left): CHAI SCENE */}
          <Link
            href="/menu?cat=Chai"
            className="group block rounded-t-[70px] rounded-b-lg overflow-hidden shadow-sm hover:scale-[1.02] active:scale-98 transition-transform"
          >
            <img
              src="/home_card_chai.png"
              alt="CHAI SCENE - Spiced & soothing"
              className="w-full h-auto object-contain rounded-t-[70px] rounded-b-lg"
            />
          </Link>

          {/* Card 4 (Bottom-Right): SOMETHING LIGHT */}
          <Link
            href="/menu?cat=Coolers"
            className="group block rounded-t-[70px] rounded-b-lg overflow-hidden shadow-sm hover:scale-[1.02] active:scale-98 transition-transform"
          >
            <img
              src="/home_card_light.png"
              alt="SOMETHING LIGHT - Fresh & easy"
              className="w-full h-auto object-contain rounded-t-[70px] rounded-b-lg"
            />
          </Link>
        </div>

        {/* Today's Blackboard Card matching exact reference design */}
        <div className="pt-2">
          <div className="rounded-t-[44px] rounded-b-xl overflow-hidden shadow-md">
            <img
              src="/home_card_blackboard.png"
              alt="Today's Blackboard - Jaggery Sea-Salt Latte is our new crush. ♡"
              className="w-full h-auto object-contain rounded-t-[44px] rounded-b-xl"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
