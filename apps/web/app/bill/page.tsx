import { fetchRunningBillAction } from "./actions";
import { RunningBillView } from "@/components/bill/RunningBillView";

export const metadata = {
  title: "Your Bill — smol café",
  description: "View running bill and request bill check for smol café dining session.",
};

export default async function BillPage() {
  const result = await fetchRunningBillAction();

  return <RunningBillView initialBill={result.bill} hasSession={result.hasSession} />;
}
