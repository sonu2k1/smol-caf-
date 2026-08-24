"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { Profile } from "@smol-cafe/db";
import type { CustomerHistoricalOrder } from "@/app/account/actions";
import { claimCurrentSessionOrdersAction } from "@/app/account/actions";
import type { LoyaltyAccountDetails } from "@/app/account/loyalty-actions";
import { AuthModal } from "./AuthModal";

import { BottomNavBar } from "@/components/navigation/BottomNavBar";

interface ProfileViewProps {
  initialProfile: Profile | null;
  initialOrders: CustomerHistoricalOrder[];
  initialLoyalty?: LoyaltyAccountDetails;
  activeSession: {
    sessionId: string;
    tableLabel: string;
    locationName: string;
  } | null;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  initialProfile,
  initialOrders,
  initialLoyalty,
  activeSession,
}) => {
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [orders] = useState<CustomerHistoricalOrder[]>(initialOrders);
  const [loyalty] = useState<LoyaltyAccountDetails | undefined>(initialLoyalty);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimMessage, setClaimMessage] = useState<string | null>(null);

  const handleClaimOrders = async () => {
    setIsClaiming(true);
    setClaimMessage(null);

    try {
      const res = await claimCurrentSessionOrdersAction();
      if (res.success) {
        setClaimMessage(res.message || "Orders linked successfully!");
      } else {
        setClaimMessage(res.message || "Could not claim orders.");
      }
    } catch {
      setClaimMessage("Failed to claim orders.");
    } finally {
      setIsClaiming(false);
    }
  };

  const loyaltyBalance = loyalty?.account?.current_balance_cached || 240;

  const rewardCoupons = [
    { title: "Free Pour Over Coffee", cost: 150, icon: "☕" },
    { title: "Free Bun Makkhan", cost: 100, icon: "🧈" },
    { title: "Table Conversation Board", cost: 200, icon: "🧀" },
  ];

  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#1C1917] pb-28 font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-[#E8DFD3]/80 bg-[#F5EFEB]/90 px-4 py-3.5 backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[#1C1917] transition hover:bg-black/5 active:scale-95"
            aria-label="Back to home"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>

          <h1 className="font-serif text-xl font-bold tracking-tight text-[#1C1917]">
            Loyalty &amp; Profile
          </h1>

          <div className="w-9" />
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 pt-4 space-y-4">
        {/* Smol Loyalty Pass Card */}
        <div className="relative overflow-hidden rounded-3xl border-2 border-[#D8CEBF] bg-[#FAF5ED] p-5 shadow-xs">
          <div className="flex items-start justify-between">
            <div>
              <span className="inline-block rounded-full bg-[#EFE7DC] px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#8C7E72] uppercase tracking-wider">
                SMOL REWARDS PASS
              </span>
              <h2 className="font-serif text-xl font-bold text-[#1C1917] mt-1.5">
                {profile?.display_name || "Sonu Singh"}
              </h2>
              <p className="font-serif italic text-xs text-[#786F66]">
                Gold Chai Member • Rishikesh
              </p>
            </div>

            <div className="rounded-2xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-right">
              <span className="block font-mono text-[9px] font-bold uppercase text-amber-800 tracking-wider">
                POINTS
              </span>
              <span className="font-mono text-xl font-extrabold text-amber-900">
                🪙 {loyaltyBalance}
              </span>
            </div>
          </div>

          {/* Points Progress Bar */}
          <div className="mt-4 pt-3 border-t border-[#EADFCF] space-y-1.5">
            <div className="flex justify-between font-mono text-[10px] text-[#786F66]">
              <span>Tier Progress</span>
              <span>240 / 500 pts for Platinum</span>
            </div>
            <div className="h-2 w-full rounded-full bg-[#E8DFD3] overflow-hidden">
              <div className="h-full w-[48%] rounded-full bg-[#A62B34]" />
            </div>
          </div>
        </div>

        {/* Redeemable Rewards Catalog */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-serif text-xs font-bold text-[#1C1917] uppercase tracking-wider">
              Redeem Rewards
            </h3>
            <span className="font-serif italic text-xs text-[#786F66]">
              1 pt per ₹10 spent
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {rewardCoupons.map((coupon) => (
              <div
                key={coupon.title}
                className="rounded-2xl border border-[#E2D7C7] bg-[#FCF8F2] p-3 text-center shadow-xs flex flex-col justify-between"
              >
                <div className="text-2xl">{coupon.icon}</div>
                <p className="font-serif text-[11px] font-bold text-[#1C1917] line-clamp-2 my-1">
                  {coupon.title}
                </p>
                <button
                  type="button"
                  onClick={() => alert(`Redeemed coupon for ${coupon.title}!`)}
                  className="rounded-full bg-[#A62B34] py-1 text-[10px] font-serif font-bold text-white shadow-xs hover:bg-[#91242C]"
                >
                  {coupon.cost} pts
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Staff & Admin Quick Portals */}
        <div className="rounded-2xl border border-[#E2D7C7] bg-[#FAF5ED] p-3.5 space-y-2">
          <span className="block font-serif text-xs font-bold text-[#8C7E72] uppercase tracking-wider px-1">
            Staff &amp; Admin Tools
          </span>
          <div className="grid grid-cols-3 gap-2">
            <Link
              href="/kitchen"
              className="rounded-xl border border-[#D8CEBF] bg-[#FCF8F2] p-2 text-center hover:bg-[#EFE7DC] transition"
            >
              <span className="block text-base">👨‍🍳</span>
              <span className="font-serif text-[11px] font-bold text-[#1C1917]">Kitchen KDS</span>
            </Link>
            <Link
              href="/cashier"
              className="rounded-xl border border-[#D8CEBF] bg-[#FCF8F2] p-2 text-center hover:bg-[#EFE7DC] transition"
            >
              <span className="block text-base">💳</span>
              <span className="font-serif text-[11px] font-bold text-[#1C1917]">Cashier</span>
            </Link>
            <Link
              href="/admin"
              className="rounded-xl border border-[#D8CEBF] bg-[#FCF8F2] p-2 text-center hover:bg-[#EFE7DC] transition"
            >
              <span className="block text-base">⚡</span>
              <span className="font-serif text-[11px] font-bold text-[#1C1917]">Admin Hub</span>
            </Link>
          </div>
        </div>

        {/* Active Session Claim Card (if seated) */}
        {activeSession && (
          <div className="rounded-2xl border border-[#C6DDD0] bg-[#E3EBE4] p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#2A5235]">
                  Seated Table Session
                </span>
                <p className="font-serif text-sm font-bold text-[#1C1917]">
                  Table {activeSession.tableLabel} • {activeSession.locationName}
                </p>
              </div>
              <button
                onClick={handleClaimOrders}
                disabled={isClaiming}
                className="rounded-full bg-[#2A5235] px-3.5 py-1.5 font-serif text-xs font-bold text-white shadow-xs hover:bg-[#1E3B26] active:scale-95 disabled:opacity-50"
              >
                {isClaiming ? "Linking..." : "Claim Orders ✓"}
              </button>
            </div>
            {claimMessage && (
              <p className="mt-2 font-serif text-xs text-[#2A5235]">
                {claimMessage}
              </p>
            )}
          </div>
        )}

        {/* Past Visits & Digital Invoices */}
        <section className="space-y-2.5">
          <h3 className="font-serif text-xs font-bold text-[#1C1917] uppercase tracking-wider px-1">
            Past Invoices &amp; Receipts ({orders.length})
          </h3>

          {orders.length === 0 ? (
            <div className="rounded-2xl border border-[#E2D7C7] bg-[#FCF8F2] p-6 text-center">
              <p className="font-serif text-xs text-[#786F66]">
                No past visit receipts yet. Orders placed at your table will appear here automatically.
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-[#E8DFD3] bg-[#FAF5ED] p-3.5 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#1C1917]">
                      Order #{order.orderNo}
                    </span>
                    <p className="font-serif italic text-[11px] text-[#786F66]">
                      {new Date(order.submittedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-serif font-bold text-sm text-[#9E2A2B]">
                      ₹{order.totalRupees}
                    </span>
                    <span className="block font-mono text-[9px] uppercase font-bold text-emerald-700">
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="border-t border-[#EADFCF] pt-2 space-y-1">
                  {order.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between font-serif text-xs text-[#5C544D]"
                    >
                      <span>
                        <span className="font-mono">{it.qty}x</span> {it.name}
                      </span>
                      <span className="font-mono">₹{it.priceRupees * it.qty}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </section>
      </main>

      {/* Sign-in Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setProfile({
            id: "user",
            display_name: "Sonu Singh",
            phone: "+91 98765 43210",
            email: null,
            avatar_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }}
      />

      {/* Bottom Sticky Navigation */}
      <BottomNavBar />
    </div>
  );
};

