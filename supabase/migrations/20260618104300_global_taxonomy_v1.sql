-- ============================================================
-- GLOBAL TAXONOMY — sports, countries, teams, memberships,
-- community suggestions, stat schemas
-- ============================================================

-- ── 1. SPORTS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sports (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL UNIQUE,
  type          text NOT NULL CHECK (type IN ('team', 'individual')),
  icon          text NOT NULL DEFAULT 'activity',
  category      text NOT NULL DEFAULT 'Other',
  stat_schema   jsonb NOT NULL DEFAULT '[]',
  display_order int NOT NULL DEFAULT 100,
  active        boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE sports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sports_select_all" ON sports FOR SELECT USING (true);
CREATE POLICY "sports_insert_admin" ON sports FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'
  ));
CREATE POLICY "sports_update_admin" ON sports FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'
  ));
CREATE POLICY "sports_delete_admin" ON sports FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- ── 2. COUNTRIES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS countries (
  iso_code   char(2) PRIMARY KEY,
  name       text NOT NULL,
  flag       text NOT NULL DEFAULT '',
  region     text NOT NULL DEFAULT 'Other',
  sub_region text,
  active     boolean NOT NULL DEFAULT true
);

ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "countries_select_all" ON countries FOR SELECT USING (true);

-- ── 3. ALTER competitions to global schema ───────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name='competitions' AND column_name='sport_id') THEN
    ALTER TABLE competitions ADD COLUMN sport_id uuid REFERENCES sports(id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name='competitions' AND column_name='country_id') THEN
    ALTER TABLE competitions ADD COLUMN country_id char(2) REFERENCES countries(iso_code);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name='competitions' AND column_name='scope') THEN
    ALTER TABLE competitions ADD COLUMN scope text NOT NULL DEFAULT 'national'
      CHECK (scope IN ('global','continental','national','regional','local'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name='competitions' AND column_name='gender') THEN
    ALTER TABLE competitions ADD COLUMN gender text NOT NULL DEFAULT 'open'
      CHECK (gender IN ('open','male','female','mixed'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name='competitions' AND column_name='age_group') THEN
    ALTER TABLE competitions ADD COLUMN age_group text NOT NULL DEFAULT 'senior'
      CHECK (age_group IN ('senior','u23','u21','u20','u18','u17','u15','youth','school','veterans','open'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name='competitions' AND column_name='governing_body') THEN
    ALTER TABLE competitions ADD COLUMN governing_body text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name='competitions' AND column_name='data_source') THEN
    ALTER TABLE competitions ADD COLUMN data_source text NOT NULL DEFAULT 'community'
      CHECK (data_source IN ('licensed','community','none'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name='competitions' AND column_name='verification_status') THEN
    ALTER TABLE competitions ADD COLUMN verification_status text NOT NULL DEFAULT 'approved'
      CHECK (verification_status IN ('pending','approved','rejected'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name='competitions' AND column_name='created_by') THEN
    ALTER TABLE competitions ADD COLUMN created_by uuid REFERENCES user_profiles(id);
  END IF;
END $$;

-- Expand tier check to include all global tiers and normalise existing values
-- First update existing rows to normalised values
UPDATE competitions SET tier = 'semi_pro' WHERE tier = 'semi-professional';
UPDATE competitions SET tier = 'youth_academy' WHERE tier = 'youth';
-- Now replace the constraint
ALTER TABLE competitions DROP CONSTRAINT IF EXISTS competitions_tier_check;
ALTER TABLE competitions ADD CONSTRAINT competitions_tier_check
  CHECK (tier IN (
    'professional','semi_pro','amateur','college','youth_academy',
    'school','grassroots','recreational',
    'continental','international','friendly'
  ));

-- ── 4. TEAMS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teams (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                text NOT NULL,
  sport_id            uuid REFERENCES sports(id),
  country_id          char(2) REFERENCES countries(iso_code),
  city                text,
  crest_url           text,
  short_name          text,
  founded_year        int,
  data_source         text NOT NULL DEFAULT 'community'
    CHECK (data_source IN ('licensed','community','none')),
  verification_status text NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending','approved','rejected')),
  external_ids        jsonb NOT NULL DEFAULT '{}',
  created_by          uuid REFERENCES user_profiles(id),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_teams_sport_id ON teams(sport_id);
CREATE INDEX IF NOT EXISTS idx_teams_country_id ON teams(country_id);
CREATE INDEX IF NOT EXISTS idx_teams_name ON teams USING gin(to_tsvector('simple', name));

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teams_select_approved" ON teams FOR SELECT
  USING (verification_status = 'approved' OR created_by = auth.uid());
CREATE POLICY "teams_insert_auth" ON teams FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);
CREATE POLICY "teams_update_owner_admin" ON teams FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'
  ));
CREATE POLICY "teams_delete_admin" ON teams FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- ── 5. ATHLETE → TEAM MEMBERSHIPS ────────────────────────────
CREATE TABLE IF NOT EXISTS athlete_team_memberships (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  team_id    uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  sport_id   uuid REFERENCES sports(id),
  position   text,
  jersey_number int,
  start_date date,
  end_date   date,
  is_current boolean NOT NULL DEFAULT true,
  loan       boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE athlete_team_memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "memberships_select_own" ON athlete_team_memberships FOR SELECT
  TO authenticated USING (athlete_id = auth.uid());
CREATE POLICY "memberships_insert_own" ON athlete_team_memberships FOR INSERT
  TO authenticated WITH CHECK (athlete_id = auth.uid());
CREATE POLICY "memberships_update_own" ON athlete_team_memberships FOR UPDATE
  TO authenticated USING (athlete_id = auth.uid());
CREATE POLICY "memberships_delete_own" ON athlete_team_memberships FOR DELETE
  TO authenticated USING (athlete_id = auth.uid());

-- ── 6. INDIVIDUAL SPORT EVENTS / MEETS ───────────────────────
CREATE TABLE IF NOT EXISTS sport_events (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_id       uuid REFERENCES sports(id),
  competition_id uuid REFERENCES competitions(id),
  name           text NOT NULL,
  event_date     date NOT NULL,
  location       text,
  country_id     char(2) REFERENCES countries(iso_code),
  discipline     text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE sport_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sport_events_select_all" ON sport_events FOR SELECT USING (true);

-- Personal bests / performance records for individual sports
CREATE TABLE IF NOT EXISTS personal_bests (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id  uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  sport_id    uuid NOT NULL REFERENCES sports(id),
  discipline  text NOT NULL,
  value       numeric NOT NULL,
  unit        text NOT NULL DEFAULT 's',
  wind_speed  numeric,
  altitude    int,
  event_id    uuid REFERENCES sport_events(id),
  venue       text,
  achieved_at date NOT NULL,
  verified    boolean NOT NULL DEFAULT false,
  source      text NOT NULL DEFAULT 'self_reported',
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE personal_bests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pb_select_own" ON personal_bests FOR SELECT
  TO authenticated USING (athlete_id = auth.uid());
CREATE POLICY "pb_insert_own" ON personal_bests FOR INSERT
  TO authenticated WITH CHECK (athlete_id = auth.uid());
CREATE POLICY "pb_update_own" ON personal_bests FOR UPDATE
  TO authenticated USING (athlete_id = auth.uid());

-- ── 7. COMMUNITY SUGGESTIONS ─────────────────────────────────
CREATE TABLE IF NOT EXISTS entity_suggestions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type   text NOT NULL CHECK (entity_type IN ('sport','competition','team','athlete')),
  suggested_by  uuid REFERENCES user_profiles(id),
  name          text NOT NULL,
  sport         text,
  country       text,
  details       jsonb NOT NULL DEFAULT '{}',
  status        text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected','duplicate')),
  duplicate_of  uuid,
  reviewed_by   uuid REFERENCES user_profiles(id),
  reviewed_at   timestamptz,
  review_notes  text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE entity_suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "suggestions_select_own_admin" ON entity_suggestions FOR SELECT
  TO authenticated USING (
    suggested_by = auth.uid()
    OR EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "suggestions_insert_auth" ON entity_suggestions FOR INSERT
  TO authenticated WITH CHECK (suggested_by = auth.uid());
CREATE POLICY "suggestions_update_admin" ON entity_suggestions FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Full-text search index on competitions
CREATE INDEX IF NOT EXISTS idx_competitions_fts
  ON competitions USING gin(to_tsvector('simple', name));

-- Locale / preference columns on user_profiles
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name='user_profiles' AND column_name='sport_id') THEN
    ALTER TABLE user_profiles ADD COLUMN sport_id uuid REFERENCES sports(id);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name='user_profiles' AND column_name='country_id') THEN
    ALTER TABLE user_profiles ADD COLUMN country_id char(2) REFERENCES countries(iso_code);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name='user_profiles' AND column_name='locale') THEN
    ALTER TABLE user_profiles ADD COLUMN locale text NOT NULL DEFAULT 'en';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name='user_profiles' AND column_name='timezone') THEN
    ALTER TABLE user_profiles ADD COLUMN timezone text NOT NULL DEFAULT 'UTC';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_name='user_profiles' AND column_name='unit_system') THEN
    ALTER TABLE user_profiles ADD COLUMN unit_system text NOT NULL DEFAULT 'metric'
      CHECK (unit_system IN ('metric','imperial'));
  END IF;
END $$;
