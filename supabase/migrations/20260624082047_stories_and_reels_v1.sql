-- ───────────────────────────────────────────────────────────────
-- Stories & Reels  (AceAiX Floodlight)
-- ───────────────────────────────────────────────────────────────

-- ── stories ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stories (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  media_url      text NOT NULL,
  media_type     text NOT NULL CHECK (media_type IN ('image','video')),
  thumbnail_url  text,
  duration_ms    integer NOT NULL DEFAULT 5000,
  caption        text,
  overlay        jsonb DEFAULT '{}',
  created_at     timestamptz NOT NULL DEFAULT now(),
  expires_at     timestamptz NOT NULL DEFAULT (now() + interval '24 hours'),
  is_highlight   boolean NOT NULL DEFAULT false,
  visibility     text NOT NULL DEFAULT 'public' CHECK (visibility IN ('public','connections'))
);

ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_stories_public" ON stories FOR SELECT
  TO authenticated USING (
    visibility = 'public' OR author_id = auth.uid()
  );
CREATE POLICY "insert_own_stories" ON stories FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "update_own_stories" ON stories FOR UPDATE
  TO authenticated USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);
CREATE POLICY "delete_own_stories" ON stories FOR DELETE
  TO authenticated USING (auth.uid() = author_id);

-- ── story_views ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS story_views (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id   uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  viewer_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (story_id, viewer_id)
);

ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_story_views" ON story_views FOR SELECT
  TO authenticated USING (
    viewer_id = auth.uid() OR
    story_id IN (SELECT id FROM stories WHERE author_id = auth.uid())
  );
CREATE POLICY "insert_story_view" ON story_views FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = viewer_id);
CREATE POLICY "update_story_view" ON story_views FOR UPDATE
  TO authenticated USING (auth.uid() = viewer_id) WITH CHECK (auth.uid() = viewer_id);
CREATE POLICY "delete_story_view" ON story_views FOR DELETE
  TO authenticated USING (auth.uid() = viewer_id);

-- ── reels ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reels (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_url     text NOT NULL,
  thumbnail_url text,
  duration_ms   integer NOT NULL DEFAULT 15000,
  caption       text,
  ai_tags       jsonb DEFAULT '[]',
  sound_label   text,
  like_count    integer NOT NULL DEFAULT 0,
  comment_count integer NOT NULL DEFAULT 0,
  share_count   integer NOT NULL DEFAULT 0,
  view_count    integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  visibility    text NOT NULL DEFAULT 'public' CHECK (visibility IN ('public','connections'))
);

ALTER TABLE reels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_reels_public" ON reels FOR SELECT
  TO authenticated USING (visibility = 'public' OR author_id = auth.uid());
CREATE POLICY "insert_own_reels" ON reels FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "update_own_reels" ON reels FOR UPDATE
  TO authenticated USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);
CREATE POLICY "delete_own_reels" ON reels FOR DELETE
  TO authenticated USING (auth.uid() = author_id);

-- ── reel_reactions ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reel_reactions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reel_id    uuid NOT NULL REFERENCES reels(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (reel_id, user_id)
);

ALTER TABLE reel_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_reel_reactions" ON reel_reactions FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "insert_reel_reaction" ON reel_reactions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_reel_reaction" ON reel_reactions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_reel_reaction" ON reel_reactions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ── reel_comments ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reel_comments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reel_id    uuid NOT NULL REFERENCES reels(id) ON DELETE CASCADE,
  author_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content    text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE reel_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_reel_comments" ON reel_comments FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "insert_reel_comment" ON reel_comments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "update_reel_comment" ON reel_comments FOR UPDATE
  TO authenticated USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);
CREATE POLICY "delete_reel_comment" ON reel_comments FOR DELETE
  TO authenticated USING (auth.uid() = author_id);

-- ── indexes ──────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_stories_author     ON stories (author_id);
CREATE INDEX IF NOT EXISTS idx_stories_expires    ON stories (expires_at);
CREATE INDEX IF NOT EXISTS idx_stories_highlight  ON stories (is_highlight) WHERE is_highlight = true;
CREATE INDEX IF NOT EXISTS idx_story_views_story  ON story_views (story_id);
CREATE INDEX IF NOT EXISTS idx_reels_author       ON reels (author_id);
CREATE INDEX IF NOT EXISTS idx_reels_created      ON reels (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reel_reactions_reel ON reel_reactions (reel_id);
CREATE INDEX IF NOT EXISTS idx_reel_comments_reel  ON reel_comments (reel_id);
