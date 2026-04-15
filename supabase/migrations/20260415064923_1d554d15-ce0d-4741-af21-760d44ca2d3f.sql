-- Fix easter egg: add polar_express_enabled to allowed keys
CREATE OR REPLACE FUNCTION public.get_public_setting(p_key text)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT value
  FROM public.admin_settings
  WHERE key = p_key
    AND key IN ('block_anonymous_reviews', 'disabled_subjects', 'obama_enabled', 'explorer_enabled', 'ai_teacher_enabled', 'disabled_niveaus', 'polar_express_enabled')
  LIMIT 1;
$$;

-- Track user IPs
CREATE TABLE public.user_ips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  user_email text NOT NULL,
  ip_address text NOT NULL,
  is_vpn boolean DEFAULT false,
  vpn_provider text,
  country text,
  city text,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_email, ip_address)
);

ALTER TABLE public.user_ips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can read user_ips" ON public.user_ips FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'email') = ANY(ARRAY['brankovantland@gmail.com', 'branko18vantland@gmail.com']));

CREATE POLICY "Owners can delete user_ips" ON public.user_ips FOR DELETE TO authenticated
  USING ((auth.jwt() ->> 'email') = ANY(ARRAY['brankovantland@gmail.com', 'branko18vantland@gmail.com']));

CREATE POLICY "Service role can manage user_ips" ON public.user_ips FOR ALL TO service_role USING (true) WITH CHECK (true);

-- IP bans
CREATE TABLE public.ip_bans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL UNIQUE,
  reason text,
  banned_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ip_bans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can read ip_bans" ON public.ip_bans FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'email') = ANY(ARRAY['brankovantland@gmail.com', 'branko18vantland@gmail.com']));

CREATE POLICY "Owners can insert ip_bans" ON public.ip_bans FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() ->> 'email') = ANY(ARRAY['brankovantland@gmail.com', 'branko18vantland@gmail.com']));

CREATE POLICY "Owners can delete ip_bans" ON public.ip_bans FOR DELETE TO authenticated
  USING ((auth.jwt() ->> 'email') = ANY(ARRAY['brankovantland@gmail.com', 'branko18vantland@gmail.com']));

-- User bans (different from muted_users - this is a full ban)
CREATE TABLE public.user_bans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  reason text,
  ban_type text NOT NULL DEFAULT 'ban',
  mute_until timestamptz,
  banned_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_email, ban_type)
);

ALTER TABLE public.user_bans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can read user_bans" ON public.user_bans FOR SELECT TO authenticated
  USING ((auth.jwt() ->> 'email') = ANY(ARRAY['brankovantland@gmail.com', 'branko18vantland@gmail.com']));

CREATE POLICY "Owners can insert user_bans" ON public.user_bans FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() ->> 'email') = ANY(ARRAY['brankovantland@gmail.com', 'branko18vantland@gmail.com']));

CREATE POLICY "Owners can update user_bans" ON public.user_bans FOR UPDATE TO authenticated
  USING ((auth.jwt() ->> 'email') = ANY(ARRAY['brankovantland@gmail.com', 'branko18vantland@gmail.com']));

CREATE POLICY "Owners can delete user_bans" ON public.user_bans FOR DELETE TO authenticated
  USING ((auth.jwt() ->> 'email') = ANY(ARRAY['brankovantland@gmail.com', 'branko18vantland@gmail.com']));

-- Function to check if a user is banned (for use in app)
CREATE OR REPLACE FUNCTION public.check_user_ban(p_email text)
RETURNS TABLE(is_banned boolean, ban_type text, reason text, mute_until timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT true, ub.ban_type, ub.reason, ub.mute_until
  FROM public.user_bans ub
  WHERE ub.user_email = p_email
    AND (ub.ban_type = 'ban' OR (ub.ban_type = 'mute' AND ub.mute_until > now()))
  LIMIT 1;
$$;

-- Function to check if an IP is banned
CREATE OR REPLACE FUNCTION public.check_ip_ban(p_ip text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT EXISTS (SELECT 1 FROM public.ip_bans WHERE ip_address = p_ip);
$$;