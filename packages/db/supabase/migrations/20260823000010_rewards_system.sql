-- ==============================================================================
-- Smol Café — Rewards Catalog & Atomic Cart Redemption Engine
-- ==============================================================================

-- 1. Rewards Table
CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('FIXED_ITEM', 'FIXED_VALUE', 'PERCENTAGE')),
  discount_value INTEGER NOT NULL DEFAULT 0, -- paise for FIXED_VALUE, percentage (1-100) for PERCENTAGE
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
  points_cost INTEGER NOT NULL,
  expiry_days INTEGER DEFAULT 30,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Reward Redemptions Table
CREATE TABLE IF NOT EXISTS reward_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reward_id UUID NOT NULL REFERENCES rewards(id) ON DELETE RESTRICT,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  points_spent INTEGER NOT NULL,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reward_redemptions_profile_id ON reward_redemptions(profile_id);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_order_id ON reward_redemptions(order_id);

-- 3. Add discount_snapshot to orders
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS discount_snapshot INTEGER NOT NULL DEFAULT 0;

-- 4. Seed Default Rewards
INSERT INTO rewards (name, description, type, discount_value, points_cost, expiry_days, active)
VALUES
  ('₹50 Off Any Order', 'Flat ₹50 discount on your current table bill.', 'FIXED_VALUE', 5000, 50, 30, true),
  ('15% Off Your Meal', 'Enjoy 15% off your entire dining round.', 'PERCENTAGE', 15, 75, 30, true),
  ('Free Bun Maska Treat', 'Complimentary classic Irani Bun Maska up to ₹80.', 'FIXED_VALUE', 8000, 40, 30, true)
ON CONFLICT DO NOTHING;

