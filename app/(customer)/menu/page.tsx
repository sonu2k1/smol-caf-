'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { Category, MenuItem } from '@/lib/types';
import { Search, ChevronLeft, Sparkles, X, SlidersHorizontal } from 'lucide-react';
import { APP_CONFIG } from '@/lib/config';
import { customerStore } from '@/lib/customer-store';

function MenuContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCategory = searchParams.get('cat') || 'all';

  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const loadData = () => {
    setCategories(db.getCategories());
    setMenuItems(db.getMenuItems());
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

  const categoryPills = [
    { id: 'all', name: 'all' },
    { id: 'coffee', name: 'coffee' },
    { id: 'tea', name: 'tea' },
    { id: 'fizz', name: 'fizz' },
    { id: 'bites', name: 'bites' },
  ];

  // Filtering
  const filteredItems = menuItems.filter((item) => {
    let matchesCategory = true;
    if (activeCategory !== 'all') {
      if (activeCategory === 'coffee') {
        matchesCategory =
          item.categoryId === 'cat-1' ||
          item.name.toLowerCase().includes('pour over') ||
          item.name.toLowerCase().includes('espresso') ||
          item.name.toLowerCase().includes('flat white') ||
          item.name.toLowerCase().includes('coffee');
      } else if (activeCategory === 'tea') {
        matchesCategory =
          item.categoryId === 'cat-2' ||
          item.name.toLowerCase().includes('chai') ||
          item.name.toLowerCase().includes('tea') ||
          item.name.toLowerCase().includes('chaas');
      } else if (activeCategory === 'fizz') {
        matchesCategory =
          item.categoryId === 'cat-5' ||
          item.name.toLowerCase().includes('fizz') ||
          item.name.toLowerCase().includes('brew') ||
          item.name.toLowerCase().includes('tonic') ||
          item.name.toLowerCase().includes('frappe');
      } else if (activeCategory === 'bites') {
        matchesCategory =
          item.categoryId === 'cat-3' ||
          item.categoryId === 'cat-4' ||
          item.categoryId === 'cat-6' ||
          item.name.toLowerCase().includes('toast') ||
          item.name.toLowerCase().includes('panini') ||
          item.name.toLowerCase().includes('cake') ||
          item.name.toLowerCase().includes('board');
      }
    }

    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Group items
  const signatureItems = filteredItems.filter(
    (item) =>
      item.categoryId === 'cat-1' ||
      item.categoryId === 'cat-2' ||
      item.id === 'item-1' ||
      item.id === 'item-2' ||
      item.id === 'item-3' ||
      item.id === 'item-4'
  );

  const refresherItems = filteredItems.filter(
    (item) =>
      item.categoryId === 'cat-5' ||
      item.id === 'item-14' ||
      item.name.toLowerCase().includes('fizz') ||
      item.name.toLowerCase().includes('brew') ||
      item.name.toLowerCase().includes('chaas')
  );

  const bitesItems = filteredItems.filter(
    (item) =>
      item.categoryId === 'cat-3' ||
      item.categoryId === 'cat-4' ||
      item.categoryId === 'cat-6' ||
      (!signatureItems.includes(item) && !refresherItems.includes(item))
  );

  return (
    <div className="animate-in fade-in duration-300 pb-28 min-h-[85vh] bg-brand-creme dark:bg-[#140F0D] text-brand-espresso dark:text-[#EFE7D8] transition-colors">
      {/* Sticky / Fixed Top Header Bar */}
      <div className="sticky top-0 z-30 bg-brand-creme/95 dark:bg-[#140F0D]/95 backdrop-blur px-4 pt-4 pb-3 border-b border-brand-biscuit/30 dark:border-[#3A2D25] flex items-center justify-between">
        <button
          onClick={() => router.push('/home')}
          className="w-8 h-8 rounded-full flex items-center justify-center text-brand-espresso dark:text-brand-creme hover:bg-brand-biscuit/20 transition-colors"
          aria-label="Go back to Home"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
        </button>

        <h2 className="font-serif text-2xl font-bold text-[#A62B2B] dark:text-brand-butter">
          Menu
        </h2>

        <button
          onClick={() => setShowSearch(!showSearch)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-brand-espresso dark:text-brand-creme hover:bg-brand-biscuit/20 transition-colors"
          aria-label="Toggle search"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>

      <div className="px-4 py-3 space-y-4">
        {/* Top Prompt Line */}
        <p className="font-serif italic text-sm text-brand-walnut/80 dark:text-[#9E8E82]">
          what are we brewing today?
        </p>

      {/* Expandable Search Input */}
      {showSearch && (
        <div className="relative animate-in slide-in-from-top-2 duration-200">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-brand-walnut dark:text-brand-biscuit opacity-60" />
          <input
            type="text"
            placeholder="search drinks, breakfast & bowls..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-brand-biscuit/20 dark:bg-[#1F1815] border border-brand-biscuit/40 dark:border-[#3A2D25] text-xs font-sans text-brand-espresso dark:text-brand-creme focus:outline-none"
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

      {/* Category Pills Header Bar */}
      <div className="flex items-center justify-between gap-2 py-0.5">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 flex-1">
          {categoryPills.map((pill) => {
            const isSelected = activeCategory === pill.id;
            return (
              <button
                key={pill.id}
                onClick={() => setActiveCategory(pill.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-serif lowercase whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#A62B2B] text-white font-medium shadow-sm'
                    : 'bg-transparent border border-brand-biscuit/60 dark:border-[#3A2D25] text-brand-walnut dark:text-[#9E8E82] hover:bg-brand-biscuit/20 dark:hover:bg-[#251D19]'
                }`}
              >
                {pill.name}
              </button>
            );
          })}
        </div>

        {/* Filter Sliders Button */}
        <button
          onClick={() => {}}
          className="w-8 h-8 rounded-full border border-brand-biscuit/60 dark:border-[#3A2D25] flex items-center justify-center text-brand-walnut dark:text-[#9E8E82] hover:bg-brand-biscuit/20 flex-shrink-0"
          aria-label="Filters"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ====== SECTION 1: SIGNATURE BREWS ====== */}
      {signatureItems.length > 0 && (
        <div className="space-y-2 pt-1">
          {/* Section Header with Golden Sparkle */}
          <div className="flex items-center gap-1.5 px-1">
            <h3 className="font-serif text-lg font-bold text-brand-espresso dark:text-[#E6C687] lowercase">
              signature brews
            </h3>
            <span className="text-[#E6C687] text-sm">✧</span>
          </div>

          {/* Dark Mode Card Box */}
          <div className="rounded-3xl border border-brand-biscuit/40 dark:border-[#3A2D25]/80 bg-[#FAF4EA]/40 dark:bg-[#1E1815] p-3.5 divide-y divide-brand-biscuit/20 dark:divide-[#2E241E] shadow-sm">
            {signatureItems.map((item) => {
              const itemImage =
                item.image ||
                (item.id === 'item-1'
                  ? '/item-pourover.png'
                  : item.id === 'item-2'
                  ? '/item-espresso.png'
                  : item.id === 'item-3'
                  ? '/item-flatwhite.png'
                  : item.id === 'item-4'
                  ? '/item-kulhadchai.png'
                  : '/item-pourover.png');

              return (
                <Link
                  key={item.id}
                  href={`/item/${item.id}`}
                  className="py-3 first:pt-1 last:pb-1 flex items-center justify-between gap-3.5 group transition-opacity"
                >
                  {/* Double-Line Arched Thumbnail Frame matching reference image */}
                  <div className="w-[68px] h-[92px] rounded-t-[34px] rounded-b-[4px] p-[2.5px] bg-[#FAF4EA] dark:bg-[#1A1411] border border-[#D8C7B0] dark:border-[#524438] flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    <div className="w-full h-full rounded-t-[31px] rounded-b-[2px] border border-[#D8C7B0]/90 dark:border-[#524438]/90 overflow-hidden relative">
                      <img
                        src={itemImage}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Middle Content */}
                  <div className="flex-1 space-y-0.5 pr-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2ECC71] inline-block flex-shrink-0" />
                      <h4 className="font-serif font-bold text-sm text-brand-espresso dark:text-[#EFE7D8] lowercase group-hover:text-brand-cherry transition-colors">
                        {item.name}
                      </h4>
                    </div>

                    {/* Special Badge (e.g. for Tapovan Pour Over) */}
                    {item.isSpecial && (
                      <div className="pt-0.5 pb-0.5">
                        <span className="bg-[#E5B54A] text-[#1E1815] text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase inline-flex items-center gap-0.5">
                          ★ SPECIAL
                        </span>
                      </div>
                    )}

                    {/* Description */}
                    <p className="font-sans text-[11px] text-brand-walnut/80 dark:text-[#9E8E82] leading-snug line-clamp-2">
                      {item.description}
                    </p>
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
      )}

      {/* ====== SECTION 2: REFRESHERS & FIZZ ====== */}
      {refresherItems.length > 0 && (
        <div className="space-y-2 pt-2">
          {/* Section Header with Soft Teal/Gold Text */}
          <div className="flex items-center gap-1.5 px-1">
            <h3 className="font-serif text-lg font-bold text-brand-espresso dark:text-[#93BDB0] lowercase">
              refreshers &amp; fizz
            </h3>
            <span className="text-[#93BDB0] text-sm">✧</span>
          </div>

          {/* Dark Mode Card Box */}
          <div className="rounded-3xl border border-brand-biscuit/40 dark:border-[#3A2D25]/80 bg-[#FAF4EA]/40 dark:bg-[#1E1815] p-3.5 divide-y divide-brand-biscuit/20 dark:divide-[#2E241E] shadow-sm">
            {refresherItems.map((item) => {
              const itemImage =
                item.image ||
                (item.id === 'item-14'
                  ? '/item-guavafizz.png'
                  : item.id === 'item-5'
                  ? '/item_chaas.jpg'
                  : item.id === 'item-11'
                  ? '/item_rosebrew.jpg'
                  : '/item-guavafizz.png');

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
                        src={itemImage}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Middle Content */}
                  <div className="flex-1 space-y-0.5 pr-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2ECC71] inline-block flex-shrink-0" />
                      <h4 className="font-serif font-bold text-sm text-brand-espresso dark:text-[#EFE7D8] lowercase group-hover:text-brand-cherry transition-colors">
                        {item.name}
                      </h4>
                    </div>

                    <p className="font-sans text-[11px] text-brand-walnut/80 dark:text-[#9E8E82] leading-snug line-clamp-2">
                      {item.description}
                    </p>
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
      )}

      {/* ====== SECTION 3: BITES & FOOD ====== */}
      {bitesItems.length > 0 && activeCategory !== 'coffee' && activeCategory !== 'tea' && activeCategory !== 'fizz' && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-1.5 px-1">
            <h3 className="font-serif text-lg font-bold text-brand-espresso dark:text-[#E6C687] lowercase">
              bites &amp; toasts
            </h3>
            <span className="text-[#E6C687] text-sm">✧</span>
          </div>

          <div className="rounded-3xl border border-brand-biscuit/40 dark:border-[#3A2D25]/80 bg-[#FAF4EA]/40 dark:bg-[#1E1815] p-3.5 divide-y divide-brand-biscuit/20 dark:divide-[#2E241E] shadow-sm">
            {bitesItems.map((item) => {
              const itemImage =
                item.image ||
                (item.id === 'item-6'
                  ? '/item_avocado.jpg'
                  : item.id === 'item-7'
                  ? '/item_mushroom.jpg'
                  : item.id === 'item-9'
                  ? '/item_panini.jpg'
                  : item.id === 'item-12' || item.id === 'item-13'
                  ? '/item_chocolatecake.jpg'
                  : '/mood-food-card.png');

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
                        src={itemImage}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="flex-1 space-y-0.5 pr-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2ECC71] inline-block flex-shrink-0" />
                      <h4 className="font-serif font-bold text-sm text-brand-espresso dark:text-[#EFE7D8] lowercase group-hover:text-brand-cherry transition-colors">
                        {item.name}
                      </h4>
                    </div>

                    <p className="font-sans text-[11px] text-brand-walnut/80 dark:text-[#9E8E82] leading-snug line-clamp-2">
                      {item.description}
                    </p>
                  </div>

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
      )}
      </div>
    </div>
  );
}

export default function CustomerMenuPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-xs font-mono text-brand-walnut">Loading menu...</div>}>
      <MenuContent />
    </Suspense>
  );
}
