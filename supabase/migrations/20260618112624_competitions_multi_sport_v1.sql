-- ── COMPETITIONS CATALOG — multi-sport extension ─────────────────────────────

-- structure_type: covers league/cup (team sports), tour_circuit, championship, tournament (individual/multi-discipline sports)
ALTER TABLE competitions
  ADD COLUMN IF NOT EXISTS structure_type text NOT NULL DEFAULT 'league',
  ADD COLUMN IF NOT EXISTS governing_body text,
  ADD COLUMN IF NOT EXISTS updated_at     timestamptz NOT NULL DEFAULT now();

ALTER TABLE competitions DROP CONSTRAINT IF EXISTS competitions_structure_type_check;
ALTER TABLE competitions ADD CONSTRAINT competitions_structure_type_check
  CHECK (structure_type IN ('league','cup','tour_circuit','championship','tournament','friendly','other'));

-- Populate structure_type from existing type column where possible
UPDATE competitions SET structure_type = 'cup'   WHERE type = 'cup'   AND structure_type = 'league';
UPDATE competitions SET structure_type = 'league' WHERE type = 'league' AND structure_type = 'league';

-- Composite deduplication index for seed/community rows (no provider id)
CREATE UNIQUE INDEX IF NOT EXISTS idx_competitions_sport_name_country
  ON competitions (sport, lower(name), country)
  WHERE provider = 'community' OR external_id IS NULL;

-- Additional search/filter indexes
CREATE INDEX IF NOT EXISTS idx_competitions_structure_type ON competitions(structure_type);
CREATE INDEX IF NOT EXISTS idx_competitions_governing_body  ON competitions(governing_body);

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_competitions_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS competitions_updated_at ON competitions;
CREATE TRIGGER competitions_updated_at
  BEFORE UPDATE ON competitions
  FOR EACH ROW EXECUTE FUNCTION update_competitions_updated_at();
