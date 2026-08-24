"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";


interface AppDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  tableLabel?: string;
}

export const AppDrawer: React.FC<AppDrawerProps> = ({
  isOpen,
  onClose,
  tableLabel,
}) => {
  const pathname = usePathname();

  if (!isOpen) return null;

  const navSections = [
    {
      title: "☕ Dine & Experience",
      items: [
        { name: "Home", href: "/", icon: "🏠", desc: "Daily specials & bento cards" },
        { name: "Smol Menu", href: "/menu", icon: "📜", desc: "All 59 artisanal items & pairings" },
        { name: "Your Table", href: "/table", icon: "🪑", desc: `Table ${tableLabel || "01"} seated round` },
        { name: "Live Order Status", href: "/orders", icon: "📦", desc: "Live kitchen brewing tracker" },
        { name: "Settle Up / Bill", href: "/bill", icon: "🧾", desc: "UPI, Cards, Wallets & digital receipt" },
        { name: "Café Jukebox", href: "/music", icon: "🎵", desc: "Now playing, song requests & votes" },
        { name: "Community Events", href: "/events", icon: "📅", desc: "Jam sessions, chess & game nights" },
        { name: "Smol Loyalty Pass", href: "/profile", icon: "🎁", desc: "Points, rewards & past receipts" },
      ],
    },
    {
      title: "👨‍🍳 Staff Floor Ops",
      items: [
        { name: "Kitchen Display (KDS)", href: "/kitchen", icon: "🍳", desc: "Live order queue & ticket states" },
        { name: "Cashier Desk", href: "/cashier", icon: "💳", desc: "Table map, cash billing & invoices" },
      ],
    },
    {
      title: "⚙️ Admin Control Tower",
      items: [
        { name: "Admin Dashboard", href: "/admin", icon: "⚡", desc: "Master café management center" },
        { name: "Blackboard Announcements", href: "/admin/blackboard", icon: "✍️", desc: "Daily chalkboard chits & specials" },
        { name: "Procurement & Stock POs", href: "/admin/procurement", icon: "📦", desc: "Ingredient inventory & purchase orders" },
        { name: "Category Budgets", href: "/admin/budgets", icon: "💰", desc: "Monthly expense limits & burn rates" },
        { name: "Events Manager", href: "/admin/events", icon: "🎟️", desc: "Create events & attendee RSVPs" },
        { name: "Loyalty Rewards Config", href: "/admin/rewards", icon: "🏆", desc: "Points multiplier & reward catalog" },
        { name: "Jukebox Admin", href: "/admin/music", icon: "🎶", desc: "Manage music queue & requests" },
        { name: "System Observability", href: "/admin/observability", icon: "📊", desc: "Webhooks, RPCs & server health" },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative z-50 flex h-full w-[85%] max-w-sm flex-col border-r border-[#E2D7C7] bg-[#FAF5ED] shadow-2xl animate-in slide-in-from-left duration-300 ease-out">
        {/* Header */}
        <div className="border-b border-[#E8DFD3] p-4 flex items-center justify-between bg-[#F5EFEB]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#A62B34] text-white font-serif font-black text-lg shadow-sm hover-lift">
              S
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[#1C1917] lowercase">
                smol café
              </h2>
              <p className="font-serif italic text-xs text-[#786F66]">
                Rishikesh • All Features
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-500 hover:bg-black/5 active:scale-95 transition-transform"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {/* Quick Table Switcher Bar */}
        <div className="border-b border-[#E8DFD3] bg-[#FCF8F2] px-4 py-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-[11px] font-bold text-[#786F66] uppercase">
              Seated Table:
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5, 6].map((num) => {
                const label = num.toString().padStart(2, "0");
                const isSelected = tableLabel === label || (!tableLabel && num === 1);
                return (
                  <Link
                    key={num}
                    href={`/t/table-${label}`}
                    onClick={onClose}
                    className={`rounded-md px-2 py-0.5 font-mono text-xs font-bold transition-all duration-150 active:scale-95 ${
                      isSelected
                        ? "bg-[#A62B34] text-white shadow-xs scale-105"
                        : "bg-[#EFE7DC] text-[#4A423A] hover:bg-[#E2D6C5]"
                    }`}
                  >
                    T{label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Scrollable Navigation Links */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-2">
              <h3 className="font-serif text-xs font-bold text-[#8C7E72] uppercase tracking-wider px-1">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={`group flex items-start gap-3 rounded-xl p-2.5 transition-all duration-150 active:scale-[0.98] ${
                        isActive
                          ? "bg-[#A62B34] text-white shadow-xs"
                          : "hover:bg-[#EFE7DC] hover:translate-x-1 text-[#1C1917]"
                      }`}
                    >
                      <span className="text-lg leading-none shrink-0 mt-0.5 transition-transform group-hover:scale-110">{item.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className={`font-serif text-sm font-bold ${isActive ? "text-white" : "text-[#1C1917]"}`}>
                            {item.name}
                          </p>
                          {isActive && (
                            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                          )}
                        </div>
                        <p className={`font-serif italic text-xs truncate ${isActive ? "text-white/80" : "text-[#786F66]"}`}>
                          {item.desc}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>


        {/* Footer */}
        <div className="border-t border-[#E8DFD3] bg-[#F5EFEB] p-3 text-center">
          <p className="font-serif text-[11px] text-[#786F66]">
            smol café v0.1 • 100% Functional App
          </p>
        </div>
      </div>
    </div>
  );
};
