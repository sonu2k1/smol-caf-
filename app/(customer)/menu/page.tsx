'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Category, MenuItem } from '@/lib/types';
import { Search, Sparkles, Coffee, AlertCircle, Leaf } from 'lucide-react';
import { APP_CONFIG } from '@/lib/config';

export default function CustomerMenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);

  const loadData = () => {
    setCategories(db.getCategories());
    setMenuItems(db.getMenuItems());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('smol_db_change', loadData);
    return () => window.removeEventListener('smol_db_change', loadData);
  }, []);

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.categoryId === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVeg = vegOnly ? item.isVeg : true;
    return matchesCategory && matchesSearch && matchesVeg;
  });

  return (
    <div className="px-4 py-4 space-y-5 animate-in fade-in duration-200">
      {/* Editorial Header */}
      <div className="text-center py-4 border-b border-brand-biscuit/40 dark:border-brand-biscuit/20 space-y-1">
        <span className="font-mono text-xs text-brand-cherry dark:text-brand-butter tracking-widest uppercase">
          digital menu · rishikesh
        </span>
        <h2 className="font-serif text-3xl font-bold tracking-tight text-brand-espresso dark:text-brand-creme lowercase">
          smol café
        </h2>
        <p className="font-serif italic text-xs text-brand-walnut dark:text-brand-biscuit max-w-xs mx-auto">
          "a café people remember because stories happen there."
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-brand-walnut dark:text-brand-biscuit opacity-60" />
          <input
            type="text"
            placeholder="search drinks, breakfast & bowls..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-brand-biscuit/20 dark:bg-brand-espresso/60 border border-brand-biscuit/40 dark:border-brand-biscuit/20 text-xs font-sans text-brand-espresso dark:text-brand-creme placeholder:text-brand-walnut/50 dark:placeholder:text-brand-biscuit/40 focus:outline-none focus:ring-2 focus:ring-brand-cherry/40"
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors border ${
              vegOnly
                ? 'bg-green-800 text-white border-green-800'
                : 'bg-brand-biscuit/20 text-brand-walnut dark:text-brand-creme border-brand-biscuit/30'
            }`}
          >
            <Leaf className="w-3.5 h-3.5 text-green-500" />
            <span>100% vegetarian filter</span>
          </button>
        </div>
      </div>

      {/* Category Pills (Horizontal Scroll) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-all font-sans ${
            activeCategory === 'all'
              ? 'bg-brand-cherry text-white font-semibold shadow-sm'
              : 'bg-brand-biscuit/25 text-brand-walnut dark:text-brand-biscuit hover:bg-brand-biscuit/40'
          }`}
        >
          all items ({menuItems.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-all font-sans ${
              activeCategory === cat.id
                ? 'bg-brand-cherry text-white font-semibold shadow-sm'
                : 'bg-brand-biscuit/25 text-brand-walnut dark:text-brand-biscuit hover:bg-brand-biscuit/40'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Notice Banner */}
      <div className="bg-brand-biscuit/20 dark:bg-brand-biscuit/10 border border-brand-biscuit/40 dark:border-brand-biscuit/20 rounded-xl p-3 flex items-start gap-2.5">
        <Coffee className="w-4 h-4 text-brand-cherry dark:text-brand-butter flex-shrink-0 mt-0.5" />
        <p className="text-[11px] font-sans text-brand-walnut dark:text-brand-creme leading-relaxed">
          Order at the counter when you&apos;re ready. All coffee is brewed fresh with single-origin beans.
        </p>
      </div>

      {/* Menu Cards */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <AlertCircle className="w-8 h-8 text-brand-walnut/40 mx-auto" />
            <p className="font-serif italic text-sm text-brand-walnut dark:text-brand-biscuit">
              no matching menu items found
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl border transition-all ${
                item.available
                  ? 'bg-brand-creme dark:bg-brand-espresso border-brand-biscuit/40 dark:border-brand-biscuit/20 shadow-card hover:border-brand-cherry/40'
                  : 'bg-brand-biscuit/10 border-brand-biscuit/20 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="w-2 h-2 rounded-full bg-green-600 inline-block" title="Vegetarian" />
                    <h3 className="font-sans font-semibold text-sm text-brand-espresso dark:text-brand-creme lowercase">
                      {item.name}
                    </h3>
                    {item.isSpecial && (
                      <span className="bg-brand-butter text-brand-espresso font-mono text-[9px] px-1.5 py-0.5 rounded font-bold uppercase flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5" /> special
                      </span>
                    )}
                    {!item.available && (
                      <span className="bg-red-800 text-white font-mono text-[9px] px-1.5 py-0.5 rounded uppercase">
                        sold out today
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-brand-walnut dark:text-brand-biscuit font-sans leading-snug">
                    {item.description}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm font-bold text-brand-cherry dark:text-brand-butter">
                    {APP_CONFIG.defaultCurrency}{item.price}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Quote */}
      <div className="text-center pt-6 pb-2 border-t border-brand-biscuit/30 dark:border-brand-biscuit/10 space-y-1">
        <p className="font-serif italic text-xs text-brand-walnut dark:text-brand-biscuit">
          "invite people in; never make them perform belonging."
        </p>
        <span className="font-mono text-[10px] text-brand-walnut/60 dark:text-brand-biscuit/60">
          smol café · rishikesh menu v1.0
        </span>
      </div>
    </div>
  );
}
