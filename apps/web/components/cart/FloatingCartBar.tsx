"use client";

import React from "react";
import { useCart } from "@/context/CartContext";

export const FloatingCartBar: React.FC = () => {
  const { totalCount, subtotalPaise, openCart } = useCart();

  if (totalCount === 0) return null;

  const totalRupees = Math.round(subtotalPaise / 100);

  return (
    <aside aria-label="Cart summary" className="fixed bottom-5 left-0 right-0 z-40 px-4">
      <div className="mx-auto flex max-w-md items-center justify-between rounded-2xl border border-stone-800/20 bg-stone-900 px-5 py-3.5 text-white shadow-2xl shadow-stone-900/40 backdrop-blur-lg dark:border-stone-200/20 dark:bg-stone-100 dark:text-stone-900">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#9B2C2C] text-xs font-bold text-white dark:bg-[#C53030]">
            {totalCount}
          </div>
          <div>
            <span className="text-xs text-stone-400 dark:text-stone-500 font-medium">Total</span>
            <p className="text-base font-black tracking-tight">₹{totalRupees}</p>
          </div>
        </div>

        <button
          onClick={openCart}
          className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-white/20 active:scale-95 dark:bg-stone-900/10 dark:text-stone-900 dark:hover:bg-stone-900/20"
        >
          View Order
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </aside>
  );
};
