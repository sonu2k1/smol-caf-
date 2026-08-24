import { fetchActiveCashierTablesAction } from "@/app/bill/actions";
import { CashierDashboard } from "@/components/cashier/CashierDashboard";

export const metadata = {
  title: "Cashier & Settlement — smol café",
  description: "POS cash settlement and table session closer for smol café staff.",
};

export default async function CashierPage() {
  const tables = await fetchActiveCashierTablesAction();

  return <CashierDashboard initialTables={tables} />;
}
