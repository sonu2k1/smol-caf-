"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { CustomerOrderDetails } from "@/app/orders/actions";
import { OrderStatusProgress } from "./OrderStatusProgress";
import { Clock } from "lucide-react";

interface OrderCardProps {
  order: CustomerOrderDetails;
}

interface StatusCopy {
  title: string;
  subtitle: string;
  badgeColor: string;
}

function getStatusCopy(status: string): StatusCopy {
  switch (status) {
    case "PENDING_CONFIRMATION":
    case "DRAFT":
      return {
        title: "Waiting for Confirmation",
        subtitle: "Order sent to Cashier Queue. You can still modify items or instructions.",
        badgeColor:
          "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900/40",
      };
    case "CONFIRMED":
    case "ACCEPTED":
      return {
        title: "Order Confirmed",
        subtitle: "Cashier verified your order! Pushed to Kitchen for preparation.",
        badgeColor:
          "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900/40",
      };
    case "PREPARING":
      return {
        title: "Crafting Your Order",
        subtitle: "Your coffee is brewing and your food is on the grill.",
        badgeColor:
          "bg-orange-100 text-orange-900 border-orange-300 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-900/40",
      };
    case "READY":
      return {
        title: "Order is Ready!",
        subtitle:
          "Fresh and piping hot. Your server is bringing it over, or collect at the counter.",
        badgeColor:
          "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900/40",
      };
    case "COMPLETED":
    case "SERVED":
    case "CLOSED":
      return {
        title: "Served & Enjoyed",
        subtitle: "Hope you loved it! You can order another round anytime from the menu.",
        badgeColor:
          "bg-stone-100 text-stone-800 border-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700",
      };
    case "CANCELLED":
    case "REJECTED":
      return {
        title: "Order Cancelled",
        subtitle: "This order was cancelled by staff.",
        badgeColor:
          "bg-red-100 text-red-900 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-900/40",
      };
    default:
      return {
        title: "Processing Order",
        subtitle: "Your order is in progress.",
        badgeColor: "bg-stone-100 text-stone-800 border-stone-200",
      };
  }
}

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return "Just now";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins === 1) return "1 min ago";
  if (mins < 60) return `${mins} mins ago`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ${mins % 60}m ago`;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const [showItems, setShowItems] = useState(true);
  const copy = getStatusCopy(order.status);
  const totalRupees = Math.round(order.totalPaise / 100);
  const timeAgo = formatRelativeTime(order.submittedAt);
  const canEdit = order.status === "PENDING_CONFIRMATION" || order.status === "DRAFT";

  return (
    <div className="rounded-3xl border border-stone-200/80 bg-white/85 p-5 shadow-sm backdrop-blur-sm transition-all hover:shadow-md dark:border-stone-800 dark:bg-stone-900/80 space-y-3">
      {/* Header: Order No & Status Badge */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-base font-black text-stone-900 dark:text-stone-100">
              Order #{order.orderNo}
            </span>
            <span className="text-stone-300 dark:text-stone-700">•</span>
            <span className="text-xs text-stone-500 font-medium">{timeAgo}</span>
          </div>
          <h3 className="mt-1 text-lg font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
            {copy.title}
          </h3>
        </div>

        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${copy.badgeColor}`}
        >
          {order.status.replace("_", " ")}
        </span>
      </div>

      {/* Verification Notice & Customer Edit Button */}
      {canEdit ? (
        <div className="flex items-center justify-between rounded-2xl border border-amber-400/60 bg-amber-50/80 p-3 text-xs dark:bg-amber-950/30 dark:border-amber-800/40">
          <div className="text-amber-900 dark:text-amber-200">
            <span className="font-bold">Pending Confirmation</span>
            <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
              Cashier is verifying. You can edit items now:
            </p>
          </div>
          <Link
            href={`/smol-menu?editOrder=${order.id}`}
            className="rounded-xl bg-[#B72E35] px-3 py-1.5 font-mono text-xs font-bold text-white shadow-xs hover:bg-[#9E242B] active:scale-95 transition"
          >
            Edit Order
          </Link>
        </div>
      ) : (order.status === "CONFIRMED" || order.status === "ACCEPTED" || order.status === "PREPARING") ? (
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-2.5 text-[11px] text-stone-600 dark:bg-stone-800/50 dark:border-stone-700 dark:text-stone-300 font-serif italic text-center">
          Order confirmed. Preparation has started and editing is locked.
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <p className="text-xs leading-relaxed text-stone-600 dark:text-stone-400">
          {copy.subtitle}
        </p>

        {/* Honest ETA Range Badge */}
        {(order.status === "PENDING_CONFIRMATION" ||
          order.status === "CONFIRMED" ||
          order.status === "ACCEPTED" ||
          order.status === "PREPARING") &&
          order.etaMinMinutes &&
          order.etaMaxMinutes && (
            <div className="flex-shrink-0 ml-2 flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-[11px] font-mono font-bold text-amber-700 dark:text-amber-300">
              <Clock className="h-3 w-3" />
              <span>
                {order.etaMinMinutes}–{order.etaMaxMinutes} min
              </span>
            </div>
          )}
      </div>

      {/* 5-Step Visual Stepper */}
      <div className="mt-4 border-t border-stone-100 dark:border-stone-800/80 pt-2">
        <OrderStatusProgress status={order.status} />
      </div>

      {/* Items Toggle & Breakdown */}
      <div className="mt-3 border-t border-stone-100 pt-3 dark:border-stone-800/80">
        <button
          onClick={() => setShowItems((v) => !v)}
          className="flex w-full items-center justify-between text-xs font-semibold text-stone-600 transition hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
        >
          <span>
            {order.items.length} {order.items.length === 1 ? "item" : "items"} (₹{totalRupees})
          </span>
          <span className="text-stone-400">{showItems ? "Hide details ▲" : "Show details ▼"}</span>
        </button>

        {showItems && (
          <div className="mt-3 divide-y divide-stone-100 rounded-2xl bg-stone-50/80 p-3.5 text-xs dark:divide-stone-800 dark:bg-stone-800/40">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-stone-500">{item.qty}x</span>
                  <span className="font-medium text-stone-800 dark:text-stone-200">
                    {item.name}
                  </span>
                </div>
                <span className="font-mono font-semibold text-stone-700 dark:text-stone-300">
                  ₹{Math.round(item.lineSubtotal / 100)}
                </span>
              </div>
            ))}

            <div className="flex items-center justify-between pt-2.5 font-bold text-stone-900 dark:text-stone-100 border-t border-stone-200/60 dark:border-stone-700/60">
              <span>Total</span>
              <span className="font-mono text-sm text-[#9B2C2C] dark:text-[#F6AD55]">
                ₹{totalRupees}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
