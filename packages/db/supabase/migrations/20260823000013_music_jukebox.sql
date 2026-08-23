-- ==============================================================================
-- Smol Café — Jukebox Music Request & Collaborative Voting Subsystem
-- ==============================================================================

-- 1. Music Sessions Table
CREATE TABLE IF NOT EXISTS music_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('OPEN', 'CLOSED')) DEFAULT 'OPEN',
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_music_sessions_location_status ON music_sessions(location_id, status);

-- 2. Song Requests Table
CREATE TABLE IF NOT EXISTS song_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES music_sessions(id) ON DELETE CASCADE,
  table_session_id UUID NOT NULL REFERENCES table_sessions(id) ON DELETE CASCADE,
  track_name TEXT NOT NULL,
  artist TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'APPROVED', 'QUEUED', 'PLAYING', 'PLAYED', 'REJECTED', 'SKIPPED')) DEFAULT 'PENDING',
  vote_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_song_requests_session_status ON song_requests(session_id, status);
CREATE INDEX IF NOT EXISTS idx_song_requests_votes ON song_requests(vote_count DESC);

-- 3. Song Votes Table (1 vote per table per track)
CREATE TABLE IF NOT EXISTS song_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES song_requests(id) ON DELETE CASCADE,
  table_session_id UUID NOT NULL REFERENCES table_sessions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_song_votes_request_table UNIQUE (request_id, table_session_id)
);

CREATE INDEX IF NOT EXISTS idx_song_votes_table_session ON song_votes(table_session_id);

-- 4. Atomic Song Request Submission with 15-Minute Rate Limiting
CREATE OR REPLACE FUNCTION submit_song_request(
  p_location_id UUID,
  p_table_session_id UUID,
  p_track_name TEXT,
  p_artist TEXT
) RETURNS JSONB AS $$
DECLARE
  v_session_id UUID;
  v_recent_requests INTEGER;
  v_request_id UUID;
  v_clean_track TEXT;
  v_clean_artist TEXT;
BEGIN
  v_clean_track := TRIM(p_track_name);
  v_clean_artist := TRIM(p_artist);

  IF v_clean_track = '' OR v_clean_artist = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'INVALID_INPUT', 'message', 'Track name and artist are required.');
  END IF;

  -- 1. Find Open Music Session for this location
  SELECT id INTO v_session_id
  FROM music_sessions
  WHERE location_id = p_location_id AND status = 'OPEN'
  ORDER BY opened_at DESC
  LIMIT 1;

  IF v_session_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'SESSION_CLOSED', 'message', 'The café jukebox is currently closed.');
  END IF;

  -- 2. Check Rate Limit: Max 3 active/recent requests in rolling 15 minutes per table
  SELECT COUNT(*) INTO v_recent_requests
  FROM song_requests
  WHERE table_session_id = p_table_session_id
    AND created_at >= (now() - INTERVAL '15 minutes')
    AND status IN ('PENDING', 'APPROVED', 'QUEUED', 'PLAYING');

  IF v_recent_requests >= 3 THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'RATE_LIMITED',
      'message', 'Your table has reached the limit of 3 song requests in 15 minutes. Please wait a bit!'
    );
  END IF;

  -- 3. Insert Song Request (Default PENDING for Staff DJ approval)
  INSERT INTO song_requests (
    session_id,
    table_session_id,
    track_name,
    artist,
    status,
    vote_count
  ) VALUES (
    v_session_id,
    p_table_session_id,
    v_clean_track,
    v_clean_artist,
    'PENDING',
    1
  ) RETURNING id INTO v_request_id;

  -- 4. Auto-cast submitter table's vote
  INSERT INTO song_votes (request_id, table_session_id)
  VALUES (v_request_id, p_table_session_id)
  ON CONFLICT DO NOTHING;

  RETURN jsonb_build_object(
    'success', true,
    'request_id', v_request_id,
    'message', 'Song requested! It will appear in the queue once approved by the café DJ.'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Atomic Upvote Function
CREATE OR REPLACE FUNCTION cast_song_vote(
  p_request_id UUID,
  p_table_session_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_inserted BOOLEAN := false;
  v_new_votes INTEGER;
  v_status TEXT;
BEGIN
  -- Verify request is voteable
  SELECT status INTO v_status FROM song_requests WHERE id = p_request_id;
  IF v_status IS NULL OR v_status NOT IN ('PENDING', 'APPROVED', 'QUEUED') THEN
    RETURN jsonb_build_object('success', false, 'message', 'This track is no longer in the voting queue.');
  END IF;

  -- Insert Vote (Strictly 1 per table session)
  BEGIN
    INSERT INTO song_votes (request_id, table_session_id)
    VALUES (p_request_id, p_table_session_id);
    v_inserted := true;
  EXCEPTION WHEN unique_violation THEN
    v_inserted := false;
  END;

  IF NOT v_inserted THEN
    RETURN jsonb_build_object('success', false, 'error', 'ALREADY_VOTED', 'message', 'Your table has already voted for this track!');
  END IF;

  -- Update vote count
  UPDATE song_requests
  SET vote_count = vote_count + 1, updated_at = now()
  WHERE id = p_request_id
  RETURNING vote_count INTO v_new_votes;

  RETURN jsonb_build_object(
    'success', true,
    'vote_count', v_new_votes,
    'message', 'Vote recorded!'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Seed Initial Open Session & Lo-Fi Lounge Track
DO $$
DECLARE
  v_loc_id UUID;
  v_sess_id UUID;
  v_tsess_id UUID;
  v_req_id UUID;
BEGIN
  SELECT id INTO v_loc_id FROM locations LIMIT 1;
  IF v_loc_id IS NOT NULL THEN
    INSERT INTO music_sessions (location_id, status)
    VALUES (v_loc_id, 'OPEN')
    RETURNING id INTO v_sess_id;

    SELECT id INTO v_tsess_id FROM table_sessions WHERE location_id = v_loc_id LIMIT 1;
    IF v_tsess_id IS NOT NULL AND v_sess_id IS NOT NULL THEN
      -- Playing track
      INSERT INTO song_requests (session_id, table_session_id, track_name, artist, status, vote_count)
      VALUES (v_sess_id, v_tsess_id, 'Chai & Rain Lo-fi Chill', 'Smol Beats', 'PLAYING', 8)
      RETURNING id INTO v_req_id;

      -- Queued track
      INSERT INTO song_requests (session_id, table_session_id, track_name, artist, status, vote_count)
      VALUES (v_sess_id, v_tsess_id, 'Coffee Shop Acoustic Dreams', 'Indie Barista Ensemble', 'QUEUED', 5);
    END IF;
  END IF;
END $$;
