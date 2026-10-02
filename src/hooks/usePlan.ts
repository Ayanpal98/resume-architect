import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type PlanTier = { jobseeker: number; recruiter: number };

/** Tier numbers: jobseeker 1=Starter 2=Professional 3=Elite; recruiter 1=Lite 2=Growth 3=Scale. */
export const usePlan = () => {
  const { user } = useAuth();
  const [tier, setTier] = useState<PlanTier>({ jobseeker: 0, recruiter: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!user) {
      setLoading(false);
      return;
    }
    supabase.rpc("get_plan_tier").then(({ data }) => {
      if (!active) return;
      const d = (data ?? {}) as Partial<PlanTier>;
      setTier({ jobseeker: d.jobseeker ?? 0, recruiter: d.recruiter ?? 0 });
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [user]);

  return { tier, loading };
};