-- 5. Updated submit_order Function with Atomic Reward Redemption & Points Debit
CREATE OR REPLACE FUNCTION submit_order(
  p_location_id UUID,
  p_table_session_id UUID,
  p_idempotency_key TEXT,
  p_items JSONB, -- Array of { menu_item_id, expected_unit_price_paise, qty }
  p_reward_id UUID DEFAULT NULL,
  p_profile_id UUID DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_session_status table_session_status;
  v_existing_order orders%ROWTYPE;
  v_order_no INTEGER;
  v_order_id UUID;
  v_item JSONB;
  v_menu_item_id UUID;
  v_expected_price INTEGER;
  v_current_price INTEGER;
  v_item_name TEXT;
  v_version_id UUID;
  v_qty INTEGER;
  v_servable INTEGER;
  v_line_subtotal INTEGER;
  v_subtotal_paise INTEGER := 0;
  v_discount_paise INTEGER := 0;
  v_tax_paise INTEGER := 0;
  v_total_paise INTEGER := 0;
  v_price_conflicts JSONB := '[]'::jsonb;
  v_stock_conflicts JSONB := '[]'::jsonb;
  v_recipe_id UUID;
  v_comp RECORD;
  v_reward rewards%ROWTYPE;
  v_user_balance INTEGER := 0;
  v_now TIMESTAMPTZ := now();
BEGIN
  -- 1. Check Idempotency (Prevent double-taps)
  IF p_idempotency_key IS NOT NULL AND p_idempotency_key != '' THEN
    SELECT * INTO v_existing_order FROM orders WHERE idempotency_key = p_idempotency_key;
    IF FOUND THEN
      RETURN jsonb_build_object(
        'success', true,
        'is_duplicate', true,
        'order_id', v_existing_order.id,
        'order_no', v_existing_order.order_no,
        'discount_paise', v_existing_order.discount_snapshot,
        'total_paise', v_existing_order.total_snapshot
      );
    END IF;
  END IF;

  -- 2. Verify Table Session is OPEN
  SELECT status INTO v_session_status 
  FROM table_sessions 
  WHERE id = p_table_session_id AND location_id = p_location_id;

  IF NOT FOUND OR v_session_status != 'OPEN' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'SESSION_NOT_OPEN',
      'message', 'Your table session is no longer active. Please scan the QR code again.'
    );
  END IF;

  -- 3. Re-validate Current Prices & Servable Stock Quantities
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_menu_item_id := (v_item->>'menu_item_id')::UUID;
    v_expected_price := (v_item->>'expected_unit_price_paise')::INTEGER;
    v_qty := (v_item->>'qty')::INTEGER;

    -- Fetch item name and latest version
    SELECT mi.name, mv.id INTO v_item_name, v_version_id
    FROM menu_items mi
    LEFT JOIN menu_item_versions mv ON mv.menu_item_id = mi.id
    WHERE mi.id = v_menu_item_id
    ORDER BY mv.created_at DESC
    LIMIT 1;

    -- Check Servable Quantity
    v_servable := servable_qty(v_menu_item_id);
    IF v_servable < v_qty THEN
      v_stock_conflicts := v_stock_conflicts || jsonb_build_object(
        'menu_item_id', v_menu_item_id,
        'name', COALESCE(v_item_name, 'Item'),
        'requested_qty', v_qty,
        'servable_qty', v_servable
      );
    END IF;

    -- Fetch current effective price
    SELECT amount_paise INTO v_current_price
    FROM menu_prices
    WHERE menu_item_id = v_menu_item_id
      AND effective_from <= v_now
      AND (effective_to IS NULL OR effective_to > v_now)
    ORDER BY effective_from DESC
    LIMIT 1;

    IF v_current_price IS NULL OR v_current_price != v_expected_price THEN
      v_price_conflicts := v_price_conflicts || jsonb_build_object(
        'menu_item_id', v_menu_item_id,
        'name', COALESCE(v_item_name, 'Unknown item'),
        'expected_price_paise', v_expected_price,
        'current_price_paise', COALESCE(v_current_price, 0)
      );
    ELSE
      v_subtotal_paise := v_subtotal_paise + (v_current_price * v_qty);
    END IF;
  END LOOP;

  -- Stock Conflict Abort
  IF jsonb_array_length(v_stock_conflicts) > 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'OUT_OF_STOCK',
      'message', 'Some items are currently sold out or have insufficient ingredients.',
      'stock_conflicts', v_stock_conflicts
    );
  END IF;

  -- Price Conflict Abort
  IF jsonb_array_length(v_price_conflicts) > 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'PRICE_CHANGED',
      'message', 'Some item prices have changed. Please review your updated order.',
      'changed_items', v_price_conflicts
    );
  END IF;

  -- 4. Server-Side Reward & Discount Validation
  IF p_reward_id IS NOT NULL THEN
    IF p_profile_id IS NULL THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'AUTH_REQUIRED',
        'message', 'Please sign in to redeem loyalty rewards.'
      );
    END IF;

    SELECT * INTO v_reward FROM rewards WHERE id = p_reward_id AND active = true;
    IF NOT FOUND THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'INVALID_REWARD',
        'message', 'Selected reward is inactive or does not exist.'
      );
    END IF;

    -- Check customer points balance
    SELECT COALESCE(current_balance_cached, 0) INTO v_user_balance
    FROM loyalty_accounts
    WHERE profile_id = p_profile_id;

    IF v_user_balance < v_reward.points_cost THEN
      RETURN jsonb_build_object(
        'success', false,
        'error', 'INSUFFICIENT_POINTS',
        'message', format('Insufficient points. You need %s points for this reward.', v_reward.points_cost)
      );
    END IF;

    -- Calculate Discount Amount
    IF v_reward.type = 'PERCENTAGE' THEN
      v_discount_paise := FLOOR(v_subtotal_paise * v_reward.discount_value / 100);
    ELSIF v_reward.type = 'FIXED_VALUE' THEN
      v_discount_paise := LEAST(v_subtotal_paise, v_reward.discount_value);
    ELSIF v_reward.type = 'FIXED_ITEM' THEN
      v_discount_paise := LEAST(v_subtotal_paise, v_reward.discount_value);
    END IF;
  END IF;

  -- 5. Calculate Final Financial Totals
  v_tax_paise := 0;
  v_total_paise := GREATEST(0, (v_subtotal_paise - v_discount_paise) + v_tax_paise);

  -- 6. Generate Next Sequential Order Number
  SELECT COALESCE(MAX(order_no), 0) + 1 INTO v_order_no 
  FROM orders 
  WHERE location_id = p_location_id;

  -- 7. Insert Order Record
  INSERT INTO orders (
    location_id,
    table_session_id,
    customer_id,
    order_no,
    status,
    service_mode,
    submitted_at,
    subtotal_snapshot,
    discount_snapshot,
    tax_snapshot,
    total_snapshot,
    idempotency_key,
    version
  ) VALUES (
    p_location_id,
    p_table_session_id,
    p_profile_id,
    v_order_no,
    'SUBMITTED',
    'DINE_IN',
    v_now,
    v_subtotal_paise,
    v_discount_paise,
    v_tax_paise,
    v_total_paise,
    p_idempotency_key,
    1
  ) RETURNING id INTO v_order_id;

  -- 8. Debit Points & Record Reward Redemption in the SAME Transaction
  IF p_reward_id IS NOT NULL AND v_discount_paise > 0 THEN
    -- Debit loyalty ledger
    PERFORM record_loyalty_movement(
      p_profile_id,
      'REDEEM',
      v_reward.points_cost,
      v_order_id,
      NULL,
      format('Redeemed reward: %s (Saved ₹%s)', v_reward.name, (v_discount_paise / 100))
    );

    -- Insert reward_redemptions
    INSERT INTO reward_redemptions (
      reward_id,
      profile_id,
      order_id,
      points_spent,
      redeemed_at
    ) VALUES (
      p_reward_id,
      p_profile_id,
      v_order_id,
      v_reward.points_cost,
      v_now
    );
  END IF;

  -- 9. Insert Order Items & Reserve Stock
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_menu_item_id := (v_item->>'menu_item_id')::UUID;
    v_qty := (v_item->>'qty')::INTEGER;

    SELECT mi.name, mv.id, mp.amount_paise 
    INTO v_item_name, v_version_id, v_current_price
    FROM menu_items mi
    LEFT JOIN menu_item_versions mv ON mv.menu_item_id = mi.id
    JOIN menu_prices mp ON mp.menu_item_id = mi.id
    WHERE mi.id = v_menu_item_id
      AND mp.effective_from <= v_now
      AND (mp.effective_to IS NULL OR mp.effective_to > v_now)
    ORDER BY mv.created_at DESC, mp.effective_from DESC
    LIMIT 1;

    v_line_subtotal := v_current_price * v_qty;

    INSERT INTO order_items (
      order_id,
      menu_item_id,
      menu_item_version_id,
      name_snapshot,
      unit_price_snapshot,
      qty,
      line_subtotal,
      item_status
    ) VALUES (
      v_order_id,
      v_menu_item_id,
      v_version_id,
      COALESCE(v_item_name, 'Unknown Item'),
      v_current_price,
      v_qty,
      v_line_subtotal,
      'PENDING'
    );

    -- Reserve Ingredients
    SELECT id INTO v_recipe_id FROM recipes WHERE menu_item_id = v_menu_item_id AND is_active = true LIMIT 1;
    IF v_recipe_id IS NOT NULL THEN
      FOR v_comp IN SELECT ingredient_id, qty_per_item FROM recipe_components WHERE recipe_id = v_recipe_id
      LOOP
        INSERT INTO inventory_movements (
          ingredient_id,
          movement_type,
          quantity,
          reference_type,
          reference_id,
          notes,
          created_at
        ) VALUES (
          v_comp.ingredient_id,
          'RESERVE',
          v_comp.qty_per_item * v_qty,
          'ORDER',
          v_order_id,
          'Reserved on order submission',
          v_now
        );
      END LOOP;
    END IF;
  END LOOP;

  -- 10. Audit History
  INSERT INTO order_status_history (
    order_id,
    from_status,
    to_status,
    actor_type,
    created_at
  ) VALUES (
    v_order_id,
    'DRAFT',
    'SUBMITTED',
    'CUSTOMER',
    v_now
  );

  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'order_no', v_order_no,
    'subtotal_paise', v_subtotal_paise,
    'discount_paise', v_discount_paise,
    'tax_paise', v_tax_paise,
    'total_paise', v_total_paise
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
