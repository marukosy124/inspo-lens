-- 1. Create the minimal profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  created_at  timestamptz DEFAULT now() NOT NULL,
  updated_at  timestamptz DEFAULT now() NOT NULL,
  username     text UNIQUE,                
  avatar_url   text,                          
  avatar_color text NOT NULL DEFAULT '#6366f1'
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Policies: Users can only manage their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = id);

-- 4. Automatically create profile on sign-up with random avatar color
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  email_prefix text;
BEGIN
  -- Extract the part before @ from the email
  email_prefix := split_part(NEW.email, '@', 1);

  INSERT INTO public.profiles (
    id,
    username,
    avatar_url,
    avatar_color
  )
  VALUES (
    NEW.id,
    email_prefix,
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

-- 5. Attach the trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. Auto-update timestamp on changes
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, auth;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();