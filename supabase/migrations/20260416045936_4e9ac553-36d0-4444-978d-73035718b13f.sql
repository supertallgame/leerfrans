
-- Add IP mute columns
ALTER TABLE public.ip_bans ADD COLUMN IF NOT EXISTS mute_until timestamptz DEFAULT NULL;
ALTER TABLE public.ip_bans ADD COLUMN IF NOT EXISTS is_mute boolean DEFAULT false;
