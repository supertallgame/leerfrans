CREATE POLICY "Players can delete themselves"
ON public.game_players
FOR DELETE
TO anon, authenticated
USING (true);