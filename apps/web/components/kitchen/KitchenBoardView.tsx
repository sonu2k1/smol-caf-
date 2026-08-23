"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import type { KitchenTicket } from "@/app/kitchen/actions";
import {
  fetchKitchenOrdersAction,
  transitionOrderStatusAction,
  staffLogoutAction,
} from "@/app/kitchen/actions";
import type { OrderStatus } from "@smol-cafe/db";
import { KitchenTicketCard } from "./KitchenTicketCard";

interface KitchenBoardViewProps {
  initialOrders: KitchenTicket[];
}

export const KitchenBoardView: React.FC<KitchenBoardViewProps> = ({ initialOrders }) => {
  const [orders, setOrders] = useState<KitchenTicket[]>(initialOrders);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const prevOrderCountRef = useRef(initialOrders.length);

  // Sound chime for incoming orders
  const playChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = new (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      )();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // AudioContext unavailable
    }
  }, [soundEnabled]);

  const refreshOrders = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const result = await fetchKitchenOrdersAction();
      if (result.success) {
        if (result.orders.length > prevOrderCountRef.current) {
          playChime();
        }
        prevOrderCountRef.current = result.orders.length;
        setOrders(result.orders);
        setLastRefreshedAt(new Date());
      }
    } catch (err) {
      console.error("Failed to refresh kitchen orders:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, [playChime]);

  // 3-Second Polling Loop
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        refreshOrders();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [refreshOrders]);

  // Optimistic Transition Handler
  const handleTransition = async (
    orderId: string,
    fromStatus: OrderStatus,
    toStatus: OrderStatus
  ) => {
    // 1. Apply Optimistic Update
    setOrders((prev) =>
      toStatus === "SERVED"
        ? prev.filter((o) => o.id !== orderId)
        : prev.map((o) => (o.id === orderId ? { ...o, status: toStatus } : o))
    );

    // 2. Execute Server Action
    const result = await transitionOrderStatusAction(orderId, fromStatus, toStatus);

    if (!result.success) {
      // Revert & notify
      if (result.error === "STATUS_MISMATCH") {
        setConflictMessage(result.message || "Order status changed by another device.");
      }
      refreshOrders();
    }
  };

  // Group tickets into 4 columns
  const newOrders = orders.filter((o) => o.status === "SUBMITTED");
  const acceptedOrders = orders.filter((o) => o.status === "ACCEPTED");
  const preparingOrders = orders.filter((o) => o.status === "PREPARING");
  const readyOrders = orders.filter((o) => o.status === "READY");

  return (
    <div className="flex min-h-screen flex-col bg-[#141211] text-[#FDFBF7]">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-stone-800 bg-[#1C1917]/95 px-6 py-3.5 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-black tracking-tight text-[#F6AD55]">
              smol café • KDS
            </span>
            <span className="rounded-md bg-stone-800 px-2 py-0.5 font-mono text-xs text-stone-400">
              Kitchen Display
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled((v) => !v)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition ${
                soundEnabled
                  ? "border-amber-600/80 bg-amber-950/40 text-amber-300"
                  : "border-stone-800 bg-stone-900 text-stone-500 hover:text-stone-300"
              }`}
            >
              <span>{soundEnabled ? "🔔 Chime On" : "🔕 Chime Off"}</span>
            </button>

            {/* Live Polling Indicator */}
            <div className="flex items-center gap-2 rounded-full border border-stone-800 bg-stone-900 px-3 py-1 text-xs font-mono text-stone-400">
              <span
                className={`h-2 w-2 rounded-full bg-emerald-500 ${
                  isRefreshing ? "scale-125 opacity-70" : "animate-pulse"
                }`}
              />
              <span>
                Live (3s) •{" "}
                {lastRefreshedAt.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            </div>

            {/* Logout */}
            <button
              onClick={async () => {
                await staffLogoutAction();
                window.location.reload();
              }}
              className="rounded-full bg-stone-850 border border-stone-800 px-3 py-1 text-xs text-stone-400 hover:text-stone-200"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Concurrency Conflict Toast */}
        {conflictMessage && (
          <div className="mt-2 flex items-center justify-between rounded-xl border border-amber-800 bg-amber-950/70 px-4 py-2 text-xs text-amber-200">
            <span>⚠️ {conflictMessage}</span>
            <button onClick={() => setConflictMessage(null)} className="font-bold underline ml-2">
              Dismiss
            </button>
          </div>
        )}
      </header>

      {/* Kanban Board Columns */}
      <main className="grid flex-1 grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
        {/* Column 1: NEW / SUBMITTED */}
        <div className="flex flex-col rounded-3xl border border-stone-800/80 bg-[#1A1715] p-4">
          <div className="mb-3 flex items-center justify-between border-b border-stone-800 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-stone-400" />
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-stone-300">
                New Tickets
              </h2>
            </div>
            <span className="rounded-full bg-stone-800 px-2.5 py-0.5 font-mono text-xs font-bold text-stone-300">
              {newOrders.length}
            </span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto">
            {newOrders.length === 0 ? (
              <p className="py-12 text-center text-xs text-stone-600">No new tickets</p>
            ) : (
              newOrders.map((ticket) => (
                <KitchenTicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onTransition={handleTransition}
                />
              ))
            )}
          </div>
        </div>

        {/* Column 2: ACCEPTED */}
        <div className="flex flex-col rounded-3xl border border-stone-800/80 bg-[#1A1715] p-4">
          <div className="mb-3 flex items-center justify-between border-b border-stone-800 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-amber-500" />
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-amber-300">
                Accepted
              </h2>
            </div>
            <span className="rounded-full bg-amber-950/60 border border-amber-800/50 px-2.5 py-0.5 font-mono text-xs font-bold text-amber-300">
              {acceptedOrders.length}
            </span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto">
            {acceptedOrders.length === 0 ? (
              <p className="py-12 text-center text-xs text-stone-600">No accepted tickets</p>
            ) : (
              acceptedOrders.map((ticket) => (
                <KitchenTicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onTransition={handleTransition}
                />
              ))
            )}
          </div>
        </div>

        {/* Column 3: PREPARING */}
        <div className="flex flex-col rounded-3xl border border-stone-800/80 bg-[#1A1715] p-4">
          <div className="mb-3 flex items-center justify-between border-b border-stone-800 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#9B2C2C]" />
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#F6AD55]">
                In Preparation
              </h2>
            </div>
            <span className="rounded-full bg-red-950/60 border border-red-900/50 px-2.5 py-0.5 font-mono text-xs font-bold text-[#F6AD55]">
              {preparingOrders.length}
            </span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto">
            {preparingOrders.length === 0 ? (
              <p className="py-12 text-center text-xs text-stone-600">Nothing on the grill</p>
            ) : (
              preparingOrders.map((ticket) => (
                <KitchenTicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onTransition={handleTransition}
                />
              ))
            )}
          </div>
        </div>

        {/* Column 4: READY */}
        <div className="flex flex-col rounded-3xl border border-stone-800/80 bg-[#1A1715] p-4">
          <div className="mb-3 flex items-center justify-between border-b border-stone-800 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-500" />
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-emerald-300">
                Ready to Serve
              </h2>
            </div>
            <span className="rounded-full bg-emerald-950/60 border border-emerald-900/50 px-2.5 py-0.5 font-mono text-xs font-bold text-emerald-300">
              {readyOrders.length}
            </span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto">
            {readyOrders.length === 0 ? (
              <p className="py-12 text-center text-xs text-stone-600">No ready orders</p>
            ) : (
              readyOrders.map((ticket) => (
                <KitchenTicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onTransition={handleTransition}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
