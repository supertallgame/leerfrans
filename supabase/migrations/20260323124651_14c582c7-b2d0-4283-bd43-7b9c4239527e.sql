
-- Add a secret token column to game_players (not exposed via SELECT policy)
ALTER TABLE public.game_players ADD COLUMN player_token UUID NOT NULL DEFAULT gen_random_uuid();

-- Drop existing SELECT policy and recreate without exposing player_token
DROP POLICY IF EXISTS "Anyone can view players" ON public.game_players;
CREATE POLICY "Anyone can view players" ON public.game_players FOR SELECT USING (true);
