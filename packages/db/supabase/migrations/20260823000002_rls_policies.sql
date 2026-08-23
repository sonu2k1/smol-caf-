-- ==============================================================================
-- Smol Café — Row Level Security (RLS) Policies (Step 0.4)
-- Deny-by-default, customer table_session isolation, and staff RBAC
-- ==============================================================================

-- 1. Helper Functions
-- Extract table_session_id claim from JWT for anonymous customer sessions
CREATE OR REPLACE FUNCTION current_table_session_id() RETURNS UUID AS $$
  SELECT NULLIF(
    COALESCE(
      current_setting('request.jwt.claims', true)::json->>'table_session_id',
      current_setting('request.jwt.claim.table_session_id', true)
    ),
    ''
  )::UUID;
$$ LANGUAGE sql STABLE;

-- Extract staff role from authenticated JWT claims
CREATE OR REPLACE FUNCTION current_staff_role() RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->'app_metadata'->>'role',
    current_setting('request.jwt.claims', true)::json->'user_metadata'->>'role'
  );
$$ LANGUAGE sql STABLE;

-- Check if current user is an authenticated staff member
CREATE OR REPLACE FUNCTION is_staff() RETURNS BOOLEAN AS $$
  SELECT auth.role() = 'authenticated' AND current_staff_role() IN ('super_admin', 'admin', 'cashier', 'kitchen', 'chef');
$$ LANGUAGE sql STABLE;

-- Check if current user is admin or super_admin
CREATE OR REPLACE FUNCTION is_admin_or_super() RETURNS BOOLEAN AS $$
  SELECT auth.role() = 'authenticated' AND current_staff_role() IN ('super_admin', 'admin');
$$ LANGUAGE sql STABLE;

-- Check if current user is cashier, admin, or super_admin
CREATE OR REPLACE FUNCTION is_cashier_or_above() RETURNS BOOLEAN AS $$
  SELECT auth.role() = 'authenticated' AND current_staff_role() IN ('super_admin', 'admin', 'cashier');
$$ LANGUAGE sql STABLE;

-- 2. Enable RLS on all 13 Tables (Deny by default)
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE dining_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_qr_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_attempts ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 3. Public Read Catalogs (Menu & Locations)
-- ------------------------------------------------------------------------------

-- locations: public read, admin write
CREATE POLICY "locations_public_read" ON locations
  FOR SELECT USING (true);

CREATE POLICY "locations_admin_write" ON locations
  FOR ALL USING (is_admin_or_super());

-- dining_tables: public read active tables, admin write
CREATE POLICY "dining_tables_public_read" ON dining_tables
  FOR SELECT USING (active = true OR is_staff());

CREATE POLICY "dining_tables_admin_write" ON dining_tables
  FOR ALL USING (is_admin_or_super());

-- table_qr_tokens: public read active tokens only (for QR scanner resolution), admin write
CREATE POLICY "table_qr_tokens_resolve" ON table_qr_tokens
  FOR SELECT USING (revoked_at IS NULL OR is_staff());

CREATE POLICY "table_qr_tokens_admin_write" ON table_qr_tokens
  FOR ALL USING (is_admin_or_super());

-- menu_categories: public read, admin write
CREATE POLICY "menu_categories_public_read" ON menu_categories
  FOR SELECT USING (true);

CREATE POLICY "menu_categories_admin_write" ON menu_categories
  FOR ALL USING (is_admin_or_super());

-- menu_items: public read, admin write
CREATE POLICY "menu_items_public_read" ON menu_items
  FOR SELECT USING (true);

CREATE POLICY "menu_items_admin_write" ON menu_items
  FOR ALL USING (is_admin_or_super());

-- menu_item_versions: public read, admin write
CREATE POLICY "menu_item_versions_public_read" ON menu_item_versions
  FOR SELECT USING (true);

CREATE POLICY "menu_item_versions_admin_write" ON menu_item_versions
  FOR ALL USING (is_admin_or_super());

