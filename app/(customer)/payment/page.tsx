'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { customerStore } from '@/lib/customer-store';
import { ChevronLeft, ChevronRight, Lock, CheckCircle2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SettleUpPaymentPage() {
  const router = useRouter();
  const [subtotal, setSubtotal] = useState(700);
  const [taxes, setTaxes] = useState(42);
  const [grandTotal, setGrandTotal] = useState(742);
  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderNo, setOrderNo] = useState('');

  useEffect(() => {
    const total = customerStore.getCartTotal();
    const itemsTotal = total > 0 ? total : 700;
    const taxVal = Math.round(itemsTotal * 0.06);
    setSubtotal(itemsTotal);
    setTaxes(taxVal);
    setGrandTotal(itemsTotal + taxVal);
  }, []);

  const handlePay = (method: string) => {
    setSelectedMethod(method);
    setProcessing(true);

    setTimeout(() => {
      const newOrderNo = customerStore.placeOrder();
      setOrderNo(newOrderNo);
      setProcessing(false);
      setIsSuccess(true);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        // ignore if confetti fails
      }
    }, 1200);
  };

  if (isSuccess) {
    return (
      <div className="px-5 py-10 space-y-6 text-center animate-in zoom-in-95 duration-300 min-h-[85vh] flex flex-col items-center justify-center bg-brand-creme dark:bg-brand-espresso transition-colors">
        <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border-2 border-emerald-500 text-emerald-500 flex items-center justify-center mx-auto shadow-xl">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest">
            payment successful
          </span>
          <h2 className="font-serif text-3xl font-bold text-brand-espresso dark:text-brand-creme">
            Thank you!
          </h2>
          <p className="font-serif italic text-xs text-brand-walnut dark:text-brand-biscuit">
            Good things deserve good pauses.
          </p>
        </div>

        <div className="bg-transparent border border-brand-biscuit/50 dark:border-brand-espressoCard rounded-2xl p-4 w-full max-w-xs text-center space-y-1">
          <span className="text-[10px] font-mono uppercase text-brand-walnut dark:text-brand-biscuit">
            ORDER NUMBER
          </span>
          <h3 className="font-mono text-2xl font-bold text-brand-cherry dark:text-brand-butter">
            {orderNo}
          </h3>
          <p className="text-[11px] font-sans text-brand-walnut dark:text-brand-biscuit pt-1">
            Sent to smol café kitchen • Table 07
          </p>
        </div>

        <div className="w-full max-w-xs space-y-2 pt-2">
          <Link
            href="/order-status"
            className="w-full py-3.5 px-6 rounded-full bg-brand-cherry text-white font-sans text-sm font-semibold shadow-md hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Track Order Status</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 py-4 space-y-4 animate-in fade-in duration-300 relative min-h-[90vh] bg-brand-creme dark:bg-brand-espresso transition-colors max-w-md mx-auto pb-8">
      {/* Header Bar */}
      <div className="relative flex items-center justify-center pb-1 pt-1">
        <button
          onClick={() => router.back()}
          className="absolute left-0 w-8 h-8 rounded-full flex items-center justify-center text-brand-espresso dark:text-brand-creme hover:bg-brand-biscuit/20 transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
        </button>

        <h2 className="font-serif text-2xl font-bold text-brand-espresso dark:text-brand-creme text-center tracking-tight">
          Settle Up
        </h2>
      </div>

      {/* Main Arch Bill Card with double-line contour */}
      <div className="relative w-full rounded-t-[130px] rounded-b-2xl border border-[#D4C3A6] dark:border-brand-espressoCard bg-transparent p-5 space-y-3 shadow-sm overflow-hidden">
        {/* Inner parallel decorative border line */}
        <div
          className="absolute pointer-events-none rounded-t-[126px] rounded-b-xl border border-[#D4C3A6]/40 dark:border-brand-espressoCard/40"
          style={{
            top: '3px',
            left: '3px',
            right: '3px',
            bottom: '3px',
          }}
        />

        {/* Exact Coffee Cup and Bill Illustration from reference */}
        <div className="w-full flex justify-center pt-2 pb-0 relative z-10">
          <img
            src="/exact_coffee_bill_clean.png"
            alt="Coffee cup and bill illustration"
            className="w-48 h-24 object-contain mix-blend-multiply dark:mix-blend-normal pointer-events-none"
          />
        </div>

        {/* Headings */}
        <div className="text-center space-y-1 relative z-10">
          <h3 className="font-serif text-[26px] font-bold text-brand-espresso dark:text-brand-creme leading-tight">
            Good things<br />deserve good pauses.
          </h3>
          <p className="font-serif italic text-sm text-brand-walnut/85 dark:text-brand-biscuit pt-0.5">
            Here&apos;s your bill.
          </p>
        </div>

        {/* Dotted Divider */}
        <div
          className="my-3 relative z-10"
          style={{
            borderBottom: '1.5px dotted #D4C3A6',
          }}
        />

        {/* Bill Breakdown */}
        <div className="space-y-1.5 font-mono text-sm relative z-10">
          <div className="flex items-center justify-between text-brand-walnut dark:text-brand-biscuit">
            <span>Items Total</span>
            <span className="font-semibold">₹{subtotal}</span>
          </div>
          <div className="flex items-center justify-between text-brand-walnut dark:text-brand-biscuit">
            <span>Taxes &amp; Charges</span>
            <span className="font-semibold">₹{taxes}</span>
          </div>
        </div>

        {/* Solid Line & Grand Total */}
        <div className="border-t border-[#D4C3A6]/50 dark:border-brand-espressoCard pt-3 flex items-center justify-between relative z-10">
          <span className="font-serif font-bold text-lg text-[#8B2626] dark:text-brand-butter">
            Grand Total
          </span>
          <span className="font-serif text-3xl font-bold text-[#8B2626] dark:text-brand-butter">
            ₹{grandTotal}
          </span>
        </div>
      </div>

      {/* Payment Options Section (3 Vertical Cards) */}
      <div className="space-y-2.5 pt-1">
        {/* UPI Option */}
        <button
          type="button"
          onClick={() => handlePay('UPI')}
          disabled={processing}
          className="w-full p-3.5 rounded-2xl border border-[#D4C3A6] dark:border-brand-espressoCard bg-transparent hover:bg-brand-biscuit/15 transition-all flex items-center justify-between gap-3 text-left group disabled:opacity-50"
        >
          <div className="flex items-center gap-3">
            {/* Official UPI Icon from vectorlogo.zone */}
            <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
              <img
                src="/upi-icon.svg"
                alt="UPI"
                className="w-7 h-7 object-contain"
              />
            </div>
            <div>
              <h4 className="font-sans font-bold text-sm text-brand-espresso dark:text-brand-creme">
                UPI
              </h4>
              <p className="font-sans text-xs text-brand-walnut/70 dark:text-brand-biscuit">
                Pay with any UPI app
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-brand-walnut/60 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Card Option */}
        <button
          type="button"
          onClick={() => handlePay('Card')}
          disabled={processing}
          className="w-full p-3.5 rounded-2xl border border-[#D4C3A6] dark:border-brand-espressoCard bg-transparent hover:bg-brand-biscuit/15 transition-all flex items-center justify-between gap-3 text-left group disabled:opacity-50"
        >
          <div className="flex items-center gap-3">
            {/* Custom Card Vector SVG */}
            <div className="w-8 h-8 flex items-center justify-center text-brand-espresso dark:text-brand-creme flex-shrink-0">
              <svg
                viewBox="0 0 24 24"
                className="w-6 h-6 text-brand-espresso dark:text-brand-creme"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="5" width="20" height="14" rx="3.5" />
                <line x1="2" y1="9.5" x2="22" y2="9.5" />
                <circle cx="6.5" cy="14.5" r="1.5" />
                <circle cx="15.5" cy="14.5" r="0.75" fill="currentColor" />
                <circle cx="18" cy="14.5" r="0.75" fill="currentColor" />
              </svg>
            </div>
            <div>
              <h4 className="font-sans font-bold text-sm text-brand-espresso dark:text-brand-creme">
                Card
              </h4>
              <p className="font-sans text-xs text-brand-walnut/70 dark:text-brand-biscuit">
                Visa, MasterCard, Rupay
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-brand-walnut/60 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Wallets Option */}
        <button
          type="button"
          onClick={() => handlePay('Wallets')}
          disabled={processing}
          className="w-full p-3.5 rounded-2xl border border-[#D4C3A6] dark:border-brand-espressoCard bg-transparent hover:bg-brand-biscuit/15 transition-all flex items-center justify-between gap-3 text-left group disabled:opacity-50"
        >
          <div className="flex items-center gap-3">
            {/* Custom Wallet Vector SVG */}
            <div className="w-8 h-8 flex items-center justify-center text-brand-espresso dark:text-brand-creme flex-shrink-0">
              <svg
                viewBox="0 0 24 24"
                className="w-6 h-6 text-brand-espresso dark:text-brand-creme"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 8V6a2.5 2.5 0 0 1 2.5-2.5h5A2.5 2.5 0 0 1 17 6v2" />
                <rect x="3" y="8" width="18" height="13" rx="3" />
                <path d="M15 12h4.5a1.5 1.5 0 0 1 1.5 1.5v0a1.5 1.5 0 0 1-1.5 1.5H15a1.5 1.5 0 0 1-1.5-1.5v0a1.5 1.5 0 0 1 1.5-1.5z" />
                <circle cx="15" cy="13.5" r="0.75" fill="currentColor" />
              </svg>
            </div>
            <div>
              <h4 className="font-sans font-bold text-sm text-brand-espresso dark:text-brand-creme">
                Wallets
              </h4>
              <p className="font-sans text-xs text-brand-walnut/70 dark:text-brand-biscuit">
                PhonePe, Paytm, etc.
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-brand-walnut/60 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Security Footer Note */}
      <div className="text-center pt-3 pb-4 flex items-center justify-center gap-1.5 text-xs text-brand-walnut/70 dark:text-brand-biscuit">
        <Lock className="w-3.5 h-3.5" />
        <span>100% Secure Payments</span>
      </div>

      {/* Processing Loader Overlay */}
      {processing && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center animate-in fade-in">
          <div className="bg-brand-creme dark:bg-brand-espresso p-6 rounded-3xl shadow-2xl border border-brand-biscuit/30 text-center space-y-3 max-w-xs mx-4">
            <div className="w-10 h-10 border-3 border-brand-cherry border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="font-serif text-sm font-bold text-brand-espresso dark:text-brand-creme">
              Connecting to {selectedMethod}...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
