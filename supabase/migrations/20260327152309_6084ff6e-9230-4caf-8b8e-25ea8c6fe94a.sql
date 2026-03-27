
CREATE TRIGGER trigger_rate_limit_replies
  BEFORE INSERT ON public.review_replies
  FOR EACH ROW
  EXECUTE FUNCTION public.rate_limit_replies();

CREATE TRIGGER trigger_rate_limit_reviews
  BEFORE INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.rate_limit_reviews();

CREATE TRIGGER trigger_validate_review
  BEFORE INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_review();
