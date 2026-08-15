'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { customerStore, CartItem } from '@/lib/customer-store';
import { ChevronLeft, Plus, Minus, Trash2, Check, MoreHorizontal } from 'lucide-react';
import { APP_CONFIG } from '@/lib/config';

/**
 * Generates a Mughal Jharokha arch border SVG path.
 * The arch top is drawn at a fixed pixel height, and the sides/bottom
 * stretch to fit whatever content height we have.
 */
function archPath(w: number, h: number, inset: number = 0): string {
  const archH = 80;
  const l = 0 + inset;
  const r = w - inset;
  const t = 0 + inset;
  const b = h - inset;
  const br = Math.max(10 - inset / 2, 4);

  const span = r - l;
  const cx = w / 2;

  // Shoulders near edges
  const shoulderL = l + span * 0.06;
  const shoulderR = r - span * 0.06;
  // Dips about 22% in from each edge
  const dipL = l + span * 0.22;
  const dipR = r - span * 0.22;

  // Y-positions
  const sideY = t + archH;
  const shoulderY = t + archH * 0.52;
  const dipY = t + archH * 0.58;
  const domeY = t + archH * 0.02;

  return [
    `M ${l} ${b - br}`,
    `Q ${l} ${b}, ${l + br} ${b}`,
    `L ${r - br} ${b}`,
    `Q ${r} ${b}, ${r} ${b - br}`,
    `L ${r} ${sideY}`,
    // Right side → right shoulder
    `Q ${r} ${shoulderY + 16}, ${shoulderR} ${shoulderY}`,
    // Right shoulder → right dip
    `Q ${(shoulderR + dipR) / 2} ${shoulderY - 8}, ${dipR} ${dipY}`,
    // Right dip → dome peak
    `C ${dipR - 8} ${dipY - 12}, ${cx + 120} ${domeY}, ${cx} ${domeY}`,
    // Dome peak → left dip
    `C ${cx - 120} ${domeY}, ${dipL + 8} ${dipY - 12}, ${dipL} ${dipY}`,
    // Left dip → left shoulder
    `Q ${(dipL + shoulderL) / 2} ${shoulderY - 8}, ${shoulderL} ${shoulderY}`,
    // Left shoulder → left side
    `Q ${l} ${shoulderY + 16}, ${l} ${sideY}`,
    `Z`
  ].join(' ');
}

