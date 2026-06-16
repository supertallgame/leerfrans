
CREATE OR REPLACE FUNCTION public.get_public_setting(p_key text)
RETURNS jsonb
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT value
  FROM public.admin_settings
  WHERE key = p_key
    AND key IN ('block_anonymous_reviews', 'disabled_subjects', 'obama_enabled', 'explorer_enabled', 'ai_teacher_enabled', 'disabled_niveaus', 'polar_express_enabled', 'site_rules')
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.upsert_site_rules(p_rules text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_owner(auth.uid()) THEN
    RAISE EXCEPTION 'Only owners can edit site rules';
  END IF;
  INSERT INTO public.admin_settings (key, value)
  VALUES ('site_rules', to_jsonb(p_rules))
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
END;
$$;

INSERT INTO public.admin_settings (key, value)
VALUES ('site_rules', to_jsonb(E'# Regels\n\n1. Wees respectvol naar andere gebruikers.\n2. Geen spam, scheldwoorden of haatdragende taal.\n3. Geen valse reviews of misbruik van het stemsysteem.\n4. Geen misbruik van multiplayer of accounts.\n5. Volg de instructies van staff op.\n\nBij overtreding kun je een waarschuwing, mute of ban krijgen.'::text))
ON CONFLICT (key) DO NOTHING;
