import React from "react";
import type { MenuItemWithDetails } from "@/lib/queries/menu";

interface MenuItemCardProps {
  item: MenuItemWithDetails;
  onOpenDetail: (item: MenuItemWithDetails) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onOpenDetail }) => {
  const priceRupees = Math.round(item.pricePaise / 100);
  const dietary = item.metadata?.dietary || "";
  const isVeg = dietary.toLowerCase().includes("veg") && !dietary.toLowerCase().includes("egg");
  const isEgg = dietary.toLowerCase().includes("egg");
  const isVegan = dietary.toLowerCase().includes("vegan");

  return (
    <div
      onClick={() => onOpenDetail(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenDetail(item);
        }
      }}
      className="group relative flex flex-col justify-between rounded-2xl border border-stone-200/80 bg-white/75 p-4 text-left shadow-sm transition hover:border-stone-300 hover:bg-white hover:shadow-md active:scale-[0.99] dark:border-stone-800 dark:bg-stone-900/70 dark:hover:border-stone-700 dark:hover:bg-stone-900"
    >
      <div>
        {/* Header: Dietary tag & Subcategory / Chai ke Saathi */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {isVegan ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                🌱 Vegan
              </span>
            ) : isVeg ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-950/60 dark:text-green-300">
                🟢 Veg
              </span>
            ) : isEgg ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                🍳 Egg
              </span>
            ) : dietary ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                {dietary}
              </span>
            ) : null}

            {item.metadata?.chai_ke_saathi && (
              <span className="inline-flex items-center rounded-md bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-800 dark:bg-orange-950/60 dark:text-orange-300">
                ☕ Chai ke Saathi
              </span>
            )}
          </div>

          <span className="text-base font-bold text-stone-900 dark:text-stone-100">
            ₹{priceRupees}
          </span>
        </div>

        {/* Item Name */}
        <h3 className="mt-2.5 text-base font-bold tracking-tight text-stone-900 transition group-hover:text-[#9B2C2C] dark:text-stone-100 dark:group-hover:text-[#F6AD55]">
          {item.name}
        </h3>

        {/* Short Description */}
        {item.description && (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-stone-600 dark:text-stone-400">
            {item.description}
          </p>
        )}
      </div>

      {/* Footer info: Pairing or Spice indicator */}
      {item.metadata?.best_pairing && (
        <div className="mt-3 flex items-center gap-1 text-[11px] text-stone-500 dark:text-stone-400 border-t border-stone-100 dark:border-stone-800/80 pt-2">
          <span className="font-medium text-stone-700 dark:text-stone-300">Pairs with:</span>
          <span className="truncate italic">{item.metadata.best_pairing}</span>
        </div>
      )}
    </div>
  );
};
