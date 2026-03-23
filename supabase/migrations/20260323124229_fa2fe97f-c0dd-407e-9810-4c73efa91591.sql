
-- Remove permissive UPDATE/INSERT policies
DROP POLICY IF EXISTS "Anyone can update rooms" ON public.game_rooms;
DROP POLICY IF EXISTS "Anyone can update players" ON public.game_players;
DROP POLICY IF EXISTS "Anyone can create rooms" ON public.game_rooms;
DROP POLICY IF EXISTS "Anyone can join rooms" ON public.game_players;

-- Recreate INSERT policies scoped (still open since no auth, but INSERT is less dangerous)
CREATE POLICY "Anyone can create rooms" ON public.game_rooms FOR INSERT WITH CHECK (status = 'waiting');
CREATE POLICY "Anyone can join rooms" ON public.game_players FOR INSERT WITH CHECK (true);
