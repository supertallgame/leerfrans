
DROP FUNCTION IF EXISTS public.get_room_players(uuid);

CREATE FUNCTION public.get_room_players(p_room_id uuid)
 RETURNS TABLE(id uuid, room_id uuid, player_name text, score integer, has_answered boolean, joined_at timestamp with time zone, team_number integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT id, room_id, player_name, score, has_answered, joined_at, team_number
  FROM public.game_players
  WHERE game_players.room_id = p_room_id
  ORDER BY score DESC;
$$;
