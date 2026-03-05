
CREATE TABLE public.platform_stats (
  id TEXT PRIMARY KEY DEFAULT 'global',
  resumes_optimized BIGINT NOT NULL DEFAULT 0,
  candidate_screenings BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read platform stats"
ON public.platform_stats
FOR SELECT
TO anon, authenticated
USING (true);

INSERT INTO public.platform_stats (id, resumes_optimized, candidate_screenings)
VALUES ('global', 1247, 438);

CREATE OR REPLACE FUNCTION public.increment_stat(stat_name TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF stat_name = 'resumes_optimized' THEN
    UPDATE public.platform_stats SET resumes_optimized = resumes_optimized + 1, updated_at = now() WHERE id = 'global';
  ELSIF stat_name = 'candidate_screenings' THEN
    UPDATE public.platform_stats SET candidate_screenings = candidate_screenings + 1, updated_at = now() WHERE id = 'global';
  END IF;
END;
$$;

ALTER PUBLICATION supabase_realtime ADD TABLE public.platform_stats;
