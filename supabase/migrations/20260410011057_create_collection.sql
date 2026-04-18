CREATE TABLE IF NOT EXISTS collections (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  slug         text NOT NULL,        
  description  text,
  creator_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  public       boolean DEFAULT false,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now(),
  UNIQUE (creator_id, slug)
);

CREATE TABLE IF NOT EXISTS collection_analyses (
  collection_id uuid NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  analysis_id   uuid NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  created_at    timestamptz DEFAULT now(),
  PRIMARY KEY (collection_id, analysis_id)
);

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_analyses ENABLE ROW LEVEL SECURITY;

-- Create / Update / Delete collection: only owner (authenticated)
CREATE POLICY "Authenticated users can create own collections"
  ON collections FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = creator_id);

CREATE POLICY "Authenticated users can update own collections"
  ON collections FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = creator_id);

CREATE POLICY "Authenticated users can delete own collections"
  ON collections FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = creator_id);

-- Create / Delete collection_analyses: only owner (authenticated)
CREATE POLICY "Users can add analyses to own collections"
  ON collection_analyses FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM collections 
    WHERE id = collection_analyses.collection_id 
      AND creator_id = auth.uid()
  ));

CREATE POLICY "Users can remove analyses from own collections"
  ON collection_analyses FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM collections 
    WHERE id = collection_analyses.collection_id 
      AND creator_id = auth.uid()
  ));

CREATE POLICY "Users can view analyses from own collections"
  ON collection_analyses FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM collections 
    WHERE id = collection_analyses.collection_id 
      AND creator_id = auth.uid()
  ));

-- Authenticated users can also read their own private collections
CREATE POLICY "Users can read public collections or own private ones"
  ON collections FOR SELECT
  TO anon, authenticated
  USING (
    public = true 
    OR (auth.uid() IS NOT NULL AND auth.uid() = creator_id)
  );

CREATE INDEX IF NOT EXISTS idx_collections_creator_id ON collections(creator_id);
CREATE INDEX IF NOT EXISTS idx_collections_public ON collections(public);
CREATE INDEX IF NOT EXISTS idx_collection_analyses_analysis_id ON collection_analyses(analysis_id);