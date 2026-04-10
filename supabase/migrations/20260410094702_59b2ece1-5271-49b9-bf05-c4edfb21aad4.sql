
-- Polls table
CREATE TABLE public.update_polls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by UUID NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.update_polls ENABLE ROW LEVEL SECURITY;

-- Everyone can read active polls
CREATE POLICY "Anyone can read active polls"
ON public.update_polls FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- Admins can read all polls
CREATE POLICY "Admins can read all polls"
ON public.update_polls FOR SELECT
TO authenticated
USING ((auth.jwt() ->> 'email'::text) = ANY (get_admin_emails()));

-- Admins can create polls
CREATE POLICY "Admins can create polls"
ON public.update_polls FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() ->> 'email'::text) = ANY (get_admin_emails()));

-- Admins can update polls
CREATE POLICY "Admins can update polls"
ON public.update_polls FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'email'::text) = ANY (get_admin_emails()));

-- Admins can delete polls
CREATE POLICY "Admins can delete polls"
ON public.update_polls FOR DELETE
TO authenticated
USING ((auth.jwt() ->> 'email'::text) = ANY (get_admin_emails()));

-- Poll votes table
CREATE TABLE public.poll_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES public.update_polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  selected_option TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (poll_id, user_id)
);

ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- Anyone can read votes (for showing results)
CREATE POLICY "Anyone can read votes"
ON public.poll_votes FOR SELECT
TO anon, authenticated
USING (true);

-- Authenticated users can insert their own vote
CREATE POLICY "Users can insert own vote"
ON public.poll_votes FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can update their own vote
CREATE POLICY "Users can update own vote"
ON public.poll_votes FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Users can delete their own vote
CREATE POLICY "Users can delete own vote"
ON public.poll_votes FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Update announcements table
CREATE TABLE public.update_announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.update_announcements ENABLE ROW LEVEL SECURITY;

-- Anyone can read active announcements
CREATE POLICY "Anyone can read active announcements"
ON public.update_announcements FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- Admins can read all announcements
CREATE POLICY "Admins can read all announcements"
ON public.update_announcements FOR SELECT
TO authenticated
USING ((auth.jwt() ->> 'email'::text) = ANY (get_admin_emails()));

-- Owners can create announcements
CREATE POLICY "Owners can create announcements"
ON public.update_announcements FOR INSERT
TO authenticated
WITH CHECK ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['brankovantland@gmail.com'::text, 'branko18vantland@gmail.com'::text]));

-- Owners can update announcements
CREATE POLICY "Owners can update announcements"
ON public.update_announcements FOR UPDATE
TO authenticated
USING ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['brankovantland@gmail.com'::text, 'branko18vantland@gmail.com'::text]));

-- Owners can delete announcements
CREATE POLICY "Owners can delete announcements"
ON public.update_announcements FOR DELETE
TO authenticated
USING ((auth.jwt() ->> 'email'::text) = ANY (ARRAY['brankovantland@gmail.com'::text, 'branko18vantland@gmail.com'::text]));

-- Storage bucket for announcement images
INSERT INTO storage.buckets (id, name, public) VALUES ('announcement-images', 'announcement-images', true);

CREATE POLICY "Anyone can view announcement images"
ON storage.objects FOR SELECT
USING (bucket_id = 'announcement-images');

CREATE POLICY "Owners can upload announcement images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'announcement-images' AND (auth.jwt() ->> 'email'::text) = ANY (ARRAY['brankovantland@gmail.com'::text, 'branko18vantland@gmail.com'::text]));

CREATE POLICY "Owners can delete announcement images"
ON storage.objects FOR DELETE
USING (bucket_id = 'announcement-images' AND (auth.jwt() ->> 'email'::text) = ANY (ARRAY['brankovantland@gmail.com'::text, 'branko18vantland@gmail.com'::text]));
