
-- Recreate reviews_public view WITHOUT security_invoker so it can read the base table
-- This is safe because the view intentionally excludes user_email
DROP VIEW IF EXISTS public.reviews_public;
CREATE VIEW public.reviews_public AS
  SELECT id, display_name, rating, message, created_at, user_id
  FROM public.reviews;
