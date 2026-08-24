import { redirect } from "next/navigation";
import { requireStaffAuth } from "@/lib/auth/rbac";
import { fetchActiveCashierTablesAction } from "@/app/bill/actions";
import { CashierDashboard } from "@/components/cashier/CashierDashboard";

export const metadata = {
  title: "Cashier Desk & Settlement — smol café",
  description: "POS verification queue and table cash settlement for smol café staff.",
};

export default async function SmolBackdoorCashierPage() {
  const auth = await requireStaffAuth(["cashier", "admin"]);

  if (!auth.authorized) {
    redirect("/smol-backdoor");
  }

  const tables = await fetchActiveCashierTablesAction();

  return <CashierDashboard initialTables={tables} />;
}
