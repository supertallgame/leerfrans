-- Fix 1: Remove admin_settings from Realtime publication
ALTER PUBLICATION supabase_realtime DROP TABLE public.admin_settings;

-- Fix 2: Recreate reviews_public view without user_id
DROP VIEW IF EXISTS public.reviews_public;
CREATE VIEW public.reviews_public AS
  SELECT id, display_name, rating, message, created_at
  FROM public.reviews;