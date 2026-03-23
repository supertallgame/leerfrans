CREATE POLICY "Host can delete rooms"
ON public.game_rooms
FOR DELETE
TO anon, authenticated
USING (true);

CREATE OR REPLACE FUNCTION delete_room_cascade()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.game_players WHERE room_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_delete_room_cascade
BEFORE DELETE ON public.game_rooms
FOR EACH ROW EXECUTE FUNCTION delete_room_cascade();