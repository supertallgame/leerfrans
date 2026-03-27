
-- Add is_public column to game_rooms
ALTER TABLE public.game_rooms ADD COLUMN is_public boolean NOT NULL DEFAULT false;
ALTER TABLE public.game_rooms ADD COLUMN max_players integer NOT NULL DEFAULT 20;

-- Recreate the view to include is_public
DROP VIEW IF EXISTS public.game_rooms_public;
CREATE VIEW public.game_rooms_public AS
  SELECT id, code, host_name, status, current_question_index, total_questions,
         direction, game_mode, team_mode, num_teams, team_names, team_emojis, created_at, is_public
  FROM public.game_rooms;

-- Update create_game_room to accept is_public and max_players
CREATE OR REPLACE FUNCTION public.create_game_room(
  p_code text,
  p_host_name text,
  p_total_questions integer DEFAULT 20,
  p_game_mode text DEFAULT 'normal',
  p_team_mode text DEFAULT 'solo',
  p_num_teams integer DEFAULT 2,
  p_team_names jsonb DEFAULT '[]',
  p_team_emojis jsonb DEFAULT '["🔵","🔴","🟢","🟡"]',
  p_is_public boolean DEFAULT false,
  p_max_players integer DEFAULT 20
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_room game_rooms%ROWTYPE;
BEGIN
  INSERT INTO public.game_rooms (code, host_name, total_questions, game_mode, team_mode, num_teams, team_names, team_emojis, is_public, max_players)
  VALUES (p_code, p_host_name, p_total_questions, p_game_mode, p_team_mode, p_num_teams, p_team_names, p_team_emojis, p_is_public, p_max_players)
  RETURNING * INTO v_room;

  RETURN jsonb_build_object(
    'id', v_room.id,
    'code', v_room.code,
    'host_name', v_room.host_name,
    'status', v_room.status,
    'current_question_index', v_room.current_question_index,
    'total_questions', v_room.total_questions,
    'direction', v_room.direction,
    'game_mode', v_room.game_mode,
    'team_mode', v_room.team_mode,
    'num_teams', v_room.num_teams,
    'team_names', v_room.team_names,
    'team_emojis', v_room.team_emojis,
    'is_public', v_room.is_public,
    'max_players', v_room.max_players
  );
END;
$$;

-- RPC to get public waiting rooms with player count
CREATE OR REPLACE FUNCTION public.get_public_rooms()
RETURNS TABLE(
  id uuid,
  code text,
  host_name text,
  game_mode text,
  team_mode text,
  num_teams integer,
  player_count bigint,
  max_players integer,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    r.id, r.code, r.host_name, r.game_mode, r.team_mode, r.num_teams,
    (SELECT count(*) FROM public.game_players gp WHERE gp.room_id = r.id) AS player_count,
    r.max_players,
    r.created_at
  FROM public.game_rooms r
  WHERE r.is_public = true
    AND r.status = 'waiting'
    AND (SELECT count(*) FROM public.game_players gp WHERE gp.room_id = r.id) < r.max_players
  ORDER BY r.created_at DESC
  LIMIT 50;
$$;
