CREATE TABLE public.job_openings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
  description text NOT NULL CHECK (length(description) BETWEEN 50 AND 50000),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_openings TO authenticated;
GRANT ALL ON public.job_openings TO service_role;
ALTER TABLE public.job_openings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Recruiters manage own openings" ON public.job_openings FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.enforce_job_opening_limit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE tier int; lim int; cnt int;
BEGIN
  IF NEW.status <> 'open' OR (TG_OP = 'UPDATE' AND OLD.status = 'open') THEN RETURN NEW; END IF;
  SELECT COALESCE(MAX(CASE plan_id WHEN 'recruiter-lite' THEN 1 WHEN 'recruiter-growth' THEN 2 WHEN 'recruiter-scale' THEN 3 END), 0)
    INTO tier FROM public.orders
    WHERE user_id = NEW.user_id AND payment_status = 'paid' AND paid_at > now() - interval '31 days';
  lim := CASE tier WHEN 1 THEN 1 WHEN 2 THEN 5 WHEN 3 THEN NULL ELSE 0 END;
  IF lim IS NULL THEN RETURN NEW; END IF;
  SELECT count(*) INTO cnt FROM public.job_openings WHERE user_id = NEW.user_id AND status = 'open' AND id <> NEW.id;
  IF cnt >= lim THEN RAISE EXCEPTION 'job_opening_limit_reached' USING ERRCODE = 'P0001'; END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER job_openings_limit BEFORE INSERT OR UPDATE ON public.job_openings
  FOR EACH ROW EXECUTE FUNCTION public.enforce_job_opening_limit();
CREATE TRIGGER update_job_openings_updated_at BEFORE UPDATE ON public.job_openings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();