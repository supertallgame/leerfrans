-- Revert: allow SELECT on game_rooms again (needed for INSERT returning, realtime, and joins)
DROP POLICY IF EXISTS "Anyone can view rooms" ON public.game_rooms;
CREATE POLICY "Anyone can view rooms" ON public.game_rooms
  FOR SELECT TO anon, authenticated
  USING (true);