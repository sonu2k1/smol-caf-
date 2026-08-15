'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { customerStore, CartItem } from '@/lib/customer-store';
import { Plus, Minus, Trash2, Users, Sparkles, ArrowRight, Coffee, Utensils } from 'lucide-react';
import { APP_CONFIG } from '@/lib/config';

export default function YourTablePage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tableNo, setTableNo] = useState('07');
  const [guestCount, setGuestCount] = useState(2);
  const [addedUpsell, setAddedUpsell] = useState(false);

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

  return (
    <div className="px-4 py-4 space-y-5 animate-in fade-in duration-300 relative pb-28">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-brand-biscuit/30 dark:border-brand-espressoCard pb-3">
        <div>
          <span className="font-mono text-[10px] text-brand-cherry dark:text-brand-butter uppercase tracking-widest block">
            5. your table
          </span>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-brand-espresso dark:text-brand-creme lowercase">
            Your Table
          </h2>
          <p className="font-serif italic text-xs text-brand-walnut dark:text-brand-biscuit">
            current order items
          </p>
        </div>

        <Link
          href="/menu"
          className="px-3.5 py-1.5 rounded-full border border-brand-cherry text-brand-cherry dark:text-brand-butter font-mono text-xs hover:bg-brand-cherry hover:text-white transition-colors"
        >
          Add more
        </Link>
      </div>

      {/* Table Badge Card */}
      <div className="bg-brand-cremeMuted dark:bg-brand-espressoLight border border-brand-biscuit/50 dark:border-brand-espressoCard rounded-2xl p-4 text-center space-y-1 shadow-sm relative">
        <span className="font-mono text-[10px] uppercase tracking-widest text-brand-walnut dark:text-brand-biscuit">
          TABLE
        </span>
        <h3 className="font-serif text-3xl font-bold text-brand-cherry dark:text-brand-butter">
          {tableNo}
        </h3>
        <div className="inline-flex items-center gap-1.5 bg-brand-cherry/10 dark:bg-brand-cherry/20 text-brand-cherry dark:text-brand-butter px-3 py-0.5 rounded-full text-xs font-mono">
          <Users className="w-3.5 h-3.5" />
          <span>{guestCount} guests</span>
        </div>
      </div>

      {/* Itemized Order List */}
      {cart.length === 0 ? (
        <div className="text-center py-10 space-y-3 border border-dashed border-brand-biscuit/40 rounded-2xl p-6">
          <Coffee className="w-10 h-10 text-brand-walnut/40 mx-auto" />
          <p className="font-serif italic text-sm text-brand-walnut dark:text-brand-biscuit">
            Your table has no active items yet.
          </p>
          <Link
            href="/menu"
            className="inline-block px-5 py-2 rounded-full bg-brand-cherry text-white text-xs font-semibold"
          >
            Browse Menu
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <h4 className="font-serif text-xs font-bold text-brand-walnut dark:text-brand-biscuit uppercase tracking-wider border-b border-brand-biscuit/20 dark:border-brand-espressoCard pb-1">
            Ordered Items
          </h4>

          <div className="space-y-3">
            {cart.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-brand-creme dark:bg-brand-espressoLight border border-brand-biscuit/40 dark:border-brand-espressoCard flex items-center justify-between shadow-sm"
              >
                <div className="space-y-1 flex-1 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-brand-cherry dark:text-brand-butter">
                      {item.quantity}x
                    </span>
                    <h5 className="font-sans font-semibold text-sm text-brand-espresso dark:text-brand-creme capitalize">
                      {item.menuItem.name}
                    </h5>
                  </div>

                  {item.customization && (
                    <p className="text-[11px] font-mono text-brand-walnut dark:text-brand-biscuit">
                      • {item.customization.brewMethod || ''} {item.customization.milkPreference ? `(${item.customization.milkPreference})` : ''}
                    </p>
                  )}

                  {item.pairing && (
                    <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                      + Paired with {item.pairing.name}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-brand-espresso dark:text-brand-creme">
                    {APP_CONFIG.defaultCurrency}{item.totalPrice * item.quantity}
                  </span>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1 bg-brand-biscuit/30 dark:bg-brand-espressoCard rounded-lg p-1 border border-brand-biscuit/40 dark:border-brand-espressoCard">
                    <button
                      onClick={() => handleUpdateQty(item.id, -1)}
                      className="w-6 h-6 rounded flex items-center justify-center text-brand-espresso dark:text-brand-creme hover:bg-brand-cherry hover:text-white transition-colors"
                    >
                      {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-red-500" /> : <Minus className="w-3 h-3" />}
                    </button>
                    <span className="font-mono text-xs w-4 text-center font-bold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQty(item.id, 1)}
                      className="w-6 h-6 rounded flex items-center justify-center text-brand-espresso dark:text-brand-creme hover:bg-brand-cherry hover:text-white transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upsell Card: "Make it a moment?" */}
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm">
        <div className="space-y-0.5 flex-1">
          <span className="font-mono text-[9px] uppercase tracking-wider text-amber-800 dark:text-amber-300 font-bold block">
            Make it a moment?
          </span>
          <h5 className="font-serif text-sm font-bold text-brand-espresso dark:text-brand-creme">
            Conversation Board
          </h5>
          <p className="text-[11px] text-brand-walnut dark:text-brand-biscuit font-sans">
            Cheese, fruits, nuts & a little something sweet.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-brand-cherry dark:text-brand-butter">
            ₹260
          </span>
          <button
            onClick={handleAddUpsell}
            disabled={addedUpsell}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              addedUpsell
                ? 'bg-emerald-600 text-white'
                : 'bg-brand-cherry text-white hover:scale-105'
            }`}
          >
            {addedUpsell ? '✓' : <Plus className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-14 left-0 right-0 max-w-md mx-auto p-3 bg-brand-creme/95 dark:bg-brand-espresso/95 backdrop-blur border-t border-brand-biscuit/30 dark:border-brand-espressoCard z-40 flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono uppercase text-brand-walnut dark:text-brand-biscuit block">
              {totalItemCount} items • Total
            </span>
            <span className="font-mono text-xl font-bold text-brand-cherry dark:text-brand-butter">
              {APP_CONFIG.defaultCurrency}{subtotal}
            </span>
          </div>

          <Link
            href="/payment"
            className="flex-1 py-3 px-6 rounded-full bg-brand-cherry dark:bg-brand-cherryGlow text-white font-sans text-sm font-semibold shadow-neonCherry hover:scale-[1.02] active:scale-95 transition-all text-center flex items-center justify-center gap-2"
          >
            <span>View Bill</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
