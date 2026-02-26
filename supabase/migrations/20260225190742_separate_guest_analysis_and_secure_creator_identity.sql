-- =============================================================================
-- Add is_guest_analysis column to analyses
-- =============================================================================

ALTER TABLE public.analyses
  ADD COLUMN IF NOT EXISTS is_guest_analysis boolean NOT NULL DEFAULT false;

-- =============================================================================
-- Private config table + helper function
-- =============================================================================
CREATE SCHEMA IF NOT EXISTS private;

REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;

CREATE TABLE IF NOT EXISTS private.config (
    key        text PRIMARY KEY,
    value      text NOT NULL,
    created_at timestamptz DEFAULT now()
);

REVOKE ALL ON TABLE private.config FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION private.get_official_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = private, public
AS $$
    SELECT value::uuid
    FROM private.config
    WHERE key = 'official_user_id';
$$;

REVOKE ALL ON FUNCTION private.get_official_user_id() FROM PUBLIC, anon, authenticated;

-- =============================================================================
-- Replace all four query functions with anonymized creator objects
-- =============================================================================

DROP FUNCTION IF EXISTS public.get_public_analyses(uuid, integer, integer, text, text);
DROP FUNCTION IF EXISTS public.get_analyses_with_save_status(uuid, uuid, boolean, integer, integer, text, text);
DROP FUNCTION IF EXISTS public.get_public_analysis_by_id(uuid);
DROP FUNCTION IF EXISTS public.get_analysis_by_id_with_save_status(uuid, uuid);

-- =============================================================================
-- Public feed – everyone can see ALL public analyses (real users + guests)
--    is_saved = NULL always
-- =============================================================================

CREATE OR REPLACE FUNCTION public.get_public_analyses(
    p_creator_id      uuid    DEFAULT NULL,     
    p_limit           integer DEFAULT 20,
    p_offset          integer DEFAULT 0,
    p_order_by        text    DEFAULT 'created_at',
    p_order_direction text    DEFAULT 'desc'
)
RETURNS SETOF public.analysis_with_save_status
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, private
AS $$
    WITH guest_config AS (
        SELECT
            MAX(CASE WHEN key = 'official_user_avatar_url' THEN value END) AS avatar_url
        FROM private.config
        WHERE key = 'official_user_avatar_url'
    )
    SELECT
        a.id,
        CASE
            WHEN a.is_guest_analysis THEN
                jsonb_build_object(
                    'id',           NULL,
                    'username',     'guest_creator',
                    'avatar_url',   (SELECT avatar_url FROM guest_config),
                    'avatar_color', '#6366f1'
                )
            ELSE
                jsonb_build_object(
                    'id',           p.id,
                    'username',     p.username,
                    'avatar_url',   p.avatar_url,
                    'avatar_color', p.avatar_color
                )
        END AS creator,
        a.search_term,
        a.description,
        a.public,
        a.image_path,
        a.image_bucket,
        a.created_at,
        a.updated_at,
        COALESCE((
            SELECT array_agg(
                jsonb_build_object('id', c.id, 'hex', c.hex, 'name', c.name)
                ORDER BY c.hex
            )
            FROM analysis_colors ac JOIN colors c ON ac.color_id = c.id
            WHERE ac.analysis_id = a.id
        ), '{}'::jsonb[]) AS colors,
        COALESCE((
            SELECT array_agg(
                jsonb_build_object('id', k.id, 'name', k.name)
                ORDER BY k.name
            )
            FROM analysis_keywords ak JOIN keywords k ON ak.keyword_id = k.id
            WHERE ak.analysis_id = a.id
        ), '{}'::jsonb[]) AS keywords,
        NULL::boolean AS is_saved
    FROM public.analyses a
    LEFT JOIN public.profiles p 
        ON p.id = a.creator_id 
       AND NOT a.is_guest_analysis
    WHERE a.public = true
      AND (p_creator_id IS NULL OR a.creator_id = p_creator_id)
    ORDER BY
        CASE WHEN p_order_by = 'created_at' AND p_order_direction ILIKE 'desc' THEN a.created_at END DESC NULLS LAST,
        CASE WHEN p_order_by = 'created_at' AND p_order_direction ILIKE 'asc'  THEN a.created_at END ASC  NULLS LAST,
        a.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
