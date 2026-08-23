-- ==============================================================================
-- Smol Café — Budgets, Spend Analytics & Vendor Spend Intelligence
-- ==============================================================================

-- 1. Ensure ingredients have a category column
ALTER TABLE ingredients
ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'MISC';

CREATE INDEX IF NOT EXISTS idx_ingredients_category ON ingredients(category);

-- Update categories for known ingredient types
UPDATE ingredients SET category = 'DAIRY' WHERE LOWER(name) LIKE '%milk%' OR LOWER(name) LIKE '%butter%' OR LOWER(name) LIKE '%cream%' OR LOWER(name) LIKE '%paneer%';
UPDATE ingredients SET category = 'COFFEE_BEANS' WHERE LOWER(name) LIKE '%coffee%' OR LOWER(name) LIKE '%espresso%' OR LOWER(name) LIKE '%bean%';
UPDATE ingredients SET category = 'BAKERY_RAW' WHERE LOWER(name) LIKE '%flour%' OR LOWER(name) LIKE '%yeast%' OR LOWER(name) LIKE '%sugar%' OR LOWER(name) LIKE '%bun%' OR LOWER(name) LIKE '%chocolate%';
UPDATE ingredients SET category = 'SPICES_TEA' WHERE LOWER(name) LIKE '%tea%' OR LOWER(name) LIKE '%chai%' OR LOWER(name) LIKE '%cardamom%' OR LOWER(name) LIKE '%saffron%' OR LOWER(name) LIKE '%cinnamon%' OR LOWER(name) LIKE '%clove%';

-- 2. Budgets Table
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  month TEXT NOT NULL, -- Format: YYYY-MM e.g. '2026-08'
  budgeted_amount_paise INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_budget_category_month UNIQUE (category, month)
);

CREATE INDEX IF NOT EXISTS idx_budgets_month ON budgets(month);

-- 3. Seed Default Monthly Budgets for August 2026
INSERT INTO budgets (category, month, budgeted_amount_paise, notes)
VALUES
  ('DAIRY', '2026-08', 4500000, 'Monthly budget for whole milk, butter, and heavy cream (₹45,000)'),
  ('COFFEE_BEANS', '2026-08', 3500000, 'Specialty Arabica roasts & Peaberry (₹35,000)'),
  ('BAKERY_RAW', '2026-08', 2500000, 'Organic flour, butter blocks, Belgian cocoa (₹25,000)'),
  ('SPICES_TEA', '2026-08', 1500000, 'Assam CTC, green cardamom pods, saffron (₹15,000)'),
  ('PACKAGING', '2026-08', 1000000, 'Takeaway cups, compostable straws, pastry bags (₹10,000)'),
  ('MISC', '2026-08', 800000, 'Cleaning supplies and filter papers (₹8,000)')
ON CONFLICT (category, month) DO UPDATE
SET budgeted_amount_paise = EXCLUDED.budgeted_amount_paise,
    notes = EXCLUDED.notes;
