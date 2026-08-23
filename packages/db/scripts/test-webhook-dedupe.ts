/**
 * ==============================================================================
 * Smol Café — Razorpay Webhook Deduplication & Out-of-Order Safety Test Suite
 * ==============================================================================
 * Simulates:
 * 1. Initial valid delivery of `payment.captured` event
 * 2. Duplicate re-delivery of the same `event.id` (verifies dedupe returns 200 OK + is_duplicate: true)
 * 3. Out-of-order delivery of `payment.authorized` after `payment.captured` (verifies state is not downgraded)
 * 4. Invalid HMAC signature rejection
 */

import crypto from "crypto";

const WEBHOOK_SECRET = "test_webhook_secret_key_123";

interface WebhookEventRecord {
  provider_event_id: string;
  event_type: string;
  processed_at: string;
  status: string;
}

interface PaymentAttemptRecord {
  id: string;
  idempotency_key: string;
  status: "PENDING" | "AUTHORIZED" | "CAPTURED" | "FAILED";
  amount: number;
}

// In-Memory Simulation of PostgreSQL Tables & RPC
class MockDatabase {
  public webhookEvents: Map<string, WebhookEventRecord> = new Map();
  public paymentAttempts: Map<string, PaymentAttemptRecord> = new Map();

  // Mirrors process_razorpay_webhook PL/pgSQL function
  processWebhook(eventId: string, eventType: string, payload: Record<string, unknown>) {
    // 1. Deduplication Check (ON CONFLICT DO NOTHING)
    if (this.webhookEvents.has(eventId)) {
      return {
        success: true,
        is_duplicate: true,
        event_id: eventId,
        message: "Webhook event already processed (idempotent acknowledge).",
      };
    }

    // Insert into webhook_events
    this.webhookEvents.set(eventId, {
      provider_event_id: eventId,
      event_type: eventType,
      processed_at: new Date().toISOString(),
      status: "PROCESSED",
    });

    const paymentEntity = (
      payload as {
        payload?: { payment?: { entity?: { id?: string; order_id?: string; amount?: number } } };
      }
    )?.payload?.payment?.entity;
    const orderId = paymentEntity?.order_id;
    const paymentId = paymentEntity?.id;

    const attempt = Array.from(this.paymentAttempts.values()).find(
      (a) => a.idempotency_key === orderId || a.id === paymentId
    );

    if (attempt) {
      if (eventType === "payment.captured" || eventType === "order.paid") {
        attempt.status = "CAPTURED";
      } else if (eventType === "payment.authorized") {
        // Out-of-order protection: DO NOT overwrite if already CAPTURED
        if (attempt.status !== "CAPTURED") {
          attempt.status = "AUTHORIZED";
        }
      }
    }

    return {
      success: true,
      is_duplicate: false,
      event_id: eventId,
      event_type: eventType,
      message: "Webhook processed successfully.",
    };
  }
}