-- menu_prices: public read, admin write
CREATE POLICY "menu_prices_public_read" ON menu_prices
  FOR SELECT USING (true);

CREATE POLICY "menu_prices_admin_write" ON menu_prices
  FOR ALL USING (is_admin_or_super());

-- ------------------------------------------------------------------------------
-- 4. Customer Session-Scoped Policies (Isolated to current table_session_id)
-- ------------------------------------------------------------------------------

-- table_sessions:
-- 1) Customers can SELECT their own session
-- 2) Customers can INSERT a new session (or through Server Action)
-- 3) Staff can SELECT/UPDATE all sessions
CREATE POLICY "table_sessions_customer_select" ON table_sessions
  FOR SELECT USING (
    id = current_table_session_id() OR is_staff()
  );

CREATE POLICY "table_sessions_customer_insert" ON table_sessions
  FOR INSERT WITH CHECK (
    id = current_table_session_id() OR is_staff() OR auth.role() = 'anon'
  );

CREATE POLICY "table_sessions_staff_update" ON table_sessions
  FOR UPDATE USING (is_staff());

-- orders:
-- 1) Customers can SELECT and INSERT orders tied to their own table_session_id
-- 2) Staff can SELECT all orders; Cashier/Admin can INSERT/UPDATE; Kitchen can UPDATE status
CREATE POLICY "orders_customer_select" ON orders
  FOR SELECT USING (
    (table_session_id IS NOT NULL AND table_session_id = current_table_session_id())
    OR is_staff()
  );

CREATE POLICY "orders_customer_insert" ON orders
  FOR INSERT WITH CHECK (
    (table_session_id IS NOT NULL AND table_session_id = current_table_session_id())
    OR is_cashier_or_above()
  );

CREATE POLICY "orders_staff_update" ON orders
  FOR UPDATE USING (is_staff());

-- order_items:
-- 1) Customers can SELECT and INSERT items for their session's orders
-- 2) Staff can SELECT all order items, Kitchen/Cashier can UPDATE item status
CREATE POLICY "order_items_customer_select" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND (orders.table_session_id = current_table_session_id() OR is_staff())
    )
  );

CREATE POLICY "order_items_customer_insert" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND (orders.table_session_id = current_table_session_id() OR is_cashier_or_above())
    )
  );

CREATE POLICY "order_items_staff_update" ON order_items
  FOR UPDATE USING (is_staff());

-- order_status_history:
-- 1) Customers can SELECT audit history for their own orders
-- 2) Staff and backend can INSERT history rows
CREATE POLICY "order_status_history_customer_select" ON order_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_status_history.order_id
        AND (orders.table_session_id = current_table_session_id() OR is_staff())
    )
  );

CREATE POLICY "order_status_history_insert" ON order_status_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_status_history.order_id
        AND (orders.table_session_id = current_table_session_id() OR is_staff())
    )
  );

-- bills:
-- 1) Customers can SELECT the bill tied to their own table_session_id
-- 2) Cashier/Admin can manage all bills
CREATE POLICY "bills_customer_select" ON bills
  FOR SELECT USING (
    table_session_id = current_table_session_id() OR is_staff()
  );

CREATE POLICY "bills_staff_write" ON bills
  FOR ALL USING (is_cashier_or_above());

-- payment_attempts:
-- 1) Customers can SELECT and INSERT payment attempts for their own session's bill
-- 2) Cashier/Admin can manage payment attempts
CREATE POLICY "payment_attempts_customer_select" ON payment_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bills
      WHERE bills.id = payment_attempts.bill_id
        AND (bills.table_session_id = current_table_session_id() OR is_staff())
    )
  );

CREATE POLICY "payment_attempts_customer_insert" ON payment_attempts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM bills
      WHERE bills.id = payment_attempts.bill_id
        AND (bills.table_session_id = current_table_session_id() OR is_cashier_or_above())
    )
  );

CREATE POLICY "payment_attempts_staff_update" ON payment_attempts
  FOR UPDATE USING (is_cashier_or_above());
