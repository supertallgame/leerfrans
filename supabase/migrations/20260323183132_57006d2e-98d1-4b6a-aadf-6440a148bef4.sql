-- Create a function to insert a player and return id + token (bypasses SELECT RLS)
CREATE OR REPLACE FUNCTION public.join_game_room(p_room_id uuid, p_player_name text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_token uuid;
BEGIN
  -- Validate: room must exist and be in waiting status
  IF NOT EXISTS (
    SELECT 1 FROM public.game_rooms WHERE id = p_room_id AND status = 'waiting'
  ) THEN
    RAISE EXCEPTION 'Room not found or game already started';
  END IF;

  INSERT INTO public.game_players (room_id, player_name, score, has_answered, current_answer)
  VALUES (p_room_id, p_player_name, 0, false, null)
  RETURNING id, player_token INTO v_id, v_token;

  RETURN jsonb_build_object('id', v_id, 'player_token', v_token);
END;
$$;