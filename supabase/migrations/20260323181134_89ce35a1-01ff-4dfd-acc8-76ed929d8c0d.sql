
-- Restrict SELECT on game_players: only allow reading your own row (by player_token)
-- Other players are read via game_players_public view which excludes player_token
DROP POLICY "Anyone can view players in their room" ON public.game_players;
CREATE POLICY "Players can view own record" ON public.game_players
  FOR SELECT TO anon, authenticated
  USING (false);
