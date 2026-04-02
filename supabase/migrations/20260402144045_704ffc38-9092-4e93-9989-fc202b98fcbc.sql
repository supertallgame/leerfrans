CREATE OR REPLACE FUNCTION public.get_public_setting(p_key text)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT value
  FROM public.admin_settings
  WHERE key = p_key
    AND key IN ('block_anonymous_reviews', 'disabled_subjects', 'obama_enabled')
  LIMIT 1;
$$;