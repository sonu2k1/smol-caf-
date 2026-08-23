-- ==============================================================================
-- Smol Café — Inventory, Recipes & Auto-86 Availability Engine
-- ==============================================================================

-- 1. Units Table (e.g. g, ml, pcs, shots)
CREATE TABLE IF NOT EXISTS units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  symbol TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'weight', -- 'weight', 'volume', 'count'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default standard units
INSERT INTO units (name, symbol, category) VALUES
  ('Gram', 'g', 'weight'),
  ('Kilogram', 'kg', 'weight'),
  ('Millilitre', 'ml', 'volume'),
  ('Litre', 'L', 'volume'),
  ('Piece', 'pcs', 'count'),
  ('Shot', 'shot', 'count')
ON CONFLICT (name) DO NOTHING;

-- 2. Ingredients Table
CREATE TABLE IF NOT EXISTS ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  unit_id UUID REFERENCES units(id),
  cost_per_unit_paise INTEGER NOT NULL DEFAULT 0,
  min_threshold NUMERIC(12, 4) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ingredients_location_id ON ingredients (location_id);

-- 3. Recipes Table
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recipes_menu_item_id ON recipes (menu_item_id);

-- 4. Recipe Components Table
CREATE TABLE IF NOT EXISTS recipe_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
  qty_per_item NUMERIC(12, 4) NOT NULL,
  unit_id UUID REFERENCES units(id),
  is_optional BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recipe_components_recipe_id ON recipe_components (recipe_id);

