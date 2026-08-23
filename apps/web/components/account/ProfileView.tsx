"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { Profile } from "@smol-cafe/db";
import type { CustomerHistoricalOrder } from "@/app/account/actions";
import { claimCurrentSessionOrdersAction } from "@/app/account/actions";
import { AuthModal } from "./AuthModal";

interface ProfileViewProps {
  initialProfile: Profile | null;
  initialOrders: CustomerHistoricalOrder[];
  activeSession: {
    sessionId: string;
    tableLabel: string;
    locationName: string;
  } | null;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  initialProfile,
  initialOrders,
  activeSession,
}) => {
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [orders] = useState<CustomerHistoricalOrder[]>(initialOrders);
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

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1C1917] pb-24 dark:bg-[#141211] dark:text-[#FDFBF7]">
      {/* Top Header */}
      <header className="border-b border-stone-200/80 bg-white/70 px-4 py-4 backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/60">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              href="/menu"
              className="rounded-full border border-stone-200 bg-stone-50 p-2 text-stone-600 transition hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-800 dark:text-stone-300"
            >
              ← Menu
            </Link>
            <span className="text-base font-black tracking-tight text-[#9B2C2C] dark:text-[#F6AD55]">
              My Account
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/bill"
              className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-bold text-stone-600 transition hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-800 dark:text-stone-300"
            >
              Live Bill
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pt-6 space-y-6">
        {/* Profile Info Card or Guest Banner */}
        {profile ? (
          <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#9B2C2C]/10 text-lg font-black text-[#9B2C2C] dark:bg-red-950/40 dark:text-[#F6AD55]">
                {profile.display_name ? profile.display_name.charAt(0).toUpperCase() : "☕"}
              </div>
              <div>
                <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  {profile.display_name || "Café Guest"}
                </h2>
                <p className="text-xs text-stone-500 font-mono">
                  {profile.phone || profile.email || "Verified Member"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-stone-200 bg-white p-6 text-center shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-2xl dark:bg-amber-950/40">
              ☕
            </div>
            <h2 className="mt-3 text-base font-bold text-stone-900 dark:text-stone-100">
              Dine as a Guest or Sign In
            </h2>
            <p className="mt-1 text-xs text-stone-500 max-w-xs mx-auto">
              Sign in with mobile OTP to save receipts, view past orders, and claim loyalty rewards.
            </p>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="mt-4 rounded-2xl bg-[#9B2C2C] px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#822424] active:scale-95 dark:bg-[#C53030]"
            >
              Sign In with Mobile OTP →
            </button>
          </div>
        )}

        {/* Active Session Claim Card (if seated) */}
        {activeSession && profile && (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-5 dark:border-emerald-800 dark:bg-emerald-950/30">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                  Seated Right Now
                </span>
                <p className="text-sm font-bold text-stone-900 dark:text-stone-100">
                  Table {activeSession.tableLabel} • {activeSession.locationName}
                </p>
              </div>
              <button
                onClick={handleClaimOrders}
                disabled={isClaiming}
                className="rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-800 active:scale-95 disabled:opacity-50"
              >
                {isClaiming ? "Linking..." : "Claim Orders ✓"}
              </button>
            </div>
            {claimMessage && (
              <p className="mt-3 text-xs font-medium text-emerald-900 dark:text-emerald-300">
                {claimMessage}
              </p>
            )}
          </div>
        )}

        {/* Claimed Orders & Receipts History */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Past Orders & Digital Receipts ({orders.length})
            </h3>
          </div>

          {orders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-stone-300 bg-white/50 p-8 text-center dark:border-stone-800 dark:bg-stone-900/30">
              <p className="text-xs text-stone-500 font-medium">
                No past orders linked to this account yet.
              </p>
              <p className="text-[11px] text-stone-400 mt-1">
                Any orders placed at your table can be claimed within 24 hours of dining.
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-stone-800 dark:text-stone-200">
                      Order #{order.orderNo}
                    </span>
                    <p className="text-[11px] text-stone-400">
                      {new Date(order.submittedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-sm font-black text-[#9B2C2C] dark:text-[#F6AD55]">
                      ₹{order.totalRupees}
                    </span>
                    <span className="block text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="border-t border-stone-100 pt-2 dark:border-stone-800 space-y-1">
                  {order.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between text-xs text-stone-600 dark:text-stone-400"
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
            display_name: "Member",
            phone: null,
            email: null,
            avatar_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }}
      />
    </div>
  );
};
