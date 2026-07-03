REVOKE EXECUTE ON FUNCTION public.increment_stat(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_stat(text) TO service_role;