-- 5. Append-Only Inventory Movements Table
CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('RECEIVE', 'RESERVE', 'RELEASE', 'CONSUME', 'WASTE', 'ADJUST')),
  quantity NUMERIC(12, 4) NOT NULL,
  reference_type TEXT, -- 'ORDER', 'PURCHASE', 'MANUAL_86', 'WASTE', 'AUDIT'
  reference_id UUID,
  actor_type TEXT NOT NULL DEFAULT 'SYSTEM', -- 'SYSTEM', 'CHEF', 'STAFF'
  actor_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_ingredient_id ON inventory_movements (ingredient_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_reference_id ON inventory_movements (reference_id);

-- 6. Function: Get Available Quantity for an Ingredient
CREATE OR REPLACE FUNCTION get_ingredient_available_qty(p_ingredient_id UUID) 
RETURNS NUMERIC AS $$
DECLARE
  v_available NUMERIC;
BEGIN
  SELECT COALESCE(
    SUM(
      CASE 
        WHEN movement_type IN ('RECEIVE', 'RELEASE') THEN quantity
        WHEN movement_type = 'ADJUST' THEN quantity
        WHEN movement_type IN ('RESERVE', 'CONSUME', 'WASTE') THEN -quantity
        ELSE 0
      END
    ), 0
  ) INTO v_available
  FROM inventory_movements
  WHERE ingredient_id = p_ingredient_id;

  RETURN GREATEST(0, v_available);
END;
$$ LANGUAGE plpgsql STABLE;

-- 7. Function: Servable Quantity for a Menu Item
CREATE OR REPLACE FUNCTION servable_qty(p_menu_item_id UUID) 
RETURNS INTEGER AS $$
DECLARE
  v_item_status TEXT;
  v_active_recipe_id UUID;
  v_min_servable INTEGER := 9999;
  v_comp RECORD;
  v_avail_qty NUMERIC;
  v_comp_servable INTEGER;
  v_has_components BOOLEAN := false;
BEGIN
  -- A. Manual 86 Check: Chef/Admin sold-out override always wins
  SELECT status INTO v_item_status FROM menu_items WHERE id = p_menu_item_id;
  IF NOT FOUND OR v_item_status IN ('SOLD_OUT', '86', 'INACTIVE') THEN
    RETURN 0;
  END IF;

  -- B. Find active recipe
  SELECT id INTO v_active_recipe_id 
  FROM recipes 
  WHERE menu_item_id = p_menu_item_id AND is_active = true 
  ORDER BY version DESC 
  LIMIT 1;

  -- If no active recipe exists, treat as unconstrained
  IF v_active_recipe_id IS NULL THEN
    RETURN 9999;
  END IF;

  -- C. Compute bottleneck across mandatory components
  FOR v_comp IN 
    SELECT ingredient_id, qty_per_item 
    FROM recipe_components 
    WHERE recipe_id = v_active_recipe_id AND is_optional = false
  LOOP
    v_has_components := true;
    v_avail_qty := get_ingredient_available_qty(v_comp.ingredient_id);

    IF v_avail_qty <= 0 OR v_comp.qty_per_item <= 0 THEN
      RETURN 0;
    END IF;

    v_comp_servable := FLOOR(v_avail_qty / v_comp.qty_per_item);
    IF v_comp_servable < v_min_servable THEN
      v_min_servable := v_comp_servable;
    END IF;
  END LOOP;

  IF NOT v_has_components THEN
    RETURN 9999;
  END IF;

  RETURN v_min_servable;
END;
$$ LANGUAGE plpgsql STABLE;

-- 8. Helper: Handle Inventory Transition on Order Status Changes
CREATE OR REPLACE FUNCTION handle_order_inventory_transition(
  p_order_id UUID,
  p_to_status TEXT
) RETURNS VOID AS $$
DECLARE
  v_item RECORD;
  v_recipe_id UUID;
  v_comp RECORD;
  v_now TIMESTAMPTZ := now();
BEGIN
  -- When kitchen moves to PREPARING: Release reservation & record CONSUME
  IF p_to_status = 'PREPARING' THEN
    FOR v_item IN SELECT menu_item_id, qty FROM order_items WHERE order_id = p_order_id
    LOOP
      SELECT id INTO v_recipe_id FROM recipes WHERE menu_item_id = v_item.menu_item_id AND is_active = true LIMIT 1;
      IF v_recipe_id IS NOT NULL THEN
        FOR v_comp IN SELECT ingredient_id, qty_per_item FROM recipe_components WHERE recipe_id = v_recipe_id
        LOOP
          -- 1. Release Reservation
          INSERT INTO inventory_movements (
            ingredient_id, movement_type, quantity, reference_type, reference_id, notes, created_at
          ) VALUES (
            v_comp.ingredient_id, 'RELEASE', v_comp.qty_per_item * v_item.qty, 'ORDER', p_order_id, 'Released on kitchen start prep', v_now
          );

          -- 2. Record Permanent Consumption
          INSERT INTO inventory_movements (
            ingredient_id, movement_type, quantity, reference_type, reference_id, notes, created_at
          ) VALUES (
            v_comp.ingredient_id, 'CONSUME', v_comp.qty_per_item * v_item.qty, 'ORDER', p_order_id, 'Consumed in kitchen cooking', v_now
          );
        END LOOP;
      END IF;
    END LOOP;

  -- When order is CANCELLED or REJECTED: Release any existing reservations
  ELSIF p_to_status IN ('CANCELLED', 'REJECTED') THEN
    FOR v_item IN SELECT menu_item_id, qty FROM order_items WHERE order_id = p_order_id
    LOOP
      SELECT id INTO v_recipe_id FROM recipes WHERE menu_item_id = v_item.menu_item_id AND is_active = true LIMIT 1;
      IF v_recipe_id IS NOT NULL THEN
        FOR v_comp IN SELECT ingredient_id, qty_per_item FROM recipe_components WHERE recipe_id = v_recipe_id
        LOOP
          INSERT INTO inventory_movements (
            ingredient_id, movement_type, quantity, reference_type, reference_id, notes, created_at
          ) VALUES (
            v_comp.ingredient_id, 'RELEASE', v_comp.qty_per_item * v_item.qty, 'ORDER', p_order_id, 'Released on order cancellation', v_now
          );
        END LOOP;
      END IF;
    END LOOP;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Update submit_order to Reserve Inventory Atomically in the Same Transaction
CREATE OR REPLACE FUNCTION submit_order(
  p_location_id UUID,
  p_table_session_id UUID,
  p_idempotency_key TEXT,
  p_items JSONB -- Array of { menu_item_id, expected_unit_price_paise, qty }
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
  v_tax_paise INTEGER := 0;
  v_total_paise INTEGER := 0;
  v_price_conflicts JSONB := '[]'::jsonb;
  v_stock_conflicts JSONB := '[]'::jsonb;
  v_recipe_id UUID;
  v_comp RECORD;
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

  -- 7. Insert Order Items & Reserve Ingredient Stock in the SAME Transaction
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

    -- Reserve Ingredients for this item's active recipe
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
