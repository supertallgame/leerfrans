
-- Remove the permissive SELECT policy on game_players (client uses game_players_public view)
DROP POLICY IF EXISTS "Anyone can view players" ON public.game_players;

-- Revoke direct SELECT on player_token column as defense-in-depth
REVOKE SELECT (player_token) ON public.game_players FROM anon, authenticated;
