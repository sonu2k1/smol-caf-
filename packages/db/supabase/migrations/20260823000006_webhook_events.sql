-- ==============================================================================
-- Smol Café — Webhook Events & Atomic Processing (Deduplication & Out-of-Order Safety)
-- ==============================================================================

-- 1. Create webhook_events table
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL DEFAULT 'RAZORPAY',
  provider_event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'PROCESSED',
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_provider_event_id 
  ON webhook_events (provider_event_id);

-- 2. Atomic process_razorpay_webhook PL/pgSQL Function
CREATE OR REPLACE FUNCTION process_razorpay_webhook(
  p_event_id TEXT,
  p_event_type TEXT,
  p_payload JSONB
) RETURNS JSONB AS $$
DECLARE
  v_inserted_id UUID;
  v_payment_payload JSONB;
  v_razorpay_order_id TEXT;
  v_razorpay_payment_id TEXT;
  v_amount_paise INTEGER;
  v_attempt payment_attempts%ROWTYPE;
  v_bill_id UUID;
  v_bill bills%ROWTYPE;
  v_net_paid INTEGER := 0;
  v_now TIMESTAMPTZ := now();
BEGIN
  -- 1. Deduplication Check via UNIQUE provider_event_id
  INSERT INTO webhook_events (
    provider,
    provider_event_id,
    event_type,
    payload,
    status,
    processed_at
  ) VALUES (
    'RAZORPAY',
    p_event_id,
    p_event_type,
    p_payload,
    'PROCESSED',
    v_now
  ) ON CONFLICT (provider_event_id) DO NOTHING
  RETURNING id INTO v_inserted_id;

  -- If no row was inserted, this event was already processed (Dedupe hit!)
  IF v_inserted_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', true,
      'is_duplicate', true,
      'event_id', p_event_id,
      'message', 'Webhook event already processed (idempotent acknowledge).'
    );
  END IF;

  -- Extract payment and order details from payload
  v_payment_payload := p_payload->'payload'->'payment'->'entity';
  IF v_payment_payload IS NOT NULL THEN
    v_razorpay_payment_id := v_payment_payload->>'id';
    v_razorpay_order_id := v_payment_payload->>'order_id';
    v_amount_paise := (v_payment_payload->>'amount')::INTEGER;
  END IF;

  -- If no payment entity found (e.g. order.paid or refund), try order entity
  IF v_razorpay_order_id IS NULL THEN
    v_razorpay_order_id := p_payload->'payload'->'order'->'entity'->>'id';
  END IF;

  -- 2. Handle 'payment.captured' Event
  IF p_event_type = 'payment.captured' OR p_event_type = 'order.paid' THEN
    -- Find the associated payment attempt by razorpay order id or payment id
    SELECT * INTO v_attempt 
    FROM payment_attempts 
    WHERE idempotency_key = v_razorpay_order_id OR id = v_razorpay_payment_id
    LIMIT 1;

    IF FOUND THEN
      v_bill_id := v_attempt.bill_id;

      -- Update payment attempt to CAPTURED
      UPDATE payment_attempts SET
        status = 'CAPTURED',
        captured_at = v_now
      WHERE id = v_attempt.id;

      -- Calculate Net Paid Amount from all successful captures for this bill
      SELECT COALESCE(SUM(amount), 0) INTO v_net_paid
      FROM payment_attempts
      WHERE bill_id = v_bill_id
        AND status = 'CAPTURED';

      -- Fetch bill details
      SELECT * INTO v_bill FROM bills WHERE id = v_bill_id;

      -- Update bill status based on net paid calculation
      IF v_bill.id IS NOT NULL THEN
        IF v_net_paid >= v_bill.total THEN
          UPDATE bills SET
            paid_amount = v_net_paid,
            status = 'PAID',
            closed_at = COALESCE(closed_at, v_now)
          WHERE id = v_bill_id;

          -- Close table session
          UPDATE table_sessions SET
            status = 'CLOSED',
            closed_at = COALESCE(closed_at, v_now),
            last_activity_at = v_now
          WHERE bill_id = v_bill_id OR id = v_bill.table_session_id;

          -- Update orders to SERVED
          UPDATE orders SET
            status = 'SERVED',
            served_at = COALESCE(served_at, v_now),
            updated_at = v_now
          WHERE table_session_id = v_bill.table_session_id
            AND status IN ('SUBMITTED', 'ACCEPTED', 'PREPARING', 'READY');
        ELSE
          UPDATE bills SET
            paid_amount = v_net_paid,
            status = 'PARTIALLY_PAID'
          WHERE id = v_bill_id;
        END IF;
      END IF;
    END IF;

  -- 3. Handle 'payment.authorized' Event (Out-of-Order Protection)
  ELSIF p_event_type = 'payment.authorized' THEN
    -- DO NOT overwrite if status is already CAPTURED
    UPDATE payment_attempts SET
      status = 'AUTHORIZED'
    WHERE (idempotency_key = v_razorpay_order_id OR id = v_razorpay_payment_id)
      AND status != 'CAPTURED';

  -- 4. Handle 'payment.failed' Event
  ELSIF p_event_type = 'payment.failed' THEN
    -- DO NOT overwrite if status was already CAPTURED
    UPDATE payment_attempts SET
      status = 'FAILED'
    WHERE (idempotency_key = v_razorpay_order_id OR id = v_razorpay_payment_id)
      AND status != 'CAPTURED';
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'is_duplicate', false,
    'event_id', p_event_id,
    'event_type', p_event_type,
    'message', 'Webhook processed successfully.'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
