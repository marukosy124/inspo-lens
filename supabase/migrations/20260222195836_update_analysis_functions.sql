-- Common return type (used by all functions)
CREATE TYPE public.analysis_with_save_status AS (
    id                uuid,
    creator           jsonb,
    search_term       text,
    description       text,
    public            boolean,
    image_path        text,
    image_bucket      text,
    created_at        timestamptz,
    updated_at        timestamptz,
    colors            jsonb[],
    keywords          jsonb[],
    is_saved          boolean
);

-- =============================================================================
-- 1. Public list function — safe for guests/anon
--    Returns only public analyses, is_saved = NULL
--    Optional p_creator_id filter
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
SET search_path = public
AS $$
    SELECT 
        a.id,
        jsonb_build_object(
            'id',           p.id,
            'username',     p.username,
            'avatar_url',   p.avatar_url,
            'avatar_color', p.avatar_color
        ) AS creator,
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
    LEFT JOIN public.profiles p ON p.id = a.creator_id
    WHERE 
        a.public = true
        AND (p_creator_id IS NULL OR a.creator_id = p_creator_id)
    ORDER BY 
        CASE WHEN p_order_by = 'created_at' AND p_order_direction ILIKE 'desc' THEN a.created_at END DESC,
        CASE WHEN p_order_by = 'created_at' AND p_order_direction ILIKE 'asc'  THEN a.created_at END ASC,
        a.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
$$;

-- =============================================================================
-- 2. Full authenticated function — personalized list
--    Returns is_saved based on p_user_id
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_analyses_with_save_status(
    p_user_id         uuid    DEFAULT NULL,
    p_creator_id      uuid    DEFAULT NULL,
    p_only_saved      boolean DEFAULT false,
    p_limit           integer DEFAULT 20,
    p_offset          integer DEFAULT 0,
    p_order_by        text    DEFAULT 'created_at',
    p_order_direction text    DEFAULT 'desc'
)
RETURNS SETOF public.analysis_with_save_status
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        a.id,
        jsonb_build_object(
            'id',           p.id,
            'username',     p.username,
            'avatar_url',   p.avatar_url,
            'avatar_color', p.avatar_color
        ) AS creator,
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
    LEFT JOIN public.profiles p ON p.id = a.creator_id
    LEFT JOIN public.saved_analyses sa 
        ON sa.analysis_id = a.id 
       AND sa.user_id = p_user_id
    WHERE 
        (p_creator_id IS NULL OR a.creator_id = p_creator_id)
        AND (NOT p_only_saved OR sa.analysis_id IS NOT NULL)
        AND (
            p_user_id IS NOT NULL 
            OR (p_user_id IS NULL AND a.public = true)
        )
    ORDER BY 
        CASE WHEN p_order_by = 'created_at' AND p_order_direction ILIKE 'desc' THEN a.created_at END DESC,
        CASE WHEN p_order_by = 'created_at' AND p_order_direction ILIKE 'asc'  THEN a.created_at END ASC,
        a.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
$$;

-- =============================================================================
-- 3. Public single analysis — guest-safe, is_saved = NULL
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_public_analysis_by_id(
    p_analysis_id     uuid
)
RETURNS public.analysis_with_save_status
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        a.id,
        jsonb_build_object(
            'id',           p.id,
            'username',     p.username,
            'avatar_url',   p.avatar_url,
            'avatar_color', p.avatar_color
        ) AS creator,
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
    LEFT JOIN public.profiles p ON p.id = a.creator_id
    WHERE a.id = p_analysis_id
      AND a.public = true
    LIMIT 1;
$$;

-- =============================================================================
-- 4. Private single analysis — with is_saved for authenticated users
-- =============================================================================
CREATE OR REPLACE FUNCTION public.get_analysis_by_id_with_save_status(
    p_analysis_id     uuid,
    p_user_id         uuid DEFAULT NULL
)
RETURNS public.analysis_with_save_status
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        a.id,
        jsonb_build_object(
            'id',           p.id,
            'username',     p.username,
            'avatar_url',   p.avatar_url,
            'avatar_color', p.avatar_color
        ) AS creator,
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
    LEFT JOIN public.profiles p ON p.id = a.creator_id
    LEFT JOIN public.saved_analyses sa 
        ON sa.analysis_id = a.id 
       AND sa.user_id = p_user_id
    WHERE a.id = p_analysis_id
    LIMIT 1;
$$;

-- =============================================================================
-- PERMISSIONS / ACCESS CONTROL
-- =============================================================================

-- Public functions — accessible by anon and authenticated
GRANT EXECUTE ON FUNCTION public.get_public_analyses                     TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_analysis_by_id               TO anon, authenticated;

-- Personalized / private functions — authenticated users only
REVOKE EXECUTE ON FUNCTION public.get_analyses_with_save_status          FROM anon;
GRANT  EXECUTE ON FUNCTION public.get_analyses_with_save_status          TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_analysis_by_id_with_save_status    FROM anon;
GRANT  EXECUTE ON FUNCTION public.get_analysis_by_id_with_save_status    TO authenticated;

-- =============================================================================
-- PERFORMANCE INDEXES (recommended)
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_saved_analyses_user_and_analysis
    ON saved_analyses (user_id, analysis_id);

CREATE INDEX IF NOT EXISTS idx_analyses_created_at_desc
    ON analyses (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analyses_public_created_at_desc
    ON analyses (public, created_at DESC)
    WHERE public = true;