$$;

-- =============================================================================
-- Authenticated list – can see own (public+private) or others' public
--    → returns correct is_saved
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_analyses_with_save_status(
    p_user_id uuid DEFAULT NULL,
    p_creator_id uuid DEFAULT NULL,
    p_only_guest boolean DEFAULT false,
    p_only_saved boolean DEFAULT false,
    p_include_own_private boolean DEFAULT false,
    p_limit integer DEFAULT 20,
    p_offset integer DEFAULT 0,
    p_order_by text DEFAULT 'created_at',
    p_order_direction text DEFAULT 'desc'
)
RETURNS SETOF public.analysis_with_save_status
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, private
AS $$
    WITH guest_config AS (
        SELECT MAX(CASE WHEN key = 'official_user_avatar_url' THEN value END) AS avatar_url
        FROM private.config
        WHERE key = 'official_user_avatar_url'
    )
    SELECT
        a.id,
        CASE
            WHEN a.is_guest_analysis THEN jsonb_build_object(
                'id', NULL,
                'username', 'guest_creator',
                'avatar_url', (SELECT avatar_url FROM guest_config),
                'avatar_color', '#6366f1'
            )
            ELSE jsonb_build_object(
                'id', p.id,
                'username', p.username,
                'avatar_url', p.avatar_url,
                'avatar_color', p.avatar_color
            )
        END AS creator,
        a.search_term,
        a.description,
        a.public,
        a.image_path,
        a.image_bucket,
        a.created_at,
        a.updated_at,
        COALESCE((
            SELECT array_agg(jsonb_build_object('id', c.id, 'hex', c.hex, 'name', c.name) ORDER BY c.hex)
            FROM analysis_colors ac
            JOIN colors c ON ac.color_id = c.id
            WHERE ac.analysis_id = a.id
        ), '{}'::jsonb[]) AS colors,
        COALESCE((
            SELECT array_agg(jsonb_build_object('id', k.id, 'name', k.name) ORDER BY k.name)
            FROM analysis_keywords ak
            JOIN keywords k ON ak.keyword_id = k.id
            WHERE ak.analysis_id = a.id
        ), '{}'::jsonb[]) AS keywords,
        CASE
            WHEN p_user_id IS NULL THEN NULL::boolean
            WHEN sa.analysis_id IS NOT NULL THEN true
            ELSE false
        END AS is_saved
    FROM public.analyses a
    LEFT JOIN public.profiles p ON p.id = a.creator_id AND NOT a.is_guest_analysis
    LEFT JOIN public.saved_analyses sa ON sa.analysis_id = a.id AND sa.user_id = p_user_id
    WHERE true
        AND (NOT p_only_saved OR sa.analysis_id IS NOT NULL)
        AND CASE
            -- Filter by specific creator (exclude guest analyses)
            WHEN p_creator_id IS NOT NULL THEN
                a.creator_id = p_creator_id
                AND (a.public = true OR (p_creator_id = p_user_id AND p_include_own_private))
            -- Only guest items
            WHEN p_only_guest THEN
                a.is_guest_analysis AND a.public = true
            -- Default: all public analyses + optionally current user's own private
            ELSE
                (
                    a.public = true
                    OR (p_include_own_private AND p_user_id IS NOT NULL AND a.creator_id = p_user_id)
                )
        END
    ORDER BY
        CASE WHEN p_order_by = 'created_at' AND p_order_direction ILIKE 'desc' THEN a.created_at END DESC NULLS LAST,
        CASE WHEN p_order_by = 'created_at' AND p_order_direction ILIKE 'asc'  THEN a.created_at END ASC  NULLS LAST,
        a.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
