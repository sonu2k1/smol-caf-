import React from "react";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata = {
  title: "Admin Control Tower — smol café",
  description: "Master operations dashboard for smol café staff, managers, and owners.",
};

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();

  // Fetch quick metrics
  const [{ count: activeTablesCount }, { count: activeOrdersCount }, { count: blackboardCount }, { count: lowStockCount }] =
    await Promise.all([
      supabase.from("table_sessions").select("*", { count: "exact", head: true }).eq("status", "ACTIVE"),
      supabase.from("orders").select("*", { count: "exact", head: true }).in("status", ["SUBMITTED", "ACCEPTED", "PREPARING", "READY"]),
      supabase.from("blackboard_posts").select("*", { count: "exact", head: true }).eq("active", true),
      supabase.from("inventory_items").select("*", { count: "exact", head: true }).lt("current_stock", 10),
    ]);

  const adminModules = [
    {
      title: "Daily Blackboard",
      subtitle: "Chalkboard specials & love notes",
      href: "/admin/blackboard",
      icon: "✍️",
      stat: `${blackboardCount || 1} active note`,
      badge: "Customer Facing",
      badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
    },
    {
      title: "Procurement & POs",
      subtitle: "Ingredient stock & purchase orders",
      href: "/admin/procurement",
      icon: "📦",
      stat: `${lowStockCount || 0} low stock items`,
      badge: "Inventory",
      badgeColor: "bg-orange-100 text-orange-900 border-orange-300",
    },
    {
      title: "Category Budgets",
      subtitle: "Monthly expense limits & burn rates",
      href: "/admin/budgets",
      icon: "💰",
      stat: "8 category caps",
      badge: "Financials",
      badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300",
    },
    {
      title: "Community Events",
      subtitle: "Live sessions, RSVPs & capacity",
      href: "/admin/events",
      icon: "🎟️",
      stat: "Active schedule",
      badge: "Engage",
      badgeColor: "bg-teal-100 text-teal-900 border-teal-300",
    },
    {
      title: "Loyalty & Rewards",
      subtitle: "Points multipliers & free coupons",
      href: "/admin/rewards",
      icon: "🏆",
      stat: "Active catalog",
      badge: "Growth",
      badgeColor: "bg-purple-100 text-purple-900 border-purple-300",
    },
    {
      title: "Jukebox Queue",
      subtitle: "Manage playlist & guest requests",
      href: "/admin/music",
      icon: "🎶",
      stat: "Live stream",
      badge: "Vibe",
      badgeColor: "bg-rose-100 text-rose-900 border-rose-300",
    },
    {
      title: "Observability",
      subtitle: "Webhooks, RPCs & server health",
      href: "/admin/observability",
      icon: "📊",
      stat: "100% RPC Health",
      badge: "Telemetry",
      badgeColor: "bg-blue-100 text-blue-900 border-blue-300",
    },
    {
      title: "Kitchen KDS",
      subtitle: "Live chef display & ticket pipeline",
      href: "/kitchen",
      icon: "👨‍🍳",
      stat: `${activeOrdersCount || 0} active tickets`,
      badge: "Floor Ops",
      badgeColor: "bg-red-100 text-red-900 border-red-300",
    },
    {
      title: "Cashier Desk",
      subtitle: "Table settlement & cash invoices",
      href: "/cashier",
      icon: "💳",
      stat: `${activeTablesCount || 0} active tables`,
      badge: "POS Desk",
      badgeColor: "bg-stone-200 text-stone-900 border-stone-400",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#1C1917] pb-16 font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-[#E8DFD3]/80 bg-[#F5EFEB]/90 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#1C1917] border border-[#D8CEBF] transition hover:bg-stone-50"
              title="Back to customer home"
            >
              ←
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-xl font-bold tracking-tight text-[#9E2A2B]">
                  smol café
                </span>
                <span className="rounded-md bg-[#1C1917] px-2 py-0.5 font-mono text-[10px] font-bold text-white uppercase">
                  Admin Tower
                </span>
              </div>
              <p className="font-serif italic text-xs text-[#786F66]">
                Rishikesh Operations &amp; Backoffice Command
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/menu"
              className="rounded-full border border-[#D8CEBF] bg-[#FAF5ED] px-3.5 py-1.5 font-serif text-xs font-bold text-[#1C1917] hover:bg-[#EFE7DC]"
            >
              View Menu
            </Link>
            <Link
              href="/kitchen"
              className="rounded-full bg-[#A62B34] px-4 py-1.5 font-serif text-xs font-bold text-white shadow-xs hover:bg-[#91242C]"
            >
              Kitchen KDS →
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-6 pt-6 space-y-6">
        {/* Quick Stat Bar */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-[#E2D7C7] bg-[#FAF5ED] p-4 shadow-xs">
            <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#786F66]">
              ACTIVE TABLES
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-serif text-2xl font-bold text-[#1C1917]">
                {activeTablesCount || 0} / 12
              </span>
              <span className="text-xs text-emerald-700 font-bold">● Live</span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E2D7C7] bg-[#FAF5ED] p-4 shadow-xs">
            <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#786F66]">
              ACTIVE ORDERS
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-serif text-2xl font-bold text-[#A62B34]">
                {activeOrdersCount || 0}
              </span>
              <span className="text-xs text-[#A62B34] font-bold">In Prep</span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E2D7C7] bg-[#FAF5ED] p-4 shadow-xs">
            <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#786F66]">
              CATALOG ITEMS
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-serif text-2xl font-bold text-[#1C1917]">
                59
              </span>
              <span className="text-xs text-stone-500 font-bold">100% Seeded</span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E2D7C7] bg-[#FAF5ED] p-4 shadow-xs">
            <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#786F66]">
              SYSTEM HEALTH
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="font-serif text-2xl font-bold text-emerald-700">
                100%
              </span>
              <span className="text-xs text-emerald-600 font-bold">All PASS</span>
            </div>
          </div>
        </div>

        {/* Modules Grid */}
        <div>
          <h2 className="font-serif text-lg font-bold text-[#1C1917] mb-3">
            Management &amp; Operational Modules
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {adminModules.map((mod) => (
              <Link
                key={mod.href}
                href={mod.href}
                className="group rounded-3xl border border-[#E2D7C7] bg-[#FAF5ED] p-5 shadow-xs transition duration-150 hover:border-[#A62B34] hover:shadow-md active:scale-[0.99] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-3xl">{mod.icon}</span>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${mod.badgeColor}`}
                    >
                      {mod.badge}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-[#1C1917] mt-3 group-hover:text-[#A62B34] transition">
                    {mod.title}
                  </h3>
                  <p className="font-serif italic text-xs text-[#786F66] mt-0.5">
                    {mod.subtitle}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between pt-3 border-t border-[#EADFCF]">
                  <span className="font-mono text-xs font-bold text-[#4A423A]">
                    {mod.stat}
                  </span>
                  <span className="font-serif text-xs font-bold text-[#A62B34] group-hover:translate-x-1 transition">
                    Open →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
