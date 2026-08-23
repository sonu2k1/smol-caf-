-- ==============================================================================
-- Smol Café — Menu Metadata & JSONB Support (Step 0.5)
-- Adds metadata column to menu_items and menu_item_versions with GIN indexes
-- ==============================================================================

-- Add metadata column to menu_items
ALTER TABLE menu_items
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Add metadata column to menu_item_versions
ALTER TABLE menu_item_versions
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Create GIN index for fast JSON querying
CREATE INDEX IF NOT EXISTS idx_menu_items_metadata ON menu_items USING gin (metadata);
CREATE INDEX IF NOT EXISTS idx_menu_item_versions_metadata ON menu_item_versions USING gin (metadata);
