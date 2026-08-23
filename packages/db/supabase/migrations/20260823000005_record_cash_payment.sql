-- ==============================================================================
-- Smol Café — Record Cash Payment & Session Closure Transaction (Step 1.6)
-- Atomic bill generation, payment capture, table closure, and mutation locking
-- ==============================================================================

CREATE OR REPLACE FUNCTION record_cash_payment(
  p_table_session_id UUID,
  p_amount_tendered_paise INTEGER,
  p_staff_identifier TEXT,
  p_idempotency_key TEXT
) RETURNS JSONB AS $$
DECLARE
  v_session table_sessions%ROWTYPE;
  v_subtotal INTEGER := 0;
  v_tax INTEGER := 0;
  v_total INTEGER := 0;
  v_bill_id UUID;
  v_now TIMESTAMPTZ := now();
  v_existing_attempt payment_attempts%ROWTYPE;
BEGIN
  -- 1. Check idempotency (Prevent double cash settlement)
  IF p_idempotency_key IS NOT NULL AND p_idempotency_key != '' THEN
    SELECT * INTO v_existing_attempt FROM payment_attempts WHERE idempotency_key = p_idempotency_key;
    IF FOUND THEN
      RETURN jsonb_build_object(
        'success', true,
        'is_duplicate', true,
        'bill_id', v_existing_attempt.bill_id,
        'message', 'Payment was already recorded.'
      );
    END IF;
  END IF;

  -- 2. Verify Session exists and is not already closed
  SELECT * INTO v_session FROM table_sessions WHERE id = p_table_session_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'SESSION_NOT_FOUND', 'message', 'Table session not found.');
  END IF;

  IF v_session.status = 'CLOSED' THEN
    RETURN jsonb_build_object('success', false, 'error', 'SESSION_ALREADY_CLOSED', 'message', 'This dining session is already settled and closed.');
  END IF;

  -- 3. Calculate financial totals across all valid orders in this session
  SELECT 
    COALESCE(SUM(subtotal_snapshot), 0),
    COALESCE(SUM(tax_snapshot), 0),
    COALESCE(SUM(total_snapshot), 0)
  INTO v_subtotal, v_tax, v_total
  FROM orders
  WHERE table_session_id = p_table_session_id
    AND status NOT IN ('CANCELLED', 'REJECTED');

  IF v_total = 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'EMPTY_BILL', 'message', 'No payable orders found in this session.');
  END IF;

  IF p_amount_tendered_paise < v_total THEN
    RETURN jsonb_build_object(
      'success', false, 
      'error', 'INSUFFICIENT_AMOUNT', 
      'message', 'Tendered amount is less than the total bill.'
    );
  END IF;

  -- 4. Create or Update Bill Record
  IF v_session.bill_id IS NOT NULL THEN
    UPDATE bills SET
      subtotal = v_subtotal,
      tax = v_tax,
      total = v_total,
      paid_amount = v_total,
      status = 'PAID',
      closed_at = v_now
    WHERE id = v_session.bill_id
    RETURNING id INTO v_bill_id;
  ELSE
    INSERT INTO bills (
      table_session_id,
      status,
      subtotal,
      tax,
      total,
      paid_amount,
      closed_at
    ) VALUES (
      p_table_session_id,
      'PAID',
      v_subtotal,
      v_tax,
      v_total,
      v_total,
      v_now
    ) RETURNING id INTO v_bill_id;
  END IF;

  -- 5. Insert Payment Attempt Record
  INSERT INTO payment_attempts (
    bill_id,
    provider,
    amount,
    currency,
    status,
    idempotency_key,
    created_at,
    captured_at
  ) VALUES (
    v_bill_id,
    'CASH',
    v_total,
    'INR',
    'CAPTURED',
    COALESCE(p_idempotency_key, gen_random_uuid()::text),
    v_now,
    v_now
  );

  -- 6. Close Table Session (Freeing the table)
  UPDATE table_sessions SET
    status = 'CLOSED',
    closed_at = v_now,
    bill_id = v_bill_id,
    last_activity_at = v_now
  WHERE id = p_table_session_id;

  -- 7. Update all orders in this session to SERVED if still active
  UPDATE orders SET
    status = 'SERVED',
    served_at = COALESCE(served_at, v_now),
    updated_at = v_now
  WHERE table_session_id = p_table_session_id
    AND status IN ('SUBMITTED', 'ACCEPTED', 'PREPARING', 'READY');

  RETURN jsonb_build_object(
    'success', true,
    'bill_id', v_bill_id,
    'total_paise', v_total,
    'tendered_paise', p_amount_tendered_paise,
    'change_paise', p_amount_tendered_paise - v_total,
    'staff', p_staff_identifier,
    'message', 'Payment recorded successfully. Table session is closed.'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
