"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const BottomNavBar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    {
      label: "HOME",
      href: "/",
      isActive: pathname === "/",
      icon: (active: boolean) => (
        <svg
          className={`h-5 w-5 ${active ? "text-[#A62B34]" : "text-[#786F66]"}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={active ? 2.2 : 1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z" />
        </svg>
      ),
    },
    {
      label: "MENU",
      href: "/menu",
      isActive: pathname.startsWith("/menu"),
      icon: (active: boolean) => (
        <svg
          className={`h-5 w-5 ${active ? "text-[#A62B34]" : "text-[#786F66]"}`}
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
      label: "TABLE",
      href: "/table",
      isActive: pathname.startsWith("/table") || pathname.startsWith("/t/"),
      icon: (active: boolean) => (
        <svg
          className={`h-5 w-5 ${active ? "text-[#A62B34]" : "text-[#786F66]"}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={active ? 2.2 : 1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2" />
          <path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
          <path d="M4 18v2" />
          <path d="M20 18v2" />
          <path d="M12 5v4" />
        </svg>
      ),
    },
    {
      label: "ORDERS",
      href: "/orders",
      isActive: pathname.startsWith("/orders"),
      icon: (active: boolean) => (
        <svg
          className={`h-5 w-5 ${active ? "text-[#A62B34]" : "text-[#786F66]"}`}
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
      label: "PROFILE",
      href: "/profile",
      isActive: pathname.startsWith("/profile"),
      icon: (active: boolean) => (
        <svg
          className={`h-5 w-5 ${active ? "text-[#A62B34]" : "text-[#786F66]"}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={active ? 2.2 : 1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#E8DFD3]/90 bg-[#FAF5EE]/95 backdrop-blur-lg shadow-[0_-4px_24px_rgba(40,30,20,0.06)] pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 select-none">
      <div className="mx-auto flex max-w-md items-center justify-around px-2">
        {navItems.map((item) => {
          const active = item.isActive;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3.5 rounded-2xl transition-all duration-200 active:scale-90 touch-manipulation min-w-[56px] ${
                active ? "text-[#A62B34]" : "text-[#786F66] hover:text-[#1C1917]"
              }`}
            >
              <div className={`flex items-center justify-center h-6 w-6 transition-transform duration-200 ${active ? "animate-pop scale-110" : ""}`}>
                {item.icon(active)}
              </div>
              <span
                className={`text-[9px] tracking-wider font-sans transition-colors duration-200 ${
                  active ? "font-bold text-[#A62B34]" : "font-medium text-[#8A8076]"
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

