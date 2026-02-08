--  composite index on saved_analyses: user_id first, then analysis_id
CREATE INDEX IF NOT EXISTS idx_saved_analyses_user_and_analysis
    ON saved_analyses (user_id, analysis_id);

-- index for fast sorting
CREATE INDEX IF NOT EXISTS idx_analyses_created_at_desc
    ON analyses (created_at DESC);

-- function that returns analyses with is_saved flag
CREATE OR REPLACE FUNCTION public.get_analyses_with_save_status(
    p_user_id         uuid DEFAULT NULL,
    p_limit           integer DEFAULT 20,
    p_offset          integer DEFAULT 0,
    p_order_by        text    DEFAULT 'created_at',
    p_order_direction text    DEFAULT 'desc'
)
RETURNS TABLE (
    id                uuid,
    creator           jsonb,                        -- ← nested object
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
)
LANGUAGE sql
STABLE
AS $$
    SELECT 
        a.id,

        -- Nested creator object
        jsonb_build_object(
            'id',           a.creator_id,
            'username',     p.username,
            'display_name', p.username,               -- or p.display_name later
            'avatar_url',   p.avatar_url,
            'avatar_color', p.avatar_color            -- optional, if you want it
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
                jsonb_build_object(
                    'id',   c.id,
                    'hex',  c.hex,
                    'name', c.name
                ) ORDER BY c.hex
            )
            FROM analysis_colors ac
            JOIN colors c ON ac.color_id = c.id
            WHERE ac.analysis_id = a.id
        ), '{}'::jsonb[]) AS colors,

        COALESCE((
            SELECT array_agg(
                jsonb_build_object(
                    'id',   k.id,
                    'name', k.name
                ) ORDER BY k.name
            )
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
    LEFT JOIN public.profiles p 
        ON p.id = a.creator_id

    LEFT JOIN public.saved_analyses sa
        ON sa.analysis_id = a.id
        AND sa.user_id = p_user_id

    WHERE (p_user_id IS NOT NULL)
       OR (p_user_id IS NULL AND a.public = true)

    ORDER BY 
        CASE WHEN p_order_by = 'created_at' AND p_order_direction ILIKE 'desc' THEN a.created_at END DESC,
        CASE WHEN p_order_by = 'created_at' AND p_order_direction ILIKE 'asc'  THEN a.created_at END ASC

    LIMIT p_limit
    OFFSET p_offset;
$$;