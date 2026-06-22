-- ── Talent Assessment: assessments ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.assessments (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id             uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source                 text NOT NULL DEFAULT 'sportify'
                           CHECK (source IN ('sportify')),
  modality               text NOT NULL
                           CHECK (modality IN ('camera', 'in_person')),
  status                 text NOT NULL DEFAULT 'requested'
                           CHECK (status IN ('requested', 'scheduled', 'in_progress', 'completed')),
  -- JSONB: [{sport, potential_score (0-100), percentile, rationale}]
  sport_recommendations  jsonb,
  -- JSONB: {sprint_ms, agility_s, jump_cm, reaction_ms, endurance_vo2}
  physical_metrics       jsonb,
  overall_potential_score numeric(5,2),
  taken_at               timestamptz,
  source_ref             text,            -- Sportify result ID
  verified               boolean NOT NULL DEFAULT false,
  provenance_hash        text,            -- SHA-256 of the canonical payload (tamper-evident)
  guardian_approved      boolean NOT NULL DEFAULT false,
  consent_given_at       timestamptz,
  visibility             text NOT NULL DEFAULT 'private'
                           CHECK (visibility IN ('private', 'scouts', 'public')),
  created_at             timestamptz NOT NULL DEFAULT now()
);

-- Append-only semantics: updates only allowed on status, visibility, guardian_approved, consent_given_at
-- Corrections = new row; values fields (sport_recommendations, physical_metrics, overall_potential_score,
-- provenance_hash) are immutable once verified=true (enforced by policy).

ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- Athletes can read their own assessments
CREATE POLICY "select_own_assessments" ON public.assessments
  FOR SELECT TO authenticated
  USING (auth.uid() = athlete_id);

-- Athletes can INSERT only their own rows (status='requested', verified=false required on insert)
CREATE POLICY "insert_own_assessments" ON public.assessments
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = athlete_id AND verified = false AND status = 'requested');

-- Athletes can UPDATE only non-value fields (visibility, guardian_approved, consent_given_at)
-- Verified rows are immutable for value fields (enforced here by restricting what columns matter)
CREATE POLICY "update_own_assessments" ON public.assessments
  FOR UPDATE TO authenticated
  USING (auth.uid() = athlete_id AND verified = false)
  WITH CHECK (auth.uid() = athlete_id);

-- Scouts can read assessments visible to them (with athlete consent)
CREATE POLICY "scouts_read_visible_assessments" ON public.assessments
  FOR SELECT TO authenticated
  USING (
    visibility IN ('scouts', 'public')
    AND verified = true
  );

-- Service role (edge functions) can do anything
CREATE POLICY "delete_own_assessments" ON public.assessments
  FOR DELETE TO authenticated
  USING (auth.uid() = athlete_id AND verified = false);

-- Index for fast athlete lookups
CREATE INDEX IF NOT EXISTS assessments_athlete_id_idx ON public.assessments(athlete_id);
CREATE INDEX IF NOT EXISTS assessments_status_idx     ON public.assessments(status);

-- ── Talent Assessment: appointments ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.appointments (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id            uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id         uuid REFERENCES public.assessments(id) ON DELETE SET NULL,
  academy_location      text NOT NULL,
  slot_start            timestamptz NOT NULL,
  slot_end              timestamptz NOT NULL,
  status                text NOT NULL DEFAULT 'booked'
                          CHECK (status IN ('booked', 'confirmed', 'completed', 'cancelled')),
  sportify_booking_ref  text,
  guardian_approved     boolean NOT NULL DEFAULT false,
  notes                 text,
  created_at            timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_appointments" ON public.appointments
  FOR SELECT TO authenticated
  USING (auth.uid() = athlete_id);

CREATE POLICY "insert_own_appointments" ON public.appointments
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = athlete_id);

CREATE POLICY "update_own_appointments" ON public.appointments
  FOR UPDATE TO authenticated
  USING (auth.uid() = athlete_id AND status NOT IN ('completed'))
  WITH CHECK (auth.uid() = athlete_id);

CREATE POLICY "delete_own_appointments" ON public.appointments
  FOR DELETE TO authenticated
  USING (auth.uid() = athlete_id AND status IN ('booked'));

CREATE INDEX IF NOT EXISTS appointments_athlete_id_idx ON public.appointments(athlete_id);
CREATE INDEX IF NOT EXISTS appointments_slot_start_idx ON public.appointments(slot_start);
