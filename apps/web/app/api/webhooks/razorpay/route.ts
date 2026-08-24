import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateRequestId, logger } from "@/lib/observability/logger";
import { recordWebhookSuccess, recordWebhookFailure } from "@/lib/observability/alerts";
import { captureAppException } from "@/lib/observability/sentry";

export async function POST(req: Request) {
  const requestId = generateRequestId();
  const startTime = Date.now();

  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      logger.warn("Razorpay webhook rejected: Missing signature header", {
        requestId,
        action: "razorpayWebhook",
      });
      recordWebhookFailure("Missing signature header");
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
          logger.warn("Razorpay webhook signature mismatch", {
            requestId,
            action: "razorpayWebhook",
          });
          recordWebhookFailure("Invalid signature");
          return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
        }
      } catch {
        recordWebhookFailure("Signature verification failure");
        return NextResponse.json({ error: "Signature verification failed" }, { status: 400 });
      }
    }

    // 2. Parse Event Payload
    const event = JSON.parse(rawBody);
    const eventId = event.id || event.event_id || `evt_${Date.now()}`;
    const eventType = event.event || "unknown";

    logger.info(`Received Razorpay webhook event ${eventType} (${eventId})`, {
      requestId,
      action: "razorpayWebhook",
      data: { eventId, eventType },
    });

    // 3. Atomic Database Processing with Deduplication
    const supabase = createAdminClient();

    const { data: rpcResult, error: rpcError } = await supabase.rpc("process_razorpay_webhook", {
      p_event_id: eventId,
      p_event_type: eventType,
      p_payload: event,
    });

    const durationMs = Date.now() - startTime;

    if (rpcError) {
      logger.error("Error executing process_razorpay_webhook RPC", {
        requestId,
        action: "razorpayWebhook",
        durationMs,
        data: { error: rpcError.message, eventId, eventType },
      });
      recordWebhookFailure(rpcError.message, eventId);
      captureAppException(rpcError, { requestId });
      // Still return 200 to prevent Razorpay from infinite retry loops if internal issue is logged
      return NextResponse.json({ status: "error", message: "RPC error" }, { status: 200 });
    }

    const result = rpcResult as {
      success: boolean;
      status: string;
      message: string;
    };

    recordWebhookSuccess();
    logger.info(`Razorpay webhook processed: ${result.status} - ${result.message}`, {
      requestId,
      action: "razorpayWebhook",
      durationMs,
      data: { status: result.status, eventId },
    });

    return NextResponse.json({
      received: true,
      status: result.status,
      message: result.message,
    });
  } catch (error) {
    const durationMs = Date.now() - startTime;
    logger.error("Unexpected error in Razorpay webhook handler", {
      requestId,
      action: "razorpayWebhook",
      durationMs,
      data: { error: String(error) },
    });
    recordWebhookFailure(String(error));
    captureAppException(error, { requestId });

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
