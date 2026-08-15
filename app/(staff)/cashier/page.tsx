'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Category, MenuItem, OrderItem, PaymentMethod, Order } from '@/lib/types';
import { APP_CONFIG } from '@/lib/config';
import { useAuth } from '@/context/AuthContext';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  X,
  Printer,
  History,
  CreditCard,
  QrCode,
  Banknote,
  Search,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CashierPage() {
  const { currentUser } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart state
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [taxEnabled, setTaxEnabled] = useState<boolean>(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [orderType, setOrderType] = useState<'dine_in' | 'takeaway'>('dine_in');

  // UI Modals
  const [showCartDrawer, setShowCartDrawer] = useState<boolean>(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [todayOrders, setTodayOrders] = useState<Order[]>([]);

  const loadData = () => {
    setCategories(db.getCategories());
    setMenuItems(db.getMenuItems().filter((i) => i.available));
    setTodayOrders(db.getOrders());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('smol_db_change', loadData);
    return () => window.removeEventListener('smol_db_change', loadData);
  }, []);

  // Cart calculations
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxEnabled ? (taxableAmount * APP_CONFIG.taxRatePercent) / 100 : 0;
  const grandTotal = Math.round((taxableAmount + taxAmount) * 100) / 100;

  const handleAddToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.menuItemId === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.menuItemId === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [
        ...prev,
        {
          id: `cart-${Date.now()}-${item.id}`,
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
        },
      ];
    });
  };

  const handleQuantityChange = (menuItemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((ci) => {
          if (ci.menuItemId === menuItemId) {
            const newQty = ci.quantity + delta;
            return newQty > 0 ? { ...ci, quantity: newQty } : null;
          }
          return ci;
        })
        .filter(Boolean) as OrderItem[];
    });
  };

  const getItemCartQuantity = (menuItemId: string): number => {
    const found = cart.find((ci) => ci.menuItemId === menuItemId);
    return found ? found.quantity : 0;
  };

  const handleCompleteOrder = () => {
    if (cart.length === 0) return;

    const newOrder = db.createOrder({
      items: cart,
      subtotal,
      discount: discountAmount,
      tax: taxAmount,
      total: grandTotal,
      status: 'received',
      paymentMethod,
      orderType,
      cashierName: currentUser?.name || 'Cashier',
    });

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#B72E35', '#F2C84B', '#75AFA7'],
      });
    } catch {}

    setCompletedOrder(newOrder);
    setCart([]);
    setShowCartDrawer(false);
    setDiscountPercent(0);
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.categoryId === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="px-3 py-3 space-y-3 relative pb-24 animate-in fade-in duration-200">
      {/* Top Header & History Button */}
      <div className="flex items-center justify-between border-b border-brand-biscuit/30 dark:border-brand-biscuit/10 pb-2">
        <div>
          <span className="font-mono text-[10px] text-brand-walnut dark:text-brand-biscuit uppercase tracking-wider">
            counter pos
          </span>
          <h2 className="font-serif text-lg font-bold text-brand-espresso dark:text-brand-creme lowercase">
            take order
          </h2>
        </div>
        <button
          onClick={() => setShowHistory(true)}
          className="px-3 py-1.5 rounded-full bg-brand-biscuit/20 dark:bg-brand-espresso border border-brand-biscuit/40 dark:border-brand-biscuit/20 text-xs font-sans font-medium text-brand-espresso dark:text-brand-creme flex items-center gap-1.5 hover:bg-brand-biscuit/30"
        >
          <History className="w-3.5 h-3.5 text-brand-cherry dark:text-brand-butter" />
          <span>today&apos;s orders ({todayOrders.length})</span>
        </button>
      </div>

      {/* Category Horizontal Scroll */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all font-sans ${
            activeCategory === 'all'
              ? 'bg-brand-cherry text-white font-semibold shadow-sm'
              : 'bg-brand-biscuit/25 text-brand-walnut dark:text-brand-biscuit hover:bg-brand-biscuit/40'
          }`}
        >
          all ({menuItems.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all font-sans ${
              activeCategory === cat.id
                ? 'bg-brand-cherry text-white font-semibold shadow-sm'
                : 'bg-brand-biscuit/25 text-brand-walnut dark:text-brand-biscuit hover:bg-brand-biscuit/40'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-brand-walnut dark:text-brand-biscuit opacity-60" />
        <input
          type="text"
          placeholder="quick search item name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-xl bg-brand-biscuit/20 dark:bg-brand-espresso/60 border border-brand-biscuit/40 dark:border-brand-biscuit/20 text-xs font-sans text-brand-espresso dark:text-brand-creme focus:outline-none"
        />
      </div>

      {/* 2-Column Menu Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {filteredItems.map((item) => {
          const qtyInCart = getItemCartQuantity(item.id);
          return (
            <div
              key={item.id}
              className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                qtyInCart > 0
                  ? 'bg-brand-creme dark:bg-brand-espresso border-brand-cherry ring-1 ring-brand-cherry/50 shadow-md'
                  : 'bg-brand-creme dark:bg-brand-espresso border-brand-biscuit/40 dark:border-brand-biscuit/20 shadow-card'
              }`}
            >
              <div className="space-y-1">
                <div className="font-sans font-medium text-xs text-brand-espresso dark:text-brand-creme lowercase line-clamp-2 leading-tight">
                  {item.name}
                </div>
                <div className="font-mono text-xs font-bold text-brand-cherry dark:text-brand-butter">
                  {APP_CONFIG.defaultCurrency}{item.price}
                </div>
              </div>

              {/* Add / Stepper Button */}
              <div className="mt-2.5">
                {qtyInCart === 0 ? (
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="w-full py-1.5 rounded-lg bg-brand-cherry text-white text-xs font-medium flex items-center justify-center gap-1 active:scale-95 transition-transform"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>add</span>
                  </button>
                ) : (
                  <div className="flex items-center justify-between bg-brand-cherry text-white rounded-lg p-1">
                    <button
                      onClick={() => handleQuantityChange(item.id, -1)}
                      className="w-7 h-7 rounded bg-black/20 flex items-center justify-center active:scale-90"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono text-xs font-bold px-2">{qtyInCart}</span>
                    <button
                      onClick={() => handleQuantityChange(item.id, 1)}
                      className="w-7 h-7 rounded bg-black/20 flex items-center justify-center active:scale-90"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Cart Summary Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-2 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md bg-brand-cherry text-white rounded-2xl p-3 shadow-2xl z-30 flex items-center justify-between border border-white/20 animate-in slide-in-from-bottom-5">
          <div
            onClick={() => setShowCartDrawer(true)}
            className="flex items-center gap-3 cursor-pointer flex-1"
          >
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-mono font-bold text-sm">
              {itemCount}
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider opacity-80">
                view order summary
              </div>
              <div className="font-mono font-bold text-base">
                {APP_CONFIG.defaultCurrency}{grandTotal.toFixed(2)}
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowCartDrawer(true)}
            className="px-4 py-2 bg-brand-butter text-brand-espresso font-sans text-xs font-bold rounded-xl shadow active:scale-95 transition-transform"
          >
            checkout →
          </button>
        </div>
      )}

      {/* Cart & Checkout Bottom Sheet Modal */}
      {showCartDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end animate-in fade-in">
          <div className="bg-brand-creme dark:bg-brand-espresso rounded-t-3xl border-t border-brand-biscuit/40 dark:border-brand-biscuit/20 max-h-[90vh] overflow-y-auto p-4 space-y-4 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-brand-biscuit/30 dark:border-brand-biscuit/10 pb-3">
              <div>
                <span className="font-mono text-[10px] text-brand-walnut dark:text-brand-biscuit uppercase">
                  checkout
                </span>
                <h3 className="font-serif text-xl font-bold text-brand-espresso dark:text-brand-creme lowercase">
                  order details ({itemCount} items)
                </h3>
              </div>
              <button
                onClick={() => setShowCartDrawer(false)}
                className="w-8 h-8 rounded-full bg-brand-biscuit/30 dark:bg-brand-biscuit/10 flex items-center justify-center text-brand-espresso dark:text-brand-creme"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Order Type Toggle */}
            <div className="grid grid-cols-2 gap-2 bg-brand-biscuit/20 dark:bg-brand-biscuit/10 p-1 rounded-xl">
              <button
                onClick={() => setOrderType('dine_in')}
                className={`py-1.5 rounded-lg text-xs font-medium font-sans transition-colors ${
                  orderType === 'dine_in'
                    ? 'bg-brand-cherry text-white shadow-sm'
                    : 'text-brand-walnut dark:text-brand-biscuit'
                }`}
              >
                dine in
              </button>
              <button
                onClick={() => setOrderType('takeaway')}
                className={`py-1.5 rounded-lg text-xs font-medium font-sans transition-colors ${
                  orderType === 'takeaway'
                    ? 'bg-brand-cherry text-white shadow-sm'
                    : 'text-brand-walnut dark:text-brand-biscuit'
                }`}
              >
                takeaway
              </button>
            </div>

            {/* Cart Itemized List */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div
                  key={item.menuItemId}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-brand-biscuit/15 dark:bg-brand-espresso/60 border border-brand-biscuit/30 dark:border-brand-biscuit/10"
                >
                  <div className="flex-1 pr-2">
                    <div className="font-sans font-medium text-xs text-brand-espresso dark:text-brand-creme lowercase">
                      {item.name}
                    </div>
                    <div className="font-mono text-[11px] text-brand-walnut dark:text-brand-biscuit">
                      {APP_CONFIG.defaultCurrency}{item.price} × {item.quantity} = {APP_CONFIG.defaultCurrency}
                      {(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleQuantityChange(item.menuItemId, -1)}
                      className="w-6 h-6 rounded bg-brand-biscuit/30 flex items-center justify-center text-xs"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono text-xs font-bold px-1.5">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.menuItemId, 1)}
                      className="w-6 h-6 rounded bg-brand-biscuit/30 flex items-center justify-center text-xs"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Discounts & Tax Controls */}
            <div className="space-y-2 border-t border-brand-biscuit/30 dark:border-brand-biscuit/10 pt-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-brand-walnut dark:text-brand-biscuit font-sans">discount</span>
                <div className="flex items-center gap-1 font-mono">
                  {[0, 5, 10, 15].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDiscountPercent(d)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        discountPercent === d
                          ? 'bg-brand-cherry text-white'
                          : 'bg-brand-biscuit/20 text-brand-walnut dark:text-brand-biscuit'
                      }`}
                    >
                      {d}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-brand-walnut dark:text-brand-biscuit font-sans">
                  tax ({APP_CONFIG.taxRatePercent}% GST)
                </span>
                <button
                  onClick={() => setTaxEnabled(!taxEnabled)}
                  className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold ${
                    taxEnabled ? 'bg-green-700 text-white' : 'bg-gray-300 text-gray-700'
                  }`}
                >
                  {taxEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5 border-t border-brand-biscuit/30 dark:border-brand-biscuit/10 pt-3">
              <span className="font-mono text-[10px] text-brand-walnut dark:text-brand-biscuit uppercase">
                payment method
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'upi'
                      ? 'bg-brand-cherry text-white border-brand-cherry font-bold shadow-md'
                      : 'bg-brand-biscuit/10 border-brand-biscuit/30 text-brand-walnut dark:text-brand-biscuit'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span className="text-xs font-sans">UPI</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'cash'
                      ? 'bg-brand-cherry text-white border-brand-cherry font-bold shadow-md'
                      : 'bg-brand-biscuit/10 border-brand-biscuit/30 text-brand-walnut dark:text-brand-biscuit'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span className="text-xs font-sans">Cash</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-brand-cherry text-white border-brand-cherry font-bold shadow-md'
                      : 'bg-brand-biscuit/10 border-brand-biscuit/30 text-brand-walnut dark:text-brand-biscuit'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span className="text-xs font-sans">Card</span>
                </button>
              </div>
            </div>

            {/* Bill Summary Breakdown */}
            <div className="bg-brand-biscuit/20 dark:bg-brand-biscuit/10 p-3 rounded-xl font-mono text-xs space-y-1 text-brand-espresso dark:text-brand-creme">
              <div className="flex justify-between">
                <span>subtotal</span>
                <span>{APP_CONFIG.defaultCurrency}{subtotal.toFixed(2)}</span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-green-700 dark:text-green-400">
                  <span>discount ({discountPercent}%)</span>
                  <span>-{APP_CONFIG.defaultCurrency}{discountAmount.toFixed(2)}</span>
                </div>
              )}
              {taxEnabled && (
                <div className="flex justify-between text-brand-walnut dark:text-brand-biscuit">
                  <span>tax ({APP_CONFIG.taxRatePercent}%)</span>
                  <span>+{APP_CONFIG.defaultCurrency}{taxAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold pt-1 border-t border-brand-biscuit/40 dark:border-brand-biscuit/20 text-brand-cherry dark:text-brand-butter">
                <span>total amount</span>
                <span>{APP_CONFIG.defaultCurrency}{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Complete Order Button */}
            <button
              onClick={handleCompleteOrder}
              className="w-full py-3.5 rounded-2xl bg-brand-cherry text-white font-sans font-bold text-sm shadow-xl active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>complete order ({APP_CONFIG.defaultCurrency}{grandTotal.toFixed(2)})</span>
            </button>
          </div>
        </div>
      )}

      {/* Completed Receipt Modal */}
      {completedOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white text-black rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-gray-200">
            <div className="text-center border-b border-dashed border-gray-300 pb-3 flex flex-col items-center">
              <img
                src="/logo.png"
                alt="smol café official logo"
                className="h-12 w-auto object-contain mb-1"
              />
              <h2 className="font-serif text-2xl font-bold lowercase tracking-tight">
                smol café
              </h2>
              <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">
                tapovan · rishikesh
              </p>
              <div className="font-mono text-xs font-bold text-gray-800 mt-1">
                Order #{completedOrder.orderNumber}
              </div>
              <div className="font-mono text-[10px] text-gray-500">
                {new Date(completedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {completedOrder.orderType}
              </div>
            </div>

            {/* Itemized Table */}
            <div className="font-mono text-xs space-y-1.5 border-b border-dashed border-gray-300 pb-3">
              {completedOrder.items.map((item) => (
                <div key={item.id} className="flex justify-between items-start">
                  <span className="flex-1 lowercase">
                    {item.quantity}x {item.name}
                  </span>
                  <span>{APP_CONFIG.defaultCurrency}{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="font-mono text-xs space-y-1 border-b border-dashed border-gray-300 pb-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{APP_CONFIG.defaultCurrency}{completedOrder.subtotal.toFixed(2)}</span>
              </div>
              {completedOrder.discount > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Discount</span>
                  <span>-{APP_CONFIG.defaultCurrency}{completedOrder.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Tax (5%)</span>
                <span>+{APP_CONFIG.defaultCurrency}{completedOrder.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-black pt-1">
                <span>TOTAL</span>
                <span>{APP_CONFIG.defaultCurrency}{completedOrder.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-gray-500 pt-1">
                <span>Payment</span>
                <span className="uppercase">{completedOrder.paymentMethod}</span>
              </div>
            </div>

            {/* Brand Quote Line */}
            <div className="text-center font-serif italic text-xs text-gray-600 pt-1">
              "thank you for lingering with us at smol café."
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 font-sans text-xs font-medium text-gray-800 flex items-center justify-center gap-1.5 hover:bg-gray-100"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => setCompletedOrder(null)}
                className="flex-1 py-2.5 rounded-xl bg-brand-cherry text-white font-sans text-xs font-bold flex items-center justify-center gap-1 hover:bg-brand-cherry/90"
              >
                <span>New Order</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Today's History Drawer */}
      {showHistory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end animate-in fade-in">
          <div className="bg-brand-creme dark:bg-brand-espresso rounded-t-3xl border-t border-brand-biscuit/40 dark:border-brand-biscuit/20 max-h-[85vh] overflow-y-auto p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-brand-biscuit/30 dark:border-brand-biscuit/10 pb-2">
              <h3 className="font-serif text-lg font-bold text-brand-espresso dark:text-brand-creme lowercase">
                today&apos;s order history
              </h3>
              <button
                onClick={() => setShowHistory(false)}
                className="w-8 h-8 rounded-full bg-brand-biscuit/30 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {todayOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-3 rounded-xl bg-brand-biscuit/15 dark:bg-brand-espresso/60 border border-brand-biscuit/30 dark:border-brand-biscuit/20 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-brand-cherry dark:text-brand-butter">
                      {ord.orderNumber}
                    </span>
                    <span className="font-mono text-xs font-bold text-brand-espresso dark:text-brand-creme">
                      {APP_CONFIG.defaultCurrency}{ord.total}
                    </span>
                  </div>
                  <div className="text-[11px] font-sans text-brand-walnut dark:text-brand-biscuit">
                    {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono opacity-80 pt-1 border-t border-brand-biscuit/20">
                    <span className="capitalize">{ord.status} · {ord.paymentMethod}</span>
                    <span>{new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
