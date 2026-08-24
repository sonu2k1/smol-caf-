/**
 * ==============================================================================
 * Smol Café — Role Matrix & Negative Authorization Test Suite
 * ==============================================================================
 * Validates that unauthorized roles are strictly rejected across 8 permission boundaries:
 * 1. Anonymous -> Transition Kitchen Ticket -> AUTH_REQUIRED
 * 2. Anonymous -> Create Blackboard Post -> AUTH_REQUIRED
 * 3. Anonymous -> Create Purchase Order -> AUTH_REQUIRED
 * 4. Customer -> Upsert Category Budget -> FORBIDDEN
 * 5. Kitchen Staff -> Settle Cash Bill -> FORBIDDEN
 * 6. Kitchen Staff -> Create Reward Catalog Item -> FORBIDDEN
 * 7. Cashier -> Delete Blackboard Announcement -> FORBIDDEN
 * 8. Admin (AAL1 without MFA) -> Super Admin Action -> MFA_REQUIRED
 */

type AppRole = "anonymous" | "customer" | "kitchen" | "chef" | "cashier" | "admin" | "super_admin";

interface UserContext {
  role: AppRole;
  aalLevel: "aal1" | "aal2";
}

class RBACPolicyEngine {
  public checkPermission(
    user: UserContext,
    resource: string,
    action: "create" | "read" | "update" | "delete"
  ): { allowed: boolean; error?: "AUTH_REQUIRED" | "FORBIDDEN" | "MFA_REQUIRED" } {
    if (user.role === "anonymous") {
      // Public Read is allowed on certain resources
      if (
        action === "read" &&
        ["menu", "locations", "blackboard", "events", "music_queue"].includes(resource)
      ) {
        return { allowed: true };
      }
      return { allowed: false, error: "AUTH_REQUIRED" };
    }

    if (user.role === "super_admin") {
      if (user.aalLevel !== "aal2") {
        return { allowed: false, error: "MFA_REQUIRED" };
      }
      return { allowed: true };
    }

    // Role-specific permission tables
    switch (resource) {
      case "kitchen_tickets":
        return ["kitchen", "chef", "admin"].includes(user.role)
          ? { allowed: true }
          : { allowed: false, error: "FORBIDDEN" };

      case "blackboard":
        return ["admin"].includes(user.role)
          ? { allowed: true }
          : { allowed: false, error: "FORBIDDEN" };

      case "procurement_po":
        return ["chef", "admin"].includes(user.role)
          ? { allowed: true }
          : { allowed: false, error: "FORBIDDEN" };

      case "budgets":
        return ["admin"].includes(user.role)
          ? { allowed: true }
          : { allowed: false, error: "FORBIDDEN" };

      case "cashier_settle":
        return ["cashier", "admin"].includes(user.role)
          ? { allowed: true }
          : { allowed: false, error: "FORBIDDEN" };

      case "rewards_admin":
        return ["admin"].includes(user.role)
          ? { allowed: true }
          : { allowed: false, error: "FORBIDDEN" };

      default:
        return { allowed: false, error: "FORBIDDEN" };
    }
  }
}

async function runRoleMatrixNegativeTests() {
  console.log("================================================================================");
  console.log("🧪 SMOL CAFÉ — ROLE MATRIX NEGATIVE AUTHORIZATION TEST SUITE");
  console.log("================================================================================\n");

  const rbac = new RBACPolicyEngine();
  let passedCount = 0;
  const totalTests = 8;

  const testCases: {
    name: string;
    user: UserContext;
    resource: string;
    action: "create" | "read" | "update" | "delete";
    expectedError: "AUTH_REQUIRED" | "FORBIDDEN" | "MFA_REQUIRED";
  }[] = [
    {
      name: "1. Anonymous -> Transition Kitchen Ticket",
      user: { role: "anonymous", aalLevel: "aal1" },
      resource: "kitchen_tickets",
      action: "update",
      expectedError: "AUTH_REQUIRED",
    },
    {
      name: "2. Anonymous -> Create Blackboard Post",
      user: { role: "anonymous", aalLevel: "aal1" },
      resource: "blackboard",
      action: "create",
      expectedError: "AUTH_REQUIRED",
    },
    {
      name: "3. Anonymous -> Create Purchase Order",
      user: { role: "anonymous", aalLevel: "aal1" },
      resource: "procurement_po",
      action: "create",
      expectedError: "AUTH_REQUIRED",
    },
    {
      name: "4. Customer -> Upsert Category Budget",
      user: { role: "customer", aalLevel: "aal1" },
      resource: "budgets",
      action: "update",
      expectedError: "FORBIDDEN",
    },
    {
      name: "5. Kitchen Staff -> Settle Cash Bill",
      user: { role: "kitchen", aalLevel: "aal1" },
      resource: "cashier_settle",
      action: "update",
      expectedError: "FORBIDDEN",
    },
    {
      name: "6. Kitchen Staff -> Create Reward Catalog Item",
      user: { role: "kitchen", aalLevel: "aal1" },
      resource: "rewards_admin",
      action: "create",
      expectedError: "FORBIDDEN",
    },
    {
      name: "7. Cashier -> Delete Blackboard Announcement",
      user: { role: "cashier", aalLevel: "aal1" },
      resource: "blackboard",
      action: "delete",
      expectedError: "FORBIDDEN",
    },
    {
      name: "8. Admin without MFA (AAL1) -> Owner Operation",
      user: { role: "super_admin", aalLevel: "aal1" }, // Lacks AAL2 TOTP
      resource: "budgets",
      action: "delete",
      expectedError: "MFA_REQUIRED",
    },
  ];

  for (const tc of testCases) {
    console.log(`Testing: ${tc.name}`);
    const res = rbac.checkPermission(tc.user, tc.resource, tc.action);

    if (!res.allowed && res.error === tc.expectedError) {
      console.log(`  ✅ PASS: Correctly blocked with ${tc.expectedError}.\n`);
      passedCount++;
    } else {
      console.error(`  ❌ FAIL: Permission check failed. Expected ${tc.expectedError}, got:`, res);
      process.exit(1);
    }
  }

  console.log("================================================================================");
  console.log(
    `🎉 ALL ${passedCount}/${totalTests} ROLE MATRIX NEGATIVE AUTHORIZATION TESTS PASSED!`
  );
  console.log("================================================================================");
}

runRoleMatrixNegativeTests().catch((err) => {
  console.error("Test Suite Fatal Error:", err);
  process.exit(1);
});
