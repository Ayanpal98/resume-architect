import { supabase } from "@/integrations/supabase/client";

interface SuggestionContent {
  experience?: string;
  skills?: string;
  targetRole?: string;
  title?: string;
  company?: string;
  description?: string;
  currentSkills?: string;
}

type SuggestionType = "summary" | "experience" | "skills" | "keywords";

export const getAISuggestion = async (
  type: SuggestionType,
  content: SuggestionContent | string,
  jobDescription?: string
): Promise<string> => {
  const { data, error } = await supabase.functions.invoke("ai-suggestions", {
    body: { type, content, jobDescription },
  });

  if (error) {
    console.error("AI suggestion error:", error);
    throw new Error(error.message || "Failed to get AI suggestion");
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return data.suggestion;
};

export const parseResumeFile = async (text: string): Promise<any> => {
  const { data, error } = await supabase.functions.invoke("parse-resume", {
    body: { text },
  });

  if (error) {
    console.error("Resume parse error:", error);
    throw new Error(error.message || "Failed to parse resume");
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return data.data;
};
