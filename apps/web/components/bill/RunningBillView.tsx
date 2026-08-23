"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { RunningBillDetails } from "@/app/bill/actions";
import { fetchRunningBillAction, requestBillAction } from "@/app/bill/actions";
import { RazorpayPaymentButton } from "./RazorpayPaymentButton";

interface RunningBillViewProps {
  initialBill?: RunningBillDetails;
  hasSession: boolean;
}

export const RunningBillView: React.FC<RunningBillViewProps> = ({ initialBill, hasSession }) => {
  const [bill, setBill] = useState<RunningBillDetails | undefined>(initialBill);
  const [isRequesting, setIsRequesting] = useState(false);
  const [billRequested, setBillRequested] = useState(
    initialBill?.sessionStatus === "PAYMENT_PENDING"
  );
  const [requestMessage, setRequestMessage] = useState<string | null>(null);

  const refreshBill = useCallback(async () => {
    try {
      const result = await fetchRunningBillAction();
      if (result.success && result.bill) {
        setBill(result.bill);
        if (result.bill.sessionStatus === "PAYMENT_PENDING") {
          setBillRequested(true);
        }
      }
    } catch (err) {
      console.error("Failed to refresh bill:", err);
    }
  }, []);

  // Poll bill status every 5s
  useEffect(() => {
    if (!hasSession) return;
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        refreshBill();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [hasSession, refreshBill]);

  const handleRequestBill = async () => {
    setIsRequesting(true);
    setRequestMessage(null);
    try {
      const result = await requestBillAction();
      if (result.success) {
        setBillRequested(true);
        setRequestMessage(result.message || "Bill requested! Staff is on the way.");
      } else {
        setRequestMessage(result.message || "Could not request bill. Please call staff.");
      }
    } finally {
      setIsRequesting(false);
    }
  };

  if (!hasSession || !bill) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FDFBF7] px-6 py-12 text-center text-[#1C1917] dark:bg-[#141211] dark:text-[#FDFBF7]">
        <div className="w-full max-w-md rounded-3xl border border-stone-200/80 bg-white/80 p-8 shadow-xl dark:border-stone-800 dark:bg-stone-900/80">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-3xl">
            🧾
          </div>
          <h2 className="text-2xl font-bold tracking-tight">No Active Session</h2>
          <p className="mt-2 text-xs text-stone-600 dark:text-stone-400">
            Please scan your table QR code to view your dining bill.
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center rounded-xl bg-stone-900 py-3.5 text-sm font-semibold text-white dark:bg-stone-100 dark:text-stone-900"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isClosed = bill.sessionStatus === "CLOSED";
  const subtotalRupees = Math.round(bill.subtotalPaise / 100);
  const taxRupees = Math.round(bill.taxPaise / 100);
  const totalRupees = Math.round(bill.totalPaise / 100);
  const paidRupees = Math.round(bill.paidAmountPaise / 100);
  const balanceDueRupees = Math.round(bill.balanceDuePaise / 100);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1C1917] pb-24 dark:bg-[#141211] dark:text-[#FDFBF7]">
      {/* Header */}
      <header className="border-b border-stone-200/80 bg-white/70 px-4 py-4 backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/60">
        <div className="mx-auto flex max-w-xl items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-[#9B2C2C] dark:text-[#F6AD55]">
                smol café
              </span>
              <span className="text-stone-300 dark:text-stone-700">•</span>
              <span className="text-xs text-stone-500 font-medium">{bill.locationName}</span>
            </div>
            <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">
              Running Bill • Table {bill.tableLabel}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/orders"
              className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-600 dark:border-stone-800 dark:bg-stone-800 dark:text-stone-300"
            >
              Live Status
            </Link>
            <Link
              href="/menu"
              className="rounded-full bg-[#9B2C2C] px-3.5 py-1 text-xs font-semibold text-white dark:bg-[#C53030]"
            >
              + Order
            </Link>
          </div>
        </div>
      </header>

      {/* Main Bill Breakdown */}
      <main className="mx-auto max-w-xl px-4 py-6">
        {/* Settlement Status Banner */}
        {isClosed ? (
          <div className="mb-6 rounded-3xl border border-emerald-300 bg-emerald-50/80 p-5 text-center dark:border-emerald-900/60 dark:bg-emerald-950/40">
            <span className="text-3xl">🎉</span>
            <h3 className="mt-2 text-lg font-bold text-emerald-900 dark:text-emerald-200">
              Bill Paid & Closed
            </h3>
            <p className="mt-1 text-xs text-emerald-800 dark:text-emerald-300">
              Thank you for dining at smol café! We hope you loved your experience.
            </p>
          </div>
        ) : billRequested ? (
          <div className="mb-6 rounded-3xl border border-amber-300 bg-amber-50/80 p-4 text-center dark:border-amber-900/60 dark:bg-amber-950/40">
            <span className="text-2xl">🔔</span>
            <h4 className="mt-1 font-bold text-amber-900 dark:text-amber-200 text-sm">
              Bill Requested
            </h4>
            <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
              Staff has been notified. A server will be right at your table.
            </p>
          </div>
        ) : null}

        {/* Paper Receipt Style Card */}
        <div className="rounded-3xl border border-stone-200/80 bg-white/90 p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900/90">
          <div className="border-b border-stone-200/80 pb-4 text-center dark:border-stone-800">
            <h2 className="font-serif italic text-2xl text-stone-900 dark:text-stone-100">
              smol café
            </h2>
            <p className="mt-1 text-xs text-stone-500 font-mono">
              Table {bill.tableLabel} • {new Date(bill.openedAt).toLocaleDateString()}
            </p>
          </div>

          {/* Rounds List */}
          <div className="my-6 space-y-6 divide-y divide-dashed divide-stone-200 dark:divide-stone-800">
            {bill.rounds.length === 0 ? (
              <p className="py-6 text-center text-xs text-stone-400">
                No orders placed in this session yet.
              </p>
            ) : (
              bill.rounds.map((round, idx) => (
                <div key={round.orderId} className={idx > 0 ? "pt-5" : ""}>
                  <div className="flex items-center justify-between text-xs font-bold text-stone-500 mb-2">
                    <span className="font-mono">
                      Round {idx + 1} (Order #{round.orderNo})
                    </span>
                    <span className="rounded-md bg-stone-100 px-2 py-0.5 text-[10px] uppercase font-bold text-stone-700 dark:bg-stone-800 dark:text-stone-300">
                      {round.status}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {round.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-xs text-stone-800 dark:text-stone-200"
                      >
                        <span className="flex items-center gap-2">
                          <span className="font-mono text-stone-500">{item.qty}x</span>
                          <span className="font-medium">{item.name}</span>
                        </span>
                        <span className="font-mono font-semibold">
                          ₹{Math.round(item.lineSubtotal / 100)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Financial Summary */}
          <div className="border-t-2 border-stone-900 pt-4 dark:border-stone-100 font-mono text-xs space-y-2">
            <div className="flex justify-between text-stone-600 dark:text-stone-400">
              <span>Subtotal</span>
              <span>₹{subtotalRupees}</span>
            </div>

            {taxRupees > 0 && (
              <div className="flex justify-between text-stone-600 dark:text-stone-400">
                <span>Taxes</span>
                <span>₹{taxRupees}</span>
              </div>
            )}

            <div className="flex justify-between text-base font-black text-stone-900 dark:text-stone-100 pt-2 border-t border-stone-200 dark:border-stone-800">
              <span>Total Bill</span>
              <span className="text-[#9B2C2C] dark:text-[#F6AD55]">₹{totalRupees}</span>
            </div>

            {paidRupees > 0 && (
              <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-semibold pt-1">
                <span>Amount Paid</span>
                <span>₹{paidRupees}</span>
              </div>
            )}

            {!isClosed && (
              <div className="flex justify-between text-sm font-bold text-stone-800 dark:text-stone-200 pt-1">
                <span>Balance Due</span>
                <span>₹{balanceDueRupees}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons: Pay Online via Razorpay OR Request Cash Bill */}
        {!isClosed && (
          <div className="mt-6 space-y-3">
            {requestMessage && (
              <p className="text-center text-xs font-semibold text-stone-700 dark:text-stone-300">
                {requestMessage}
              </p>
            )}

            {/* Primary Action: Instant Online Payment via UPI / Cards */}
            <RazorpayPaymentButton
              tableSessionId={bill.sessionId}
              tableLabel={bill.tableLabel}
              totalRupees={balanceDueRupees}
              onSuccess={refreshBill}
            />

            <div className="relative my-2 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200 dark:border-stone-800" />
              </div>
              <span className="relative bg-[#FDFBF7] px-3 text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:bg-[#141211]">
                or pay cash
              </span>
            </div>

            {/* Secondary Action: Request Cash Bill */}
            <button
              onClick={handleRequestBill}
              disabled={isRequesting || billRequested || totalRupees === 0}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl border py-3.5 text-xs font-bold transition active:scale-[0.98] disabled:opacity-60 ${
                billRequested
                  ? "border-amber-600 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                  : "border-stone-300 bg-white text-stone-700 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
              }`}
            >
              {isRequesting
                ? "Requesting Staff..."
                : billRequested
                  ? "✓ Cash Bill Requested (Staff Alerted)"
                  : "Pay Cash at Table (Request Bill) →"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
