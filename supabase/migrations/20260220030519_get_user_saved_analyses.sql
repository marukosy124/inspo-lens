CREATE OR REPLACE FUNCTION public.get_user_saved_analyses(
  p_user_id         uuid,
  p_limit           integer DEFAULT 20,
  p_offset          integer DEFAULT 0
)
RETURNS TABLE (
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
)
LANGUAGE sql
STABLE
SECURITY DEFINER
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

    true AS is_saved

  FROM public.analyses a
  JOIN public.saved_analyses sa ON sa.analysis_id = a.id
  LEFT JOIN public.profiles p ON p.id = a.creator_id

  WHERE sa.user_id = p_user_id

  ORDER BY a.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_saved_analyses TO authenticated;