-- Recreate game_players_public view as SECURITY DEFINER so it can bypass base table RLS
-- This is safe because the view intentionally excludes player_token and current_answer
DROP VIEW IF EXISTS public.game_players_public;
CREATE VIEW public.game_players_public
WITH (security_invoker = off) AS
SELECT id, room_id, player_name, score, has_answered, joined_at
FROM public.game_players;