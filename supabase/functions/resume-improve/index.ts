import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Input validation constants
const MAX_JOB_DESC_LENGTH = 50000;
const MAX_RESUME_DATA_SIZE = 100000;

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

    const body = await req.json();
    const { resumeData, jobDescription, industryMode } = body;

    if (!resumeData || !jobDescription) {
      return new Response(
        JSON.stringify({ error: "Both resumeData and jobDescription are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate jobDescription size
    if (typeof jobDescription !== 'string' || jobDescription.length > MAX_JOB_DESC_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Job description exceeds maximum length of ${MAX_JOB_DESC_LENGTH} characters.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate resumeData size
    if (typeof resumeData !== 'object' || JSON.stringify(resumeData).length > MAX_RESUME_DATA_SIZE) {
      return new Response(
        JSON.stringify({ error: `Resume data exceeds maximum size of ${MAX_RESUME_DATA_SIZE} characters.` }),
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

    const systemPrompt = `You are a senior resume strategist, recruiter, and career coach.

Your job is to analyze a candidate's resume against a target job description and produce recruiter-grade guidance that sounds professional, specific, and commercially credible.

CRITICAL RULES:
1. Every recommendation must reference specific evidence from the resume and the job description.
2. Avoid generic AI-sounding advice, filler language, motivational clichés, and empty buzzwords.
3. Use industry-standard hiring language such as scope, ownership, delivery, cross-functional collaboration, stakeholder management, commercial impact, technical depth, operational improvement, and execution where appropriate.
4. For missing keywords, extract the exact terms from the job description.
5. For experience bullets, rewrite them into concise, achievement-oriented statements using the candidate's actual information only.
6. Do not invent metrics, tools, certifications, leadership scope, or results.
7. The "overall_tips" section must read like practical career guidance, covering positioning, progression, credibility, and how to strengthen the application strategically.
8. The "career_guidance" section is the most important strategic output. It must provide a concrete roadmap for reaching 90%+ job match — including gap analysis, role positioning, immediate actions, skill development, experience reframing, networking strategy, and a 30/60/90-day plan. Every recommendation must be grounded in the specific resume and job description provided. Do NOT give generic advice.

OUTPUT FORMAT — Return valid JSON only, no markdown, no code fences:
{
  "summary": {
    "current_assessment": "Professional assessment of how the summary aligns with the role",
    "improved_version": "A polished, recruiter-quality professional summary tailored to the role using only the candidate's actual background",
    "key_changes": ["change1", "change2"]
  },
  "experience": [
    {
      "role": "Job Title at Company",
      "current_assessment": "Professional assessment of positioning, clarity, impact, and relevance",
      "improved_bullets": ["• Rewritten bullet with stronger business relevance", "• Another rewritten bullet grounded in the candidate's data"],
      "missing_keywords_to_add": ["keyword1", "keyword2"]
    }
  ],
  "skills": {
    "keep": ["skills that already support the target role"],
    "add": ["relevant skills or terms from the JD supported by the candidate background"],
    "remove": ["skills that weaken positioning or add noise"],
    "reorganized": "Technical Skills: x, y, z | Tools & Platforms: a, b | Core Skills: c, d"
  },
  "keywords": {
    "found_in_resume": ["keywords already present"],
    "missing_critical": ["must-add keywords from JD"],
    "missing_preferred": ["useful supporting terms from JD"]
  },
  "career_guidance": {
    "current_match_estimate": 55,
    "target_match": 90,
    "gap_analysis": "2-3 sentence assessment of why the current resume falls short of 90%+ match and what broad areas need work",
    "role_positioning": "How the candidate should reframe their narrative to align with this specific role",
    "immediate_actions": ["Specific action the candidate can take right now to close the gap"],
    "skill_development_plan": ["Skill or certification to acquire within 30-60 days"],
    "experience_reframing": ["How to reposition existing experience to better match the target role"],
    "networking_strategy": "Specific networking advice tied to the target role or industry",
    "30_60_90_plan": {
      "30_days": "First 30 days improvement actions",
      "60_days": "Medium-term certifications, portfolio, informational interviews",
      "90_days": "Longer-term positioning like thought leadership or career pivots"
    }
  },
  "overall_tips": ["practical career guidance point 1", "practical career guidance point 2", "practical career guidance point 3"]
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

Analyze this resume like an experienced recruiter and resume consultant. Provide section-by-section improvements that use stronger industry-standard wording, clearer positioning, and more useful career guidance. Keep every recommendation grounded in the candidate's actual background and the target role.`;

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
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
