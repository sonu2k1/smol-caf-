-- ==============================================================================
-- Smol Café — Basic Procurement & Goods Receipt Engine
-- ==============================================================================

-- 1. Vendors Table
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  tax_id TEXT, -- GSTIN
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Purchase Orders Table
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number TEXT NOT NULL UNIQUE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
  status TEXT NOT NULL CHECK (status IN ('DRAFT', 'APPROVED', 'SENT', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CLOSED', 'CANCELLED')) DEFAULT 'DRAFT',
  total_amount_paise INTEGER NOT NULL DEFAULT 0,
  expected_delivery_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_vendor ON purchase_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);

-- 3. Purchase Order Lines Table
CREATE TABLE IF NOT EXISTS purchase_order_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
  ordered_qty NUMERIC(12, 3) NOT NULL,
  received_qty NUMERIC(12, 3) NOT NULL DEFAULT 0,
  unit_cost_paise INTEGER NOT NULL,
  line_total_paise INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_po_lines_po_id ON purchase_order_lines(po_id);
CREATE INDEX IF NOT EXISTS idx_po_lines_ingredient ON purchase_order_lines(ingredient_id);

-- 4. Goods Receipts (GRN) Table
CREATE TABLE IF NOT EXISTS goods_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grn_number TEXT NOT NULL UNIQUE,
  po_id UUID REFERENCES purchase_orders(id) ON DELETE SET NULL,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
  invoice_no TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_goods_receipts_po ON goods_receipts(po_id);
CREATE INDEX IF NOT EXISTS idx_goods_receipts_vendor ON goods_receipts(vendor_id);

-- 5. Goods Receipt Lines Table
CREATE TABLE IF NOT EXISTS goods_receipt_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grn_id UUID NOT NULL REFERENCES goods_receipts(id) ON DELETE CASCADE,
  po_line_id UUID REFERENCES purchase_order_lines(id) ON DELETE SET NULL,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
  received_qty NUMERIC(12, 3) NOT NULL,
  unit_cost_paise INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_grn_lines_grn ON goods_receipt_lines(grn_id);
CREATE INDEX IF NOT EXISTS idx_grn_lines_ingredient ON goods_receipt_lines(ingredient_id);

-- 6. Atomic Goods Receipt Stored Procedure
-- Ingests inventory into inventory_movements (RECEIVE) and updates PO fulfillment state
CREATE OR REPLACE FUNCTION record_goods_receipt(
  p_po_id UUID,
  p_vendor_id UUID,
  p_invoice_no TEXT,
  p_notes TEXT,
  p_lines JSONB -- Array of { po_line_id, ingredient_id, received_qty, unit_cost_paise }
) RETURNS JSONB AS $$
DECLARE
  v_grn_id UUID;
  v_grn_number TEXT;
  v_grn_seq INTEGER;
  v_line JSONB;
  v_po_line_id UUID;
  v_ingredient_id UUID;
  v_received_qty NUMERIC(12, 3);
  v_unit_cost INTEGER;
  v_now TIMESTAMPTZ := now();
  v_all_received BOOLEAN := true;
  v_any_received BOOLEAN := false;
  v_pol RECORD;
BEGIN
  -- 1. Generate Sequential GRN Number
  SELECT COALESCE(COUNT(*), 0) + 1 INTO v_grn_seq FROM goods_receipts;
  v_grn_number := 'GRN-' || TO_CHAR(v_now, 'YYYYMM') || '-' || LPAD(v_grn_seq::TEXT, 4, '0');

  -- 2. Insert Goods Receipt
  INSERT INTO goods_receipts (
    grn_number,
    po_id,
    vendor_id,
    invoice_no,
    received_at,
    notes
  ) VALUES (
    v_grn_number,
    p_po_id,
    p_vendor_id,
    p_invoice_no,
    v_now,
    p_notes
  ) RETURNING id INTO v_grn_id;

  -- 3. Process Each Line: Log GRN line, insert RECEIVE inventory movement, update PO line
  FOR v_line IN SELECT * FROM jsonb_array_elements(p_lines)
  LOOP
    v_po_line_id := (v_line->>'po_line_id')::UUID;
    v_ingredient_id := (v_line->>'ingredient_id')::UUID;
    v_received_qty := (v_line->>'received_qty')::NUMERIC;
    v_unit_cost := (v_line->>'unit_cost_paise')::INTEGER;

    IF v_received_qty > 0 THEN
      -- Insert GRN Line
      INSERT INTO goods_receipt_lines (
        grn_id,
        po_line_id,
        ingredient_id,
        received_qty,
        unit_cost_paise
      ) VALUES (
        v_grn_id,
        v_po_line_id,
        v_ingredient_id,
        v_received_qty,
        v_unit_cost
      );

      -- Ingest to inventory_movements ledger (Append-Only RECEIVE)
      INSERT INTO inventory_movements (
        ingredient_id,
        movement_type,
        quantity,
        reference_type,
        reference_id,
        notes,
        created_at
      ) VALUES (
        v_ingredient_id,
        'RECEIVE',
        v_received_qty,
        'PURCHASE_ORDER',
        v_grn_id,
        COALESCE(p_notes, 'Goods received via ' || v_grn_number),
        v_now
      );

      -- Update PO Line received quantity if linked to a PO
      IF v_po_line_id IS NOT NULL THEN
        UPDATE purchase_order_lines
        SET received_qty = received_qty + v_received_qty
        WHERE id = v_po_line_id;
      END IF;
    END IF;
  END LOOP;

  -- 4. If linked to PO, recalculate PO status
  IF p_po_id IS NOT NULL THEN
    FOR v_pol IN SELECT ordered_qty, received_qty FROM purchase_order_lines WHERE po_id = p_po_id
    LOOP
      IF v_pol.received_qty > 0 THEN
        v_any_received := true;
      END IF;
      IF v_pol.received_qty < v_pol.ordered_qty THEN
        v_all_received := false;
      END IF;
    END LOOP;

    IF v_all_received THEN
      UPDATE purchase_orders SET status = 'RECEIVED', updated_at = v_now WHERE id = p_po_id;
    ELSIF v_any_received THEN
      UPDATE purchase_orders SET status = 'PARTIALLY_RECEIVED', updated_at = v_now WHERE id = p_po_id;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'grn_id', v_grn_id,
    'grn_number', v_grn_number,
    'message', 'Goods Receipt ' || v_grn_number || ' recorded and inventory stock updated successfully.'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Seed Initial Vendors
INSERT INTO vendors (name, contact_person, phone, email, address, tax_id, notes)
VALUES
  (
    'Blue Mountain Dairy Co.',
    'Rajesh Sharma',
    '+91 98201 11223',
    'orders@bluemountaindairy.in',
    'Unit 4B, MIDC Industrial Area, Mumbai',
    '27AAAAA0000A1Z5',
    'Supplies fresh full-cream milk, butter, and heavy cream daily before 6 AM.'
  ),
  (
    'Chikmagalur Coffee Estate Direct',
    'Venkatesh Rao',
    '+91 94481 99887',
    'supply@chikmagalurbeans.com',
    'Estate #12, Mallandur Road, Chikmagalur, Karnataka',
    '29BBBBB1111B2Z6',
    'Specialty shade-grown Arabica & Peaberry beans. Roasted in weekly small batches.'
  ),
  (
    'Bombay Bakery & Spice Traders',
    'Firoz Contractor',
    '+91 98210 55443',
    'firoz@bombaybakerysupplies.in',
    'Crawford Market, Fort, Mumbai',
    '27CCCCC2222C3Z7',
    'Flour, active dry yeast, Iranian saffron, and fresh green cardamom pods.'
  )
ON CONFLICT DO NOTHING;
