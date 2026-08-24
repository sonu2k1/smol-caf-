-- ==============================================================================
-- Smol Café — Append-Only Loyalty Ledger & Balance Recomputation Engine
-- ==============================================================================

-- 1. Loyalty Accounts Table
CREATE TABLE IF NOT EXISTS loyalty_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  current_balance_cached INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_accounts_profile_id ON loyalty_accounts(profile_id);

-- 2. Loyalty Ledger Table (Append-Only)
CREATE TABLE IF NOT EXISTS loyalty_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loyalty_account_id UUID NOT NULL REFERENCES loyalty_accounts(id) ON DELETE RESTRICT,
  type TEXT NOT NULL CHECK (type IN ('EARN', 'REDEEM', 'EXPIRE', 'ADJUST', 'REVERSAL')),
  points INTEGER NOT NULL,
  related_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  related_bill_id UUID REFERENCES bills(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_loyalty_ledger_account_id ON loyalty_ledger(loyalty_account_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_ledger_bill_id ON loyalty_ledger(related_bill_id);

-- 3. Atomic Balance-Recompute Function: record_loyalty_movement
CREATE OR REPLACE FUNCTION record_loyalty_movement(
  p_profile_id UUID,
  p_type TEXT, -- 'EARN', 'REDEEM', 'EXPIRE', 'ADJUST', 'REVERSAL'
  p_points INTEGER,
  p_related_order_id UUID DEFAULT NULL,
  p_related_bill_id UUID DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_account_id UUID;
  v_new_balance INTEGER := 0;
  v_now TIMESTAMPTZ := now();
BEGIN
  IF p_points <= 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'INVALID_POINTS',
      'message', 'Points must be greater than zero.'
    );
  END IF;

  -- 1. Ensure or find loyalty account with ROW-LEVEL LOCK
  INSERT INTO loyalty_accounts (profile_id, current_balance_cached, created_at, updated_at)
  VALUES (p_profile_id, 0, v_now, v_now)
  ON CONFLICT (profile_id) DO NOTHING;

  SELECT id INTO v_account_id
  FROM loyalty_accounts
  WHERE profile_id = p_profile_id
  FOR UPDATE; -- Prevents concurrent balance race conditions

  -- 2. Validate redemption cannot exceed available balance
  IF p_type IN ('REDEEM', 'EXPIRE', 'REVERSAL') THEN
    SELECT COALESCE(
      SUM(
        CASE 
          WHEN type IN ('EARN', 'ADJUST') THEN points
          WHEN type IN ('REDEEM', 'EXPIRE', 'REVERSAL') THEN -points
          ELSE 0
        END
      ), 0
    ) INTO v_new_balance
    FROM loyalty_ledger
    WHERE loyalty_account_id = v_account_id;

    IF v_new_balance < p_points AND p_type = 'REDEEM' THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'INSUFFICIENT_POINTS',
        'current_balance', v_new_balance,
        'message', 'Insufficient loyalty points balance.'
      );
    END IF;
  END IF;

  -- 3. Insert Append-Only Ledger Row (Immutable audit log)
  INSERT INTO loyalty_ledger (
    loyalty_account_id,
    type,
    points,
    related_order_id,
    related_bill_id,
    notes,
    created_at
  ) VALUES (
    v_account_id,
    p_type,
    p_points,
    p_related_order_id,
    p_related_bill_id,
    p_notes,
    v_now
  );

  -- 4. Recompute exact balance from full ledger history in the SAME transaction
  SELECT COALESCE(
    SUM(
      CASE 
        WHEN type IN ('EARN', 'ADJUST') THEN points
        WHEN type IN ('REDEEM', 'EXPIRE', 'REVERSAL') THEN -points
        ELSE 0
      END
    ), 0
  ) INTO v_new_balance
  FROM loyalty_ledger
  WHERE loyalty_account_id = v_account_id;

  -- 5. Cache the derived balance
  UPDATE loyalty_accounts SET
    current_balance_cached = GREATEST(0, v_new_balance),
    updated_at = v_now
  WHERE id = v_account_id;

  RETURN jsonb_build_object(
    'success', true,
    'account_id', v_account_id,
    'movement_type', p_type,
    'points', p_points,
    'new_balance', GREATEST(0, v_new_balance)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Helper: award_bill_loyalty_points (Hooked into payment capture)
CREATE OR REPLACE FUNCTION award_bill_loyalty_points(p_bill_id UUID)
RETURNS VOID AS $$
DECLARE
  v_bill bills%ROWTYPE;
  v_already_earned BOOLEAN;
  v_points INTEGER;
BEGIN
  SELECT * INTO v_bill FROM bills WHERE id = p_bill_id;

  IF FOUND AND v_bill.customer_id IS NOT NULL AND v_bill.status = 'PAID' THEN
    -- Check if already awarded for this bill
    SELECT EXISTS (
      SELECT 1 FROM loyalty_ledger 
      WHERE related_bill_id = p_bill_id AND type = 'EARN'
    ) INTO v_already_earned;

    IF NOT v_already_earned THEN
      -- 1 point per ₹10 spent (1000 paise)
      v_points := FLOOR(v_bill.paid_amount / 1000);
      IF v_points > 0 THEN
        PERFORM record_loyalty_movement(
          v_bill.customer_id,
          'EARN',
          v_points,
          NULL,
          p_bill_id,
          format('Earned %s points for Bill payment', v_points)
        );
      END IF;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Helper: reverse_bill_loyalty_points (Proportional refund reversal)
CREATE OR REPLACE FUNCTION reverse_bill_loyalty_points(
  p_bill_id UUID,
  p_refund_amount_paise INTEGER,
  p_reason TEXT DEFAULT 'Payment refund reversal'
) RETURNS VOID AS $$
DECLARE
  v_bill bills%ROWTYPE;
  v_points INTEGER;
BEGIN
  SELECT * INTO v_bill FROM bills WHERE id = p_bill_id;

  IF FOUND AND v_bill.customer_id IS NOT NULL THEN
    v_points := FLOOR(p_refund_amount_paise / 1000);
    IF v_points > 0 THEN
      PERFORM record_loyalty_movement(
        v_bill.customer_id,
        'REVERSAL',
        v_points,
        NULL,
        p_bill_id,
        format('Reversed %s points due to refund (%s)', v_points, p_reason)
      );
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
