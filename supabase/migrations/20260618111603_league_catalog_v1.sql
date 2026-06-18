ALTER TABLE competitions
  ADD COLUMN IF NOT EXISTS external_id    text,
  ADD COLUMN IF NOT EXISTS provider       text NOT NULL DEFAULT 'community',
  ADD COLUMN IF NOT EXISTS flag_url       text,
  ADD COLUMN IF NOT EXISTS country_code   text,
  ADD COLUMN IF NOT EXISTS season         int,
  ADD COLUMN IF NOT EXISTS is_current     boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_synced_at timestamptz,
  ADD COLUMN IF NOT EXISTS type           text NOT NULL DEFAULT 'league';

ALTER TABLE competitions DROP CONSTRAINT IF EXISTS competitions_type_check;
ALTER TABLE competitions ADD CONSTRAINT competitions_type_check
  CHECK (type IN ('league','cup','tournament','friendly','other'));

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'competitions_provider_external_id_key'
  ) THEN
    ALTER TABLE competitions ADD CONSTRAINT competitions_provider_external_id_key
      UNIQUE (provider, external_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_competitions_country      ON competitions(country);
CREATE INDEX IF NOT EXISTS idx_competitions_sport_col    ON competitions(sport);
CREATE INDEX IF NOT EXISTS idx_competitions_country_code ON competitions(country_code);
CREATE INDEX IF NOT EXISTS idx_competitions_provider     ON competitions(provider);
CREATE INDEX IF NOT EXISTS idx_competitions_vstatus      ON competitions(verification_status);

ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "competitions_select_approved" ON competitions;
CREATE POLICY "competitions_select_approved" ON competitions FOR SELECT
  USING (verification_status IN ('approved','pending'));

DROP POLICY IF EXISTS "competitions_insert_any" ON competitions;
CREATE POLICY "competitions_insert_any" ON competitions FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
    OR (data_source = 'community' AND created_by = auth.uid())
  );

DROP POLICY IF EXISTS "competitions_update_admin" ON competitions;
CREATE POLICY "competitions_update_admin" ON competitions FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "competitions_delete_admin" ON competitions;
CREATE POLICY "competitions_delete_admin" ON competitions FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE TABLE IF NOT EXISTS sync_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider    text NOT NULL,
  sport       text NOT NULL,
  started_at  timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  status      text NOT NULL DEFAULT 'running'
    CHECK (status IN ('running','success','error')),
  inserted    int NOT NULL DEFAULT 0,
  updated     int NOT NULL DEFAULT 0,
  total       int NOT NULL DEFAULT 0,
  error_msg   text
);

ALTER TABLE sync_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sync_log_admin" ON sync_log FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));
