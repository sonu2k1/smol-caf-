import { getCurrentUserProfileAction, getCustomerOrderHistoryAction } from "@/app/account/actions";
import { ProfileView } from "@/components/account/ProfileView";

export const metadata = {
  title: "My Account & Receipts — smol café",
  description: "View past orders, digital bills, and claim table dining sessions.",
};

export default async function ProfilePage() {
  const { profile, activeSession } = await getCurrentUserProfileAction();
  const { orders } = await getCustomerOrderHistoryAction();

  return (
    <ProfileView initialProfile={profile} initialOrders={orders} activeSession={activeSession} />
  );
}
