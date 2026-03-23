CREATE POLICY "Anyone can view players in their room"
ON public.game_players
FOR SELECT
TO anon, authenticated
USING (true);

REVOKE SELECT (player_token, current_answer) ON public.game_players FROM anon, authenticated;