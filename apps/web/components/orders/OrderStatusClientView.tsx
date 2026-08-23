"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { fetchActiveOrdersAction, type CustomerOrderDetails } from "@/app/orders/actions";
import { OrderCard } from "./OrderCard";

interface OrderStatusClientViewProps {
  initialOrders: CustomerOrderDetails[];
  tableLabel?: string;
  locationName?: string;
  hasSession: boolean;
}

export const OrderStatusClientView: React.FC<OrderStatusClientViewProps> = ({
  initialOrders,
  tableLabel: initialTableLabel,
  locationName: initialLocationName = "Smol Café",
  hasSession,
}) => {
  const [orders, setOrders] = useState<CustomerOrderDetails[]>(initialOrders);
  const [tableLabel, setTableLabel] = useState<string | undefined>(initialTableLabel);
  const [locationName, setLocationName] = useState<string>(initialLocationName);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());

  const refreshOrders = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const result = await fetchActiveOrdersAction();
      if (result.success) {
        setOrders(result.orders);
        if (result.tableLabel) setTableLabel(result.tableLabel);
        if (result.locationName) setLocationName(result.locationName);
        setLastRefreshedAt(new Date());
      }
    } catch (err) {
      console.error("Error polling orders:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // 4-Second Polling Timer
  useEffect(() => {
    if (!hasSession) return;

    const intervalId = setInterval(() => {
      // Poll only when tab is visible
      if (document.visibilityState === "visible") {
        refreshOrders();
      }
    }, 4000);

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
            Please scan the QR code on your table stand to view your live order updates.
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center rounded-xl bg-stone-900 py-3.5 text-sm font-semibold text-white transition hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1C1917] pb-24 dark:bg-[#141211] dark:text-[#FDFBF7]">
      {/* Header */}
      <header className="border-b border-stone-200/80 bg-white/70 px-4 py-4 backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/60">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-[#9B2C2C] dark:text-[#F6AD55]">
                smol café
              </span>
              <span className="text-stone-300 dark:text-stone-700">•</span>
              <span className="text-xs text-stone-500 font-medium">{locationName}</span>
            </div>
            {tableLabel && (
              <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                Live Order Queue • Table {tableLabel}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-[11px] font-medium text-stone-500 dark:border-stone-800 dark:bg-stone-800 dark:text-stone-400">
              <span
                className={`h-2 w-2 rounded-full bg-emerald-500 ${
                  isRefreshing ? "scale-125 opacity-70" : "animate-pulse"
                }`}
              />
              <span>Live (4s)</span>
            </div>

            <Link
              href="/menu"
              className="rounded-full bg-[#9B2C2C] px-3.5 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-[#822424] dark:bg-[#C53030]"
            >
              + Order More
            </Link>
          </div>
        </div>
      </header>

      {/* Main Order Tracker Content */}
      <main className="mx-auto max-w-2xl px-4 py-6">
        {orders.length === 0 ? (
          /* Empty State */
          <div className="rounded-3xl border border-stone-200/80 bg-white/70 p-12 text-center shadow-sm dark:border-stone-800 dark:bg-stone-900/70">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-2xl dark:bg-stone-800">
              ☕
            </div>
            <h3 className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
              No orders placed yet
            </h3>
            <p className="mt-2 text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
              You haven&apos;t placed any orders in this session. Browse our menu to start your
              round!
            </p>
            <div className="mt-6">
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#9B2C2C] px-6 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#822424] dark:bg-[#C53030]"
              >
                Browse Menu
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        ) : (
          /* List of Active & Past Orders */
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span>
                {orders.length} {orders.length === 1 ? "order round" : "order rounds"} in this
                session
              </span>
              <span className="text-[11px] opacity-75">
                Updated{" "}
                {lastRefreshedAt.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            </div>

            <div className="space-y-4">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Floating Bottom Quick Action */}
      <div className="fixed bottom-5 left-0 right-0 z-40 px-4">
        <div className="mx-auto flex max-w-md items-center justify-between rounded-2xl border border-stone-800/10 bg-white/90 p-3 shadow-xl backdrop-blur-lg dark:border-stone-700/40 dark:bg-stone-900/90">
          <div className="px-2">
            <span className="text-xs text-stone-500">Feeling hungry or thirsty?</span>
            <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
              Add more items to your table
            </p>
          </div>
          <Link
            href="/menu"
            className="rounded-xl bg-[#9B2C2C] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#822424] dark:bg-[#C53030]"
          >
            Open Menu →
          </Link>
        </div>
      </div>
    </div>
  );
};
