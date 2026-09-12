"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { fetchActiveOrdersAction, type CustomerOrderDetails } from "@/app/orders/actions";
import { OrderCard } from "./OrderCard";
import { ConversationDeckModal } from "./ConversationDeckModal";
import { BottomNavBar } from "@/components/navigation/BottomNavBar";
import { Bell, CreditCard, Tag } from "lucide-react";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { subscribeToSyncEvents } from "@/lib/sync-events";
import { createTableJsonTag } from "@/lib/table-tag";
import { JsonTagInspectorModal } from "@/components/table/JsonTagInspectorModal";
import { UpiPaymentDrawer } from "@/components/payment/UpiPaymentDrawer";

interface OrderStatusClientViewProps {
  initialOrders: CustomerOrderDetails[];
  tableLabel?: string;
  locationName?: string;
  hasSession: boolean;
}

export const OrderStatusClientView: React.FC<OrderStatusClientViewProps> = ({
  initialOrders,
  tableLabel = "01",
  locationName = "Smol Café",
  hasSession,
}) => {
  const [orders, setOrders] = useState<CustomerOrderDetails[]>(initialOrders);
  const [isDeckOpen, setIsDeckOpen] = useState(false);
  const [isJsonInspectorOpen, setIsJsonInspectorOpen] = useState(false);
  const [isUpiDrawerOpen, setIsUpiDrawerOpen] = useState(false);

  const tableJsonTag = createTableJsonTag(tableLabel);

  const refreshOrders = useCallback(async () => {
    try {
      const orderRes = await fetchActiveOrdersAction();
      if (orderRes.success) {
        setOrders(orderRes.orders);
      }
    } catch (err) {
      console.error("Error polling orders:", err);
    }
  }, []);

  // Cross-interface Real-Time Sync Event Listener (Kitchen ↔ Cashier ↔ Customer)
  useEffect(() => {
    const unsubscribe = subscribeToSyncEvents((event) => {
      if (
        event.type === "STATUS_CHANGED" ||
        event.type === "ORDER_CONFIRMED" ||
        event.type === "ORDER_PLACED" ||
        event.type === "PAYMENT_COMPLETED"
      ) {
        refreshOrders();
      }
    });
    return unsubscribe;
  }, [refreshOrders]);

  // Supabase Realtime WebSocket subscription for Customer Order Status Updates
  useSupabaseRealtime({
    table: "orders",
    onData: () => {
      refreshOrders();
    },
    enabled: hasSession,
  });

  // 3-Second Polling Timer Fallback
  useEffect(() => {
    if (!hasSession) return;

    const intervalId = setInterval(() => {
      if (document.visibilityState === "visible") {
        refreshOrders();
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [hasSession, refreshOrders]);

  if (!hasSession) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FDFBF7] px-6 py-12 text-center text-[#1C1917] dark:bg-[#141211] dark:text-[#FDFBF7]">
        <div className="w-full max-w-md rounded-3xl border border-stone-200/80 bg-white/80 p-8 shadow-xl dark:border-stone-800 dark:bg-stone-900/80">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-3xl">
            🪑
          </div>
          <h2 className="text-2xl font-bold tracking-tight">No Active Table Session</h2>
          <p className="mt-2 text-xs text-stone-600 dark:text-stone-400">
            Please scan the QR code on your table stand or tap a table below to view live orders:
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {[1, 2, 3, 4, 5, 6].map((num) => {
              const label = num.toString().padStart(2, "0");
              return (
                <a
                  key={num}
                  href={`/t/table-${label}`}
                  className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 shadow-xs hover:bg-amber-100 dark:border-amber-700 dark:bg-stone-800 dark:text-amber-200"
                >
                  Table {label}
                </a>
              );
            })}
          </div>
          <div className="mt-5">
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center rounded-xl bg-stone-900 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }


  const latestOrder = orders[0];

  const orderNumberStr = latestOrder
    ? `#SMOL ${latestOrder.orderNo.toString().padStart(4, "0")}`
    : "#SMOL 0427";

  const firstItemName = latestOrder?.items[0]?.name || "Pour Over Coffee";

  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#1C1917] pb-28 font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-[#E8DFD3]/80 bg-[#F5EFEB]/90 px-5 py-3.5 backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-start justify-between">
          <div>
            <span className="block font-mono text-[10px] font-bold uppercase tracking-widest text-[#A62B34]">
              4. ORDER STATUS
            </span>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-[#1C1917]">
              your order
            </h1>
            <p className="font-serif italic text-xs text-[#786F66]">
              {tableLabel ? `Table ${tableLabel} • ${locationName}` : "brewing happiness"}
            </p>
          </div>

          <div className="pt-1">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#94B8A3] px-3 py-0.5 text-[10px] font-bold text-[#1E432B] shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1E432B] animate-pulse" />
              LIVE
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-md px-4 pt-4 space-y-5">
        {/* Black Arched Hero Status Card */}
        <div className="relative overflow-hidden rounded-t-[5.5rem] rounded-b-3xl border-t-2 border-[#E5383B] bg-[#141517] p-6 text-center text-white shadow-2xl animate-scale-in">
          {/* Top Red Ambient Neon Glow */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-20 bg-[#E5383B]/20 rounded-full blur-xl pointer-events-none animate-pulse-glow" />

          {/* Smol Café Badge Logo in Center */}
          <div className="relative mx-auto mt-2 inline-flex items-center justify-center rounded-2xl border-2 border-white/20 bg-[#A62B34] px-4 py-2 shadow-lg shadow-red-950/50 hover-lift">

            <div className="text-center leading-none">
              <span className="block font-serif text-xs font-black tracking-tighter text-white uppercase">
                SMOL
              </span>
              <span className="block font-serif text-sm font-black italic text-white lowercase">
                café
              </span>
            </div>
          </div>

          {/* Headline & Subtitle */}
          <div className="mt-4 space-y-1">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-tight">
              Brewing Your {firstItemName}
            </h2>
            <p className="font-serif italic text-xs text-stone-300">
              single-origin South Indian estate beans
            </p>
          </div>

          {/* 2 Dark Metric Tiles */}
          <div className="mt-5 grid grid-cols-2 gap-2.5">
            {/* Order Number */}
            <div className="rounded-2xl border border-white/10 bg-[#0C0D0E] p-3 text-center">
              <span className="block font-mono text-[9px] font-bold uppercase tracking-wider text-stone-400">
                YOUR ORDER NO.
              </span>
              <span className="block font-mono text-sm font-bold text-[#F7D070] mt-1 tracking-wider">
                {orderNumberStr}
              </span>
            </div>

            {/* Ready Time */}
            <div className="rounded-2xl border border-white/10 bg-[#0C0D0E] p-3 text-center">
              <span className="block font-mono text-[9px] font-bold uppercase tracking-wider text-stone-400">
                EST. READY TIME
              </span>
              <span className="block font-mono text-sm font-bold text-[#FF5A5F] mt-1 tracking-wider">
                ⏱ 8-10 mins
              </span>
            </div>
          </div>

          {/* Table Zone Tag & UPI Payment CTA */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setIsJsonInspectorOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-2.5 py-1.5 text-[11px] font-mono text-stone-300 hover:bg-white/10 transition"
              title="Inspect JSON Table Tag"
            >
              <Tag className="h-3 w-3 text-[#F7D070]" />
              <span>{tableJsonTag.zone} • Tag</span>
            </button>

            {latestOrder && (
              <button
                type="button"
                onClick={() => setIsUpiDrawerOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#B72E35] px-3.5 py-1.5 text-xs font-serif font-bold text-white shadow-sm hover:bg-[#91242C] transition active:scale-95"
              >
                <CreditCard className="h-3.5 w-3.5" />
                <span>Pay via UPI • ₹{Math.round(latestOrder.totalPaise / 100)}</span>
              </button>
            )}
          </div>
        </div>

        {/* Another Round While You Wait */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xs font-bold text-[#1C1917]">
              another round? <span className="font-normal text-[#786F66]">while you wait</span>
            </h3>
            <span className="text-[#E5A842] text-xs">✧</span>
          </div>

          {/* Horizontal Scroller Cards */}
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
            {/* Card 1: Smol Espresso */}
            <div className="w-36 shrink-0 rounded-2xl border border-[#E2D7C7] bg-[#FAF5ED] p-3 shadow-xs flex flex-col justify-between h-24">
              <p className="font-serif font-bold text-xs text-[#1C1917] truncate">
                Smol Espresso
              </p>
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-xs text-[#9E2A2B]">₹120</span>
                <Link
                  href="/menu"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-[#A62B34] text-white text-sm font-bold shadow-xs hover:bg-[#91242C] active:scale-95"
                >
                  +
                </Link>
              </div>
            </div>

            {/* Card 2: Jaggery Latte */}
            <div className="w-36 shrink-0 rounded-2xl border border-[#E2D7C7] bg-[#FAF5ED] p-3 shadow-xs flex flex-col justify-between h-24">
              <p className="font-serif font-bold text-xs text-[#1C1917] truncate">
                Jaggery Latte
              </p>
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-xs text-[#9E2A2B]">₹150</span>
                <Link
                  href="/menu"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-[#A62B34] text-white text-sm font-bold shadow-xs hover:bg-[#91242C] active:scale-95"
                >
                  +
                </Link>
              </div>
            </div>

            {/* Card 3: Triple Decker */}
            <div className="w-36 shrink-0 rounded-2xl border border-[#E2D7C7] bg-[#FAF5ED] p-3 shadow-xs flex flex-col justify-between h-24">
              <p className="font-serif font-bold text-xs text-[#1C1917] truncate">
                Triple Decker
              </p>
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-xs text-[#9E2A2B]">₹140</span>
                <Link
                  href="/menu"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-[#A62B34] text-white text-sm font-bold shadow-xs hover:bg-[#91242C] active:scale-95"
                >
                  +
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Notify Me When Ready Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && "Notification" in window) {
                Notification.requestPermission();
              }
              alert("You will be notified as soon as your order is ready!");
            }}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#A62B34] py-3.5 font-serif text-sm font-semibold text-white shadow-md transition hover:bg-[#91242C] active:scale-[0.98]"
          >
            <Bell className="h-4 w-4" />
            <span>notify me when ready</span>
          </button>
        </div>

        {/* Active Ticket Progression Cards */}
        {orders.length > 0 && (
          <div className="pt-3 space-y-3">
            <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#786F66]">
              Detailed Round Timeline
            </h4>
            <div className="space-y-3">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Conversation Prompt Deck Modal */}
      <ConversationDeckModal isOpen={isDeckOpen} onClose={() => setIsDeckOpen(false)} />

      {/* JSON Table Tag Inspector Modal */}
      {isJsonInspectorOpen && (
        <JsonTagInspectorModal
          tag={tableJsonTag}
          onClose={() => setIsJsonInspectorOpen(false)}
        />
      )}

      {/* UPI Payment Gateway Drawer */}
      {isUpiDrawerOpen && latestOrder && (
        <UpiPaymentDrawer
          orderId={latestOrder.id}
          orderNo={latestOrder.orderNo}
          tableLabel={tableLabel}
          zone={tableJsonTag.zone}
          amountPaise={latestOrder.totalPaise}
          items={latestOrder.items.map((i) => ({
            name: i.name,
            qty: i.qty,
            priceRupees: Math.round(i.unitPricePaise / 100),
            subtotalRupees: Math.round((i.unitPricePaise / 100) * i.qty),
          }))}
          onClose={() => setIsUpiDrawerOpen(false)}
          onPaymentSuccess={() => {
            setIsUpiDrawerOpen(false);
            refreshOrders();
          }}
        />
      )}

      {/* Bottom Sticky Navigation */}
      <BottomNavBar />
    </div>
  );
};

