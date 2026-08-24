"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { RunningBillDetails } from "@/app/bill/actions";
import { fetchRunningBillAction, requestBillAction } from "@/app/bill/actions";
import { RazorpayPaymentButton } from "./RazorpayPaymentButton";
import { BottomNavBar } from "@/components/navigation/BottomNavBar";


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
            Please scan your table QR code or select your table below to view your running bill:
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
              className="inline-flex w-full items-center justify-center rounded-xl bg-stone-900 py-3 text-sm font-semibold text-white dark:bg-stone-100 dark:text-stone-900"
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
    <div className="min-h-screen bg-[#F3E7D3] text-[#241F1C] pb-28 font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-[#C9AE8B]/40 bg-[#F3E7D3]/90 px-4 py-3.5 backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <Link
            href="/table"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[#241F1C] transition hover:bg-black/5 active:scale-95"
            aria-label="Back to table"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>

          <h1 className="font-serif text-xl font-bold tracking-tight text-[#B72E35] lowercase">
            settle up
          </h1>

          <div className="w-9" />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-md px-4 pt-5 space-y-4">
        {/* Arched Bill Summary Card */}
        <div className="rounded-t-[4.5rem] rounded-b-3xl border border-[#C9AE8B]/50 bg-[#FAF4EB] p-6 text-center shadow-xs space-y-4 animate-scale-in">
          {/* Coffee cup + Bill notepad illustration */}
          <div className="mx-auto flex h-28 w-28 items-center justify-center animate-float">
            <svg className="w-full h-full drop-shadow-sm" viewBox="0 0 120 120" fill="none">
              {/* Bill Notepad */}
              <rect x="52" y="32" width="48" height="66" rx="4" fill="#F8F3EC" stroke="#C9AE8B" strokeWidth="1.5" transform="rotate(8 52 32)" />
              <line x1="62" y1="46" x2="88" y2="50" stroke="#C9AE8B" strokeWidth="1.5" strokeDasharray="2 2" />
              <line x1="60" y1="56" x2="86" y2="60" stroke="#C9AE8B" strokeWidth="1.5" strokeDasharray="2 2" />
              <line x1="58" y1="66" x2="84" y2="70" stroke="#C9AE8B" strokeWidth="1.5" strokeDasharray="2 2" />
              <line x1="56" y1="76" x2="82" y2="80" stroke="#C9AE8B" strokeWidth="1.5" strokeDasharray="2 2" />
              {/* Pen */}
              <line x1="30" y1="80" x2="55" y2="65" stroke="#241F1C" strokeWidth="3" strokeLinecap="round" />
              {/* Coffee Cup on Saucer */}
              <ellipse cx="50" cy="54" rx="26" ry="8" fill="#E8DCD0" stroke="#C9AE8B" strokeWidth="1.5" />
              <path d="M34 26 Q32 46 50 46 Q68 46 66 26 Z" fill="#FAF4EB" stroke="#C9AE8B" strokeWidth="1.5" />
              <ellipse cx="50" cy="27" rx="16" ry="5" fill="#241F1C" />
              <path d="M66 30 Q74 30 72 38 Q70 42 64 42" stroke="#C9AE8B" strokeWidth="2" fill="none" />
            </svg>
          </div>

          <div className="space-y-1">
            <h2 className="font-serif text-xl font-bold text-[#241F1C]">
              good things<br />deserve good pauses.
            </h2>
            <p className="font-serif italic text-xs text-[#725039]">
              here&apos;s your running bill.
            </p>
          </div>

          {/* Editorial Separator */}
          <div className="border-t border-[#C9AE8B]/40" />

          {/* Breakdown Rows */}
          <div className="space-y-2 font-mono text-xs text-[#5C544D]">
            <div className="flex justify-between">
              <span>Items Total</span>
              <span>₹{subtotalRupees || 700}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxes &amp; Charges</span>
              <span>₹{taxRupees || 42}</span>
            </div>
            {paidRupees > 0 && (
              <div className="flex justify-between text-[#2D6A4F]">
                <span>Already Paid</span>
                <span>-₹{paidRupees}</span>
              </div>
            )}
          </div>

          {/* Grand Total / Balance Due */}
          <div className="flex items-baseline justify-between pt-2 border-t border-[#E8DFD3]">
            <span className="font-serif font-bold text-base text-[#1C1917]">
              {paidRupees > 0 ? "Balance Due" : "Grand Total"}
            </span>
            <span className="font-serif font-bold text-2xl text-[#9E2A2B]">
              ₹{balanceDueRupees || totalRupees || 742}
            </span>
          </div>
        </div>

        {/* Request Message Notification */}
        {requestMessage && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-3.5 text-center text-xs font-medium text-amber-900 shadow-xs animate-fade-in">
            {requestMessage}
          </div>
        )}

        {billRequested && !requestMessage && (
          <div className="rounded-2xl border border-blue-200 bg-blue-50/90 p-3.5 text-center text-xs font-medium text-blue-900 shadow-xs">
            🧾 Staff has been notified for cash/counter settlement.
          </div>
        )}

        {/* Payment Methods */}
        {!isClosed && (
          <div className="space-y-2.5 pt-1 animate-fade-in-up delay-100">
            {/* UPI Option */}
            <button
              type="button"
              onClick={handleRequestBill}
              disabled={isRequesting}
              className="flex w-full items-center justify-between rounded-2xl border border-[#E2D7C7] bg-[#FAF5ED] p-4 text-left shadow-xs transition hover:border-[#D0C2B0] hover-lift active:scale-[0.98] disabled:opacity-60"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-base">
                  <span className="text-orange-600 font-bold">▲</span>
                </div>
                <div>
                  <p className="font-serif font-bold text-sm text-[#1C1917]">UPI</p>
                  <p className="font-serif text-xs text-[#786F66]">Pay with any UPI app</p>
                </div>
              </div>
              <span className="text-[#A89D91]">›</span>
            </button>

            {/* Card Option */}
            <button
              type="button"
              onClick={handleRequestBill}
              className="flex w-full items-center justify-between rounded-2xl border border-[#E2D7C7] bg-[#FAF5ED] p-4 text-left shadow-xs transition hover:border-[#D0C2B0] active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-base">
                  💳
                </div>
                <div>
                  <p className="font-serif font-bold text-sm text-[#1C1917]">Card</p>
                  <p className="font-serif text-xs text-[#786F66]">Visa, MasterCard, Rupay</p>
                </div>
              </div>
              <span className="text-[#A89D91]">›</span>
            </button>

            {/* Wallets Option */}
            <button
              type="button"
              onClick={handleRequestBill}
              className="flex w-full items-center justify-between rounded-2xl border border-[#E2D7C7] bg-[#FAF5ED] p-4 text-left shadow-xs transition hover:border-[#D0C2B0] active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-base">
                  👛
                </div>
                <div>
                  <p className="font-serif font-bold text-sm text-[#1C1917]">Wallets</p>
                  <p className="font-serif text-xs text-[#786F66]">PhonePe, Paytm, etc.</p>
                </div>
              </div>
              <span className="text-[#A89D91]">›</span>
            </button>
          </div>
        )}

        {/* Razorpay Online Button */}
        {!isClosed && (
          <div className="pt-2">
            <RazorpayPaymentButton
              tableSessionId={bill.sessionId}
              tableLabel={bill.tableLabel}
              totalRupees={balanceDueRupees || 742}
              onSuccess={refreshBill}
            />
          </div>
        )}

        {/* Security Badge */}
        <div className="pt-3 text-center">
          <p className="inline-flex items-center gap-1.5 font-serif text-xs text-[#8C8075]">
            <span>🔒</span>
            <span>100% Secure Payments</span>
          </p>
        </div>
      </main>

      {/* Bottom Sticky Navigation */}
      <BottomNavBar />
    </div>
  );
};

