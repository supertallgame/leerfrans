
-- Fix security definer view - make it INVOKER instead
ALTER VIEW public.game_players_public SET (security_invoker = on);
