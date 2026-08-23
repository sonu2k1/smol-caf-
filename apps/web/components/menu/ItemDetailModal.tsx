"use client";

import React, { useState } from "react";
import type { MenuItemWithDetails } from "@/lib/queries/menu";

interface ItemDetailModalProps {
  item: MenuItemWithDetails | null;
  onClose: () => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ item, onClose }) => {
  const [quantity, setQuantity] = useState(1);

  if (!item) return null;

  const priceRupees = Math.round(item.pricePaise / 100);
  const dietary = item.metadata?.dietary || "";
  const isVeg = dietary.toLowerCase().includes("veg") && !dietary.toLowerCase().includes("egg");
  const isEgg = dietary.toLowerCase().includes("egg");
  const isVegan = dietary.toLowerCase().includes("vegan");

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-stone-200/80 bg-[#FDFBF7] p-6 shadow-2xl transition-all dark:border-stone-800 dark:bg-[#1C1917]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Close Header */}
        <div className="flex items-start justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            {isVegan ? (
              <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                🌱 Vegan
              </span>
            ) : isVeg ? (
              <span className="rounded-md bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-800 dark:bg-green-950/80 dark:text-green-300">
                🟢 Vegetarian
              </span>
            ) : isEgg ? (
              <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-900 dark:bg-amber-950/80 dark:text-amber-300">
                🍳 Contains Egg
              </span>
            ) : null}

            {item.metadata?.subcategory && (
              <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                {item.metadata.subcategory}
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
          >
            ✕
          </button>
        </div>

        {/* Item Title & Price */}
        <div className="mt-4 flex items-baseline justify-between gap-4">
          <h2 className="text-2xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
            {item.name}
          </h2>
          <span className="text-xl font-black text-[#9B2C2C] dark:text-[#F6AD55]">
            ₹{priceRupees}
          </span>
        </div>

        {/* Description */}
        <p className="mt-3 text-sm leading-relaxed text-stone-700 dark:text-stone-300">
          {item.description || "Freshly handcrafted with love at smol café."}
        </p>

        {/* Nutritional & Profile Tags */}
        <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
          {item.metadata?.protein_focus && (
            <div className="rounded-xl border border-stone-200/80 bg-white/70 p-2.5 dark:border-stone-800 dark:bg-stone-900/60">
              <span className="text-[10px] uppercase font-semibold text-stone-400">Protein</span>
              <p className="font-medium text-stone-800 dark:text-stone-200">
                {item.metadata.protein_focus}
              </p>
            </div>
          )}

          {item.metadata?.spice && (
            <div className="rounded-xl border border-stone-200/80 bg-white/70 p-2.5 dark:border-stone-800 dark:bg-stone-900/60">
              <span className="text-[10px] uppercase font-semibold text-stone-400">
                Spice Level
              </span>
              <p className="font-medium text-stone-800 dark:text-stone-200">
                {item.metadata.spice}
              </p>
            </div>
          )}
        </div>

        {/* Core Ingredients Section */}
        {item.metadata?.core_ingredients && (
          <div className="mt-5 rounded-2xl border border-stone-200/70 bg-stone-50/80 p-3.5 dark:border-stone-800 dark:bg-stone-900/50">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Ingredients
            </h4>
            <p className="mt-1 text-xs leading-relaxed text-stone-700 dark:text-stone-300">
              {item.metadata.core_ingredients}
            </p>
          </div>
        )}

        {/* Best Pairing Recommendation */}
        {item.metadata?.best_pairing && (
          <div className="mt-3 flex items-start gap-2.5 rounded-2xl border border-amber-200/70 bg-amber-50/70 p-3.5 dark:border-amber-900/40 dark:bg-amber-950/30">
            <span className="text-base">☕</span>
            <div>
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                Best Paired With
              </h4>
              <p className="text-xs text-amber-800 dark:text-amber-300">
                {item.metadata.best_pairing}
              </p>
            </div>
          </div>
        )}

        {/* Quantity Selector & Action Footer */}
        <div className="mt-6 flex items-center gap-3 border-t border-stone-200/80 pt-5 dark:border-stone-800">
          <div className="flex items-center rounded-2xl border border-stone-300 bg-white px-2 py-1.5 dark:border-stone-700 dark:bg-stone-800">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="flex h-8 w-8 items-center justify-center text-lg font-bold text-stone-600 disabled:opacity-30 dark:text-stone-300"
            >
              −
            </button>
            <span className="w-8 text-center text-sm font-bold text-stone-900 dark:text-stone-100">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="flex h-8 w-8 items-center justify-center text-lg font-bold text-stone-600 dark:text-stone-300"
            >
              +
            </button>
          </div>

          <button
            onClick={onClose}
            className="flex-1 rounded-2xl bg-stone-900 py-3.5 text-center text-sm font-semibold text-white shadow-md transition hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
          >
            Done (₹{priceRupees * quantity})
          </button>
        </div>
      </div>
    </div>
  );
};
