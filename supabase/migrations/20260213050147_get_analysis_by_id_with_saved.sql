CREATE TYPE analysis_with_save_status AS (
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

-- returns a single row (or NULL if not found)
CREATE OR REPLACE FUNCTION public.get_analysis_by_id_with_save_status(
    p_analysis_id     uuid,
    p_user_id         uuid DEFAULT NULL
)
RETURNS analysis_with_save_status          -- single row type
LANGUAGE sql
STABLE
AS $$
    SELECT 
        a.id::uuid,

        jsonb_build_object(
            'id',           a.creator_id,
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
            FROM analysis_colors ac
            JOIN colors c ON ac.color_id = c.id
            WHERE ac.analysis_id = a.id
        ), '{}'::jsonb[]) AS colors,

        COALESCE((
            SELECT array_agg(
                jsonb_build_object('id', k.id, 'name', k.name)
                ORDER BY k.name
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

    WHERE a.id = p_analysis_id

    LIMIT 1;   -- technically not needed but good hygiene
$$;