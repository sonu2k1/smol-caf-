"use client";

import React, { useState } from "react";
import type { CategoryWithItems, MenuItemWithDetails } from "@/lib/queries/menu";
import { CartProvider } from "@/context/CartContext";
import { CategoryNav } from "./CategoryNav";
import { MenuItemCard } from "./MenuItemCard";
import { ItemDetailModal } from "./ItemDetailModal";
import { FloatingCartBar } from "@/components/cart/FloatingCartBar";
import { CartDrawer } from "@/components/cart/CartDrawer";

interface MenuClientViewProps {
  categories: CategoryWithItems[];
  tableLabel?: string;
  locationName?: string;
}

const MenuContent: React.FC<MenuClientViewProps> = ({
  categories,
  tableLabel,
  locationName = "Smol Café",
}) => {
  const [activeCategoryId, setActiveCategoryId] = useState<string>(categories[0]?.id || "");
  const [selectedItem, setSelectedItem] = useState<MenuItemWithDetails | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVegOnly, setFilterVegOnly] = useState(false);

  const handleSelectCategory = (categoryId: string) => {
    setActiveCategoryId(categoryId);
    const element = document.getElementById(`category-${categoryId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Filter items based on search and veg toggle
  const filteredCategories = categories
    .map((category) => {
      const filteredItems = category.items.filter((item) => {
        const matchesSearch =
          searchQuery === "" ||
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.metadata.core_ingredients?.toLowerCase().includes(searchQuery.toLowerCase());

        const isVeg =
          !filterVegOnly ||
          (item.metadata.dietary || "").toLowerCase().includes("veg") ||
          (item.metadata.dietary || "").toLowerCase().includes("vegan");

        return matchesSearch && isVeg;
      });

      return {
        ...category,
        items: filteredItems,
      };
    })
    .filter((cat) => cat.items.length > 0);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1C1917] pb-24 dark:bg-[#141211] dark:text-[#FDFBF7]">
      {/* Top Header */}
      <header className="border-b border-stone-200/80 bg-white/70 px-4 py-4 backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/60">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-[#9B2C2C] dark:text-[#F6AD55]">
                smol café
              </span>
              <span className="text-stone-300 dark:text-stone-700">•</span>
              <span className="text-xs text-stone-500 font-medium">{locationName}</span>
            </div>
            {tableLabel ? (
              <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                Seated at Table {tableLabel}
              </p>
            ) : (
              <p className="text-xs text-stone-500">Digital Menu</p>
            )}
          </div>

          {tableLabel && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Table
            </span>
          )}
        </div>

        {/* Search & Veg-only Filter */}
        <div className="mx-auto mt-3.5 flex max-w-2xl items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search brews, bowls, deckers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-stone-200 bg-stone-50/80 px-4 py-2 text-xs text-stone-900 placeholder:text-stone-400 focus:border-stone-400 focus:outline-none dark:border-stone-800 dark:bg-stone-800/60 dark:text-stone-100"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400"
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={() => setFilterVegOnly((v) => !v)}
            className={`whitespace-nowrap rounded-full border px-3 py-2 text-xs font-medium transition ${
              filterVegOnly
                ? "border-green-600 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-950/60 dark:text-green-300"
                : "border-stone-200 bg-stone-50/80 text-stone-600 dark:border-stone-800 dark:bg-stone-800/60 dark:text-stone-400"
            }`}
          >
            🟢 Veg only
          </button>
        </div>
      </header>

      {/* Sticky Category Navigation */}
      <CategoryNav
        categories={filteredCategories}
        activeCategoryId={activeCategoryId}
        onSelectCategory={handleSelectCategory}
      />

      {/* Main Menu List */}
      <main className="mx-auto max-w-2xl px-4 py-6">
        {filteredCategories.length === 0 ? (
          <div className="rounded-3xl border border-stone-200/80 bg-white/60 p-12 text-center dark:border-stone-800 dark:bg-stone-900/60">
            <p className="text-sm text-stone-500">No menu items found matching your filter.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterVegOnly(false);
              }}
              className="mt-3 text-xs font-semibold text-[#9B2C2C] underline dark:text-[#F6AD55]"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {filteredCategories.map((category) => (
              <section
                key={category.id}
                id={`category-${category.id}`}
                className="scroll-mt-16 space-y-3.5"
              >
                <div className="flex items-baseline justify-between border-b border-stone-200/80 pb-2 dark:border-stone-800">
                  <h2 className="text-lg font-black tracking-tight text-stone-900 dark:text-stone-100">
                    {category.name}
                  </h2>
                  <span className="text-xs text-stone-400 font-medium">
                    {category.items.length} {category.items.length === 1 ? "item" : "items"}
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {category.items.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      onOpenDetail={(it) => setSelectedItem(it)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {/* Item Detail Modal */}
      <ItemDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />

      {/* Floating Cart Bar */}
      <FloatingCartBar />

      {/* Cart Drawer */}
      <CartDrawer tableLabel={tableLabel} />
    </div>
  );
};

export const MenuClientView: React.FC<MenuClientViewProps> = (props) => {
  return (
    <CartProvider>
      <MenuContent {...props} />
    </CartProvider>
  );
};
