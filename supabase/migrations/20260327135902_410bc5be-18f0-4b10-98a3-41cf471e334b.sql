
-- Remove the conflicting public policy on the base table - the view handles public access
DROP POLICY IF EXISTS "Anyone can read reviews_public" ON public.reviews;
