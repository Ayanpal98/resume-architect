import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ActiveResume {
  user_id: string;
  file_name: string;
  resume_data: any;
  ats_score: number | null;
  analyzed_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Saves (upserts) the signed-in candidate's active resume. Safe no-op when signed out. */
export async function saveActiveResume(params: {
  resumeData: any;
  fileName?: string;
  atsScore?: number | null;
}): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await (supabase as any).from("active_resumes").upsert(
    {
      user_id: user.id,
      file_name: params.fileName?.trim() || "Resume",
      resume_data: params.resumeData,
      ats_score: params.atsScore ?? null,
      analyzed_at: params.atsScore != null ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    console.error("Failed to save active resume:", error.message);
    return false;
  }
  return true;
}

export function useActiveResume() {
  const [resume, setResume] = useState<ActiveResume | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setResume(null);
      setLoading(false);
      return;
    }
    const { data, error } = await (supabase as any)
      .from("active_resumes")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) console.error("Failed to load active resume:", error.message);
    setResume((data as ActiveResume) || null);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { resume, loading, refresh };
}
