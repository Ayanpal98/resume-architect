REVOKE EXECUTE ON FUNCTION public.increment_stat(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_stat(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.increment_stat(text) TO authenticated;