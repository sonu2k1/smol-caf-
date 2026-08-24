-- ==============================================================================
-- Smol Café — Admin Blackboard Daily Specials & Announcements
-- ==============================================================================

-- 1. Create blackboard_posts table
CREATE TABLE IF NOT EXISTS blackboard_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  image_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blackboard_active_schedule 
  ON blackboard_posts(active, starts_at, ends_at);

-- 2. Seed Initial Chalkboard Note
INSERT INTO blackboard_posts (title, body, active, starts_at, ends_at)
VALUES (
  'Today at Smol Café ☕',
  'Freshly baked batch of Warm Maska Buns straight from the oven at 3:30 PM. Pair with our signature Karak Chai for the ultimate afternoon treat!',
  true,
  now(),
  now() + INTERVAL '7 days'
) ON CONFLICT DO NOTHING;
