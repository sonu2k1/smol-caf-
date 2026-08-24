import React from "react";
import { getTableSessionCookie } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { TableClientView, type TableItemView } from "@/components/table/TableClientView";

export const metadata = {
  title: "Your Table — smol café",
  description: "View current seated table items, active rounds, and bill summary.",
};

export default async function TableViewPage() {
  const session = await getTableSessionCookie();
  const tableLabel = session?.tableLabel || "01";
  const supabase = createAdminClient();

  let orderItems: TableItemView[] = [];
  let totalPaise = 0;
  let totalItemsCount = 0;
  let guestCount = 2;

  if (session?.sessionId) {
    // 1. Fetch Session details (guest count)
    const { data: sessionData } = await supabase
      .from("table_sessions")
      .select("guest_count")
      .eq("id", session.sessionId)
      .maybeSingle();

    if (sessionData?.guest_count) {
      guestCount = sessionData.guest_count;
    }

    // 2. Fetch Active Orders for this table session
    const { data: orders } = await supabase
      .from("orders")
      .select("id, status")
      .eq("table_session_id", session.sessionId)
      .neq("status", "CANCELLED");

    if (orders && orders.length > 0) {
      const orderIds = orders.map((o) => (o as { id: string }).id);
      const { data: items } = await supabase
        .from("order_items")
        .select("*")
        .in("order_id", orderIds);

      if (items && items.length > 0) {
        orderItems = items.map((it: Record<string, unknown>) => {
          const name = String(it.name_snapshot || it.item_name || "Artisanal Brew");
          let cat = "FOOD";
          const lower = name.toLowerCase();
          if (
            lower.includes("coffee") ||
            lower.includes("pour over") ||
            lower.includes("latte") ||
            lower.includes("espresso") ||
            lower.includes("flat white") ||
            lower.includes("cappuccino") ||
            lower.includes("americano")
          ) {
            cat = "COFFEE";
          } else if (lower.includes("chai") || lower.includes("tea")) {
            cat = "CHAI";
          }

          const qty = Number(it.qty || it.quantity || 1);
          const rawPrice = Number(it.unit_price_snapshot || it.item_price_paise || 0);
          const priceRupees = rawPrice > 500 ? Math.round(rawPrice / 100) : rawPrice;
          const rawSubtotal = Number(it.line_subtotal || it.subtotal_paise || (priceRupees * 100 * qty));
          const subtotalRupees = rawSubtotal > 500 ? Math.round(rawSubtotal / 100) : priceRupees * qty;

          totalPaise += subtotalRupees * 100;
          totalItemsCount += qty;

          return {
            id: String(it.id),
            name,
            category: cat,
            quantity: qty,
            priceRupees,
            subtotalRupees,
            modifier: it.notes ? String(it.notes) : undefined,
          };
        });
      }
    }
  }

  const totalRupees = Math.round(totalPaise / 100);

  return (
    <TableClientView
      currentTableLabel={tableLabel}
      guestCount={guestCount}
      items={orderItems}
      totalRupees={totalRupees}
      totalItemsCount={totalItemsCount}
      hasActiveSession={Boolean(session?.sessionId)}
    />
  );
}
