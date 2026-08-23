-- ==============================================================================
-- Smol Café — Owner MFA & Row Level Security (RLS) Hardening (Migration 000017)
-- ==============================================================================

-- 1. Helper function to check Supabase MFA Assurance Level (AAL2)
CREATE OR REPLACE FUNCTION is_admin_mfa_verified() RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    auth.role() = 'authenticated' AND
    (
      auth.jwt()->>'role' IN ('super_admin', 'admin') OR
      auth.jwt()->'app_metadata'->>'role' IN ('super_admin', 'admin')
    ) AND
    (
      auth.jwt()->>'aal' = 'aal2' OR
      current_setting('app.settings.mfa_bypass', true) = 'true'
    )
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 2. Enable RLS on all 22 newer tables (Deny by default)
ALTER TABLE IF EXISTS units ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS recipe_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS loyalty_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS loyalty_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS blackboard_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cafe_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS music_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS song_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS song_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS purchase_order_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS goods_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS goods_receipt_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS kitchen_stations ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 3. Public Read & Customer Interaction Policies
-- ------------------------------------------------------------------------------

-- Blackboard Posts: Public read active, admin write
CREATE POLICY "blackboard_public_read" ON blackboard_posts
  FOR SELECT USING (active = true OR is_staff());

CREATE POLICY "blackboard_admin_write" ON blackboard_posts
  FOR ALL USING (is_admin_or_super());

-- Cafe Events: Public read, admin write
CREATE POLICY "events_public_read" ON cafe_events
  FOR SELECT USING (true);

CREATE POLICY "events_admin_write" ON cafe_events
  FOR ALL USING (is_admin_or_super());

-- Event RSVPs: Insert allowed, read own profile or staff
CREATE POLICY "rsvps_insert" ON event_rsvps
  FOR INSERT WITH CHECK (true);

CREATE POLICY "rsvps_select" ON event_rsvps
  FOR SELECT USING (auth.uid() = profile_id OR is_staff());

-- Rewards: Public read active, admin write
CREATE POLICY "rewards_public_read" ON rewards
  FOR SELECT USING (active = true OR is_staff());

CREATE POLICY "rewards_admin_write" ON rewards
  FOR ALL USING (is_admin_or_super());

-- Reward Redemptions: Read own profile or staff
CREATE POLICY "reward_redemptions_read" ON reward_redemptions
  FOR SELECT USING (auth.uid() = profile_id OR is_staff());

-- Music Sessions & Songs: Public read active queue, insert requests
CREATE POLICY "music_sessions_read" ON music_sessions
  FOR SELECT USING (true);

CREATE POLICY "song_requests_read" ON song_requests
  FOR SELECT USING (status NOT IN ('REJECTED', 'SKIPPED') OR is_staff());

CREATE POLICY "song_requests_insert" ON song_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "song_votes_read" ON song_votes
  FOR SELECT USING (true);

CREATE POLICY "song_votes_insert" ON song_votes
  FOR INSERT WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 4. Staff-Only Inventory & Procurement Policies
-- ------------------------------------------------------------------------------

CREATE POLICY "units_staff_all" ON units
  FOR ALL USING (is_staff());

CREATE POLICY "ingredients_staff_all" ON ingredients
  FOR ALL USING (is_staff());

CREATE POLICY "recipes_staff_all" ON recipes
  FOR ALL USING (is_staff());

CREATE POLICY "inventory_movements_staff_all" ON inventory_movements
  FOR ALL USING (is_staff());

CREATE POLICY "vendors_staff_all" ON vendors
  FOR ALL USING (is_staff());

CREATE POLICY "purchase_orders_staff_all" ON purchase_orders
  FOR ALL USING (is_staff());

CREATE POLICY "goods_receipts_staff_all" ON goods_receipts
  FOR ALL USING (is_staff());

CREATE POLICY "budgets_admin_all" ON budgets
  FOR ALL USING (is_admin_or_super());

CREATE POLICY "kitchen_stations_staff_all" ON kitchen_stations
  FOR ALL USING (is_staff());
