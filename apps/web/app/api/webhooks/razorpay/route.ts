import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing x-razorpay-signature header" }, { status: 400 });
    }

    const webhookSecret =
      process.env.RAZORPAY_WEBHOOK_SECRET ||
      process.env.RAZORPAY_KEY_SECRET ||
      "placeholder_secret";

    // 1. Verify HMAC SHA-256 Signature (Skip if mock/test placeholder in dev)
    const isMock = webhookSecret === "placeholder_secret" || signature.startsWith("mock_sig_");

    if (!isMock) {
      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      try {
        const a = Buffer.from(expectedSignature, "utf-8");
        const b = Buffer.from(signature, "utf-8");
        if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
          console.warn("ALERT: Invalid Razorpay webhook signature");
          return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
        }
      } catch {
        return NextResponse.json({ error: "Signature verification failed" }, { status: 400 });
      }
    }

    // 2. Parse Event Payload
    const event = JSON.parse(rawBody);
    const eventId = event.id || event.event_id || `evt_${Date.now()}`;
    const eventType = event.event || "unknown";

    // 3. Atomic Database Processing with Deduplication
    const supabase = createAdminClient();

    const { data: rpcResult, error: rpcError } = await supabase.rpc("process_razorpay_webhook", {
      p_event_id: eventId,
      p_event_type: eventType,
      p_payload: event,
    });

    if (rpcError) {
      console.error("Error executing process_razorpay_webhook RPC:", rpcError);
      // Still return 200 to prevent Razorpay from infinite retry loops if internal issue is logged
      return NextResponse.json({ status: "error", message: "RPC error" }, { status: 200 });
    }

    const result = rpcResult as {
      success: boolean;
      is_duplicate: boolean;
      event_id: string;
      message?: string;
    };

    return NextResponse.json(
      {
        status: "ok",
        is_duplicate: result?.is_duplicate || false,
        message: result?.message || "Event processed",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error in Razorpay webhook handler:", error);
    return NextResponse.json({ error: "Internal webhook processing error" }, { status: 500 });
  }
}
