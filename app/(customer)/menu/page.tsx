'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { Category, MenuItem } from '@/lib/types';
import { Search, ChevronLeft, Heart, Sparkles, X } from 'lucide-react';
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
  const [favourites, setFavourites] = useState<string[]>([]);

  const loadData = () => {
    setCategories(db.getCategories());
    setMenuItems(db.getMenuItems());
    setFavourites(customerStore.getState().favourites);
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

  const toggleFav = (e: React.MouseEvent, itemId: string) => {
    e.preventDefault();
    e.stopPropagation();
    customerStore.toggleFavourite(itemId);
  };

  // Group items into categories
  const filteredItems = menuItems.filter((item) => {
    let matchesCategory = true;
    if (activeCategory !== 'all') {
      if (activeCategory === 'cat-1' || activeCategory === 'Coffee') {
        matchesCategory = item.categoryId === 'cat-1' || item.name.toLowerCase().includes('coffee') || item.name.toLowerCase().includes('pour over') || item.name.toLowerCase().includes('espresso') || item.name.toLowerCase().includes('flat white');
      } else if (activeCategory === 'cat-2' || activeCategory === 'Chai') {
        matchesCategory = item.categoryId === 'cat-2' || item.name.toLowerCase().includes('chai') || item.name.toLowerCase().includes('chaas');
      } else if (activeCategory === 'Coolers') {
        matchesCategory = item.categoryId === 'cat-5' || item.name.toLowerCase().includes('fizz') || item.name.toLowerCase().includes('brew') || item.name.toLowerCase().includes('frappe') || item.name.toLowerCase().includes('tonic');
      } else if (activeCategory === 'cat-3' || activeCategory === 'cat-4' || activeCategory === 'Food') {
        matchesCategory = item.categoryId === 'cat-3' || item.categoryId === 'cat-4' || item.name.toLowerCase().includes('toast') || item.name.toLowerCase().includes('bowl') || item.name.toLowerCase().includes('panini');
      } else {
        matchesCategory = item.categoryId === activeCategory;
      }
    }

    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Grouping for Display Sections
  const signatureItems = filteredItems.filter((item) => item.categoryId === 'cat-1' || item.categoryId === 'cat-2' || item.isSpecial || item.id === 'item-1' || item.id === 'item-2' || item.id === 'item-3' || item.id === 'item-4');
  const coolerItems = filteredItems.filter((item) => item.categoryId === 'cat-5' || item.id === 'item-14' || item.name.toLowerCase().includes('fizz') || item.name.toLowerCase().includes('brew'));
  const foodItems = filteredItems.filter((item) => item.categoryId === 'cat-3' || item.categoryId === 'cat-4' || item.categoryId === 'cat-6');

  const categoryPills = [
    { id: 'all', name: 'All' },
    { id: 'Coffee', name: 'Coffee' },
    { id: 'Chai', name: 'Chai' },
    { id: 'Coolers', name: 'Coolers' },
    { id: 'Food', name: 'Food' },
  ];

  return (
    <div className="px-4 py-4 space-y-5 animate-in fade-in duration-300 pb-24 min-h-[85vh] bg-brand-creme dark:bg-brand-espresso transition-colors">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-brand-biscuit/30 dark:border-brand-espressoCard pb-3">
        <button
          onClick={() => router.push('/home')}
          className="w-8 h-8 rounded-full flex items-center justify-center text-brand-espresso dark:text-brand-creme hover:bg-brand-biscuit/20 transition-colors"
          aria-label="Go back to Home"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <h2 className="font-serif text-2xl font-bold text-brand-cherry dark:text-brand-butter">
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

      {/* Expandable Search Input */}
      {showSearch && (
        <div className="relative animate-in slide-in-from-top-2 duration-200">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-brand-walnut dark:text-brand-biscuit opacity-60" />
          <input
            type="text"
            placeholder="search drinks, breakfast & bowls..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-brand-biscuit/20 dark:bg-brand-espressoLight border border-brand-biscuit/40 dark:border-brand-espressoCard text-xs font-sans text-brand-espresso dark:text-brand-creme focus:outline-none"
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

      {/* Category Pills (Horizontal Scroll) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {categoryPills.map((pill) => {
          const isSelected = activeCategory === pill.id;
          return (
            <button
              key={pill.id}
              onClick={() => setActiveCategory(pill.id)}
              className={`px-5 py-1.5 rounded-full text-xs font-serif whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-brand-cherry text-white font-medium shadow-sm'
                  : 'bg-transparent border border-brand-biscuit/60 dark:border-brand-biscuit/30 text-brand-walnut dark:text-brand-biscuit hover:bg-brand-biscuit/20'
              }`}
            >
              {pill.name}
            </button>
          );
        })}
      </div>

      {/* SIGNATURES Section */}
      {signatureItems.length > 0 && (
        <div className="space-y-3 pt-1">
          <h3 className="font-mono text-xs font-bold text-brand-walnut dark:text-brand-biscuit uppercase tracking-wider border-b border-brand-biscuit/20 dark:border-brand-espressoCard pb-1">
            SIGNATURES
          </h3>

          <div className="divide-y divide-brand-biscuit/20 dark:divide-brand-espressoCard">
            {signatureItems.map((item) => {
              const isFav = favourites.includes(item.id);
              const itemImage = item.image || (
                item.id === 'item-1' ? '/item-pourover.png' :
                item.id === 'item-2' ? '/item-espresso.png' :
                item.id === 'item-3' ? '/item-flatwhite.png' :
                item.id === 'item-4' ? '/item-kulhadchai.png' :
                item.id === 'item-14' ? '/item-guavafizz.png' : null
              );

              return (
                <Link
                  key={item.id}
                  href={`/item/${item.id}`}
                  className="py-3 flex items-center justify-between gap-3 group hover:opacity-95 transition-opacity block"
                >
                  {/* Arched Image Thumbnail */}
                  <div className="w-20 h-24 rounded-t-[32px] rounded-b-xl bg-[#FAF3E7] dark:bg-brand-espressoLight border border-brand-biscuit/30 dark:border-brand-espressoCard flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    {itemImage ? (
                      <img
                        src={itemImage}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-serif text-xl font-bold text-brand-cherry">
                        ☕
                      </div>
                    )}
                  </div>

                  {/* Center Text Details */}
                  <div className="flex-1 space-y-1 pr-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block flex-shrink-0" />
                      <h4 className="font-serif font-bold text-base text-brand-espresso dark:text-brand-creme capitalize group-hover:text-brand-cherry transition-colors">
                        {item.name} <span className="font-sans text-xs text-brand-walnut/60 font-normal">›</span>
                      </h4>
                    </div>

                    <p className="font-sans text-xs text-brand-walnut/80 dark:text-brand-biscuit leading-snug line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  {/* Right Price */}
                  <div className="text-right flex-shrink-0 pl-1">
                    <span className="font-serif text-base font-bold text-brand-espresso dark:text-brand-creme">
                      {APP_CONFIG.defaultCurrency}{item.price}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* COOLERS Section */}
      {coolerItems.length > 0 && (
        <div className="space-y-3 pt-2">
          <h3 className="font-mono text-xs font-bold text-brand-walnut dark:text-brand-biscuit uppercase tracking-wider border-b border-brand-biscuit/20 dark:border-brand-espressoCard pb-1">
            COOLERS
          </h3>

          <div className="divide-y divide-brand-biscuit/20 dark:divide-brand-espressoCard">
            {coolerItems.map((item) => {
              const itemImage = item.image || (
                item.id === 'item-14' ? '/item-guavafizz.png' : null
              );

              return (
                <Link
                  key={item.id}
                  href={`/item/${item.id}`}
                  className="py-3 flex items-center justify-between gap-3 group hover:opacity-95 transition-opacity block"
                >
                  {/* Arched Image Thumbnail */}
                  <div className="w-20 h-24 rounded-t-[32px] rounded-b-xl bg-[#FAF3E7] dark:bg-brand-espressoLight border border-brand-biscuit/30 dark:border-brand-espressoCard flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    {itemImage ? (
                      <img
                        src={itemImage}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-serif text-xl font-bold text-brand-cherry">
                        🍹
                      </div>
                    )}
                  </div>

                  {/* Center Text Details */}
                  <div className="flex-1 space-y-1 pr-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block flex-shrink-0" />
                      <h4 className="font-serif font-bold text-base text-brand-espresso dark:text-brand-creme capitalize group-hover:text-brand-cherry transition-colors">
                        {item.name} <span className="font-sans text-xs text-brand-walnut/60 font-normal">›</span>
                      </h4>
                    </div>

                    <p className="font-sans text-xs text-brand-walnut/80 dark:text-brand-biscuit leading-snug line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  {/* Right Price */}
                  <div className="text-right flex-shrink-0 pl-1">
                    <span className="font-serif text-base font-bold text-brand-espresso dark:text-brand-creme">
                      {APP_CONFIG.defaultCurrency}{item.price}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* FOOD & BITES Section (if any remaining) */}
      {foodItems.length > 0 && activeCategory !== 'Coffee' && activeCategory !== 'Chai' && activeCategory !== 'Coolers' && (
        <div className="space-y-3 pt-2">
          <h3 className="font-mono text-xs font-bold text-brand-walnut dark:text-brand-biscuit uppercase tracking-wider border-b border-brand-biscuit/20 dark:border-brand-espressoCard pb-1">
            TOASTS &amp; FOOD BITES
          </h3>

          <div className="divide-y divide-brand-biscuit/20 dark:divide-brand-espressoCard">
            {foodItems.map((item) => {
              const itemImage = item.image || (
                item.id === 'item-6' ? '/item_avocado.jpg' :
                item.id === 'item-7' ? '/item_mushroom.jpg' :
                item.id === 'item-8' ? '/mood-light-card.png' :
                item.id === 'item-9' ? '/item_panini.jpg' :
                item.id === 'item-12' ? '/item_chocolatecake.jpg' :
                item.id === 'item-13' ? '/item_chocolatecake.jpg' : null
              );

              return (
                <Link
                  key={item.id}
                  href={`/item/${item.id}`}
                  className="py-3 flex items-center justify-between gap-3 group hover:opacity-95 transition-opacity block"
                >
                  {/* Arched Image Container */}
                  <div className="w-20 h-24 rounded-t-[32px] rounded-b-xl bg-[#FAF3E7] dark:bg-brand-espressoLight border border-brand-biscuit/30 dark:border-brand-espressoCard flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    {itemImage ? (
                      <img
                        src={itemImage}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-serif text-xl font-bold text-brand-cherry">
                        🥪
                      </div>
                    )}
                  </div>

                {/* Center Text Details */}
                <div className="flex-1 space-y-1 pr-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block flex-shrink-0" />
                    <h4 className="font-serif font-bold text-base text-brand-espresso dark:text-brand-creme capitalize group-hover:text-brand-cherry transition-colors">
                      {item.name} <span className="font-sans text-xs text-brand-walnut/60 font-normal">›</span>
                    </h4>
                  </div>

                  <p className="font-sans text-xs text-brand-walnut/80 dark:text-brand-biscuit leading-snug line-clamp-2">
                    {item.description}
                  </p>
                </div>

                {/* Right Price */}
                <div className="text-right flex-shrink-0 pl-1">
                  <span className="font-serif text-base font-bold text-brand-espresso dark:text-brand-creme">
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
  );
}

export default function CustomerMenuPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-xs font-mono text-brand-walnut">Loading menu...</div>}>
      <MenuContent />
    </Suspense>
  );
}
