"use server";

import { getTableSessionCookie } from "@/lib/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export interface PlaceOrderItemInput {
  menu_item_id: string;
  expected_unit_price_paise: number;
  qty: number;
}

export interface ChangedItemDiff {
  menu_item_id: string;
  name: string;
  expected_price_paise: number;
  current_price_paise: number;
}

export interface PlaceOrderResult {
  success: boolean;
  error?:
    | "NO_SESSION"
    | "SESSION_NOT_OPEN"
    | "PRICE_CHANGED"
    | "DB_ERROR"
    | "EMPTY_CART"
    | "INSUFFICIENT_POINTS"
    | "AUTH_REQUIRED";
  message?: string;
  orderId?: string;
  orderNo?: number;
  discountPaise?: number;
  totalPaise?: number;
  isDuplicate?: boolean;
  changedItems?: ChangedItemDiff[];
}

/**
 * Server Action: Places an order within a single atomic PostgreSQL transaction
 * enforcing server-side price re-validation, inventory reservation, and reward redemption.
 */
export async function placeOrderAction(
  items: PlaceOrderItemInput[],
  idempotencyKey: string,
  rewardId?: string
): Promise<PlaceOrderResult> {
  // 1. Verify Active Table Session from Signed Cookie
  const session = await getTableSessionCookie();
  if (!session || !session.sessionId || !session.locationId) {
    return {
      success: false,
      error: "NO_SESSION",
      message: "No active dining session found. Please scan your table QR code.",
    };
  }

  // 2. Validate Cart Items
  if (!items || items.length === 0) {
    return {
      success: false,
      error: "EMPTY_CART",
      message: "Your cart is empty. Please add items to place an order.",
    };
  }

  const supabase = createAdminClient();
  const userClient = await createClient();
  const { data: authUser } = await userClient.auth.getUser();
  const profileId = authUser?.user?.id || null;

  try {
    // 3. Call submit_order PostgreSQL function
    const { data: rpcResult, error: rpcError } = await supabase.rpc("submit_order", {
      p_location_id: session.locationId,
      p_table_session_id: session.sessionId,
      p_idempotency_key: idempotencyKey,
      p_items: items,
      p_reward_id: rewardId || null,
      p_profile_id: profileId,
    });

    if (rpcError) {
      console.error("Error executing submit_order RPC:", rpcError);
      return {
        success: false,
        error: "DB_ERROR",
        message: "Failed to place order. Please check with café staff.",
      };
    }

    const result = rpcResult as {
      success: boolean;
      error?: string;
      message?: string;
      order_id?: string;
      order_no?: number;
      discount_paise?: number;
      total_paise?: number;
      is_duplicate?: boolean;
      changed_items?: ChangedItemDiff[];
    };

    if (!result.success) {
      if (result.error === "PRICE_CHANGED") {
        return {
          success: false,
          error: "PRICE_CHANGED",
          message: result.message || "Some item prices have changed. Please review your order.",
          changedItems: result.changed_items || [],
        };
      }

      if (result.error === "SESSION_NOT_OPEN") {
        return {
          success: false,
          error: "SESSION_NOT_OPEN",
          message:
            result.message || "Your dining session has ended. Please ask staff for a fresh QR.",
        };
      }

      return {
        success: false,
        error: "DB_ERROR",
        message: result.message || "Could not process order.",
      };
    }

    return {
      success: true,
      orderId: result.order_id,
      orderNo: result.order_no,
      discountPaise: result.discount_paise || 0,
      totalPaise: result.total_paise,
      isDuplicate: result.is_duplicate || false,
      message:
        result.discount_paise && result.discount_paise > 0
          ? `Order #${result.order_no} placed with ₹${Math.round(result.discount_paise / 100)} reward discount!`
          : `Order #${result.order_no} placed successfully!`,
    };
  } catch (err) {
    console.error("Unexpected error in placeOrderAction:", err);
    return {
      success: false,
      error: "DB_ERROR",
      message: "An unexpected error occurred. Please call a staff member.",
    };
  }
}
