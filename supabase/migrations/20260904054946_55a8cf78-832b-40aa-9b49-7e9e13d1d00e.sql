CREATE TABLE public.active_resumes (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL DEFAULT 'Resume',
  resume_data JSONB NOT NULL,
  ats_score INTEGER,
  analyzed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.active_resumes TO authenticated;
GRANT ALL ON public.active_resumes TO service_role;

ALTER TABLE public.active_resumes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own active resume"
ON public.active_resumes FOR ALL TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_active_resumes_updated_at
BEFORE UPDATE ON public.active_resumes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();