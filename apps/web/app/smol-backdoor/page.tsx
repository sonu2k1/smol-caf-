import { StaffBackdoorPortal } from "@/components/staff/StaffBackdoorPortal";

export const metadata = {
  title: "Staff Backdoor — smol café",
  description: "Secure role-based backdoor login for Kitchen, Cashier, and Admin staff.",
};

export default function SmolBackdoorPage() {
  return <StaffBackdoorPortal />;
}
