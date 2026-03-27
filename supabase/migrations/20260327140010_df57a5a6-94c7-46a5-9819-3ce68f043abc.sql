
-- Set security_invoker = true on reviews_public view
DROP VIEW IF EXISTS public.reviews_public;
CREATE VIEW public.reviews_public
WITH (security_invoker = true)
AS
SELECT id, display_name, rating, message, created_at, user_id
FROM public.reviews;
