"use client";

import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { placeOrderAction, type ChangedItemDiff } from "@/app/menu/actions";

interface CartDrawerProps {
  tableLabel?: string;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ tableLabel }) => {
  const { items, updateQty, removeItem, clearCart, isCartOpen, closeCart, subtotalPaise } =
    useCart();

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
    // Update local cart item prices to new current prices
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
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={closeCart}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-t-3xl sm:rounded-3xl border border-stone-200/80 bg-[#FDFBF7] shadow-2xl transition-all dark:border-stone-800 dark:bg-[#1C1917]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200/80 p-5 dark:border-stone-800">
          <div>
            <h2 className="text-lg font-black tracking-tight text-stone-900 dark:text-stone-100">
              Your Order
            </h2>
            {tableLabel && (
              <p className="text-xs font-semibold text-stone-500">Seated at Table {tableLabel}</p>
            )}
          </div>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
          >
            ✕
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {orderSuccess ? (
            /* Success State */
            <div className="py-8 text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl dark:bg-emerald-950/80">
                🎉
              </div>
              <h3 className="text-2xl font-black tracking-tight text-stone-900 dark:text-stone-100">
                Order #{orderSuccess.orderNo} Placed!
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 max-w-xs mx-auto leading-relaxed">
                Your order has been sent to the kitchen. Our baristas and chefs are preparing it
                fresh.
              </p>
              <div className="rounded-2xl border border-stone-200 bg-white/70 p-4 dark:border-stone-800 dark:bg-stone-900/70">
                <span className="text-xs text-stone-500">Total Amount</span>
                <p className="text-xl font-bold text-stone-900 dark:text-stone-100">
                  ₹{Math.round(orderSuccess.totalPaise / 100)}
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setOrderSuccess(null);
                    closeCart();
                  }}
                  className="w-full rounded-2xl bg-stone-900 py-3.5 text-sm font-semibold text-white transition hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
                >
                  Back to Menu
                </button>
              </div>
            </div>
          ) : priceConflicts ? (
            /* Price Changed 409 Conflict Dialog */
            <div className="space-y-4 py-2">
              <div className="rounded-2xl border border-amber-300 bg-amber-50/80 p-4 dark:border-amber-900/50 dark:bg-amber-950/40">
                <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-sm">
                  <span>⚠️</span>
                  <h4>Item Prices Updated</h4>
                </div>
                <p className="mt-1 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  Prices were updated on the menu while you were browsing. Please review the updated
                  rates below:
                </p>
              </div>

              <div className="space-y-2">
                {priceConflicts.map((c) => (
                  <div
                    key={c.menu_item_id}
                    className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-3 text-xs dark:border-stone-800 dark:bg-stone-900"
                  >
                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                      {c.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="line-through text-stone-400">
                        ₹{c.expected_price_paise / 100}
                      </span>
                      <span className="font-bold text-[#9B2C2C] dark:text-[#F6AD55]">
                        ₹{c.current_price_paise / 100}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleApplyPriceUpdates}
                className="w-full rounded-2xl bg-[#9B2C2C] py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#822424]"
              >
                Accept New Prices & Continue
              </button>
            </div>
          ) : items.length === 0 ? (
            /* Empty Cart */
            <div className="py-12 text-center text-stone-500">
              <p className="text-3xl mb-2">🛒</p>
              <p className="text-sm font-medium">Your cart is empty.</p>
              <p className="text-xs text-stone-400 mt-1">
                Add drinks, bowls, or deckers from the menu.
              </p>
            </div>
          ) : (
            /* Cart Items List */
            <div className="space-y-4">
              {errorMessage && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                  {errorMessage}
                </div>
              )}

              <div className="divide-y divide-stone-100 dark:divide-stone-800">
                {items.map(({ item, qty }) => {
                  const priceRupees = Math.round(item.pricePaise / 100);
                  return (
                    <div key={item.id} className="flex items-center justify-between py-3">
                      <div className="flex-1 pr-3">
                        <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                          {item.name}
                        </h4>
                        <p className="text-xs font-semibold text-[#9B2C2C] dark:text-[#F6AD55]">
                          ₹{priceRupees} each
                        </p>
                      </div>

                      {/* Quantity Modifier */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center rounded-xl border border-stone-300 bg-white px-1.5 py-1 dark:border-stone-700 dark:bg-stone-800">
                          <button
                            onClick={() => updateQty(item.id, -1)}
                            className="flex h-6 w-6 items-center justify-center text-sm font-bold text-stone-600 dark:text-stone-300"
                          >
                            −
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-stone-900 dark:text-stone-100">
                            {qty}
                          </span>
                          <button
                            onClick={() => updateQty(item.id, 1)}
                            className="flex h-6 w-6 items-center justify-center text-sm font-bold text-stone-600 dark:text-stone-300"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          aria-label="Remove item"
                          className="text-stone-400 hover:text-red-600 text-xs px-1"
                        >
                          🗑️
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
          <div className="border-t border-stone-200/80 bg-stone-50/80 p-5 dark:border-stone-800 dark:bg-stone-900/60">
            <div className="mb-4 flex items-baseline justify-between">
              <span className="text-xs font-medium text-stone-500">Subtotal</span>
              <span className="text-lg font-black text-stone-900 dark:text-stone-100">
                ₹{totalRupees}
              </span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#9B2C2C] py-4 text-base font-semibold text-white shadow-lg shadow-red-900/20 transition hover:bg-[#822424] active:scale-[0.98] disabled:opacity-50 dark:bg-[#C53030] dark:hover:bg-[#9B2C2C]"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Submitting Order...
                </>
              ) : (
                <>
                  Place Order • ₹{totalRupees}
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
