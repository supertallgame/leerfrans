
-- Create a function for users to check their own mute status
CREATE OR REPLACE FUNCTION public.get_my_mute_status()
RETURNS TABLE(muted_until timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT muted_until
  FROM public.muted_users
  WHERE user_email = (auth.jwt() ->> 'email')
    AND muted_until > now()
  LIMIT 1;
$$;

-- Restrict SELECT to admins only
DROP POLICY IF EXISTS "Anyone can read mutes" ON public.muted_users;
CREATE POLICY "Admins can read mutes"
ON public.muted_users
FOR SELECT
TO authenticated
USING ((auth.jwt() ->> 'email') = ANY(ARRAY['brankovantland@gmail.com','branko18vantland@gmail.com','tamoopdam@gmail.com','jack.ouwerkerk@vsodaafgeluk.nl']));
