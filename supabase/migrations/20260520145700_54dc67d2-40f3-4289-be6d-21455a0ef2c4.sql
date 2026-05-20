
ALTER TABLE public.game_players
  ADD COLUMN IF NOT EXISTS eliminated boolean NOT NULL DEFAULT false;

ALTER TABLE public.game_rooms
  ADD COLUMN IF NOT EXISTS question_started_at timestamptz;

DROP FUNCTION IF EXISTS public.get_room_players(uuid);

CREATE OR REPLACE FUNCTION public.get_room_players(p_room_id uuid)
 RETURNS TABLE(id uuid, room_id uuid, player_name text, score integer, has_answered boolean, joined_at timestamp with time zone, team_number integer, eliminated boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT id, room_id, player_name, score, has_answered, joined_at, team_number, eliminated
  FROM public.game_players
  WHERE game_players.room_id = p_room_id
  ORDER BY score DESC;
$function$;
