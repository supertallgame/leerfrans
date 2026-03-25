CREATE POLICY "No direct update on game_rooms"
ON public.game_rooms
FOR UPDATE
TO anon, authenticated
USING (false)
WITH CHECK (false);