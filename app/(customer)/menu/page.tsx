'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { Category, MenuItem } from '@/lib/types';
import { Search, ChevronLeft, Sparkles, X, SlidersHorizontal, Leaf, Flame, Heart } from 'lucide-react';
import { APP_CONFIG } from '@/lib/config';
import { customerStore } from '@/lib/customer-store';

function MenuContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawCat = searchParams.get('cat') || 'all';

  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'vegan' | 'protein'>('all');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const loadData = () => {
    const cats = db.getCategories();
    const items = db.getMenuItems();
    setCategories(cats);
    setMenuItems(items);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('smol_db_change', loadData);
    window.addEventListener('smol_customer_store_change', loadData);
    return () => {
      window.removeEventListener('smol_db_change', loadData);
      window.removeEventListener('smol_customer_store_change', loadData);
    };
  }, []);

  // Sync with searchParams
  useEffect(() => {
    if (!categories.length) return;
    const catQuery = rawCat.toLowerCase();
    if (catQuery === 'all') {
      setActiveCategory('all');
    } else {
      // Find matching category by ID or name
      const matched = categories.find(
        (c) =>
          c.id.toLowerCase() === catQuery ||
          c.name.toLowerCase().includes(catQuery) ||
          (catQuery === 'coffee' && c.name.includes('coffee')) ||
          (catQuery === 'chai' && c.name.includes('chai')) ||
          (catQuery === 'food' && (c.name.includes('sandwich') || c.name.includes('morning') || c.name.includes('bowl'))) ||
          (catQuery === 'coolers' && (c.name.includes('cold') || c.name.includes('experiment') || c.name.includes('shake')))
      );
      if (matched) {
        setActiveCategory(matched.id);
      } else {
        setActiveCategory('all');
      }
    }
  }, [rawCat, categories]);

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Category filter
      let matchesCategory = true;
      if (activeCategory !== 'all') {
        matchesCategory = item.categoryId === activeCategory;
      }

      // Dietary filter
      let matchesDietary = true;
      if (dietaryFilter === 'veg') {
        matchesDietary = item.isVeg === true;
      } else if (dietaryFilter === 'vegan') {
        matchesDietary = item.isVegan === true;
      } else if (dietaryFilter === 'protein') {
        matchesDietary = item.proteinFocus === 'High' || item.proteinFocus === 'Medium';
      }

      // Search query
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.coreIngredients && item.coreIngredients.toLowerCase().includes(q)) ||
        (item.subcategory && item.subcategory.toLowerCase().includes(q));

      return matchesCategory && matchesDietary && matchesSearch;
    });
  }, [menuItems, activeCategory, dietaryFilter, searchQuery]);

  // Group items by category for structured layout
  const groupedCategories = useMemo(() => {
    const targetCats =
      activeCategory === 'all'
        ? categories
        : categories.filter((c) => c.id === activeCategory);

    return targetCats
      .map((cat) => {
        const items = filteredItems.filter((item) => item.categoryId === cat.id);
        return {
          category: cat,
          items,
        };
      })
      .filter((group) => group.items.length > 0);
  }, [categories, filteredItems, activeCategory]);

  return (
    <div className="animate-in fade-in duration-300 pb-28 min-h-[85vh] bg-brand-creme dark:bg-[#140F0D] text-brand-espresso dark:text-[#EFE7D8] transition-colors">
      {/* Sticky Top Header Bar */}
      <div className="sticky top-0 z-30 bg-brand-creme/95 dark:bg-[#140F0D]/95 backdrop-blur px-4 pt-4 pb-3 border-b border-brand-biscuit/30 dark:border-[#3A2D25] flex items-center justify-between">
        <button
          onClick={() => router.push('/home')}
          className="w-8 h-8 rounded-full flex items-center justify-center text-brand-espresso dark:text-brand-creme hover:bg-brand-biscuit/20 transition-colors"
          aria-label="Go back to Home"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
        </button>

        <div className="text-center">
          <h2 className="font-serif text-2xl font-bold text-[#A62B2B] dark:text-brand-butter lowercase tracking-tight">
            smol menu
          </h2>
        </div>

        <button
          onClick={() => setShowSearch(!showSearch)}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            showSearch
              ? 'bg-[#A62B2B] text-white'
              : 'text-brand-espresso dark:text-brand-creme hover:bg-brand-biscuit/20'
          }`}
          aria-label="Toggle search"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>

      <div className="px-4 py-3 space-y-4">
        {/* Top Prompt Line */}
        <div className="flex items-center justify-between">
          <p className="font-serif italic text-sm text-brand-walnut/80 dark:text-[#9E8E82]">
            what are we brewing &amp; baking today?
          </p>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#A62B2B] dark:text-brand-butter">
            {filteredItems.length} items
          </span>
        </div>

        {/* Expandable Search Input */}
        {showSearch && (
          <div className="relative animate-in slide-in-from-top-2 duration-200">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-brand-walnut dark:text-brand-biscuit opacity-60" />
            <input
              type="text"
              placeholder="search 59 items: dishes, espresso, chaas, rajma, pizzas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-brand-biscuit/20 dark:bg-[#1F1815] border border-brand-biscuit/40 dark:border-[#3A2D25] text-xs font-sans text-brand-espresso dark:text-brand-creme focus:outline-none focus:border-[#A62B2B]"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-xs text-brand-walnut dark:text-brand-biscuit"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Category Filter Pills (Horizontal Scrolling) */}
        <div className="flex items-center justify-between gap-2 py-0.5">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 flex-1">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-serif lowercase whitespace-nowrap transition-all ${
                activeCategory === 'all'
                  ? 'bg-[#A62B2B] text-white font-medium shadow-sm'
                  : 'bg-transparent border border-brand-biscuit/60 dark:border-[#3A2D25] text-brand-walnut dark:text-[#9E8E82] hover:bg-brand-biscuit/20 dark:hover:bg-[#251D19]'
              }`}
            >
              all items
            </button>

            {categories.map((cat) => {
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-serif lowercase whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-[#A62B2B] text-white font-medium shadow-sm'
                      : 'bg-transparent border border-brand-biscuit/60 dark:border-[#3A2D25] text-brand-walnut dark:text-[#9E8E82] hover:bg-brand-biscuit/20 dark:hover:bg-[#251D19]'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Filter Sliders Button */}
          <button
            onClick={() => setShowFilterDrawer(!showFilterDrawer)}
            className={`w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
              dietaryFilter !== 'all' || showFilterDrawer
                ? 'border-[#A62B2B] bg-[#A62B2B]/10 text-[#A62B2B] dark:text-brand-butter'
                : 'border-brand-biscuit/60 dark:border-[#3A2D25] text-brand-walnut dark:text-[#9E8E82] hover:bg-brand-biscuit/20'
            }`}
            aria-label="Filter dietary"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dietary Quick Filter Bar (Toggleable) */}
        {showFilterDrawer && (
          <div className="flex items-center gap-2 pt-1 pb-1 animate-in fade-in slide-in-from-top-1 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-mono uppercase text-brand-walnut dark:text-brand-biscuit">Filter:</span>
            {[
              { id: 'all', label: 'All Diets' },
              { id: 'veg', label: '🌱 Pure Veg' },
              { id: 'vegan', label: '🌿 100% Vegan' },
              { id: 'protein', label: '💪 High Protein' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setDietaryFilter(f.id as any)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-sans whitespace-nowrap transition-all border ${
                  dietaryFilter === f.id
                    ? 'bg-[#E5B54A] text-[#1E1815] font-bold border-[#E5B54A]'
                    : 'bg-brand-biscuit/20 dark:bg-[#1E1815] border-brand-biscuit/40 dark:border-[#3A2D25] text-brand-espresso dark:text-brand-creme'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* Render Categorized Menu Sections */}
        {groupedCategories.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <p className="font-serif text-lg text-brand-walnut dark:text-brand-biscuit">
              no dishes found
            </p>
            <p className="text-xs text-brand-walnut/70">
              Try adjusting your search query or dietary filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
                setDietaryFilter('all');
              }}
              className="mt-2 text-xs font-mono underline text-[#A62B2B] dark:text-brand-butter"
            >
              Clear filters
            </button>
          </div>
        ) : (
          groupedCategories.map(({ category, items }) => (
            <div key={category.id} className="space-y-2 pt-2">
              {/* Category Header */}
              <div className="flex items-baseline justify-between px-1 border-b border-brand-biscuit/20 dark:border-[#2E241E] pb-1.5">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-serif text-lg font-bold text-brand-espresso dark:text-[#E6C687] lowercase">
                    {category.name}
                  </h3>
                  <span className="text-[#E6C687] text-xs">✧</span>
                </div>
                <span className="text-[10px] font-mono text-brand-walnut/60 dark:text-[#9E8E82]">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {category.description && (
                <p className="text-[11px] font-serif italic text-brand-walnut/70 dark:text-[#9E8E82] px-1 pb-0.5">
                  {category.description}
                </p>
              )}

              {/* Items Card List */}
              <div className="rounded-3xl border border-brand-biscuit/40 dark:border-[#3A2D25]/80 bg-[#FAF4EA]/40 dark:bg-[#1E1815] p-3.5 divide-y divide-brand-biscuit/20 dark:divide-[#2E241E] shadow-sm">
                {items.map((item) => {
                  const isVeg = item.isVeg !== false;
                  const isEgg = item.isEgg === true;

                  return (
                    <Link
                      key={item.id}
                      href={`/item/${item.id}`}
                      className="py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-3.5 group transition-opacity"
                    >
                      {/* Double-Line Arched Thumbnail Frame */}
                      <div className="w-[68px] h-[92px] rounded-t-[34px] rounded-b-[4px] p-[2.5px] bg-[#FAF4EA] dark:bg-[#1A1411] border border-[#D8C7B0] dark:border-[#524438] flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                        <div className="w-full h-full rounded-t-[31px] rounded-b-[2px] border border-[#D8C7B0]/90 dark:border-[#524438]/90 overflow-hidden relative">
                          <img
                            src={item.image || '/mood-food-card.png'}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Middle Content */}
                      <div className="flex-1 space-y-1 pr-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Dietary Indicator Dot */}
                          <span
                            className={`w-2 h-2 rounded-full inline-block flex-shrink-0 ${
                              isEgg
                                ? 'bg-[#F39C12] ring-1 ring-[#F39C12]/40'
                                : isVeg
                                ? 'bg-[#2ECC71] ring-1 ring-[#2ECC71]/40'
                                : 'bg-[#E74C3C]'
                            }`}
                            title={isEgg ? 'Contains Egg' : isVeg ? 'Vegetarian' : 'Non-veg'}
                          />
                          <h4 className="font-serif font-bold text-sm text-brand-espresso dark:text-[#EFE7D8] lowercase group-hover:text-brand-cherry transition-colors">
                            {item.name}
                          </h4>
                        </div>

                        {/* Special or Seasonal Badges */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {item.isSpecial && (
                            <span className="bg-[#E5B54A] text-[#1E1815] text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase inline-flex items-center gap-0.5">
                              ★ SPECIAL
                            </span>
                          )}
                          {item.isVegan && (
                            <span className="border border-emerald-500/60 text-emerald-700 dark:text-emerald-300 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase">
                              VEGAN
                            </span>
                          )}
                          {item.spice && item.spice !== 'None' && (
                            <span className="text-[9px] font-mono text-brand-walnut/70 dark:text-[#9E8E82] inline-flex items-center gap-0.5">
                              🌶️ {item.spice}
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        <p className="font-sans text-[11px] text-brand-walnut/80 dark:text-[#9E8E82] leading-snug line-clamp-2">
                          {item.description}
                        </p>

                        {/* Best Pairing Hint if available */}
                        {item.bestPairing && item.bestPairing !== '—' && (
                          <p className="text-[10px] font-serif italic text-[#A62B2B]/90 dark:text-[#E6C687]/90 line-clamp-1">
                            pairs with: {item.bestPairing}
                          </p>
                        )}
                      </div>

                      {/* Right Price in Vintage Gold */}
                      <div className="text-right flex-shrink-0 pl-1">
                        <span className="font-serif text-base font-bold text-brand-espresso dark:text-[#E5B54A]">
                          {APP_CONFIG.defaultCurrency}{item.price}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function CustomerMenuPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-xs font-mono text-brand-walnut">Loading Smol Menu...</div>}>
      <MenuContent />
    </Suspense>
  );
}
