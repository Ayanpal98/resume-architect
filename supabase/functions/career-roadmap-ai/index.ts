import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ALLOWED_ORIGIN_PATTERNS = [
  /^https?:\/\/localhost(:\d+)?$/,
  /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
  /\.lovable\.app$/,
  /\.lovable\.dev$/,
  /\.lovableproject\.com$/,
];

function buildCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") || "";
  const extra = (Deno.env.get("ALLOWED_ORIGIN") || "").split(",").map((s) => s.trim()).filter(Boolean);
  const isAllowed =
    extra.includes(origin) ||
    ALLOWED_ORIGIN_PATTERNS.some((re) => {
      try { return re.test(new URL(origin).host) || re.test(origin); } catch { return false; }
    });
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : (extra[0] || "https://atsfycareerintelligentplatform.lovable.app"),
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Vary": "Origin",
  };
}

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { resumeData, jobDescription, industryMode } = body;

    if (!resumeData || !jobDescription) {
      return new Response(
        JSON.stringify({ error: "Both resumeData and jobDescription are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (typeof jobDescription !== "string" || jobDescription.length > 50000) {
      return new Response(
        JSON.stringify({ error: "Job description exceeds maximum length." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const skills = (resumeData.skills || []).join(", ");
    const experience = (resumeData.experience || []).map((e: any) =>
      `${e.title || ""} at ${e.company || ""}: ${e.description || ""}`
    ).join("\n");
    const education = (resumeData.education || []).map((e: any) =>
      `${e.degree || ""} from ${e.school || ""}`
    ).join("\n");
    const personalInfo = resumeData.personalInfo || {};

    const industryHint = industryMode && industryMode !== "auto"
      ? `The candidate is targeting the ${industryMode.toUpperCase()} industry. Tailor all recommendations, certifications, tools, platforms, and networking advice to this specific field.`
      : "Auto-detect the industry from the job description and tailor recommendations accordingly.";

    const systemPrompt = `You are an elite career intelligence strategist and portfolio optimization consultant.

Your job is to produce a PREMIUM, highly actionable career roadmap that:
1. Analyzes the candidate's current portfolio (resume) against the target role
2. Provides REAL-TIME upgrade suggestions — specific, concrete changes to make RIGHT NOW
3. Delivers a competitive positioning strategy
4. Creates a milestone-driven roadmap with measurable checkpoints

${industryHint}

CRITICAL RULES:
- Every recommendation must be SPECIFIC to this candidate's actual background — no generic advice
- Include exact tool names, platform names, certification names, course names where relevant
- Portfolio upgrades must reference specific sections of the resume that need changes
- Quantify impact where possible ("Adding X could increase match by ~Y%")
- Think like a hiring manager evaluating this candidate

OUTPUT FORMAT — Return valid JSON only, no markdown, no code fences:
{
  "current_match_estimate": 55,
  "target_match": 90,
  "competitive_positioning": {
    "strength_tier": "Mid-Level Competitive",
    "market_position": "Where this candidate stands relative to typical applicants for this role",
    "unique_differentiators": ["What makes this candidate stand out"],
    "critical_gaps": ["What's holding them back from top-tier status"]
  },
  "portfolio_upgrades": [
    {
      "section": "Summary/Experience/Skills/Education/Projects",
      "priority": "critical/high/medium",
      "current_state": "What the section currently looks like or is missing",
      "recommended_change": "Exact change to make",
      "impact_estimate": "How this change improves job match",
      "implementation_time": "5 min / 30 min / 1 hour / 1 week"
    }
  ],
  "skill_intelligence": {
    "market_demand_skills": [
      {
        "skill": "Skill name",
        "demand_level": "critical/high/moderate",
        "learning_resource": "Specific course, platform, or certification",
        "time_to_acquire": "2 weeks / 1 month / 3 months",
        "impact_on_match": "+5-10%"
      }
    ],
    "skills_to_highlight": ["Skills already on resume that should be more prominent"],
    "skills_to_deprioritize": ["Skills that add noise for this role"]
  },
  "experience_intelligence": {
    "reframe_suggestions": [
      {
        "original_role": "Current role title",
        "optimized_framing": "How to reposition this experience",
        "power_bullets": ["Rewritten achievement bullet 1", "Rewritten achievement bullet 2"],
        "keywords_to_inject": ["keyword1", "keyword2"]
      }
    ],
    "missing_experience_bridges": ["How to bridge experience gaps without lying"]
  },
  "certification_roadmap": [
    {
      "name": "Certification name",
      "provider": "Provider name",
      "relevance": "Why this matters for the target role",
      "timeline": "When to complete",
      "cost_estimate": "Free / ₹X / $X",
      "priority": "immediate/short-term/long-term"
    }
  ],
  "networking_intelligence": {
    "target_companies": ["Company names to target"],
    "key_communities": ["Specific communities, forums, Slack groups"],
    "events_to_attend": ["Conferences, meetups, webinars"],
    "outreach_template": "A brief networking message template for reaching out to hiring managers"
  },
  "milestone_roadmap": {
    "week_1": {
      "title": "Quick wins title",
      "actions": ["Specific action 1", "Specific action 2"],
      "expected_match_after": 60
    },
    "week_2_4": {
      "title": "Build foundation title",
      "actions": ["Specific action 1", "Specific action 2"],
      "expected_match_after": 70
    },
    "month_2": {
      "title": "Accelerate title",
      "actions": ["Specific action 1", "Specific action 2"],
      "expected_match_after": 80
    },
    "month_3": {
      "title": "Position for hire title",
      "actions": ["Specific action 1", "Specific action 2"],
      "expected_match_after": 90
    }
  },
  "interview_preparation": {
    "likely_questions": ["Question 1", "Question 2", "Question 3"],
    "talking_points": ["Key point to emphasize based on resume"],
    "weakness_mitigation": ["How to address gaps in interviews"]
  },
  "gap_analysis": "Comprehensive 2-3 sentence assessment",
  "role_positioning": "How to frame the narrative for this specific role",
  "overall_readiness_score": 55,
  "executive_summary": "A 2-3 sentence premium assessment of the candidate's readiness and the fastest path to 90%+ match"
}`;

    const userPrompt = `CANDIDATE PORTFOLIO:

Name: ${personalInfo.fullName || "Not provided"}
Contact: ${personalInfo.email || ""} | ${personalInfo.phone || ""} | ${personalInfo.linkedin || ""} | ${personalInfo.portfolio || ""}

PROFESSIONAL SUMMARY:
${resumeData.summary || "(Empty)"}

SKILLS:
${skills || "(None listed)"}

WORK EXPERIENCE:
${experience || "(None listed)"}

EDUCATION:
${education || "(None listed)"}

---

TARGET JOB DESCRIPTION:
${jobDescription}

---

Analyze this portfolio like a $500/hr career strategist. Produce an intelligent, premium-grade roadmap with specific, actionable portfolio upgrades that will maximize this candidate's job match. Every recommendation must be grounded in the actual resume data and target JD.`;

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
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI service error");
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    content = content.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

    let roadmap;
    try {
      roadmap = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        try { roadmap = JSON.parse(match[0]); } catch {
          console.error("Failed to parse:", content.substring(0, 500));
          throw new Error("Failed to parse roadmap data");
        }
      } else {
        throw new Error("No valid JSON in AI response");
      }
    }

    return new Response(JSON.stringify({ roadmap }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in career-roadmap-ai:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
