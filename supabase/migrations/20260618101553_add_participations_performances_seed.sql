-- Create missing tables and seed data safely

-- ── participations (create if not exists) ────────────────────
CREATE TABLE IF NOT EXISTS participations (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id       UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  fixture_id       UUID REFERENCES fixtures(id) ON DELETE SET NULL,
  sport            VARCHAR(100) NOT NULL,
  competition_name VARCHAR(255),
  match_date       DATE,
  opponent_name    VARCHAR(255),
  venue            VARCHAR(500),
  position         VARCHAR(100),
  minutes_played   INTEGER CHECK (minutes_played IS NULL OR (minutes_played >= 0 AND minutes_played <= 120)),
  is_starter       BOOLEAN DEFAULT TRUE,
  jersey_number    INTEGER CHECK (jersey_number IS NULL OR (jersey_number >= 1 AND jersey_number <= 99)),
  status           VARCHAR(50) DEFAULT 'pending_verification'
                   CHECK (status IN ('pending_verification','verified','rejected','unmatched')),
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  verified_at      TIMESTAMPTZ
);

ALTER TABLE participations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='participations' AND policyname='part_select_own') THEN
    CREATE POLICY "part_select_own"   ON participations FOR SELECT TO authenticated USING (athlete_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='participations' AND policyname='part_select_staff') THEN
    CREATE POLICY "part_select_staff" ON participations FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin','club','scout')));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='participations' AND policyname='part_insert_own') THEN
    CREATE POLICY "part_insert_own"   ON participations FOR INSERT TO authenticated
      WITH CHECK (athlete_id = auth.uid());
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_participations_athlete ON participations (athlete_id);
CREATE INDEX IF NOT EXISTS idx_participations_fixture ON participations (fixture_id);
CREATE INDEX IF NOT EXISTS idx_participations_status  ON participations (athlete_id, status);

-- ── performances ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS performances (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participation_id UUID REFERENCES participations(id) ON DELETE CASCADE,
  athlete_id       UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  fixture_id       UUID REFERENCES fixtures(id) ON DELETE SET NULL,
  sport            VARCHAR(100)  NOT NULL,
  competition      VARCHAR(255),
  source           VARCHAR(100)  NOT NULL,
  source_display   VARCHAR(255)  NOT NULL,
  verified_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  verified_by      UUID          REFERENCES user_profiles(id),
  verifier_name    VARCHAR(255),
  stats            JSONB         NOT NULL DEFAULT '{}',
  version          INTEGER       NOT NULL DEFAULT 1,
  is_latest        BOOLEAN       DEFAULT TRUE,
  created_at       TIMESTAMPTZ   DEFAULT NOW()
);

ALTER TABLE performances ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='performances' AND policyname='perf_select_own') THEN
    CREATE POLICY "perf_select_own"   ON performances FOR SELECT TO authenticated USING (athlete_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='performances' AND policyname='perf_select_staff') THEN
    CREATE POLICY "perf_select_staff" ON performances FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin','club','scout')));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_performances_athlete ON performances (athlete_id);
CREATE INDEX IF NOT EXISTS idx_performances_latest  ON performances (athlete_id, is_latest) WHERE is_latest = TRUE;

-- ── seed competitions ─────────────────────────────────────────
INSERT INTO competitions (sport, name, country, region, tier)
  SELECT v.sport, v.name, v.country, v.region, v.tier
  FROM (VALUES
    ('Football', 'Arabian Gulf League',          'UAE', 'Middle East', 'professional'),
    ('Football', 'UAE President''s Cup',         'UAE', 'Middle East', 'professional'),
    ('Football', 'Saudi Pro League',             'KSA', 'Middle East', 'professional'),
    ('Football', 'Saudi King''s Cup',            'KSA', 'Middle East', 'professional'),
    ('Football', 'Qatar Stars League',           'QAT', 'Middle East', 'professional'),
    ('Football', 'Bahrain Premier League',       'BHR', 'Middle East', 'professional'),
    ('Football', 'Kuwait Premier League',        'KUW', 'Middle East', 'professional'),
    ('Football', 'Oman Professional League',     'OMN', 'Middle East', 'professional'),
    ('Football', 'AFC Champions League',         NULL,  'Asia',        'continental'),
    ('Football', 'AFC Asian Cup',                NULL,  'Asia',        'international'),
    ('Football', 'FIFA World Cup',               NULL,  'World',       'international'),
    ('Football', 'Premier League',               'ENG', 'Europe',      'professional'),
    ('Football', 'La Liga',                      'ESP', 'Europe',      'professional'),
    ('Football', 'Bundesliga',                   'GER', 'Europe',      'professional'),
    ('Football', 'Serie A',                      'ITA', 'Europe',      'professional'),
    ('Football', 'UEFA Champions League',        NULL,  'Europe',      'continental'),
    ('Football', 'Friendly',                     NULL,  NULL,          'friendly'),
    ('Basketball', 'UAE Basketball League',      'UAE', 'Middle East', 'professional'),
    ('Basketball', 'Saudi Basketball League',    'KSA', 'Middle East', 'professional'),
    ('Basketball', 'Arab Basketball Championship',NULL, 'Middle East', 'international'),
    ('Volleyball', 'UAE Volleyball League',      'UAE', 'Middle East', 'professional'),
    ('Volleyball', 'Arab Volleyball Championship',NULL, 'Middle East', 'international'),
    ('Wrestling',  'UAE Wrestling Championship', 'UAE', 'Middle East', 'professional'),
    ('Wrestling',  'Arab Wrestling Championship',NULL,  'Middle East', 'international'),
    ('Tennis',     'Dubai Duty Free Tennis',     'UAE', 'Middle East', 'professional'),
    ('Swimming',   'Arab Swimming Championship', NULL,  'Middle East', 'international'),
    ('Athletics',  'UAE Athletics Championship', 'UAE', 'Middle East', 'professional'),
    ('Cricket',    'UAE Premier Cricket League', 'UAE', 'Middle East', 'professional'),
    ('Padel',      'UAE Padel League',           'UAE', 'Middle East', 'professional')
  ) AS v(sport, name, country, region, tier)
  WHERE NOT EXISTS (
    SELECT 1 FROM competitions c WHERE c.sport = v.sport AND c.name = v.name
  );
