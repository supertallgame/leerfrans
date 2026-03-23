-- Fix security definer view by using security invoker
ALTER VIEW public.game_rooms_public SET (security_invoker = on);