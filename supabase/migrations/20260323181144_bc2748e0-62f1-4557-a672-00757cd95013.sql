
-- Restrict UPDATE and DELETE on game_players from direct client access
-- All mutations go through the edge function with service role
DROP POLICY "Players can update themselves" ON public.game_players;
CREATE POLICY "Players can update themselves" ON public.game_players
  FOR UPDATE TO anon, authenticated
  USING (false)
  WITH CHECK (false);

DROP POLICY "Players can delete themselves" ON public.game_players;
CREATE POLICY "Players can delete themselves" ON public.game_players
  FOR DELETE TO anon, authenticated
  USING (false);

-- Also restrict DELETE on game_rooms from direct client access
DROP POLICY "Host can delete rooms" ON public.game_rooms;
CREATE POLICY "Host can delete rooms" ON public.game_rooms
  FOR DELETE TO anon, authenticated
  USING (false);
