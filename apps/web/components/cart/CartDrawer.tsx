"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { placeOrderAction, type ChangedItemDiff } from "@/app/menu/actions";
import { useNetworkHealth } from "@/hooks/useNetworkHealth";

interface CartDrawerProps {
  tableLabel?: string;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ tableLabel }) => {
  const { items, updateQty, removeItem, clearCart, isCartOpen, closeCart, subtotalPaise } =
    useCart();
  const { isDegraded } = useNetworkHealth();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [priceConflicts, setPriceConflicts] = useState<ChangedItemDiff[] | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<{
    orderNo: number;
    orderId: string;
    totalPaise: number;
  } | null>(null);

  if (!isCartOpen) return null;

  const totalRupees = Math.round(subtotalPaise / 100);

  const handlePlaceOrder = async () => {
    if (items.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setPriceConflicts(null);

    // Generate client-side UUID idempotency key
    const idempotencyKey = crypto.randomUUID();

    const orderPayload = items.map((cartItem) => ({
      menu_item_id: cartItem.item.id,
      expected_unit_price_paise: cartItem.item.pricePaise,
      qty: cartItem.qty,
    }));

    try {
      const result = await placeOrderAction(orderPayload, idempotencyKey);

      if (result.success && result.orderNo && result.orderId) {
        setOrderSuccess({
          orderNo: result.orderNo,
          orderId: result.orderId,
          totalPaise: result.totalPaise || subtotalPaise,
        });
        clearCart();
      } else if (result.error === "PRICE_CHANGED" && result.changedItems) {
        setPriceConflicts(result.changedItems);
      } else {
        setErrorMessage(result.message || "Failed to place order. Please try again.");
      }
    } catch (err) {
      console.error("Order submission error:", err);
      setErrorMessage("An unexpected error occurred. Please ask staff.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApplyPriceUpdates = () => {
    if (priceConflicts) {
      priceConflicts.forEach((conflict) => {
        const cartItem = items.find((i) => i.item.id === conflict.menu_item_id);
        if (cartItem) {
          cartItem.item.pricePaise = conflict.current_price_paise;
        }
      });
      setPriceConflicts(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-stone-900/60 backdrop-blur-xs sm:items-center sm:p-4 transition-opacity duration-300"
      onClick={closeCart}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-lg flex-col rounded-t-[2.5rem] sm:rounded-3xl border border-[#E2D7C7] bg-[#FAF5ED] shadow-2xl transition-all animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Handle Indicator */}
        <div className="pt-3 flex justify-center sm:hidden">
          <div className="w-10 h-1.5 rounded-full bg-[#D8CEBF]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8DFD3] px-5 py-4">
          <div>
            <h2 className="font-serif text-xl font-bold tracking-tight text-[#1C1917]">
              Your Table Order
            </h2>
            <p className="font-serif italic text-xs text-[#786F66]">
              Seated at Table {tableLabel || "01"} • Rishikesh
            </p>
          </div>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EFE7DC] text-[#786F66] hover:bg-[#E2D6C5] active:scale-95 transition"
          >
            ✕
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {orderSuccess ? (
            /* Success State */
            <div className="py-8 text-center space-y-4 animate-scale-in">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl shadow-inner">
                🎉
              </div>
              <h3 className="font-serif text-2xl font-bold tracking-tight text-[#1C1917]">
                Order #{orderSuccess.orderNo} Sent to Kitchen!
              </h3>
              <p className="font-serif italic text-xs text-[#786F66] max-w-xs mx-auto leading-relaxed">
                Your order is brewing fresh. You can track real-time kitchen status live!
              </p>
              <div className="rounded-2xl border border-[#E2D7C7] bg-[#FCF8F2] p-4 shadow-xs">
                <span className="font-mono text-[10px] uppercase font-bold text-[#8C7E72]">
                  TOTAL AMOUNT
                </span>
                <p className="font-serif text-2xl font-bold text-[#A62B34] mt-0.5">
                  ₹{Math.round(orderSuccess.totalPaise / 100)}
                </p>
              </div>

              <div className="pt-2 space-y-2">
                <Link
                  href="/orders"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#A62B34] py-3.5 font-serif text-sm font-semibold text-white shadow-md transition hover:bg-[#91242C] active:scale-[0.98]"
                >
                  Track Order Live →
                </Link>
                <button
                  onClick={() => {
                    setOrderSuccess(null);
                    closeCart();
                  }}
                  className="w-full rounded-2xl border border-[#E2D7C7] bg-[#FAF5ED] py-3 font-serif text-xs font-semibold text-[#786F66] transition hover:bg-[#EFE7DC]"
                >
                  Stay on Menu
                </button>
              </div>
            </div>
          ) : priceConflicts ? (
            /* Price Changed 409 Conflict Dialog */
            <div className="space-y-4 py-2 animate-scale-in">
              <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <span>⚠️</span>
                  <h4>Item Prices Updated</h4>
                </div>
                <p className="mt-1 font-serif text-xs text-amber-800 leading-relaxed">
                  Prices were updated on the menu. Please review the updated rates below:
                </p>
              </div>

              <div className="space-y-2">
                {priceConflicts.map((c) => (
                  <div
                    key={c.menu_item_id}
                    className="flex items-center justify-between rounded-xl border border-[#E8DFD3] bg-[#FCF8F2] p-3 text-xs"
                  >
                    <span className="font-serif font-bold text-[#1C1917]">
                      {c.name}
                    </span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="line-through text-stone-400">
                        ₹{c.expected_price_paise / 100}
                      </span>
                      <span className="font-bold text-[#A62B34]">
                        ₹{c.current_price_paise / 100}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleApplyPriceUpdates}
                className="w-full rounded-2xl bg-[#A62B34] py-3 text-xs font-serif font-bold text-white shadow-sm"
              >
                Accept New Prices &amp; Review
              </button>
            </div>
          ) : items.length === 0 ? (
            /* Empty Cart */
            <div className="py-12 text-center space-y-3">
              <span className="text-4xl">☕</span>
              <p className="font-serif text-sm font-bold text-[#1C1917]">
                Your cart is empty
              </p>
              <p className="font-serif italic text-xs text-[#786F66]">
                Explore our artisanal brews, buns &amp; comfort bowls.
              </p>
              <button
                onClick={closeCart}
                className="inline-flex rounded-full bg-[#A62B34] px-5 py-2 font-serif text-xs font-bold text-white shadow-xs"
              >
                Explore Menu
              </button>
            </div>
          ) : (
            /* Cart Item List */
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#8C7E72]">
                  {items.length} {items.length === 1 ? "ITEM" : "ITEMS"} IN ORDER
                </span>
                <button
                  onClick={clearCart}
                  className="font-serif text-xs text-[#A62B34] hover:underline"
                >
                  Clear all
                </button>
              </div>

              <div className="divide-y divide-[#E8DFD3] rounded-2xl border border-[#E2D7C7] bg-[#FCF8F2] shadow-xs">
                {items.map(({ item, qty }) => {
                  const unitRupees = Math.round(item.pricePaise / 100);
                  const itemTotalRupees = unitRupees * qty;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 p-3.5"
                    >
                      <div className="min-w-0 flex-1">
                        <h4 className="font-serif text-sm font-bold text-[#1C1917] truncate lowercase">
                          {item.name}
                        </h4>
                        <p className="font-mono text-xs text-[#786F66] mt-0.5">
                          ₹{unitRupees} each
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Quantity Counter */}
                        <div className="flex items-center rounded-xl border border-[#E2D7C7] bg-[#FAF5ED] px-1.5 py-0.5">
                          <button
                            onClick={() => updateQty(item.id, qty - 1)}
                            className="flex h-6 w-6 items-center justify-center font-bold text-[#786F66] active:scale-95"
                          >
                            −
                          </button>
                          <span className="w-6 text-center font-serif text-xs font-bold text-[#1C1917]">
                            {qty}
                          </span>
                          <button
                            onClick={() => updateQty(item.id, qty + 1)}
                            className="flex h-6 w-6 items-center justify-center font-bold text-[#786F66] active:scale-95"
                          >
                            +
                          </button>
                        </div>

                        <span className="w-12 text-right font-serif text-sm font-bold text-[#1C1917]">
                          ₹{itemTotalRupees}
                        </span>

                        <button
                          onClick={() => removeItem(item.id)}
                          aria-label="Remove item"
                          className="text-[#8C7E72] hover:text-[#A62B34] text-xs px-1"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer with Subtotal & Place Order */}
        {!orderSuccess && !priceConflicts && items.length > 0 && (
          <div className="border-t border-[#E8DFD3] bg-[#FAF5ED] p-4 sm:p-5 space-y-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            {errorMessage && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800">
                {errorMessage}
              </div>
            )}

            <div className="flex items-baseline justify-between px-1">
              <span className="font-mono text-xs uppercase font-bold text-[#786F66]">
                Order Total
              </span>
              <span className="font-serif text-xl font-bold text-[#A62B34]">
                ₹{totalRupees}
              </span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting || isDegraded}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#A62B34] py-3.5 font-serif text-base font-semibold text-white shadow-md transition hover:bg-[#91242C] active:scale-[0.98] disabled:opacity-50 touch-manipulation hover-lift"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Sending to Kitchen...
                </>
              ) : (
                <>
                  Place Order for Table {tableLabel || "01"} • ₹{totalRupees}
                  <span aria-hidden="true">→</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
