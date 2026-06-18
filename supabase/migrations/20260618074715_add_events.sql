-- ============================================================
-- Events & Attendees
-- ============================================================

CREATE TYPE event_rsvp_status AS ENUM ('pending', 'going', 'maybe', 'not_going');
CREATE TYPE event_activity_type AS ENUM (
  'match', 'training', 'tournament', 'trial', 'social',
  'charity', 'clinic', 'camp', 'other'
);

CREATE TABLE events (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id    UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title         VARCHAR(255) NOT NULL,
  description   TEXT,
  sport_type    VARCHAR(100) DEFAULT 'Football',
  activity_type event_activity_type DEFAULT 'social',
  is_public     BOOLEAN DEFAULT TRUE,
  location      VARCHAR(500),
  event_date    TIMESTAMPTZ NOT NULL,
  duration_mins INTEGER DEFAULT 90,
  max_attendees INTEGER,
  cover_color   VARCHAR(20) DEFAULT '#2F80ED',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE TABLE event_attendees (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id     UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  rsvp_status  event_rsvp_status DEFAULT 'pending',
  invited_by   UUID REFERENCES user_profiles(id),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (event_id, user_id)
);

ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;

-- Events RLS (defined after event_attendees exists)
CREATE POLICY "events_select_public" ON events FOR SELECT
  USING (
    is_public = TRUE
    OR creator_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM event_attendees ea
      WHERE ea.event_id = events.id AND ea.user_id = auth.uid()
    )
  );

CREATE POLICY "events_insert_own" ON events FOR INSERT
  TO authenticated WITH CHECK (creator_id = auth.uid());

CREATE POLICY "events_update_own" ON events FOR UPDATE
  TO authenticated USING (creator_id = auth.uid());

CREATE POLICY "events_delete_own" ON events FOR DELETE
  TO authenticated USING (creator_id = auth.uid());

-- Attendees RLS
CREATE POLICY "attendees_select" ON event_attendees FOR SELECT
  USING (
    user_id = auth.uid()
    OR invited_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM events e WHERE e.id = event_id AND e.creator_id = auth.uid()
    )
  );

CREATE POLICY "attendees_insert" ON event_attendees FOR INSERT
  TO authenticated WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM events e WHERE e.id = event_id AND e.creator_id = auth.uid()
    )
  );

CREATE POLICY "attendees_update_own" ON event_attendees FOR UPDATE
  TO authenticated USING (user_id = auth.uid());

CREATE POLICY "attendees_delete" ON event_attendees FOR DELETE
  TO authenticated USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM events e WHERE e.id = event_id AND e.creator_id = auth.uid()
    )
  );

CREATE INDEX idx_events_creator   ON events (creator_id);
CREATE INDEX idx_events_date      ON events (event_date);
CREATE INDEX idx_attendees_event  ON event_attendees (event_id);
CREATE INDEX idx_attendees_user   ON event_attendees (user_id);
