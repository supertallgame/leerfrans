
-- Fix 1: Drop the broken is_room_player function and policy (if they still exist)
DROP POLICY IF EXISTS "Players can read their room" ON public.game_rooms;
DROP FUNCTION IF EXISTS public.is_room_player;

-- Fix 2: Tighten game_answers INSERT policy to validate user_id matches auth.uid()
DROP POLICY "Anyone can insert answers" ON public.game_answers;
CREATE POLICY "Anyone can insert answers"
ON public.game_answers FOR INSERT TO anon, authenticated
WITH CHECK (
  (user_id IS NULL OR user_id = auth.uid())
);
