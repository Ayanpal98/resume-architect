import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth validation
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } });
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (!resumeData || !jobDescription) {
      return new Response(
        JSON.stringify({ error: "Both resumeData and jobDescription are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const resumeSummary = resumeData.summary || "";
    const skills = (resumeData.skills || []).join(", ");
    const experience = (resumeData.experience || []).map((e: any) =>
      `${e.title || ""} at ${e.company || ""}: ${e.description || ""}`
    ).join("\n");
    const education = (resumeData.education || []).map((e: any) =>
      `${e.degree || ""} from ${e.school || ""}`
    ).join("\n");
    const personalInfo = resumeData.personalInfo || {};

    const systemPrompt = `You are an elite ATS resume consultant. Analyze a candidate's resume against a specific job description and provide CONCRETE, ACTIONABLE improvement suggestions for EVERY section.

CRITICAL RULES:
1. Every suggestion must reference SPECIFIC content from the candidate's resume AND the job description
2. Never give generic advice — every point must be tied to what's actually written
3. For missing keywords, extract the EXACT terms from the job description
4. For experience bullets, rewrite them using the XYZ formula with the candidate's actual data
5. Quantify gaps precisely (e.g., "JD mentions Python 3 times but your resume mentions it 0 times")

OUTPUT FORMAT — Return valid JSON only, no markdown, no code fences:
{
  "summary": {
    "current_assessment": "Brief assessment of current summary vs JD requirements",
    "improved_version": "A complete rewritten professional summary tailored to this JD using the candidate's actual experience",
    "key_changes": ["change1", "change2"]
  },
  "experience": [
    {
      "role": "Job Title at Company",
      "current_assessment": "What's wrong with current bullets",
      "improved_bullets": ["• Rewritten bullet with metrics", "• Another improved bullet"],
      "missing_keywords_to_add": ["keyword1", "keyword2"]
    }
  ],
  "skills": {
    "keep": ["skills that match the JD"],
    "add": ["missing skills from JD the candidate likely has based on experience"],
    "remove": ["irrelevant skills not in JD"],
    "reorganized": "Technical Skills: x, y, z | Tools & Platforms: a, b | Core Skills: c, d"
  },
  "keywords": {
    "found_in_resume": ["keywords already present"],
    "missing_critical": ["must-add keywords from JD"],
    "missing_preferred": ["nice-to-have keywords"]
  },
  "overall_tips": ["tip1", "tip2", "tip3"]
}`;

    const userPrompt = `CANDIDATE'S RESUME:

Name: ${personalInfo.fullName || "Not provided"}
Contact: ${personalInfo.email || ""} | ${personalInfo.phone || ""} | ${personalInfo.linkedin || ""} | ${personalInfo.portfolio || ""}

PROFESSIONAL SUMMARY:
${resumeSummary || "(Empty — needs to be created)"}

SKILLS:
${skills || "(No skills listed)"}

WORK EXPERIENCE:
${experience || "(No experience listed)"}

EDUCATION:
${education || "(No education listed)"}

---

TARGET JOB DESCRIPTION:
${jobDescription}

---

Analyze this resume against the job description. Provide specific, actionable improvements for EVERY section. Rewrite content using the candidate's actual data. Include exact keywords from the JD that are missing.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI service error");
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";

    // Clean markdown fences
    content = content.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

    let analysis;
    try {
      analysis = JSON.parse(content);
    } catch {
      // Try to extract JSON object
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          analysis = JSON.parse(match[0]);
        } catch {
          console.error("Failed to parse AI response:", content.substring(0, 500));
          throw new Error("Failed to parse improvement suggestions");
        }
      } else {
        throw new Error("No valid JSON in AI response");
      }
    }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in resume-improve function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
