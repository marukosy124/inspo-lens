CREATE OR REPLACE FUNCTION create_analysis_with_relations(
  p_creator_id        uuid,
  p_search_term       text,
  p_description       text,
  p_public            boolean,
  p_image_path        text,
  p_image_bucket      text,
  p_colors            jsonb,   -- array of { hex: "#FFFFFF", name: "White" | null }
  p_keywords          text[]
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_analysis_id uuid;
  color_id        uuid;
  keyword_id      uuid;
  color_json      jsonb;
  color_hex       text;
  color_name      text;
  keyword_name    text;
BEGIN
  ------------------------------------------------------------------
  -- 1. Defensive checks (VERY important for SECURITY DEFINER)
  ------------------------------------------------------------------
  IF p_creator_id IS NULL THEN
    RAISE EXCEPTION 'creator_id is required';
  END IF;

  -- Optional but strongly recommended
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE id = p_creator_id
  ) THEN
    RAISE EXCEPTION 'Invalid creator_id: %', p_creator_id;
  END IF;

  ------------------------------------------------------------------
  -- 2. Create analysis
  ------------------------------------------------------------------
  INSERT INTO analyses (
    creator_id,
    search_term,
    description,
    public,
    image_path,
    image_bucket
  )
  VALUES (
    p_creator_id,
    p_search_term,
    p_description,
    p_public,
    p_image_path,
    p_image_bucket
  )
  RETURNING id INTO new_analysis_id;

  ------------------------------------------------------------------
  -- 3. Handle colors
  ------------------------------------------------------------------
  IF p_colors IS NOT NULL AND jsonb_array_length(p_colors) > 0 THEN
    FOR color_json IN
      SELECT * FROM jsonb_array_elements(p_colors)
    LOOP
      color_hex  := color_json->>'hex';
      color_name := color_json->>'name';

      IF color_hex IS NULL
         OR color_hex !~ '^#[0-9A-Fa-f]{6}$' THEN
        RAISE EXCEPTION 'Invalid color hex: %', color_hex;
      END IF;

      INSERT INTO colors (hex, name)
      VALUES (color_hex, color_name)
      ON CONFLICT (hex) DO UPDATE
        SET name = COALESCE(colors.name, EXCLUDED.name)
      RETURNING id INTO color_id;

      INSERT INTO analysis_colors (analysis_id, color_id)
      VALUES (new_analysis_id, color_id)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  ------------------------------------------------------------------
  -- 4. Handle keywords
  ------------------------------------------------------------------
  IF p_keywords IS NOT NULL AND array_length(p_keywords, 1) > 0 THEN
    FOREACH keyword_name IN ARRAY p_keywords
    LOOP
      INSERT INTO keywords (name)
      VALUES (keyword_name)
      ON CONFLICT (name) DO NOTHING
      RETURNING id INTO keyword_id;

      IF NOT FOUND THEN
        SELECT id
        INTO keyword_id
        FROM keywords
        WHERE name = keyword_name;
      END IF;

      INSERT INTO analysis_keywords (analysis_id, keyword_id)
      VALUES (new_analysis_id, keyword_id)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

  RETURN new_analysis_id;
END;
$$;
