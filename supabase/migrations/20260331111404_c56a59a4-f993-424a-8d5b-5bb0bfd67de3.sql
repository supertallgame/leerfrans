
-- Fix: restrict game_rooms SELECT to prevent anon users from reading private rooms
-- Drop the overly permissive policy
DROP POLICY "Anyone can read game rooms" ON public.game_rooms;

-- Admins get full access
CREATE POLICY "Admins can read all game rooms"
ON public.game_rooms FOR SELECT TO authenticated
USING ((auth.jwt() ->> 'email'::text) = ANY (ARRAY[
  'brankovantland@gmail.com'::text,
  'branko18vantland@gmail.com'::text,
  'tamoopdam@gmail.com'::text,
  'jack.ouwerkerk@vsodaafgeluk.nl'::text
]));

-- Authenticated users can only see public rooms (private rooms accessed via game_rooms_public view)
CREATE POLICY "Authenticated can read public rooms"
ON public.game_rooms FOR SELECT TO authenticated
USING (is_public = true);

-- Authenticated users can read rooms they are playing in (for realtime)
CREATE OR REPLACE FUNCTION public.is_room_player(_room_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.game_players
    WHERE room_id = _room_id
  )
$$;

CREATE POLICY "Players can read their room"
ON public.game_rooms FOR SELECT TO authenticated
USING (public.is_room_player(id));

-- Anon users can only see public rooms
CREATE POLICY "Anon can read public rooms"
ON public.game_rooms FOR SELECT TO anon
USING (is_public = true);
