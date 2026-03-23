ALTER TABLE public.game_players ADD COLUMN last_active timestamp with time zone NOT NULL DEFAULT now();

-- Allow updates to last_active
CREATE POLICY "Players can update themselves" ON public.game_players FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);