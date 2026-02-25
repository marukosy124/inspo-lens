-- =============================================================================
-- Analyses table
-- =============================================================================
CREATE TABLE IF NOT EXISTS analyses (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  search_term  text NOT NULL,
  description  text NOT NULL,
  public       boolean DEFAULT false,
  image_path   text NOT NULL,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

-- =============================================================================
-- Colors & Keywords (shared reusable data)
-- =============================================================================
CREATE TABLE IF NOT EXISTS colors (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hex        text NOT NULL UNIQUE,
  name       text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS keywords (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- =============================================================================
-- Join tables
-- =============================================================================
CREATE TABLE IF NOT EXISTS analysis_colors (
  analysis_id uuid REFERENCES analyses(id) ON DELETE CASCADE,
  color_id    uuid REFERENCES colors(id) ON DELETE CASCADE,
  PRIMARY KEY (analysis_id, color_id)
);

CREATE TABLE IF NOT EXISTS analysis_keywords (
  analysis_id uuid REFERENCES analyses(id) ON DELETE CASCADE,
  keyword_id  uuid REFERENCES keywords(id) ON DELETE CASCADE,
  PRIMARY KEY (analysis_id, keyword_id)
);

-- =============================================================================
-- Saved Analyses (user favorites)
-- =============================================================================
CREATE TABLE IF NOT EXISTS saved_analyses (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_id uuid REFERENCES analyses(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now(),
  UNIQUE (user_id, analysis_id)
);

-- =============================================================================
-- Enable RLS on ALL tables
-- =============================================================================
ALTER TABLE analyses            ENABLE ROW LEVEL SECURITY;
ALTER TABLE colors              ENABLE ROW LEVEL SECURITY;
ALTER TABLE keywords            ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_colors     ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_keywords   ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_analyses      ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- CLEAN & NON-OVERLAPPING Policies for Analyses
-- =============================================================================

-- Anonymous users: only public analyses
CREATE POLICY "Anonymous users can only read public analyses"
  ON analyses FOR SELECT
  TO anon
  USING (public = true);

-- Authenticated users: public OR own private analyses
CREATE POLICY "Authenticated users can read public or own private analyses"
  ON analyses FOR SELECT
  TO authenticated
  USING (
    public = true
    OR (SELECT auth.uid()) = creator_id
  );

-- Create / Update / Delete: only owner (authenticated)
CREATE POLICY "Authenticated users can create own analyses"
  ON analyses FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = creator_id);

CREATE POLICY "Authenticated users can update own analyses"
  ON analyses FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = creator_id);

CREATE POLICY "Authenticated users can delete own analyses"
  ON analyses FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = creator_id);

-- =============================================================================
-- Policies for Colors & Keywords (shared data) - FIXED
-- =============================================================================

-- Public read access (applies to anon + authenticated, no overlap with write policies)
CREATE POLICY "Public read access to colors"
  ON colors FOR SELECT
  USING (true);

CREATE POLICY "Public read access to keywords"
  ON keywords FOR SELECT
  USING (true);

CREATE POLICY "Public read access to analysis_colors"
  ON analysis_colors FOR SELECT
  USING (true);

CREATE POLICY "Public read access to analysis_keywords"
  ON analysis_keywords FOR SELECT
  USING (true);

-- Write access: only authenticated users (no SELECT overlap because these are FOR INSERT/UPDATE/DELETE only)
CREATE POLICY "Authenticated users can insert colors"
  ON colors FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "Authenticated users can update colors"
  ON colors FOR UPDATE
  TO authenticated
  USING ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "Authenticated users can delete colors"
  ON colors FOR DELETE
  TO authenticated
  USING ((SELECT auth.role()) = 'authenticated');

-- Repeat for keywords
CREATE POLICY "Authenticated users can insert keywords"
  ON keywords FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "Authenticated users can update keywords"
  ON keywords FOR UPDATE
  TO authenticated
  USING ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "Authenticated users can delete keywords"
  ON keywords FOR DELETE
  TO authenticated
  USING ((SELECT auth.role()) = 'authenticated');

-- Repeat for analysis_colors
CREATE POLICY "Authenticated users can insert analysis_colors"
  ON analysis_colors FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "Authenticated users can update analysis_colors"
  ON analysis_colors FOR UPDATE
  TO authenticated
  USING ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "Authenticated users can delete analysis_colors"
  ON analysis_colors FOR DELETE
  TO authenticated
  USING ((SELECT auth.role()) = 'authenticated');

-- Repeat for analysis_keywords
CREATE POLICY "Authenticated users can insert analysis_keywords"
  ON analysis_keywords FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "Authenticated users can update analysis_keywords"
  ON analysis_keywords FOR UPDATE
  TO authenticated
  USING ((SELECT auth.role()) = 'authenticated');

CREATE POLICY "Authenticated users can delete analysis_keywords"
  ON analysis_keywords FOR DELETE
  TO authenticated
  USING ((SELECT auth.role()) = 'authenticated');

-- =============================================================================
-- Policies for Saved Analyses (only owner)
-- =============================================================================

CREATE POLICY "Authenticated users can view their saved analyses"
  ON saved_analyses FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Authenticated users can save analyses"
  ON saved_analyses FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Authenticated users can unsave their analyses"
  ON saved_analyses FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- =============================================================================
-- Performance Indexes
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_analyses_creator_id ON analyses(creator_id);
CREATE INDEX IF NOT EXISTS idx_analyses_public ON analyses(public);
CREATE INDEX IF NOT EXISTS idx_saved_analyses_user_id ON saved_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_analyses_analysis_id ON saved_analyses(analysis_id);