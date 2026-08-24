"use client";

import React from "react";
import { useCart } from "@/context/CartContext";

export const FloatingCartBar: React.FC = () => {
  const { totalCount, subtotalPaise, openCart } = useCart();

  if (totalCount === 0) return null;

  const totalRupees = Math.round(subtotalPaise / 100);

  return (
    <aside
      aria-label="Cart summary"
      className="fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom,0px))] left-0 right-0 z-40 px-4 animate-fade-in-up"
    >
      <div className="mx-auto flex max-w-md items-center justify-between rounded-2xl border border-red-900/20 bg-[#A62B34] px-4 py-3 text-white shadow-xl shadow-red-950/25 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-bold text-[#A62B34] shadow-xs">
            {totalCount}
          </div>
          <div>
            <span className="text-[10px] text-white/80 font-mono uppercase tracking-wider">Your Order</span>
            <p className="font-serif text-base font-bold tracking-tight">₹{totalRupees}</p>
          </div>
        </div>

        <button
          onClick={openCart}
          className="flex items-center gap-1.5 rounded-xl bg-white/20 px-4 py-2 font-serif text-xs font-bold text-white transition hover:bg-white/30 active:scale-95 touch-manipulation"
        >
          <span>View Cart</span>
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </aside>
  );
};

