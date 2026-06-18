-- ── SUPER ADMIN PORTAL ────────────────────────────────────────────────────────

-- Immutable audit log — append-only, never updated or deleted
CREATE TABLE IF NOT EXISTS audit_log (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  performed_by uuid REFERENCES user_profiles(id),
  action       text NOT NULL,
  entity_type  text NOT NULL,
  entity_id    text,
  before_state jsonb,
  after_state  jsonb,
  reason       text,
  ip_address   text,
  user_agent   text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_log_select_admin" ON audit_log FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "audit_log_insert_admin" ON audit_log FOR INSERT TO authenticated
  WITH CHECK (performed_by = auth.uid());
-- No UPDATE or DELETE policies — append-only

CREATE INDEX IF NOT EXISTS idx_audit_log_performed_by ON audit_log(performed_by);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);

-- Admin sub-roles for scoped access
CREATE TABLE IF NOT EXISTS admin_staff (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL UNIQUE REFERENCES user_profiles(id) ON DELETE CASCADE,
  scope        text[] NOT NULL DEFAULT '{}',
  -- scopes: dashboard, users, verification, competitions, sports, content, ai, moderation, subscriptions, finance, security, system
  display_name text,
  is_active    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admin_staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_staff_admin_only" ON admin_staff FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

-- Feature flags for System Config
CREATE TABLE IF NOT EXISTS feature_flags (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL UNIQUE,
  description  text,
  enabled      boolean NOT NULL DEFAULT false,
  rollout_pct  int NOT NULL DEFAULT 100 CHECK (rollout_pct BETWEEN 0 AND 100),
  environment  text NOT NULL DEFAULT 'production' CHECK (environment IN ('production','staging','development')),
  updated_by   uuid REFERENCES user_profiles(id),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "feature_flags_select_admin" ON feature_flags FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "feature_flags_modify_admin" ON feature_flags FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

-- Seed default feature flags
INSERT INTO feature_flags (name, description, enabled, rollout_pct, environment) VALUES
  ('ai_career_coach',        'AI-powered career coaching chatbot',              true,  100, 'production'),
  ('ai_score_analysis',      'AI performance score analysis',                   true,  100, 'production'),
  ('community_submissions',  'Community competition/league submissions',         true,  100, 'production'),
  ('medical_clearances',     'Medical partner clearance workflow',               true,  100, 'production'),
  ('live_scores',            'Real-time live scores from API-Sports',            true,   50, 'production'),
  ('video_highlights',       'Video highlight reel generation',                  false, 100, 'production'),
  ('impersonation_mode',     'Admin impersonation (always logged)',              true,  100, 'production'),
  ('minor_safeguarding',     'Enhanced safeguarding for under-18 accounts',      true,  100, 'production'),
  ('rtl_arabic',             'Arabic RTL interface',                             true,  100, 'production'),
  ('subscription_billing',   'Stripe subscription billing',                      false, 100, 'production')
ON CONFLICT (name) DO NOTHING;

-- Moderation reports
CREATE TABLE IF NOT EXISTS moderation_reports (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id     uuid REFERENCES user_profiles(id),
  reported_entity_type text NOT NULL CHECK (reported_entity_type IN ('user','profile','content','message','competition')),
  reported_entity_id   text NOT NULL,
  reason          text NOT NULL,
  details         text,
  severity        text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  status          text NOT NULL DEFAULT 'open'   CHECK (status IN ('open','reviewing','resolved','escalated')),
  is_minor_related boolean NOT NULL DEFAULT false,
  resolved_by     uuid REFERENCES user_profiles(id),
  resolution      text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE moderation_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mod_reports_admin" ON moderation_reports FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE INDEX IF NOT EXISTS idx_mod_reports_status   ON moderation_reports(status);
CREATE INDEX IF NOT EXISTS idx_mod_reports_severity ON moderation_reports(severity);
CREATE INDEX IF NOT EXISTS idx_mod_reports_minor    ON moderation_reports(is_minor_related);

-- Seed a few sample reports for the UI
INSERT INTO moderation_reports (reported_entity_type, reported_entity_id, reason, severity, status, is_minor_related)
VALUES
  ('user',    'demo-1', 'Suspicious contact with minor account',  'critical', 'open',       true),
  ('profile', 'demo-2', 'Misleading performance statistics',      'medium',   'reviewing',  false),
  ('content', 'demo-3', 'Inappropriate media content',            'high',     'open',       false),
  ('user',    'demo-4', 'Spam / automated profile',               'low',      'resolved',   false)
ON CONFLICT DO NOTHING;
