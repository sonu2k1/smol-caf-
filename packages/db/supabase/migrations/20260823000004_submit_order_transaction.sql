-- ==============================================================================
-- Smol Café — Atomic Order Submission Transaction (Step 1.3)
-- Server-side price re-validation, idempotency, snapshotting, and audit logging
-- ==============================================================================

-- 1. Ensure idempotency_key column exists on orders table
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_orders_idempotency_key 
  ON orders (idempotency_key);

-- 2. Atomic submit_order PostgreSQL Function
CREATE OR REPLACE FUNCTION submit_order(
  p_location_id UUID,
  p_table_session_id UUID,
  p_idempotency_key TEXT,
  p_items JSONB -- Array of { menu_item_id: UUID, expected_unit_price_paise: INTEGER, qty: INTEGER }
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
  v_line_subtotal INTEGER;
  v_subtotal_paise INTEGER := 0;
  v_tax_paise INTEGER := 0;
  v_total_paise INTEGER := 0;
  v_price_conflicts JSONB := '[]'::jsonb;
  v_now TIMESTAMPTZ := now();
BEGIN
  -- 1. Check Idempotency (Prevent double-taps from creating duplicate orders)
  IF p_idempotency_key IS NOT NULL AND p_idempotency_key != '' THEN
    SELECT * INTO v_existing_order FROM orders WHERE idempotency_key = p_idempotency_key;
    IF FOUND THEN
      RETURN jsonb_build_object(
        'success', true,
        'is_duplicate', true,
        'order_id', v_existing_order.id,
        'order_no', v_existing_order.order_no,
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

  -- 3. Re-validate Current Prices & Catalog Status
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

  -- If any item had price change, abort and return diff
  IF jsonb_array_length(v_price_conflicts) > 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'PRICE_CHANGED',
      'message', 'Some item prices have changed. Please review your updated order.',
      'changed_items', v_price_conflicts
    );
  END IF;

  -- 4. Calculate Financial Totals
  v_tax_paise := 0;
  v_total_paise := v_subtotal_paise + v_tax_paise;

  -- 5. Generate Next Sequential Order Number for Location
  SELECT COALESCE(MAX(order_no), 0) + 1 INTO v_order_no 
  FROM orders 
  WHERE location_id = p_location_id;

  -- 6. Insert Order Record
  INSERT INTO orders (
    location_id,
    table_session_id,
    order_no,
    status,
    service_mode,
    submitted_at,
    subtotal_snapshot,
    tax_snapshot,
    total_snapshot,
    idempotency_key,
    version
  ) VALUES (
    p_location_id,
    p_table_session_id,
    v_order_no,
    'SUBMITTED',
    'DINE_IN',
    v_now,
    v_subtotal_paise,
    v_tax_paise,
    v_total_paise,
    p_idempotency_key,
    1
  ) RETURNING id INTO v_order_id;

  -- 7. Insert Order Items (Immutable Price & Name Snapshot)
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
  END LOOP;

  -- 8. Insert Order Status History (Audit Trail: DRAFT -> SUBMITTED)
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

  -- 9. Return Success Response
  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'order_no', v_order_no,
    'subtotal_paise', v_subtotal_paise,
    'tax_paise', v_tax_paise,
    'total_paise', v_total_paise
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