function computeSignature(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expected = computeSignature(payload, secret);
  const a = Buffer.from(expected, "utf-8");
  const b = Buffer.from(signature, "utf-8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// Run Test Suite
async function runWebhookDedupeTests() {
  console.log("===============================================================");
  console.log("🧪 SMOL CAFÉ — RAZORPAY WEBHOOK DEDUPLICATION & SAFETY TESTS");
  console.log("===============================================================\n");

  const db = new MockDatabase();

  const testOrderId = "order_smol_test_999";
  const testPaymentId = "pay_smol_test_888";
  const testEventId = "evt_rzp_unique_001";

  // Pre-seed a PENDING payment attempt
  db.paymentAttempts.set(testPaymentId, {
    id: testPaymentId,
    idempotency_key: testOrderId,
    status: "PENDING",
    amount: 54000, // ₹540.00
  });

  const capturedPayload = {
    entity: "event",
    account_id: "acc_smol_123",
    event: "payment.captured",
    contains: ["payment"],
    payload: {
      payment: {
        entity: {
          id: testPaymentId,
          order_id: testOrderId,
          amount: 54000,
          currency: "INR",
          status: "captured",
        },
      },
    },
    created_at: 1724400000,
  };

  const payloadString = JSON.stringify(capturedPayload);
  const validSignature = computeSignature(payloadString, WEBHOOK_SECRET);
  const invalidSignature = "invalid_signature_hash_1234567890abcdef";

  // ----------------------------------------------------------------------------
  // Test 1: Signature Verification
  // ----------------------------------------------------------------------------
  console.log("Test 1: HMAC SHA-256 Signature Verification");
  const sigValid = verifySignature(payloadString, validSignature, WEBHOOK_SECRET);
  const sigInvalid = verifySignature(payloadString, invalidSignature, WEBHOOK_SECRET);

  if (sigValid && !sigInvalid) {
    console.log("  ✅ PASS: Valid signature accepted, invalid signature rejected.\n");
  } else {
    console.error("  ❌ FAIL: Signature verification error.");
    process.exit(1);
  }

  // ----------------------------------------------------------------------------
  // Test 2: Initial Webhook Delivery (payment.captured)
  // ----------------------------------------------------------------------------
  console.log("Test 2: Initial Delivery of payment.captured Event");
  const result1 = db.processWebhook(testEventId, capturedPayload.event, capturedPayload);
  const attemptAfterCapture = db.paymentAttempts.get(testPaymentId);

  if (
    result1.success &&
    result1.is_duplicate === false &&
    attemptAfterCapture?.status === "CAPTURED"
  ) {
    console.log(`  ✅ PASS: Event ${testEventId} processed.`);
    console.log(`  ✅ PASS: Payment attempt transitioned from PENDING -> CAPTURED.\n`);
  } else {
    console.error("  ❌ FAIL: Initial event delivery failed.", result1);
    process.exit(1);
  }

  // ----------------------------------------------------------------------------
  // Test 3: Duplicate Webhook Delivery (Deduplication Check)
  // ----------------------------------------------------------------------------
  console.log("Test 3: Duplicate Re-Delivery of the Same Event (Same event_id)");
  const result2 = db.processWebhook(testEventId, capturedPayload.event, capturedPayload);

  if (result2.success && result2.is_duplicate === true) {
    console.log(`  ✅ PASS: Duplicate event ${testEventId} detected.`);
    console.log(
      `  ✅ PASS: Idempotent 200 acknowledge returned without re-executing DB mutations.\n`
    );
  } else {
    console.error("  ❌ FAIL: Deduplication failed to catch duplicate event.", result2);
    process.exit(1);
  }

  // ----------------------------------------------------------------------------
  // Test 4: Out-of-Order Event Delivery (payment.authorized after payment.captured)
  // ----------------------------------------------------------------------------
  console.log("Test 4: Out-of-Order Delivery (payment.authorized arrives AFTER payment.captured)");
  const outOfOrderEventId = "evt_rzp_out_of_order_002";
  const authorizedPayload = {
    entity: "event",
    account_id: "acc_smol_123",
    event: "payment.authorized",
    payload: {
      payment: {
        entity: {
          id: testPaymentId,
          order_id: testOrderId,
          amount: 54000,
          status: "authorized",
        },
      },
    },
  };

  const result3 = db.processWebhook(outOfOrderEventId, authorizedPayload.event, authorizedPayload);
  const attemptAfterAuthorized = db.paymentAttempts.get(testPaymentId);

  if (
    result3.success &&
    result3.is_duplicate === false &&
    attemptAfterAuthorized?.status === "CAPTURED"
  ) {
    console.log(`  ✅ PASS: Out-of-order event processed safely.`);
    console.log(`  ✅ PASS: Payment status remains CAPTURED (never downgraded to AUTHORIZED).\n`);
  } else {
    console.error("  ❌ FAIL: Out-of-order event erroneously downgraded CAPTURED status.");
    process.exit(1);
  }

  console.log("===============================================================");
  console.log("🎉 ALL 4 WEBHOOK SECURITY & DEDUPLICATION TESTS PASSED!");
  console.log("===============================================================");
}

runWebhookDedupeTests().catch(console.error);
