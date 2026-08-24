"use client";

import React, { useState, useEffect } from "react";
import type { KitchenTicket } from "@/app/kitchen/actions";
import type { OrderStatus } from "@smol-cafe/db";

interface KitchenTicketCardProps {
  ticket: KitchenTicket;
  onTransition: (orderId: string, fromStatus: OrderStatus, toStatus: OrderStatus) => Promise<void>;
}

export const KitchenTicketCard: React.FC<KitchenTicketCardProps> = ({ ticket, onTransition }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  useEffect(() => {
    const calculateElapsed = () => {
      if (!ticket.submittedAt) return;
      const diffMs = Date.now() - new Date(ticket.submittedAt).getTime();
      setElapsedMinutes(Math.floor(diffMs / 60000));
    };

    calculateElapsed();
    const timer = setInterval(calculateElapsed, 15000); // refresh every 15s
    return () => clearInterval(timer);
  }, [ticket.submittedAt]);

  const handleAction = async () => {
    if (isUpdating) return;

    let nextStatus: OrderStatus | null = null;
    if (ticket.status === "SUBMITTED") nextStatus = "ACCEPTED";
    else if (ticket.status === "ACCEPTED") nextStatus = "PREPARING";
    else if (ticket.status === "PREPARING") nextStatus = "READY";
    else if (ticket.status === "READY") nextStatus = "SERVED";

    if (!nextStatus) return;

    setIsUpdating(true);
    try {
      await onTransition(ticket.id, ticket.status, nextStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  // Color-coded urgency timer
  const timerBadgeColor =
    elapsedMinutes < 5
      ? "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800"
      : elapsedMinutes < 10
        ? "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800"
        : "bg-red-100 text-red-900 border-red-300 animate-pulse dark:bg-red-950/80 dark:text-red-300 dark:border-red-800";

  let actionButtonLabel = "Accept Order";
  let actionButtonColor =
    "bg-stone-900 text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200";

  if (ticket.status === "ACCEPTED") {
    actionButtonLabel = "Start Preparing 🍳";
    actionButtonColor = "bg-amber-700 text-white hover:bg-amber-800 dark:bg-amber-600";
  } else if (ticket.status === "PREPARING") {
    actionButtonLabel = "Mark Ready ✨";
    actionButtonColor = "bg-[#9B2C2C] text-white hover:bg-[#822424] dark:bg-[#C53030]";
  } else if (ticket.status === "READY") {
    actionButtonLabel = "Mark Served ✓";
    actionButtonColor = "bg-emerald-700 text-white hover:bg-emerald-800 dark:bg-emerald-600";
  }

  return (
    <div className="flex flex-col justify-between rounded-2xl border-2 border-stone-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-stone-800 dark:bg-[#1A1715]">
      <div>
        {/* Card Header: Order #, Table, Timer */}
        <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-3 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xl font-black text-stone-900 dark:text-stone-50">
              #{ticket.orderNo}
            </span>
            <span className="rounded-lg bg-stone-100 px-2.5 py-1 text-xs font-bold text-stone-800 dark:bg-stone-800 dark:text-stone-200">
              {ticket.tableLabel}
            </span>
          </div>

          <div
            className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-mono font-bold ${timerBadgeColor}`}
          >
            <span>⏱️</span>
            <span>{elapsedMinutes}m</span>
          </div>
        </div>

        {/* Items List */}
        <div className="my-3 space-y-2">
          {ticket.items.map((item) => (
            <div key={item.id} className="flex items-start gap-2 text-sm">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-stone-900 font-mono text-xs font-bold text-white dark:bg-stone-200 dark:text-stone-900">
                {item.qty}
              </span>
              <span className="font-bold leading-snug text-stone-900 dark:text-stone-100">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* One-Tap 48px+ Action Button */}
      <div className="pt-2">
        <button
          onClick={handleAction}
          disabled={isUpdating}
          className={`flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl text-sm font-bold tracking-wide shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 ${actionButtonColor}`}
        >
          {isUpdating ? (
            <span className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
          ) : (
            actionButtonLabel
          )}
        </button>
      </div>
    </div>
  );
};
