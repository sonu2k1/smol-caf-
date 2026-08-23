-- ==============================================================================
-- Smol Café — Profiles, Optional Accounts & 24h Order Claiming Engine
-- ==============================================================================

-- 1. Profiles Table linked to auth.users
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  phone TEXT UNIQUE,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Add nullable customer_id to orders and bills
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);

ALTER TABLE bills 
  ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_bills_customer_id ON bills(customer_id);

-- 3. Function: claim_session_orders with 24-hour claim window validation
CREATE OR REPLACE FUNCTION claim_session_orders(
  p_profile_id UUID,
  p_session_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_session table_sessions%ROWTYPE;
  v_count INTEGER := 0;
  v_window_start TIMESTAMPTZ := now() - INTERVAL '24 hours';
BEGIN
  -- Verify session exists
  SELECT * INTO v_session FROM table_sessions WHERE id = p_session_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'SESSION_NOT_FOUND',
      'message', 'Dining table session could not be found.'
    );
  END IF;

  -- Verify 24-Hour Claim Window
  IF v_session.opened_at < v_window_start THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'CLAIM_EXPIRED',
      'message', 'The 24-hour claim window for this dining session has expired.'
    );
  END IF;

  -- Link orders to customer profile
  UPDATE orders 
  SET customer_id = p_profile_id,
      updated_at = now()
  WHERE table_session_id = p_session_id;

  GET DIAGNOSTICS v_count = ROW_COUNT;

  -- Link bills to customer profile
  UPDATE bills 
  SET customer_id = p_profile_id
  WHERE table_session_id = p_session_id;

  RETURN jsonb_build_object(
    'success', true,
    'claimed_orders_count', v_count,
    'message', format('Successfully linked %s orders to your account!', v_count)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Row Level Security for Profiles & Customer Order History Lookups
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Allow authenticated customers to view their claimed orders
CREATE POLICY "orders_select_claimed" ON orders
  FOR SELECT TO authenticated
  USING (customer_id = auth.uid());

-- Allow authenticated customers to view their claimed bills
CREATE POLICY "bills_select_claimed" ON bills
  FOR SELECT TO authenticated
  USING (customer_id = auth.uid());
