
CREATE OR REPLACE FUNCTION public.get_public_setting(p_key text)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT value
  FROM public.admin_settings
  WHERE key = p_key
    AND key IN ('block_anonymous_reviews', 'disabled_subjects', 'obama_enabled', 'explorer_enabled', 'ai_teacher_enabled', 'disabled_niveaus')
  LIMIT 1;
$function$;
