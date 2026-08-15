'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { MenuItem } from '@/lib/types';
import { customerStore } from '@/lib/customer-store';
import { ChevronLeft, Heart, Plus, Check, Sparkles } from 'lucide-react';
import { APP_CONFIG } from '@/lib/config';

export default function ItemDetailPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params.id as string;

  const [item, setItem] = useState<MenuItem | null>(null);
  const [pairingItem, setPairingItem] = useState<MenuItem | null>(null);
  const [includePairing, setIncludePairing] = useState(false);
  const [isFav, setIsFav] = useState(false);

  // Customization options
  const [milkPreference, setMilkPreference] = useState('None');
  const [addedToast, setAddedToast] = useState(false);

  useEffect(() => {
    const items = db.getMenuItems();
    const found = items.find((i) => i.id === itemId) || items[0];
    setItem(found);

    // Find pairing item (e.g. Triple Decker toast or sourdough)
    const pairing = items.find((i) => i.name.toLowerCase().includes('panini') || i.name.toLowerCase().includes('toast') || i.id === 'item-6') || items[5];
    setPairingItem(pairing);

    const state = customerStore.getState();
    setIsFav(state.favourites.includes(itemId));
  }, [itemId]);

  if (!item) {
    return (
      <div className="p-10 text-center font-serif text-brand-walnut dark:text-brand-biscuit">
        loading item details...
      </div>
    );
  }

  const toggleFav = () => {
    customerStore.toggleFavourite(item.id);
    setIsFav(!isFav);
  };

  const calculateTotalPrice = () => {
    let price = item.price;
    if (milkPreference.includes('+₹30')) price += 30;
    if (includePairing && pairingItem) price += pairingItem.price;
    return price;
  };

  const handleAddToCart = () => {
    customerStore.addToCart(
      item,
      {
        milkPreference,
      },
      includePairing && pairingItem ? pairingItem : undefined
    );

    setAddedToast(true);
    setTimeout(() => {
      setAddedToast(false);
      router.push('/table');
    }, 1000);
  };

  // Hero Image
  const heroImage =
    item.id === 'item-1'
      ? '/item-pourover.png'
      : item.id === 'item-2'
      ? '/item-espresso-arch.png'
      : item.id === 'item-3'
      ? '/item-flatwhite-arch.png'
      : item.id === 'item-4'
      ? '/item-kulhadchai-arch.png'
      : item.id === 'item-5'
      ? '/item-chaas-hero.png'
      : item.id === 'item-11'
      ? '/item_rosebrew.jpg'
      : item.id === 'item-14'
      ? '/item-guavafizz.png'
      : item.image || '/item-pourover.png';

  return (
    <div className="px-5 py-4 space-y-5 animate-in fade-in duration-300 relative pb-28 min-h-[85vh] bg-brand-creme dark:bg-brand-espresso transition-colors">
      {/* Navigation & Wishlist Header */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full flex items-center justify-center text-brand-espresso dark:text-brand-creme hover:bg-brand-biscuit/20 transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={toggleFav}
          className="w-9 h-9 rounded-full flex items-center justify-center text-brand-walnut dark:text-brand-biscuit hover:text-brand-cherry transition-colors"
          aria-label="Toggle favourite"
        >
          <Heart className={`w-5 h-5 ${isFav ? 'fill-brand-cherry text-brand-cherry' : ''}`} />
        </button>
      </div>

      {/* Double-Line Arched Hero Photo Frame matching reference design */}
      <div className="w-full relative flex flex-col items-center">
        <div className="w-full max-w-sm h-80 rounded-t-[140px] rounded-b-2xl p-2 bg-[#FAF4EA] dark:bg-[#1C1714] border-2 border-[#D8C7B0] dark:border-[#524438] shadow-md flex items-center justify-center">
          <div className="w-full h-full rounded-t-[130px] rounded-b-xl border border-[#D8C7B0]/90 dark:border-[#524438]/90 overflow-hidden relative">
            <img
              src={heroImage}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Title, Price & Description Header */}
      <div className="space-y-3 pt-1">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-serif text-2xl font-bold text-brand-espresso dark:text-brand-creme leading-tight">
            {item.name}
          </h2>
          <span className="font-serif text-2xl font-bold text-brand-espresso dark:text-brand-creme flex-shrink-0">
            {APP_CONFIG.defaultCurrency}{item.price}
          </span>
        </div>

        <p className="text-xs text-brand-walnut/90 dark:text-brand-biscuit font-sans leading-relaxed">
          {item.description}
        </p>

        {/* Tags */}
        <div className="flex items-center gap-2 pt-1">
          <span className="border border-[#55C79E] text-[#0B5C43] dark:text-emerald-300 bg-transparent text-[10px] font-mono font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#0B5C43] dark:bg-emerald-400 inline-block" />
            VEGETARIAN
          </span>
          <span className="border border-[#D4C3A6] dark:border-brand-biscuit/40 text-[#5C4533] dark:text-brand-biscuit bg-transparent text-[10px] font-mono font-bold px-3 py-1 rounded-full uppercase">
            SINGLE ORIGIN
          </span>
        </div>
      </div>

      {/* Perfect Pairing Section */}
      {pairingItem && (
        <div className="border border-brand-biscuit/40 dark:border-brand-espressoCard rounded-2xl p-4 bg-transparent dark:bg-brand-espressoLight space-y-3 shadow-sm">
          <h3 className="font-serif text-base font-semibold text-brand-espresso dark:text-brand-creme">
            Pairs beautifully with
          </h3>

          <div
            onClick={() => setIncludePairing(!includePairing)}
            className="flex items-center justify-between gap-3 cursor-pointer pt-0.5 group"
          >
            {/* Pairing Thumbnail */}
            <div className="w-14 h-14 rounded-2xl bg-[#FAF3E7] dark:bg-brand-espresso border border-brand-biscuit/30 dark:border-brand-espressoCard flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              <img
                src={pairingItem.image || '/item-tripledecker-thumb.png'}
                alt={pairingItem.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Text Details */}
            <div className="flex-1 space-y-0.5 pr-1">
              <h4 className="font-serif font-bold text-sm text-brand-espresso dark:text-brand-creme capitalize">
                Triple Decker
              </h4>
              <p className="font-sans text-xs text-brand-walnut/70 dark:text-brand-biscuit leading-snug">
                Crispy, melty, wildly satisfying.
              </p>
            </div>

            {/* Price & Add Button */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="font-serif text-sm font-bold text-brand-espresso dark:text-brand-creme">
                {APP_CONFIG.defaultCurrency}{pairingItem.price}
              </span>
              <button
                type="button"
                className={`w-8 h-8 rounded-full border border-brand-biscuit/40 flex items-center justify-center transition-all ${
                  includePairing
                    ? 'bg-brand-cherry text-white border-brand-cherry'
                    : 'bg-[#FAF3E7] dark:bg-brand-espressoCard text-brand-espresso dark:text-brand-creme hover:bg-brand-cherry hover:text-white'
                }`}
              >
                {includePairing ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Milk Preference Section */}
      <div className="space-y-2.5 pt-2">
        <h3 className="font-serif text-sm font-bold text-brand-espresso dark:text-brand-creme">
          Milk Preference
        </h3>

        <div className="grid grid-cols-4 gap-2">
          {['None', 'Dairy', 'Oat +₹30', 'Almond +₹30'].map((milk) => {
            const isSelected = milkPreference === milk;
            return (
              <button
                key={milk}
                onClick={() => setMilkPreference(milk)}
                className={`py-2 px-2 rounded-2xl text-xs font-serif text-center transition-all border ${
                  isSelected
                    ? 'bg-brand-cherry text-white font-medium border-brand-cherry shadow-sm'
                    : 'bg-transparent border border-brand-biscuit/60 dark:border-brand-biscuit/30 text-brand-walnut dark:text-brand-biscuit hover:bg-brand-biscuit/20'
                }`}
              >
                {milk}
              </button>
            );
          })}
        </div>
      </div>

      {/* Added Toast Notification */}
      {addedToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-900 text-white px-5 py-2.5 rounded-full shadow-2xl text-xs font-sans flex items-center gap-2 animate-in zoom-in-95">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Added to Table 07 order!</span>
        </div>
      )}

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-brand-creme/95 dark:bg-brand-espresso/95 backdrop-blur border-t border-brand-biscuit/30 dark:border-brand-espressoCard z-40">
        <button
          onClick={handleAddToCart}
          className="w-full py-4 px-6 rounded-full bg-brand-cherry hover:bg-brand-cherry/90 dark:bg-brand-cherry text-white font-serif text-base font-medium shadow-md hover:scale-[1.01] active:scale-95 transition-all text-center block"
        >
          Add to Table &nbsp;|&nbsp; {APP_CONFIG.defaultCurrency}{calculateTotalPrice()}
        </button>
      </div>
    </div>
  );
}
