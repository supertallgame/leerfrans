
DROP POLICY "Anyone can join rooms" ON public.game_players;
CREATE POLICY "Anyone can join rooms" ON public.game_players
  FOR INSERT TO public
  WITH CHECK (
    score = 0
    AND has_answered = false
    AND current_answer IS NULL
  );
