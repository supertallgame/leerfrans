CREATE OR REPLACE FUNCTION public.get_public_settings_bulk()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT jsonb_build_object(
    'disabled_subjects', (SELECT value FROM public.admin_settings WHERE key = 'disabled_subjects'),
    'explorer_enabled', (SELECT value FROM public.admin_settings WHERE key = 'explorer_enabled'),
    'ai_teacher_enabled', (SELECT value FROM public.admin_settings WHERE key = 'ai_teacher_enabled'),
    'disabled_niveaus', (SELECT value FROM public.admin_settings WHERE key = 'disabled_niveaus'),
    'polar_express_enabled', (SELECT value FROM public.admin_settings WHERE key = 'polar_express_enabled')
  );
$$;