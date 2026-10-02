DROP POLICY IF EXISTS "Users can update their own pending orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
CREATE POLICY "Users can create their own pending orders" ON public.orders
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND payment_status = 'pending_verification');

CREATE OR REPLACE FUNCTION public.get_plan_tier()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'jobseeker', COALESCE(MAX(CASE plan_id
      WHEN 'premium-starter' THEN 1
      WHEN 'premium-professional' THEN 2
      WHEN 'premium-elite' THEN 3 END), 0),
    'recruiter', COALESCE(MAX(CASE WHEN paid_at > now() - interval '31 days' THEN CASE plan_id
      WHEN 'recruiter-lite' THEN 1
      WHEN 'recruiter-growth' THEN 2
      WHEN 'recruiter-scale' THEN 3 END END), 0)
  )
  FROM public.orders
  WHERE user_id = auth.uid() AND payment_status = 'paid';
$$;
REVOKE EXECUTE ON FUNCTION public.get_plan_tier() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.get_plan_tier() TO authenticated;