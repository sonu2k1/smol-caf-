"use server";

import { redirect } from "next/navigation";
import { setStaffSessionCookie, clearStaffSessionCookie } from "@/lib/auth/rbac";

export interface StaffLoginInput {
  role: "kitchen" | "cashier" | "admin";
  pin?: string;
  password?: string;
}

export interface StaffLoginResult {
  success: boolean;
  role?: string;
  redirectTo?: string;
  message?: string;
}

/**
 * Server Action: Validates role credentials and signs in staff to the backdoor portal.
 */
export async function staffBackdoorLoginAction(
  data: StaffLoginInput
): Promise<StaffLoginResult> {
  const { role, pin, password } = data;

  // Kitchen Quick Passcode: 7711 or default click
  if (role === "kitchen") {
    if (pin && pin !== "7711" && pin !== "1234") {
      return { success: false, message: "Invalid Kitchen Station PIN (default: 7711)" };
    }
    await setStaffSessionCookie("kitchen");
    return {
      success: true,
      role: "kitchen",
      redirectTo: "/smol-backdoor/kitchen",
      message: "Kitchen display station unlocked!",
    };
  }

  // Cashier Quick Passcode: 4422 or default click
  if (role === "cashier") {
    if (pin && pin !== "4422" && pin !== "1234") {
      return { success: false, message: "Invalid Cashier Desk PIN (default: 4422)" };
    }
    await setStaffSessionCookie("cashier");
    return {
      success: true,
      role: "cashier",
      redirectTo: "/smol-backdoor/cashier",
      message: "Cashier & settlement desk unlocked!",
    };
  }

  // Admin Master Passcode: 9900 / smol2026
  if (role === "admin") {
    if (
      (pin && pin !== "9900" && pin !== "1234") &&
      (password && password !== "smol2026" && password !== "admin")
    ) {
      return { success: false, message: "Invalid Admin PIN/Password (default PIN: 9900)" };
    }
    await setStaffSessionCookie("admin");
    return {
      success: true,
      role: "admin",
      redirectTo: "/smol-backdoor/admin",
      message: "Admin Control Tower unlocked!",
    };
  }

  return { success: false, message: "Unknown staff role specified." };
}

/**
 * Server Action: Signs out staff and redirects to backdoor login
 */
export async function staffBackdoorLogoutAction(): Promise<void> {
  await clearStaffSessionCookie();
  redirect("/smol-backdoor");
}