$$;

REVOKE ALL ON FUNCTION public.get_analyses_with_save_status(
    uuid, uuid, boolean, boolean, boolean, integer, integer, text, text
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.get_analyses_with_save_status(
    uuid, uuid, boolean, boolean, boolean, integer, integer, text, text
) TO authenticated;

-- =============================================================================
-- Single public analysis – anyone can call, is_saved = NULL
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_public_analysis_by_id(
    p_analysis_id uuid
)
RETURNS public.analysis_with_save_status
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, private
AS $$
    WITH guest_config AS (
        SELECT
            MAX(CASE WHEN key = 'official_user_avatar_url' THEN value END) AS avatar_url
        FROM private.config
        WHERE key = 'official_user_avatar_url'
    )
    SELECT
        a.id,
        CASE
            WHEN a.is_guest_analysis THEN
                jsonb_build_object(
                    'id',           NULL,
                    'username',     'guest_creator',
                    'avatar_url',   (SELECT avatar_url FROM guest_config),
                    'avatar_color', '#6366f1'
                )
            ELSE
                jsonb_build_object(
                    'id',           p.id,
                    'username',     p.username,
                    'avatar_url',   p.avatar_url,
                    'avatar_color', p.avatar_color
                )
        END AS creator,
        a.search_term,
        a.description,
        a.public,
        a.image_path,
        a.image_bucket,
        a.created_at,
        a.updated_at,
        COALESCE((
            SELECT array_agg(
                jsonb_build_object('id', c.id, 'hex', c.hex, 'name', c.name)
                ORDER BY c.hex
            )
            FROM analysis_colors ac JOIN colors c ON ac.color_id = c.id
            WHERE ac.analysis_id = a.id
        ), '{}'::jsonb[]) AS colors,
        COALESCE((
            SELECT array_agg(
                jsonb_build_object('id', k.id, 'name', k.name)
                ORDER BY k.name
            )
            FROM analysis_keywords ak JOIN keywords k ON ak.keyword_id = k.id
            WHERE ak.analysis_id = a.id
        ), '{}'::jsonb[]) AS keywords,
        NULL::boolean AS is_saved
    FROM public.analyses a
    LEFT JOIN public.profiles p 
        ON p.id = a.creator_id 
       AND NOT a.is_guest_analysis
    WHERE a.id = p_analysis_id
      AND a.public = true;
$$;

-- =============================================================================
-- Single analysis with save status – authenticated only
--    → can see private if owner
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_analysis_by_id_with_save_status(
    p_analysis_id uuid,
    p_user_id     uuid DEFAULT NULL
)
RETURNS public.analysis_with_save_status
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, private
AS $$
    WITH guest_config AS (
        SELECT
            MAX(CASE WHEN key = 'official_user_avatar_url' THEN value END) AS avatar_url
        FROM private.config
        WHERE key = 'official_user_avatar_url'
    )
    SELECT
        a.id,
        CASE
            WHEN a.is_guest_analysis THEN
                jsonb_build_object(
                    'id',           NULL,
                    'username',     'guest_creator',
                    'avatar_url',   (SELECT avatar_url FROM guest_config),
                    'avatar_color', '#6366f1'
                )
            ELSE
                jsonb_build_object(
                    'id',           p.id,
                    'username',     p.username,
                    'avatar_url',   p.avatar_url,
                    'avatar_color', p.avatar_color
                )
        END AS creator,
        a.search_term,
        a.description,
        a.public,
        a.image_path,
        a.image_bucket,
        a.created_at,
        a.updated_at,
        COALESCE((
            SELECT array_agg(
                jsonb_build_object('id', c.id, 'hex', c.hex, 'name', c.name)
                ORDER BY c.hex
            )
            FROM analysis_colors ac JOIN colors c ON ac.color_id = c.id
            WHERE ac.analysis_id = a.id
        ), '{}'::jsonb[]) AS colors,
        COALESCE((
            SELECT array_agg(
                jsonb_build_object('id', k.id, 'name', k.name)
                ORDER BY k.name
            )
            FROM analysis_keywords ak JOIN keywords k ON ak.keyword_id = k.id
            WHERE ak.analysis_id = a.id
        ), '{}'::jsonb[]) AS keywords,
        CASE
            WHEN p_user_id IS NULL THEN NULL::boolean
            WHEN sa.analysis_id IS NOT NULL THEN true
            ELSE false
        END AS is_saved
    FROM public.analyses a
    LEFT JOIN public.profiles p 
        ON p.id = a.creator_id 
       AND NOT a.is_guest_analysis
    LEFT JOIN public.saved_analyses sa 
        ON sa.analysis_id = a.id 
       AND sa.user_id = p_user_id
    WHERE a.id = p_analysis_id
      AND (a.public = true OR a.creator_id = p_user_id);
$$;

REVOKE ALL PRIVILEGES ON FUNCTION public.get_analysis_by_id_with_save_status(uuid, uuid)
    FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.get_analysis_by_id_with_save_status(uuid, uuid)
    TO authenticated;

-- Core indexes for listing / feed / discovery
DROP INDEX IF EXISTS idx_analyses_public_created_at_desc;
CREATE INDEX IF NOT EXISTS idx_analyses_public_created_at_desc
    ON public.analyses (public, created_at DESC)
    WHERE public = true;

-- Very helpful when filtering by creator
CREATE INDEX IF NOT EXISTS idx_analyses_creator_id_public_created_at
    ON public.analyses (creator_id, public, created_at DESC);

-- faster count of saved items per user
DROP INDEX IF EXISTS idx_saved_analyses_user_id;
CREATE INDEX IF NOT EXISTS idx_saved_analyses_user_id
    ON public.saved_analyses (user_id);

-- Fast counts per creator (including private ones)
DROP INDEX IF EXISTS idx_analyses_creator_id;
CREATE INDEX IF NOT EXISTS idx_analyses_creator_id 
    ON public.analyses (creator_id);
    
-- If you have many guest analyses and query them often
CREATE INDEX IF NOT EXISTS idx_analyses_is_guest_analysis_created_at
    ON public.analyses (is_guest_analysis, created_at DESC)
    WHERE is_guest_analysis = true;

-- Drop the old combined function
DROP FUNCTION IF EXISTS public.create_analysis_with_relations(
    uuid, text, text, boolean, text, text, jsonb, text[]
);

-- ----------------------------------------------------------------------------
-- Authenticated user analysis creation
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_user_analysis(
    p_search_term  text,
    p_description  text,
    p_public       boolean,
    p_image_path   text,
    p_image_bucket text,
    p_colors       jsonb,  
    p_keywords     text[]
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    calling_user_id uuid;
    new_analysis_id uuid;
    color_id        uuid;
    keyword_id      uuid;
    color_json      jsonb;
    color_hex       text;
    color_name      text;
    keyword_name    text;
BEGIN
    calling_user_id := auth.uid();

    IF calling_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    INSERT INTO analyses (
        creator_id, search_term, description, public,
        image_path, image_bucket, is_guest_analysis
    )
    VALUES (
        calling_user_id, p_search_term, p_description, p_public,
        p_image_path, p_image_bucket, false
    )
    RETURNING id INTO new_analysis_id;

    -- Colors
    IF p_colors IS NOT NULL AND jsonb_array_length(p_colors) > 0 THEN
        FOR color_json IN SELECT * FROM jsonb_array_elements(p_colors) LOOP
            color_hex  := color_json->>'hex';
            color_name := color_json->>'name';

            IF color_hex IS NULL OR color_hex !~ '^#[0-9A-Fa-f]{6}$' THEN
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

    -- Keywords
    IF p_keywords IS NOT NULL AND array_length(p_keywords, 1) > 0 THEN
        FOREACH keyword_name IN ARRAY p_keywords LOOP
            INSERT INTO keywords (name)
            VALUES (keyword_name)
            ON CONFLICT (name) DO NOTHING
            RETURNING id INTO keyword_id;

            IF NOT FOUND THEN
                SELECT id INTO keyword_id FROM keywords WHERE name = keyword_name;
            END IF;

            INSERT INTO analysis_keywords (analysis_id, keyword_id)
            VALUES (new_analysis_id, keyword_id)
            ON CONFLICT DO NOTHING;
        END LOOP;
    END IF;

    RETURN new_analysis_id;
END;
$$;

-- Only authenticated users can call this
REVOKE EXECUTE ON FUNCTION public.create_user_analysis(
    text, text, boolean, text, text, jsonb, text[]
) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_user_analysis(
    text, text, boolean, text, text, jsonb, text[]
) TO authenticated;


-- ----------------------------------------------------------------------------
-- Guest analysis creation  (server-side / service_role only)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_guest_analysis(
    p_search_term  text,
    p_description  text,
    p_public       boolean,
    p_image_path   text,
    p_image_bucket text,
    p_colors       jsonb,
    p_keywords     text[]
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
DECLARE
    official_id     uuid;
    new_analysis_id uuid;
    color_id        uuid;
    keyword_id      uuid;
    color_json      jsonb;
    color_hex       text;
    color_name      text;
    keyword_name    text;
BEGIN
    official_id := private.get_official_user_id();

    INSERT INTO analyses (
        creator_id, search_term, description, public,
        image_path, image_bucket, is_guest_analysis
    )
    VALUES (
        official_id, p_search_term, p_description, p_public,
        p_image_path, p_image_bucket, true           -- always guest
    )
    RETURNING id INTO new_analysis_id;

    -- Colors
    IF p_colors IS NOT NULL AND jsonb_array_length(p_colors) > 0 THEN
        FOR color_json IN SELECT * FROM jsonb_array_elements(p_colors) LOOP
            color_hex  := color_json->>'hex';
            color_name := color_json->>'name';

            IF color_hex IS NULL OR color_hex !~ '^#[0-9A-Fa-f]{6}$' THEN
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

    -- Keywords
    IF p_keywords IS NOT NULL AND array_length(p_keywords, 1) > 0 THEN
        FOREACH keyword_name IN ARRAY p_keywords LOOP
            INSERT INTO keywords (name)
            VALUES (keyword_name)
            ON CONFLICT (name) DO NOTHING
            RETURNING id INTO keyword_id;

            IF NOT FOUND THEN
                SELECT id INTO keyword_id FROM keywords WHERE name = keyword_name;
            END IF;

            INSERT INTO analysis_keywords (analysis_id, keyword_id)
            VALUES (new_analysis_id, keyword_id)
            ON CONFLICT DO NOTHING;
        END LOOP;
    END IF;

    RETURN new_analysis_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_guest_analysis(
    text, text, boolean, text, text, jsonb, text[]
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.create_guest_analysis(
    text, text, boolean, text, text, jsonb, text[]
) TO service_role;

-- =============================================================================
-- RLS policy — prevent any non-service_role client from directly
-- =============================================================================

-- Drop and recreate the insert policy to add is_guest_analysis guard
DROP POLICY IF EXISTS "Authenticated users can create own analyses" ON analyses;

CREATE POLICY "Authenticated users can create own analyses"
  ON analyses FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = creator_id
    AND is_guest_analysis = false     -- authenticated users cannot self-flag as guest
  );

CREATE INDEX IF NOT EXISTS idx_analyses_is_guest
    ON analyses (is_guest_analysis)
    WHERE is_guest_analysis = true;

