-- Block direct INSERT on game_players since all inserts go through join_game_room RPC (SECURITY DEFINER)
DROP POLICY IF EXISTS "Anyone can join rooms" ON public.game_players;
CREATE POLICY "No direct insert" ON public.game_players
  FOR INSERT TO anon, authenticated
  WITH CHECK (false);