import React from "react";
import Link from "next/link";
import { fetchActiveBlackboardPostAction } from "@/app/admin/blackboard/actions";
import { getTableSessionCookie } from "@/lib/session";
import { BlackboardCard } from "@/components/blackboard/BlackboardCard";
import { HomeClientHeader } from "@/components/home/HomeClientHeader";
import { BottomNavBar } from "@/components/navigation/BottomNavBar";

export const metadata = {
  title: "smol café — Artisanal Chai, Coffee & Buns",
  description: "Handcrafted brews, wholesome treats & cozy vibes in Rishikesh.",
};

export default async function HomePage() {
  const [activePost, session] = await Promise.all([
    fetchActiveBlackboardPostAction(),
    getTableSessionCookie(),
  ]);

  return (
    <main className="min-h-screen bg-[#F5EFEB] text-[#1C1917] pb-28 font-sans">
      {/* Top Header with App Drawer Trigger */}
      <HomeClientHeader tableLabel={session?.tableLabel} />

      {/* Main Content Area */}
      <div className="mx-auto max-w-md px-5 pt-5 space-y-6">
        {/* Greetings Salutation */}
        <div className="text-center space-y-1 animate-fade-in-down">
          <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-[#1C1917]">
            Good morning, Rishikesh
          </h1>
          <p className="font-serif italic text-sm text-[#786F66]">
            What&apos;re we feeling today?
          </p>
        </div>

        {/* 4 Arch Bento Grid */}
        <div className="grid grid-cols-2 gap-3.5 pt-1">
          {/* Card 1: FEED ME */}
          <Link
            href="/menu?category=cat_big_sandwiches"
            className="group relative flex flex-col items-center justify-between rounded-t-[4.5rem] rounded-b-3xl border border-[#F3D8C7] bg-[#FDF0E7] p-4 text-center shadow-xs transition duration-200 hover:shadow-md hover-lift active:scale-[0.98] animate-fade-in-up delay-50"
          >
            <div className="pt-2">
              <h2 className="font-serif text-base sm:text-lg font-bold uppercase tracking-wide text-[#8C3A27]">
                FEED ME
              </h2>
              <p className="font-serif italic text-xs text-[#8C3A27]/80">I&apos;m hungry</p>
            </div>
            <div className="my-2 flex h-28 w-full items-center justify-center">
              {/* Illustrated Sandwich */}
              <div className="relative flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
                <svg className="w-24 h-24 drop-shadow-md" viewBox="0 0 120 120" fill="none">
                  {/* Plate */}
                  <ellipse cx="60" cy="88" rx="46" ry="16" fill="#EDE4DC" stroke="#D1C3B6" strokeWidth="2" />
                  <ellipse cx="60" cy="86" rx="38" ry="12" fill="#F8F3EE" />
                  {/* Sandwich Slice Bottom */}
                  <path d="M26 80 L94 72 L96 78 L28 86 Z" fill="#D7A15C" stroke="#A97332" strokeWidth="1.5" />
                  {/* Greens & Tomatoes */}
                  <path d="M28 77 Q45 72 65 74 Q85 71 95 72" stroke="#487A38" strokeWidth="4" strokeLinecap="round" />
                  <ellipse cx="44" cy="73" rx="8" ry="3" fill="#D83B2B" />
                  <ellipse cx="76" cy="71" rx="8" ry="3" fill="#D83B2B" />
                  {/* Cheese / Paneer Layer */}
                  <path d="M30 74 L90 68 L88 72 L32 78 Z" fill="#F9E274" />
                  {/* Top Bread Crust */}
                  <path d="M34 54 Q60 46 86 50 L94 68 L26 75 Z" fill="#E6BA75" stroke="#A97332" strokeWidth="1.5" />
                  <path d="M36 56 Q60 49 84 52" stroke="#FAF0D8" strokeWidth="2" fill="none" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Card 2: COFFEE FIRST */}
          <Link
            href="/menu?category=cat_coffee_specialty"
            className="group relative flex flex-col items-center justify-between rounded-t-[4.5rem] rounded-b-3xl border border-[#D5E3E5] bg-[#EBF3F4] p-4 text-center shadow-xs transition duration-200 hover:shadow-md hover-lift active:scale-[0.98] animate-fade-in-up delay-100"
          >
            <div className="pt-2">
              <h2 className="font-serif text-base sm:text-lg font-bold uppercase tracking-wide text-[#234E52]">
                COFFEE FIRST
              </h2>
              <p className="font-serif italic text-xs text-[#234E52]/80">But make it strong</p>
            </div>
            <div className="my-2 flex h-28 w-full items-center justify-center">
              {/* Illustrated Coffee Cup */}
              <div className="relative flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
                <svg className="w-24 h-24 drop-shadow-md" viewBox="0 0 120 120" fill="none">
                  {/* Steam lines with animation */}
                  <g className="animate-steam">
                    <path d="M52 32 Q48 20 52 14" stroke="#89A8AC" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
                    <path d="M64 30 Q68 18 64 12" stroke="#89A8AC" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
                  </g>
                  {/* Saucer */}
                  <ellipse cx="60" cy="90" rx="42" ry="12" fill="#DDE6E8" stroke="#AFC6C8" strokeWidth="2" />
                  {/* Cup Body */}
                  <path d="M34 46 Q32 80 60 80 Q88 80 86 46 Z" fill="#F4F8F8" stroke="#AFC6C8" strokeWidth="2" />
                  {/* Handle */}
                  <path d="M84 50 Q100 50 96 66 Q92 74 80 74" stroke="#AFC6C8" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                  {/* Coffee Surface & Cream Foam Heart */}
                  <ellipse cx="60" cy="48" rx="26" ry="9" fill="#3D2314" />
                  <ellipse cx="58" cy="47" rx="20" ry="6" fill="#54331E" />
                  <path d="M58 48 C54 44 48 45 48 49 C48 53 58 57 58 57 C58 57 68 53 68 49 C68 45 62 44 58 48 Z" fill="#F0E3D3" opacity="0.9" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Card 3: CHAI SCENE */}
          <Link
            href="/menu?category=cat_chai"
            className="group relative flex flex-col items-center justify-between rounded-t-[4.5rem] rounded-b-3xl border border-[#F4E6C3] bg-[#FDF4DC] p-4 text-center shadow-xs transition duration-200 hover:shadow-md hover-lift active:scale-[0.98] animate-fade-in-up delay-150"
          >
            <div className="pt-2">
              <h2 className="font-serif text-base sm:text-lg font-bold uppercase tracking-wide text-[#7C5316]">
                CHAI SCENE
              </h2>
              <p className="font-serif italic text-xs text-[#7C5316]/80">Spiced &amp; soothing</p>
            </div>
            <div className="my-2 flex h-28 w-full items-center justify-center">
              {/* Illustrated Kulhad Chai */}
              <div className="relative flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
                <svg className="w-24 h-24 drop-shadow-md" viewBox="0 0 120 120" fill="none">
                  {/* Steam lines with animation */}
                  <g className="animate-steam">
                    <path d="M54 30 Q50 20 54 14" stroke="#C49B55" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2" />
                    <path d="M66 30 Q70 20 66 14" stroke="#C49B55" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2" />
                  </g>
                  {/* Terracotta Kulhad Body */}
                  <path d="M40 42 L48 92 Q60 96 72 92 L80 42 Z" fill="#9E5330" stroke="#7D3B1C" strokeWidth="2" />
                  {/* Ridges on kulhad */}
                  <line x1="43" y1="56" x2="77" y2="56" stroke="#7D3B1C" strokeWidth="1.5" />
                  <line x1="45" y1="68" x2="75" y2="68" stroke="#7D3B1C" strokeWidth="1.5" />
                  <line x1="46" y1="80" x2="74" y2="80" stroke="#7D3B1C" strokeWidth="1.5" />
                  {/* Chai rim and foam */}
                  <ellipse cx="60" cy="42" rx="20" ry="6" fill="#D79E66" stroke="#7D3B1C" strokeWidth="2" />
                  <ellipse cx="60" cy="42" rx="16" ry="4" fill="#E8C7A3" />
                  <circle cx="57" cy="42" r="1.5" fill="#844820" />
                  <circle cx="63" cy="43" r="1" fill="#844820" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Card 4: SOMETHING LIGHT */}
          <Link
            href="/menu?category=cat_bowls"
            className="group relative flex flex-col items-center justify-between rounded-t-[4.5rem] rounded-b-3xl border border-[#D8E7D5] bg-[#EEF5EC] p-4 text-center shadow-xs transition duration-200 hover:shadow-md hover-lift active:scale-[0.98] animate-fade-in-up delay-200"
          >
            <div className="pt-2">
              <h2 className="font-serif text-base sm:text-lg font-bold uppercase tracking-wide text-[#385C38]">
                SOMETHING LIGHT
              </h2>
              <p className="font-serif italic text-xs text-[#385C38]/80">Fresh &amp; easy</p>
            </div>
            <div className="my-2 flex h-28 w-full items-center justify-center">
              {/* Illustrated Salad Bowl */}
              <div className="relative flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
                <svg className="w-24 h-24 drop-shadow-md" viewBox="0 0 120 120" fill="none">
                  {/* Bowl */}
                  <path d="M30 64 Q32 94 60 94 Q88 94 90 64 Z" fill="#F4F8F4" stroke="#B8D0B5" strokeWidth="2" />
                  <ellipse cx="60" cy="64" rx="30" ry="10" fill="#E3EEE2" stroke="#B8D0B5" strokeWidth="2" />
                  {/* Fresh Salad Ingredients */}
                  <circle cx="50" cy="62" r="6" fill="#5B9A45" />
                  <circle cx="68" cy="60" r="7" fill="#6DAA54" />
                  <circle cx="60" cy="65" r="5" fill="#4B8436" />
                  {/* Cherry tomatoes */}
                  <circle cx="44" cy="65" r="3.5" fill="#DE4331" />
                  <circle cx="74" cy="64" r="3.5" fill="#DE4331" />
                  <circle cx="58" cy="59" r="3" fill="#DE4331" />
                  {/* Feta / Cucumber dices */}
                  <rect x="52" y="60" width="4" height="4" rx="1" fill="#FFFFFF" />
                  <rect x="64" y="66" width="4" height="4" rx="1" fill="#FFFFFF" />
                </svg>
              </div>
            </div>
          </Link>
        </div>


        {/* Today's Blackboard Section */}
        <div className="pt-1">
          <BlackboardCard post={activePost} />
        </div>

        {/* The Smol Experience & Community Features */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-serif text-sm font-bold text-[#1C1917] lowercase">
              the smol experience ✧
            </h3>
            <span className="font-serif italic text-xs text-[#786F66]">
              more than a café
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Jukebox Quick Card */}
            <Link
              href="/music"
              className="group rounded-3xl border border-[#E2D7C7] bg-[#FAF5ED] p-4 shadow-xs hover:border-[#A62B34] transition flex flex-col justify-between"
            >
              <div>
                <span className="text-2xl">🎵</span>
                <h4 className="font-serif text-sm font-bold text-[#1C1917] mt-2 group-hover:text-[#A62B34] transition">
                  Café Jukebox
                </h4>
                <p className="font-serif italic text-[11px] text-[#786F66] mt-0.5">
                  Request vinyl tracks &amp; vote with your table.
                </p>
              </div>
              <span className="font-serif text-[11px] font-bold text-[#A62B34] mt-3">
                Open Queue →
              </span>
            </Link>

            {/* Events Quick Card */}
            <Link
              href="/events"
              className="group rounded-3xl border border-[#E2D7C7] bg-[#FAF5ED] p-4 shadow-xs hover:border-[#A62B34] transition flex flex-col justify-between"
            >
              <div>
                <span className="text-2xl">📅</span>
                <h4 className="font-serif text-sm font-bold text-[#1C1917] mt-2 group-hover:text-[#A62B34] transition">
                  Live Sessions
                </h4>
                <p className="font-serif italic text-[11px] text-[#786F66] mt-0.5">
                  Acoustic jams, board games &amp; workshops.
                </p>
              </div>
              <span className="font-serif text-[11px] font-bold text-[#A62B34] mt-3">
                See Schedule →
              </span>
            </Link>

            {/* Loyalty Pass Quick Card */}
            <Link
              href="/profile"
              className="group rounded-3xl border border-[#E2D7C7] bg-[#FAF5ED] p-4 shadow-xs hover:border-[#A62B34] transition flex flex-col justify-between"
            >
              <div>
                <span className="text-2xl">🎁</span>
                <h4 className="font-serif text-sm font-bold text-[#1C1917] mt-2 group-hover:text-[#A62B34] transition">
                  Smol Rewards
                </h4>
                <p className="font-serif italic text-[11px] text-[#786F66] mt-0.5">
                  Earn points on every sip &amp; redeem free treats.
                </p>
              </div>
              <span className="font-serif text-[11px] font-bold text-[#A62B34] mt-3">
                View Pass →
              </span>
            </Link>

            {/* Admin Hub Quick Card */}
            <Link
              href="/admin"
              className="group rounded-3xl border border-[#E2D7C7] bg-[#FAF5ED] p-4 shadow-xs hover:border-[#A62B34] transition flex flex-col justify-between"
            >
              <div>
                <span className="text-2xl">⚡</span>
                <h4 className="font-serif text-sm font-bold text-[#1C1917] mt-2 group-hover:text-[#A62B34] transition">
                  Admin Tower
                </h4>
                <p className="font-serif italic text-[11px] text-[#786F66] mt-0.5">
                  KDS, Cashier, Blackboard, Budgets &amp; POs.
                </p>
              </div>
              <span className="font-serif text-[11px] font-bold text-[#A62B34] mt-3">
                Manage Café →
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Sticky Navigation */}
      <BottomNavBar />
    </main>
  );
}
