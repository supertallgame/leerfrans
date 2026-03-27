
-- Create RPC to read public-safe settings without exposing the full table
CREATE OR REPLACE FUNCTION public.get_public_setting(p_key text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT value
  FROM public.admin_settings
  WHERE key = p_key
    AND key IN ('block_anonymous_reviews', 'disabled_subjects')
  LIMIT 1;
$$;

-- Restrict SELECT on admin_settings to admins only
DROP POLICY IF EXISTS "Anyone can read admin settings" ON public.admin_settings;
CREATE POLICY "Admins can read settings"
ON public.admin_settings
FOR SELECT
TO authenticated
USING (
  (auth.jwt() ->> 'email') = ANY(ARRAY['brankovantland@gmail.com','branko18vantland@gmail.com','tamoopdam@gmail.com','jack.ouwerkerk@vsodaafgeluk.nl'])
);
