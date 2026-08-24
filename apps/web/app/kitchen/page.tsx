import { checkStaffAuthAction, fetchKitchenOrdersAction } from "./actions";
import { KitchenBoardView } from "@/components/kitchen/KitchenBoardView";
import { StaffLoginGate } from "@/components/kitchen/StaffLoginGate";

export const metadata = {
  title: "Kitchen Display (KDS) — smol café",
  description: "Live kitchen display system for smol café chefs and baristas.",
};

export default async function KitchenPage() {
  const isAuthenticated = await checkStaffAuthAction();
  const initialData = await fetchKitchenOrdersAction();

  if (!isAuthenticated) {
    return <StaffLoginGate />;
  }

  return <KitchenBoardView initialOrders={initialData.orders} />;
}
