"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const BottomNavBar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    {
      label: "MENU",
      href: "/smol-menu",
      isActive: pathname.startsWith("/smol-menu") || pathname.startsWith("/menu"),
      icon: (active: boolean) => (
        <svg
          className={`h-5 w-5 ${active ? "text-[#B72E35]" : "text-[#725039]"}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={active ? 2.2 : 1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
          <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
          <line x1="6" y1="2" x2="6" y2="4" />
          <line x1="10" y1="2" x2="10" y2="4" />
          <line x1="14" y1="2" x2="14" y2="4" />
        </svg>
      ),
    },
    {
      label: "STATUS",
      href: "/orders",
      isActive: pathname.startsWith("/orders") || pathname.startsWith("/order-status"),
      icon: (active: boolean) => (
        <svg
          className={`h-5 w-5 ${active ? "text-[#B72E35]" : "text-[#725039]"}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={active ? 2.2 : 1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
    },
    {
      label: "BILL",
      href: "/bill",
      isActive: pathname.startsWith("/bill"),
      icon: (active: boolean) => (
        <svg
          className={`h-5 w-5 ${active ? "text-[#B72E35]" : "text-[#725039]"}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={active ? 2.2 : 1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16l4-2 4 2 4-2 4 2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="8" y1="13" x2="16" y2="13" />
          <line x1="8" y1="17" x2="12" y2="17" />
        </svg>
      ),
    },
    {
      label: "MUSIC",
      href: "/music",
      isActive: pathname.startsWith("/music"),
      icon: (active: boolean) => (
        <svg
          className={`h-5 w-5 ${active ? "text-[#B72E35]" : "text-[#725039]"}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={active ? 2.2 : 1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
    },
    {
      label: "REWARDS",
      href: "/profile",
      isActive: pathname.startsWith("/profile") || pathname.startsWith("/account"),
      icon: (active: boolean) => (
        <svg
          className={`h-5 w-5 ${active ? "text-[#B72E35]" : "text-[#725039]"}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={active ? 2.2 : 1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="8" r="5" />
          <path d="M20 21a8 8 0 0 0-16 0" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#C9AE8B]/40 bg-[#FAF4EB]/95 backdrop-blur-lg shadow-[0_-4px_24px_rgba(36,31,28,0.06)] pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 select-none">
      <div className="mx-auto flex max-w-md items-center justify-around px-2">
        {navItems.map((item) => {
          const active = item.isActive;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3.5 rounded-2xl transition-all duration-200 active:scale-90 touch-manipulation min-w-[56px] ${
                active ? "text-[#B72E35]" : "text-[#725039] hover:text-[#241F1C]"
              }`}
            >
              <div className={`flex items-center justify-center h-6 w-6 transition-transform duration-200 ${active ? "animate-pop scale-110" : ""}`}>
                {item.icon(active)}
              </div>
              <span
                className={`text-[9px] tracking-widest font-mono uppercase transition-colors duration-200 ${
                  active ? "font-bold text-[#B72E35]" : "font-medium text-[#725039]/80"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

