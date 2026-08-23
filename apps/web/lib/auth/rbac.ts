import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export const STAFF_SESSION_COOKIE = "smol_staff_session";

export interface AuthCheckResult {
  authorized: boolean;
  role?: string;
  userId?: string;
  error?: "AUTH_REQUIRED" | "FORBIDDEN" | "MFA_REQUIRED";
  message?: string;
}

/**
 * Server-Side RBAC Guard: Validates that the request has an active authenticated staff session.
 * Checks both the HTTP-only staff session cookie and Supabase JWT app_metadata role.
 */
export async function requireStaffAuth(
  allowedRoles: string[] = ["super_admin", "admin", "cashier", "kitchen", "chef"]
): Promise<AuthCheckResult> {
  const cookieStore = await cookies();
  const staffCookie = cookieStore.get(STAFF_SESSION_COOKIE)?.value;

  // 1. Check Fast HTTP-Only Staff Cookie (Kitchen Tablet / Quick POS)
  if (staffCookie === "authenticated") {
    return { authorized: true, role: "admin" };
  }

  // 2. Check Supabase Auth JWT Session
  try {
    const supabase = await createClient();
    const { data: authData, error } = await supabase.auth.getUser();

    if (error || !authData.user) {
      return {
        authorized: false,
        error: "AUTH_REQUIRED",
        message: "Staff authentication required. Please log in to perform this action.",
      };
    }

    const userRole =
      (authData.user.app_metadata?.role as string) ||
      (authData.user.user_metadata?.role as string) ||
      "customer";

    if (!allowedRoles.includes(userRole) && userRole !== "super_admin") {
      return {
        authorized: false,
        error: "FORBIDDEN",
        role: userRole,
        message: `Unauthorized: Action requires one of [${allowedRoles.join(", ")}]. Current role: ${userRole}.`,
      };
    }

    return {
      authorized: true,
      role: userRole,
      userId: authData.user.id,
    };
  } catch {
    return {
      authorized: false,
      error: "AUTH_REQUIRED",
      message: "Authentication verification failed.",
    };
  }
}

/**
 * Server-Side MFA Guard: Ensures Admin/Owner account has completed Supabase TOTP MFA (AAL2).
 */
export async function requireAdminMfa(): Promise<AuthCheckResult> {
  const cookieStore = await cookies();
  const staffCookie = cookieStore.get(STAFF_SESSION_COOKIE)?.value;

  // In development / demo tablet session
  if (staffCookie === "authenticated" && process.env.NODE_ENV !== "production") {
    return { authorized: true, role: "super_admin" };
  }

  try {
    const supabase = await createClient();
    const { data: authData, error } = await supabase.auth.getUser();

    if (error || !authData.user) {
      return { authorized: false, error: "AUTH_REQUIRED", message: "Admin login required." };
    }

    // Verify Authenticator Assurance Level (AAL2)
    const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    if (aalData && aalData.currentLevel !== "aal2" && aalData.nextLevel === "aal2") {
      return {
        authorized: false,
        error: "MFA_REQUIRED",
        message: "Multi-Factor Authentication (TOTP) verification required for admin operations.",
      };
    }

    return { authorized: true, userId: authData.user.id };
  } catch {
    return { authorized: false, error: "AUTH_REQUIRED" };
  }
}
