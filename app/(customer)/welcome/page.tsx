'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

export default function WelcomePage() {
  const [calledBarista, setCalledBarista] = useState(false);

  const handleCallBarista = () => {
    setCalledBarista(true);
    setTimeout(() => setCalledBarista(false), 5000);
  };

  return (
    <div className="min-h-[85vh] px-5 py-6 flex flex-col items-center justify-between text-center animate-in fade-in duration-300 bg-brand-creme dark:bg-brand-espresso transition-colors">
      {/* 1. Official Arch Brand Logo */}
      <div className="pt-2 flex justify-center">
        <img
          src="/logo-transparent.png"
          alt="smol café official logo (day)"
          className="h-24 w-auto object-contain drop-shadow-sm dark:hidden hover:scale-105 transition-transform"
        />
        <img
          src="/logo-dark-transparent.png"
          alt="smol café official logo (night)"
          className="h-24 w-auto object-contain drop-shadow-[0_0_18px_rgba(117,76,255,0.7)] hidden dark:block hover:scale-105 transition-transform"
        />
      </div>

      {/* 2. Arched Stone Doorway & Table 07 Illustration */}
      <div className="w-full max-w-xs relative my-3 flex flex-col items-center">
        <div className="relative group">
          <img
            src="/welcome-door-transparent.png"
            alt="smol café arched doorway table 07"
            className="w-64 h-auto object-contain drop-shadow-md hover:scale-[1.02] transition-transform duration-300"
          />
        </div>
      </div>

      {/* 3. Headline */}
      <div className="space-y-3 max-w-xs">
        <h2 className="font-serif text-3xl font-semibold tracking-tight text-brand-espresso dark:text-brand-creme">
          You&apos;re at <span className="text-brand-cherry dark:text-brand-butter font-bold">Table 07</span>
        </h2>

        {/* Ornament Divider */}
        <div className="flex items-center justify-center gap-3 opacity-60">
          <span className="h-[1px] w-12 bg-brand-walnut/40 dark:bg-brand-biscuit/40" />
          <span className="text-xs text-brand-walnut dark:text-brand-biscuit">✦</span>
          <span className="h-[1px] w-12 bg-brand-walnut/40 dark:bg-brand-biscuit/40" />
        </div>

        {/* Subheading Quote */}
        <p className="font-mono text-xs leading-relaxed text-brand-walnut dark:text-brand-biscuit">
          We&apos;ve got your table.<br />
          Scan, sip &amp; stay awhile.
        </p>
      </div>

      {/* Call Barista Toast Alert */}
      {calledBarista && (
        <div className="w-full max-w-xs bg-emerald-900/90 text-white p-3 rounded-xl text-xs flex items-center gap-2 animate-in zoom-in-95 duration-150 shadow-lg my-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <p className="text-left font-sans leading-tight">
            Barista notified! A team member is on their way to <b>Table 07</b>. ☕
          </p>
        </div>
      )}

      {/* 4. Action CTA Buttons */}
      <div className="w-full max-w-xs space-y-4 pt-4 pb-2">
        <Link
          href="/home"
          className="w-full py-4 px-8 rounded-full bg-brand-cherry hover:bg-brand-cherry/90 dark:bg-brand-cherry text-white font-serif text-lg font-medium shadow-md hover:scale-[1.02] active:scale-95 transition-all block text-center"
        >
          View Menu
        </Link>

        <button
          onClick={handleCallBarista}
          className="font-mono text-xs tracking-wider uppercase text-brand-espresso dark:text-brand-creme underline underline-offset-4 hover:text-brand-cherry transition-colors block mx-auto"
        >
          NEED HELP? CALL A BARISTA
        </button>
      </div>
    </div>
  );
}
