"use client";

import React, { useState } from "react";
import type { MenuItemWithDetails } from "@/lib/queries/menu";
import { useCart } from "@/context/CartContext";
import { getFoodImage } from "@/lib/food-images";

interface ItemDetailModalProps {
  item: MenuItemWithDetails | null;
  onClose: () => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ item, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);
  const { addItem } = useCart();

  if (!item) return null;

  const priceRupees = Math.round(item.pricePaise / 100);
  const dietary = item.metadata?.dietary || "";
  const isVeg = dietary.toLowerCase().includes("veg") && !dietary.toLowerCase().includes("egg");
  const isEgg = dietary.toLowerCase().includes("egg");
  const isVegan = dietary.toLowerCase().includes("vegan");
  const foodImageUrl = getFoodImage(item.name, item.imageUrl);

  const handleAddToCart = () => {
    addItem(item, quantity);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-stone-900/60 p-0 backdrop-blur-xs sm:items-center sm:p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-[2.5rem] sm:rounded-3xl border border-[#E2D7C7] bg-[#FAF5ED] p-5 sm:p-6 shadow-2xl transition-all animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header: Dietary Tag & Close Button */}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            {isVegan ? (
              <span className="rounded-md bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 border border-emerald-200">
                🌱 Vegan
              </span>
            ) : isVeg ? (
              <span className="rounded-md bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 border border-emerald-200">
                🟢 Vegetarian
              </span>
            ) : isEgg ? (
              <span className="rounded-md bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900 border border-amber-200">
                🍳 Contains Egg
              </span>
            ) : null}

            {item.metadata?.subcategory && (
              <span className="rounded-md bg-[#EFE7DC] px-2.5 py-0.5 text-[11px] font-mono text-[#786F66]">
                {item.metadata.subcategory}
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EFE7DC] text-[#786F66] hover:bg-[#E2D6C5] active:scale-95 transition"
          >
            ✕
          </button>
        </div>

        {/* Real Food Photo Hero Banner */}
        <div className="relative mt-3.5 h-48 w-full overflow-hidden rounded-2xl border border-[#E2D6C5] bg-[#EFE7DC] shadow-inner">
          {!imageError ? (
            <img
              src={foodImageUrl}
              alt={item.name}
              onError={() => setImageError(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-4xl">
              ☕
            </div>
          )}
        </div>

        {/* Item Title & Price */}
        <div className="mt-4 flex items-baseline justify-between gap-4">
          <h2 className="font-serif text-2xl font-bold tracking-tight text-[#1C1917] lowercase">
            {item.name}
          </h2>
          <span className="font-serif text-2xl font-bold text-[#A62B34]">
            ₹{priceRupees}
          </span>
        </div>

        {/* Description */}
        <p className="mt-1.5 font-serif text-sm leading-relaxed text-[#5C544D]">
          {item.description || "Freshly handcrafted with love at smol café."}
        </p>

        {/* Nutritional & Profile Tags */}
        <div className="mt-4 grid grid-cols-2 gap-2.5 text-xs">
          {item.metadata?.protein_focus && (
            <div className="rounded-2xl border border-[#E8DFD3] bg-[#FCF8F2] p-3 text-left shadow-xs">
              <span className="block font-mono text-[10px] uppercase font-bold tracking-wider text-[#8C7E72]">
                PROTEIN
              </span>
              <p className="font-serif font-bold text-sm text-[#1C1917] mt-0.5">
                {item.metadata.protein_focus}
              </p>
            </div>
          )}

          {item.metadata?.spice && (
            <div className="rounded-2xl border border-[#E8DFD3] bg-[#FCF8F2] p-3 text-left shadow-xs">
              <span className="block font-mono text-[10px] uppercase font-bold tracking-wider text-[#8C7E72]">
                SPICE LEVEL
              </span>
              <p className="font-serif font-bold text-sm text-[#1C1917] mt-0.5">
                {item.metadata.spice}
              </p>
            </div>
          )}
        </div>

        {/* Core Ingredients Section */}
        {item.metadata?.core_ingredients && (
          <div className="mt-3 rounded-2xl border border-[#E8DFD3] bg-[#FCF8F2] p-3.5 text-left shadow-xs">
            <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#8C7E72]">
              INGREDIENTS
            </h4>
            <p className="mt-1 font-serif text-xs leading-relaxed text-[#5C544D]">
              {item.metadata.core_ingredients}
            </p>
          </div>
        )}

        {/* Best Pairing Recommendation */}
        {item.metadata?.best_pairing && (
          <div className="mt-3 flex items-start gap-2.5 rounded-2xl border border-[#F4E6C3] bg-[#FDF4DC] p-3.5 shadow-xs">
            <span className="text-base shrink-0 mt-0.5">☕</span>
            <div>
              <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#7C5316]">
                BEST PAIRED WITH
              </h4>
              <p className="mt-0.5 font-serif italic text-xs text-[#7C5316]">
                {item.metadata.best_pairing}
              </p>
            </div>
          </div>
        )}

        {/* Quantity Selector & Action Footer */}
        <div className="mt-5 flex items-center gap-3 border-t border-[#E8DFD3] pt-4 pb-2">
          <div className="flex items-center rounded-2xl border border-[#E2D7C7] bg-[#FCF8F2] px-2 py-1.5 shadow-xs">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="flex h-8 w-8 items-center justify-center text-lg font-bold text-[#786F66] disabled:opacity-30 active:scale-95 transition"
            >
              −
            </button>
            <span className="w-8 text-center font-serif text-base font-bold text-[#1C1917]">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="flex h-8 w-8 items-center justify-center text-lg font-bold text-[#786F66] active:scale-95 transition"
            >
              +
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            className="flex-1 rounded-2xl bg-[#A62B34] py-3.5 text-center font-serif text-base font-semibold text-white shadow-md transition hover:bg-[#91242C] active:scale-[0.98] hover-lift"
          >
            Add to Order • ₹{priceRupees * quantity}
          </button>
        </div>
      </div>
    </div>
  );
};
