import { redirect } from "next/navigation";
import { requireStaffAuth } from "@/lib/auth/rbac";
import AdminDashboardPage from "@/app/admin/page";

export const metadata = {
  title: "Admin Command Tower — smol café",
  description: "Master operations dashboard for smol café staff, managers, and owners.",
};

export default async function SmolBackdoorAdminPage() {
  const auth = await requireStaffAuth(["admin", "super_admin"]);

  if (!auth.authorized) {
    redirect("/smol-backdoor");
  }

  return <AdminDashboardPage />;
}
