'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { customerStore } from '@/lib/customer-store';
import { APP_CONFIG } from '@/lib/config';
import { CreditCard, QrCode, Wallet, ShieldCheck, CheckCircle2, Coffee, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PaymentPage() {
  const router = useRouter();
  const [subtotal, setSubtotal] = useState(700);
  const [taxes, setTaxes] = useState(42);
  const [grandTotal, setGrandTotal] = useState(742);
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'wallet'>('upi');
  const [processing, setProcessing] = useState(false);
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

  const handlePayNow = () => {
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
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="px-5 py-10 space-y-6 text-center animate-in zoom-in-95 duration-300 min-h-[80vh] flex flex-col items-center justify-center">
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

        <div className="bg-brand-cremeMuted dark:bg-brand-espressoLight border border-brand-biscuit/50 dark:border-brand-espressoCard rounded-2xl p-4 w-full max-w-xs text-center space-y-1">
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
            className="w-full py-3.5 px-6 rounded-full bg-brand-cherry dark:bg-brand-cherryGlow text-white font-sans text-sm font-semibold shadow-neonCherry hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Track Order Status</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-6 animate-in fade-in duration-300 relative pb-28">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-brand-biscuit/30 dark:border-brand-espressoCard pb-3">
        <div>
          <span className="font-mono text-[10px] text-brand-cherry dark:text-brand-butter uppercase tracking-widest block">
            6. payment / settle up
          </span>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-brand-espresso dark:text-brand-creme lowercase">
            Settle Up
          </h2>
        </div>
      </div>

      {/* Coffee Receipt Header Graphic */}
      <div className="bg-brand-cremeMuted dark:bg-brand-espressoLight border border-brand-biscuit/50 dark:border-brand-espressoCard rounded-2xl p-5 text-center space-y-2 shadow-sm relative overflow-hidden flex flex-col items-center">
        <img
          src="/logo-transparent.png"
          alt="smol café official logo (day)"
          className="h-14 w-auto object-contain drop-shadow-md hover:scale-105 transition-transform dark:hidden"
        />
        <img
          src="/logo-dark-transparent.png"
          alt="smol café official logo (night)"
          className="h-14 w-auto object-contain drop-shadow-[0_0_12px_rgba(117,76,255,0.7)] hover:scale-105 transition-transform hidden dark:block"
        />

        <h3 className="font-serif text-xl italic font-semibold text-brand-espresso dark:text-brand-creme">
          Good things deserve good pauses.
        </h3>
        <p className="font-serif italic text-xs text-brand-walnut dark:text-brand-biscuit">
          Here&apos;s your bill for Table 07.
        </p>
      </div>

      {/* Bill Itemized Breakdown */}
      <div className="p-4 rounded-2xl bg-brand-creme dark:bg-brand-espressoLight border border-brand-biscuit/40 dark:border-brand-espressoCard space-y-2.5 shadow-sm">
        <div className="flex items-center justify-between text-xs font-sans text-brand-espresso dark:text-brand-creme">
          <span>Items Total</span>
          <span className="font-mono font-semibold">{APP_CONFIG.defaultCurrency}{subtotal}</span>
        </div>

        <div className="flex items-center justify-between text-xs font-sans text-brand-walnut dark:text-brand-biscuit">
          <span>Taxes & Charges (6%)</span>
          <span className="font-mono font-semibold">{APP_CONFIG.defaultCurrency}{taxes}</span>
        </div>

        <div className="border-t border-dashed border-brand-biscuit/40 dark:border-brand-espressoCard pt-2 flex items-center justify-between text-base font-bold text-brand-espresso dark:text-brand-creme">
          <span className="font-serif">Grand Total</span>
          <span className="font-mono text-xl text-brand-cherry dark:text-brand-butter">
            {APP_CONFIG.defaultCurrency}{grandTotal}
          </span>
        </div>
      </div>

      {/* Payment Options Selection */}
      <div className="space-y-3">
        <span className="font-mono text-[10px] text-brand-walnut dark:text-brand-biscuit uppercase tracking-wider block">
          select payment method
        </span>

        <div className="space-y-2">
          {/* UPI */}
          <button
            onClick={() => setSelectedMethod('upi')}
            className={`w-full p-3.5 rounded-2xl border flex items-center justify-between text-left transition-all ${
              selectedMethod === 'upi'
                ? 'bg-brand-cherry/10 dark:bg-brand-cherry/20 border-brand-cherry shadow-sm'
                : 'bg-brand-creme dark:bg-brand-espressoLight border-brand-biscuit/40 dark:border-brand-espressoCard'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-500 flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-sans font-semibold text-xs text-brand-espresso dark:text-brand-creme">
                  UPI
                </h4>
                <p className="text-[11px] text-brand-walnut dark:text-brand-biscuit">
                  Pay with GPay, PhonePe, Paytm or any UPI app
                </p>
              </div>
            </div>
            <span className="font-mono text-xs text-brand-cherry font-bold">
              {selectedMethod === 'upi' ? '●' : '○'}
            </span>
          </button>

          {/* CARD */}
          <button
            onClick={() => setSelectedMethod('card')}
            className={`w-full p-3.5 rounded-2xl border flex items-center justify-between text-left transition-all ${
              selectedMethod === 'card'
                ? 'bg-brand-cherry/10 dark:bg-brand-cherry/20 border-brand-cherry shadow-sm'
                : 'bg-brand-creme dark:bg-brand-espressoLight border-brand-biscuit/40 dark:border-brand-espressoCard'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-500 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-sans font-semibold text-xs text-brand-espresso dark:text-brand-creme">
                  Card
                </h4>
                <p className="text-[11px] text-brand-walnut dark:text-brand-biscuit">
                  Visa, MasterCard, Rupay, Amex
                </p>
              </div>
            </div>
            <span className="font-mono text-xs text-brand-cherry font-bold">
              {selectedMethod === 'card' ? '●' : '○'}
            </span>
          </button>

          {/* WALLETS */}
          <button
            onClick={() => setSelectedMethod('wallet')}
            className={`w-full p-3.5 rounded-2xl border flex items-center justify-between text-left transition-all ${
              selectedMethod === 'wallet'
                ? 'bg-brand-cherry/10 dark:bg-brand-cherry/20 border-brand-cherry shadow-sm'
                : 'bg-brand-creme dark:bg-brand-espressoLight border-brand-biscuit/40 dark:border-brand-espressoCard'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-sans font-semibold text-xs text-brand-espresso dark:text-brand-creme">
                  Wallets
                </h4>
                <p className="text-[11px] text-brand-walnut dark:text-brand-biscuit">
                  PhonePe, Paytm, Amazon Pay
                </p>
              </div>
            </div>
            <span className="font-mono text-xs text-brand-cherry font-bold">
              {selectedMethod === 'wallet' ? '●' : '○'}
            </span>
          </button>
        </div>
      </div>

      {/* 100% Secure Badge */}
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-brand-walnut dark:text-brand-biscuit font-mono pt-1">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>100% Secure Payments</span>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-14 left-0 right-0 max-w-md mx-auto p-3 bg-brand-creme/95 dark:bg-brand-espresso/95 backdrop-blur border-t border-brand-biscuit/30 dark:border-brand-espressoCard z-40">
        <button
          onClick={handlePayNow}
          disabled={processing}
          className="w-full py-3.5 px-6 rounded-full bg-brand-cherry dark:bg-brand-cherryGlow text-white font-sans text-sm font-semibold shadow-neonCherry hover:scale-[1.01] active:scale-95 transition-all text-center flex items-center justify-center gap-2"
        >
          {processing ? (
            <span className="font-mono animate-pulse">Processing Payment...</span>
          ) : (
            <span>Pay {APP_CONFIG.defaultCurrency}{grandTotal}</span>
          )}
        </button>
      </div>
    </div>
  );
}
