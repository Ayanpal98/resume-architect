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

export interface JobMatchAnalysis {
  overallMatch: number;
  skillsMatch: {
    score: number;
    matched: string[];
    missing: string[];
    suggestions: string[];
  };
  experienceMatch: {
    score: number;
    strengths: string[];
    gaps: string[];
    suggestions: string[];
  };
  keywordAnalysis: {
    found: string[];
    missing: string[];
    density: number;
  };
  recommendations: string[];
  summary: string;
}

export const generateCoverLetter = async (
  resumeData: any,
  jobDescription: string,
  companyName?: string,
  tone?: string
): Promise<string> => {
  const { data, error } = await supabase.functions.invoke("generate-cover-letter", {
    body: { resumeData, jobDescription, companyName, tone },
  });

  if (error) {
    console.error("Cover letter generation error:", error);
    throw new Error(error.message || "Failed to generate cover letter");
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return data.coverLetter;
};

export const analyzeJobMatch = async (
  resumeData: any,
  jobDescription: string
): Promise<JobMatchAnalysis> => {
  const { data, error } = await supabase.functions.invoke("job-match-analysis", {
    body: { resumeData, jobDescription },
  });

  if (error) {
    console.error("Job match analysis error:", error);
    throw new Error(error.message || "Failed to analyze job match");
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return data.analysis;
};
