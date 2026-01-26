CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    username,       
    avatar_url,
    avatar_color
  )
  VALUES (
    NEW.id,
    -- Will be set based on metadata or email prefix
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL),
    -- Random nice color as default (required field)
    CASE (floor(random() * 10))::int
      WHEN 0 THEN '#6366f1'  -- indigo
      WHEN 1 THEN '#8b5cf6'  -- violet
      WHEN 2 THEN '#ec4899'  -- pink
      WHEN 3 THEN '#f43f5e'  -- rose
      WHEN 4 THEN '#ef4444'  -- red
      WHEN 5 THEN '#f97316'  -- orange
      WHEN 6 THEN '#eab308'  -- yellow
      WHEN 7 THEN '#84cc16'  -- lime
      WHEN 8 THEN '#10b981'  -- emerald
      WHEN 9 THEN '#06b6d4'  -- cyan
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- =============================================================================
-- Re-attach the trigger (just in case)
-- =============================================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

