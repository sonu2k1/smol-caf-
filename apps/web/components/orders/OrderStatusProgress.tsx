"use client";

import React from "react";
import type { OrderStatus } from "@smol-cafe/db";

interface OrderStatusProgressProps {
  status: OrderStatus;
}

const STEPS: { key: OrderStatus; label: string; icon: string }[] = [
  { key: "PENDING_CONFIRMATION", label: "Verification", icon: "⏳" },
  { key: "CONFIRMED", label: "Confirmed", icon: "✓" },
  { key: "PREPARING", label: "Preparing", icon: "🍳" },
  { key: "READY", label: "Ready", icon: "🔔" },
  { key: "SERVED", label: "Served", icon: "✨" },
];

function getStepIndex(status: OrderStatus): number {
  switch (status) {
    case "DRAFT":
    case "PENDING_CONFIRMATION":
    case "SUBMITTED":
      return 0;
    case "CONFIRMED":
    case "ACCEPTED":
      return 1;
    case "PREPARING":
      return 2;
    case "READY":
      return 3;
    case "COMPLETED":
    case "SERVED":
    case "CLOSED":
      return 4;
    case "CANCELLED":
    case "REJECTED":
      return -1;
    default:
      return 0;
  }
}

export const OrderStatusProgress: React.FC<OrderStatusProgressProps> = ({ status }) => {
  const currentIndex = getStepIndex(status);
  const isCancelled = status === "CANCELLED" || status === "REJECTED";

  if (isCancelled) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/80 p-3.5 text-center text-xs font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
        ❌ Order {status.toLowerCase()} by café staff.
      </div>
    );
  }

  return (
    <div className="w-full py-3">
      <div className="relative flex items-center justify-between">
        {/* Background connector line */}
        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-stone-200 dark:bg-stone-800 -z-0" />
        {/* Progress fill line */}
        <div
          className="absolute left-4 top-1/2 -translate-y-1/2 h-1 bg-[#9B2C2C] transition-all duration-500 -z-0 dark:bg-[#F6AD55]"
          style={{
            width: `${(Math.min(currentIndex, STEPS.length - 1) / (STEPS.length - 1)) * 90}%`,
          }}
        />

        {STEPS.map((step, idx) => {
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                  isCurrent
                    ? "bg-[#9B2C2C] text-white ring-4 ring-red-100 scale-110 shadow-md dark:bg-[#C53030] dark:ring-red-950/60"
                    : isDone
                      ? "bg-[#9B2C2C] text-white dark:bg-[#C53030]"
                      : "bg-white text-stone-400 border border-stone-300 dark:bg-stone-900 dark:border-stone-700 dark:text-stone-500"
                }`}
              >
                {isCurrent ? step.icon : isDone ? "✓" : idx + 1}
              </div>
              <span
                className={`mt-1.5 text-[10px] tracking-tight font-medium ${
                  isCurrent
                    ? "font-bold text-[#9B2C2C] dark:text-[#F6AD55]"
                    : isDone
                      ? "text-stone-800 dark:text-stone-200"
                      : "text-stone-400 dark:text-stone-600"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
