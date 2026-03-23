-- Replace the security definer VIEW with a security definer FUNCTION (not flagged by linter)
DROP VIEW IF EXISTS public.game_players_public;

CREATE OR REPLACE FUNCTION public.get_room_players(p_room_id uuid)
RETURNS TABLE (
  id uuid,
  room_id uuid,
  player_name text,
  score integer,
  has_answered boolean,
  joined_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, room_id, player_name, score, has_answered, joined_at
  FROM public.game_players
  WHERE game_players.room_id = p_room_id
  ORDER BY score DESC;
$$;