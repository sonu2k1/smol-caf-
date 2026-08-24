import Link from "next/link";
import { fetchActiveBlackboardPostAction } from "@/app/admin/blackboard/actions";
import { fetchUpcomingEventsAction } from "@/app/events/actions";
import { BlackboardCard } from "@/components/blackboard/BlackboardCard";
import { WhatsOnCard } from "@/components/events/WhatsOnCard";

export const metadata = {
  title: "smol café — Artisanal Chai, Coffee & Buns",
  description: "Modern POS and dine-in mobile ordering for smol café.",
};

export default async function HomePage() {
  const [activePost, { events }] = await Promise.all([
    fetchActiveBlackboardPostAction(),
    fetchUpcomingEventsAction(),
  ]);

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-[#1C1917] pb-24 dark:bg-[#141211] dark:text-[#FDFBF7]">
      {/* Top Header */}
      <header className="border-b border-stone-200/80 bg-white/70 px-4 py-4 backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/60">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight text-[#9B2C2C] dark:text-[#F6AD55]">
              smol café
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/profile"
              className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-bold text-stone-600 transition hover:bg-stone-100 dark:border-stone-800 dark:bg-stone-800 dark:text-stone-300"
            >
              Account 👤
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-lg px-4 pt-6 space-y-6">
        {/* Hero Welcome Banner */}
        <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900 text-center space-y-3">
          <span className="inline-block rounded-2xl bg-amber-50 p-3 text-3xl dark:bg-amber-950/40">
            ☕
          </span>
          <h1 className="text-2xl font-black tracking-tight text-stone-900 dark:text-stone-100">
            Welcome to smol café
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-400 max-w-xs mx-auto">
            Scan your table QR code to browse our 59-item menu, place orders, track kitchen prep,
            and earn loyalty points.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/menu"
              className="rounded-2xl bg-[#9B2C2C] px-6 py-3 text-xs font-bold text-white shadow-md transition hover:bg-[#822424] active:scale-95 dark:bg-[#C53030]"
            >
              Browse Full Menu →
            </Link>
          </div>
        </div>

        {/* Live Admin-Editable Blackboard Daily Specials */}
        <BlackboardCard post={activePost} />

        {/* What's On Community Events */}
        <WhatsOnCard initialEvents={events} />

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-2 gap-3 text-xs font-bold">
          <Link
            href="/orders"
            className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-900 dark:hover:bg-stone-800"
          >
            <span>Live Order Status</span>
            <span className="text-stone-400">→</span>
          </Link>
          <Link
            href="/bill"
            className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-900 dark:hover:bg-stone-800"
          >
            <span>Table Bill & Checkout</span>
            <span className="text-stone-400">→</span>
          </Link>
          <Link
            href="/kitchen"
            className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-900 dark:hover:bg-stone-800"
          >
            <span>Kitchen Display (KDS)</span>
            <span className="text-stone-400">→</span>
          </Link>
          <Link
            href="/cashier"
            className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-900 dark:hover:bg-stone-800"
          >
            <span>Cashier POS</span>
            <span className="text-stone-400">→</span>
          </Link>
          <Link
            href="/music"
            className="col-span-2 flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-sm transition hover:bg-amber-100/60 dark:border-amber-900/40 dark:bg-amber-950/20 dark:hover:bg-amber-950/40"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-lg">🎵</span>
              <div>
                <span className="text-xs font-bold text-amber-950 dark:text-amber-200">
                  Smol Jukebox
                </span>
                <p className="text-[10px] text-amber-800/80 dark:text-amber-400 font-medium">
                  Request songs & upvote the live queue
                </p>
              </div>
            </div>
            <span className="text-amber-800 dark:text-amber-400">→</span>
          </Link>
        </div>

        {/* Admin Shortcuts */}
        <div className="rounded-2xl border border-dashed border-stone-300 p-4 text-center dark:border-stone-800 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
            Admin Management
          </span>
          <div className="flex flex-wrap justify-center gap-3 text-xs font-semibold">
            <Link
              href="/admin/music"
              className="text-[#9B2C2C] hover:underline dark:text-[#F6AD55]"
            >
              Jukebox DJ 🎧
            </Link>
            <span className="text-stone-300 dark:text-stone-700">•</span>
            <Link
              href="/admin/events"
              className="text-[#9B2C2C] hover:underline dark:text-[#F6AD55]"
            >
              Events 🎪
            </Link>
            <span className="text-stone-300 dark:text-stone-700">•</span>
            <Link
              href="/admin/blackboard"
              className="text-[#9B2C2C] hover:underline dark:text-[#F6AD55]"
            >
              Blackboard 📌
            </Link>
            <span className="text-stone-300 dark:text-stone-700">•</span>
            <Link
              href="/admin/rewards"
              className="text-[#9B2C2C] hover:underline dark:text-[#F6AD55]"
            >
              Rewards 🎁
            </Link>
            <span className="text-stone-300 dark:text-stone-700">•</span>
            <Link
              href="/admin/procurement"
              className="text-[#9B2C2C] hover:underline dark:text-[#F6AD55]"
            >
              Procurement 📦
            </Link>
            <span className="text-stone-300 dark:text-stone-700">•</span>
            <Link
              href="/admin/budgets"
              className="text-[#9B2C2C] hover:underline dark:text-[#F6AD55]"
            >
              Budgets & Spend 📊
            </Link>
            <span className="text-stone-300 dark:text-stone-700">•</span>
            <Link
              href="/admin/observability"
              className="text-[#9B2C2C] hover:underline dark:text-[#F6AD55]"
            >
              Observability 📡
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
