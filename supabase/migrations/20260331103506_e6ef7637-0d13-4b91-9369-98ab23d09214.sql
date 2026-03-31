
-- Table to track all student answers across all games
CREATE TABLE public.game_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  game_type TEXT NOT NULL,          -- 'quiz', 'type', 'truefalse', 'clocktimes', 'etre', 'fill', 'sentence', 'memory', 'match'
  language TEXT NOT NULL,            -- 'french', 'english', 'nask', 'biology'
  chapter_id TEXT NOT NULL,
  question TEXT NOT NULL,            -- the question/term shown
  correct_answer TEXT NOT NULL,      -- the correct answer
  given_answer TEXT,                 -- what the student answered (null for skips)
  is_correct BOOLEAN NOT NULL DEFAULT false,
  user_id UUID,                      -- optional, if logged in
  session_id TEXT NOT NULL           -- anonymous session tracking
);

-- Enable RLS
ALTER TABLE public.game_answers ENABLE ROW LEVEL SECURITY;

-- Anyone can insert answers (anonymous tracking)
CREATE POLICY "Anyone can insert answers"
ON public.game_answers
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Only juf admins can read answers
CREATE POLICY "Juf admins can read answers"
ON public.game_answers
FOR SELECT
TO authenticated
USING (
  (auth.jwt() ->> 'email') IN ('brankovantland@gmail.com', 'branko18vantland@gmail.com')
);

-- Index for fast queries
CREATE INDEX idx_game_answers_language ON public.game_answers(language);
CREATE INDEX idx_game_answers_chapter ON public.game_answers(chapter_id);
CREATE INDEX idx_game_answers_created ON public.game_answers(created_at DESC);
CREATE INDEX idx_game_answers_correct ON public.game_answers(is_correct);
