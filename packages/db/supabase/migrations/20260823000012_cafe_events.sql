-- ==============================================================================
-- Smol Café — Community Events ("What's On") & Lightweight RSVPs
-- ==============================================================================

-- 1. Create cafe_events table
CREATE TABLE IF NOT EXISTS cafe_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  capacity INTEGER NOT NULL DEFAULT 20,
  join_url_or_note TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cafe_events_starts_at ON cafe_events(starts_at);

-- 2. Create event_rsvps table
CREATE TABLE IF NOT EXISTS event_rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES cafe_events(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  guest_name TEXT,
  guest_contact TEXT,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_event_rsvps_event_id ON event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_profile_id ON event_rsvps(profile_id);

-- 3. Seed Initial Community Events
INSERT INTO cafe_events (title, description, starts_at, ends_at, capacity, join_url_or_note, active)
VALUES
  (
    'Weekend Coffee Brewing Workshop ☕',
    'Hands-on cupping session: Master AeroPress, V60, and Traditional South Indian Filter Coffee brewing with our head barista.',
    now() + INTERVAL '3 days',
    now() + INTERVAL '3 days 2 hours',
    15,
    'Free entry for members • Includes tasting flight & bun bite',
    true
  ),
  (
    'Acoustic Sunday & Chai Jam 🎸',
    'Unplugged indie acoustic evening featuring local artists. Enjoy freshly brewed ginger-cardamom chai and sweet treats.',
    now() + INTERVAL '5 days',
    now() + INTERVAL '5 days 3 hours',
    30,
    'Walk-in friendly • RSVP guarantees community table seating',
    true
  )
ON CONFLICT DO NOTHING;