export default function YourTablePage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tableNo, setTableNo] = useState('07');
  const [guestCount, setGuestCount] = useState(2);
  const [addedUpsell, setAddedUpsell] = useState(false);
  const [cardSize, setCardSize] = useState({ w: 340, h: 500 });
  const cardRef = useRef<HTMLDivElement>(null);

  const syncState = () => {
    const state = customerStore.getState();
    setCart(state.cart);
    setTableNo(state.tableNo);
    setGuestCount(state.guestCount);
  };

  useEffect(() => {
    syncState();
    window.addEventListener('smol_customer_store_change', syncState);
    return () => window.removeEventListener('smol_customer_store_change', syncState);
  }, []);

  // Measure actual card dimensions for SVG viewBox
  useEffect(() => {
    if (!cardRef.current) return;
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setCardSize({ w: Math.round(width), h: Math.round(height) });
        }
      }
    });
    obs.observe(cardRef.current);
    return () => obs.disconnect();
  }, []);

  const handleUpdateQty = (cartId: string, delta: number) => {
    customerStore.updateQuantity(cartId, delta);
  };

  const handleAddUpsell = () => {
    if (!addedUpsell) {
      customerStore.addToCart({
        id: 'item-board',
        name: 'Conversation Board',
        categoryId: 'cat-3',
        price: 260,
        description: 'Cheese, fruits, nuts & a little something sweet.',
        available: true,
        isVeg: true,
      });
      setAddedUpsell(true);
    }
  };

  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice * item.quantity, 0);

  // Group cart items into sections
  const coffeeItems = cart.filter((item) =>
    item.menuItem.categoryId === 'cat-1' ||
    item.menuItem.name.toLowerCase().includes('pour over') ||
    item.menuItem.name.toLowerCase().includes('espresso') ||
    item.menuItem.name.toLowerCase().includes('flat white')
  );

  const chaiItems = cart.filter((item) =>
    item.menuItem.categoryId === 'cat-2' ||
    item.menuItem.name.toLowerCase().includes('chai') ||
    item.menuItem.name.toLowerCase().includes('chaas')
  );

  const foodItems = cart.filter((item) =>
    !coffeeItems.includes(item) && !chaiItems.includes(item)
  );

  const svgW = cardSize.w;
  const svgH = cardSize.h;

  return (
    <div className="relative min-h-[85vh] bg-brand-creme dark:bg-brand-espresso transition-colors">
      {/* ====== FIXED / STICKY TOP HEADER ====== */}
      <div className="sticky top-0 z-30 bg-brand-creme/95 dark:bg-brand-espresso/95 backdrop-blur px-4 pt-4 pb-2 border-b border-brand-biscuit/20 dark:border-brand-espressoCard">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full flex items-center justify-center text-brand-espresso dark:text-brand-creme hover:bg-brand-biscuit/20 transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
          </button>

          <h2 className="font-serif text-2xl font-bold text-brand-espresso dark:text-brand-creme">
            Your Table
          </h2>

          <Link
            href="/menu"
            className="text-[#A62B2B] dark:text-brand-butter font-serif text-sm font-medium hover:underline"
          >
            Add more
          </Link>
        </div>
      </div>

      {/* ====== MAIN SCROLLABLE BODY ====== */}
      <div className="px-4 pt-3 pb-64 space-y-4">
        {/* ====== JHAROKHA ARCH TABLE CARD ====== */}
        <div className="relative w-full" ref={cardRef}>
          {/* SVG border that exactly covers this container */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox={`0 0 ${svgW} ${svgH}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ overflow: 'visible' }}
          >
            {/* Outer arch border */}
            <path d={archPath(svgW, svgH, 0)} stroke="#C8B898" strokeWidth="1.2" />
            {/* Inner arch border (inset 4px) */}
            <path d={archPath(svgW, svgH, 4)} stroke="#C8B898" strokeWidth="0.7" opacity="0.5" />
          </svg>

          {/* Card Content — padded inside the arch */}
          <div className="relative z-10 px-5 pb-5" style={{ paddingTop: '75px' }}>
            {/* Table Number & Guests Badge Header */}
            <div className="text-center space-y-1 pb-3 border-b border-[#C8B898]/25">
              <span className="font-mono text-[11px] text-brand-walnut dark:text-brand-biscuit uppercase tracking-[0.2em] block">
                TABLE
              </span>
              <h3 className="font-serif text-5xl font-bold text-brand-espresso dark:text-brand-creme leading-none">
                {tableNo}
              </h3>
              <span className="bg-[#3B7A70] text-white text-[11px] font-mono font-medium px-4 py-1 rounded-full inline-block shadow-sm mt-1">
                {guestCount} guests
              </span>
            </div>

            {/* Cart Empty State */}
            {cart.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <p className="font-serif italic text-sm text-brand-walnut dark:text-brand-biscuit">
                  Your table order is empty right now.
                </p>
                <Link
                  href="/menu"
                  className="inline-block px-5 py-2 rounded-full bg-brand-cherry text-white text-xs font-serif font-medium"
                >
                  Browse Menu
                </Link>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                {/* COFFEE SECTION */}
                {coffeeItems.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-mono text-[11px] font-bold text-brand-walnut dark:text-brand-biscuit uppercase tracking-wider border-b border-[#C8B898]/25 pb-1">
                      COFFEE
                    </h4>
                    <div className="divide-y divide-[#C8B898]/20">
                      {coffeeItems.map((item) => (
                        <div key={item.id} className="py-2.5 flex items-start justify-between gap-3">
                          <span className="font-serif font-bold text-base text-brand-espresso dark:text-brand-creme w-5 pt-0.5">
                            {item.quantity}
                          </span>
                          <div className="flex-1 space-y-0.5 pr-1">
                            <h5 className="font-serif font-bold text-base text-brand-espresso dark:text-brand-creme capitalize">
                              {item.menuItem.name}
                            </h5>
                            {item.customization?.milkPreference && (
                              <p className="font-mono text-xs text-brand-walnut/70 dark:text-brand-biscuit">
                                • {item.customization.milkPreference}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
                            <span className="font-serif text-base font-bold text-brand-espresso dark:text-brand-creme">
                              {APP_CONFIG.defaultCurrency}{item.totalPrice * item.quantity}
                            </span>
                            <button onClick={() => handleUpdateQty(item.id, -1)} className="text-brand-walnut/60 hover:text-brand-cherry transition-colors p-1" aria-label="Remove item">
                              <MoreHorizontal className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CHAI SECTION */}
                {chaiItems.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <h4 className="font-mono text-[11px] font-bold text-brand-walnut dark:text-brand-biscuit uppercase tracking-wider border-b border-[#C8B898]/25 pb-1">
                      CHAI
                    </h4>
                    <div className="divide-y divide-[#C8B898]/20">
                      {chaiItems.map((item) => (
                        <div key={item.id} className="py-2.5 flex items-start justify-between gap-3">
                          <span className="font-serif font-bold text-base text-brand-espresso dark:text-brand-creme w-5 pt-0.5">
                            {item.quantity}
                          </span>
                          <div className="flex-1 space-y-0.5 pr-1">
                            <h5 className="font-serif font-bold text-base text-brand-espresso dark:text-brand-creme capitalize">
                              {item.menuItem.name}
                            </h5>
                            {item.customization?.milkPreference && (
                              <p className="font-mono text-xs text-brand-walnut/70 dark:text-brand-biscuit">
                                • {item.customization.milkPreference}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
                            <span className="font-serif text-base font-bold text-brand-espresso dark:text-brand-creme">
                              {APP_CONFIG.defaultCurrency}{item.totalPrice * item.quantity}
                            </span>
                            <button onClick={() => handleUpdateQty(item.id, -1)} className="text-brand-walnut/60 hover:text-brand-cherry transition-colors p-1" aria-label="Remove item">
                              <MoreHorizontal className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* FOOD SECTION */}
                {foodItems.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <h4 className="font-mono text-[11px] font-bold text-brand-walnut dark:text-brand-biscuit uppercase tracking-wider border-b border-[#C8B898]/25 pb-1">
                      FOOD
                    </h4>
                    <div className="divide-y divide-[#C8B898]/20">
                      {foodItems.map((item) => (
                        <div key={item.id} className="py-2.5 flex items-start justify-between gap-3">
                          <span className="font-serif font-bold text-base text-brand-espresso dark:text-brand-creme w-5 pt-0.5">
                            {item.quantity}
                          </span>
                          <div className="flex-1 space-y-0.5 pr-1">
                            <h5 className="font-serif font-bold text-base text-brand-espresso dark:text-brand-creme capitalize">
                              {item.menuItem.name}
                            </h5>
                            {item.pairing && (
                              <p className="font-mono text-xs text-brand-walnut/70 dark:text-brand-biscuit">
                                • Paired with {item.pairing.name}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
                            <span className="font-serif text-base font-bold text-brand-espresso dark:text-brand-creme">
                              {APP_CONFIG.defaultCurrency}{item.totalPrice * item.quantity}
                            </span>
                            <button onClick={() => handleUpdateQty(item.id, -1)} className="text-brand-walnut/60 hover:text-brand-cherry transition-colors p-1" aria-label="Remove item">
                              <MoreHorizontal className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ====== FIXED BOTTOM ACTION BAR ====== */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-brand-creme/95 dark:bg-brand-espresso/95 backdrop-blur border-t border-brand-biscuit/20 dark:border-brand-espressoCard z-40 space-y-2.5 shadow-lg">
        {/* Sage Green Upsell Banner */}
        <div className="bg-[#DDE5DC] dark:bg-[#253A35] border border-[#BFCFC3] dark:border-[#35524B] rounded-2xl p-3 flex items-center justify-between gap-3 shadow-sm relative">
          <img
            src="/conversation-board.png"
            alt="Conversation Board platter"
            className="w-14 h-12 object-cover rounded-xl border border-brand-biscuit/30 flex-shrink-0"
          />
          <div className="space-y-0.5 flex-1 pr-1">
            <h4 className="font-serif text-sm font-semibold text-brand-espresso dark:text-brand-creme">
              Make it a moment?
            </h4>
            <h5 className="font-serif font-bold text-xs text-brand-espresso dark:text-brand-creme">
              Conversation Board
            </h5>
            <p className="font-sans text-[10px] text-brand-walnut/80 dark:text-brand-biscuit leading-tight">
              Cheese, fruits, nuts & a little something sweet.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className="font-mono text-[11px] font-semibold text-brand-espresso dark:text-brand-creme">
              ₹260 <span className="text-[9px] text-brand-walnut/60">0/00</span>
            </span>
            <button
              onClick={handleAddUpsell}
              disabled={addedUpsell}
              className={`w-8 h-8 rounded-full font-bold text-lg flex items-center justify-center shadow-md transition-all ${
                addedUpsell
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#E5B54A] text-brand-espresso hover:scale-105'
              }`}
            >
              {addedUpsell ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Summary Line */}
        <div className="text-center">
          <span className="font-mono text-xs font-medium text-brand-walnut dark:text-brand-biscuit">
            {totalItemCount} items &nbsp;•&nbsp; Total {APP_CONFIG.defaultCurrency}{subtotal}
          </span>
        </div>

        {/* View Bill Primary Button */}
        {cart.length > 0 && (
          <div>
            <Link
              href="/payment"
              className="w-full py-3.5 px-6 rounded-full bg-brand-cherry hover:bg-brand-cherry/90 text-white font-serif text-base font-medium shadow-md text-center block"
            >
              View Bill
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
