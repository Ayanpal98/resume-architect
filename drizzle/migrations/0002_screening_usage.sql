CREATE TABLE public.screening_usage (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.screening_usage TO authenticated;
GRANT ALL ON public.screening_usage TO service_role;
ALTER TABLE public.screening_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own screening usage" ON public.screening_usage FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE INDEX screening_usage_user_time ON public.screening_usage(user_id, created_at);