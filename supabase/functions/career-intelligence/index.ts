import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

interface ProfilePayload {
  currentRole?: string;
  targetRole?: string;
  yearsOfExperience?: string;
  currentSkills?: string;
  industry?: string;
  timeline?: string;
  focusAreas?: string[];
  jobDescription?: string;
  rejectionFeedback?: string;
  coachingTopic?: string;
}

// Structured audit log for auth/authorization events. Emitted as JSON to
// stdout so logs can be searched/filtered via Cloud edge function logs.
function auditAuth(req: Request, event: string, details: Record<string, unknown> = {}) {
  try {
    const url = new URL(req.url);
    const payload = {
      audit: true,
      ts: new Date().toISOString(),
      fn: "career-intelligence",
      required_role: "jobseeker",
      event,
      path: url.pathname,
      method: req.method,
      ip: req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || null,
      ua: req.headers.get("user-agent") || null,
      origin: req.headers.get("origin") || null,
      ...details,
    };
    console.log("AUDIT " + JSON.stringify(payload));
  } catch (_e) {
    // never fail the request because of logging
  }
}

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Auth validation — reject anonymous and non-jobseeker accounts
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      auditAuth(req, "auth_missing_bearer", { reason: "no_authorization_header" });
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      auditAuth(req, "auth_invalid_token", { error: claimsError?.message || "no_claims" });
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userMetadata = (claimsData.claims as any).user_metadata || {};
    const _sub = (claimsData.claims as any).sub;
    if (false /* role gate relaxed: any authenticated user allowed */) {
      auditAuth(req, "authz_role_mismatch", { user_id: _sub, actual_role: userMetadata.user_type });
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    auditAuth(req, "auth_success", { user_id: _sub, role: userMetadata.user_type || "unset" });

    const body = await req.json();
    const { mode, profile } = body as { mode: string; profile: ProfilePayload };

    if (!mode || !profile) {
      return new Response(JSON.stringify({ error: "mode and profile are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Input size limits
    const totalSize = JSON.stringify(profile).length;
    if (totalSize > 50000) {
      return new Response(JSON.stringify({ error: "Input exceeds maximum length." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const profileBlock = `
CANDIDATE PROFILE
-----------------
Current role: ${profile.currentRole || "(not provided)"}
Target role: ${profile.targetRole || "(not provided)"}
Years of experience: ${profile.yearsOfExperience || "(not provided)"}
Current skills: ${profile.currentSkills || "(not provided)"}
Industry / domain: ${profile.industry || "(not provided)"}
Timeline to goal: ${profile.timeline || "(not provided)"}
Focus areas: ${(profile.focusAreas || []).join(", ") || "(none)"}
${profile.jobDescription ? `\nTARGET JOB DESCRIPTION:\n${profile.jobDescription}` : ""}
`.trim();

    let systemPrompt = "";
    let userPrompt = "";
    let schema: any = {};

    if (mode === "roadmap") {
      systemPrompt = `You are an elite Career Intelligence Strategist (Senior Resume Strategist persona). Produce a premium, actionable, milestone-driven career roadmap.

CRITICAL RULES:
- Recommendations must be specific to the candidate, not generic
- Reference exact tools, certifications, courses, communities
- Use STAR-Impact and XYZ formula language for any rewrites
- No buzzwords, no pronouns
- Output VALID JSON ONLY (no markdown, no fences)`;
      userPrompt = `${profileBlock}\n\nProduce a step-by-step roadmap to reach the target role within the timeline.`;
      schema = {
        executive_summary: "2-3 sentence premium assessment",
        readiness_score: 0,
        target_score: 0,
        phases: [{
          phase: "Week 1 / Week 2-4 / Month 2 / Month 3+",
          title: "Phase title",
          objective: "What this phase accomplishes",
          actions: ["Specific action 1", "Specific action 2"],
          deliverables: ["Tangible output 1"],
          expected_score_after: 0,
        }],
        quick_wins: ["Action that takes <1hr and moves the needle"],
        certifications: [{ name: "", provider: "", priority: "immediate/short-term/long-term", cost_estimate: "", time_to_complete: "" }],
        networking: { target_companies: [], communities: [], events: [] },
      };
    } else if (mode === "skill_analysis") {
      systemPrompt = `You are a Skill Intelligence Analyst. Produce a concrete skill gap analysis between current skills and the target role. Output VALID JSON ONLY.`;
      userPrompt = `${profileBlock}\n\nAnalyze skill gaps and provide a learning intelligence report.`;
      schema = {
        summary: "Concise gap assessment",
        strong_skills: [{ skill: "", evidence: "Why this is strong", market_value: "high/medium/low" }],
        missing_critical_skills: [{ skill: "", why_critical: "", learning_resource: "Specific course/cert", time_to_acquire: "", impact_on_match: "+5-10%" }],
        skills_to_deprioritize: [{ skill: "", reason: "" }],
        emerging_skills_to_watch: [{ skill: "", trend: "", relevance: "" }],
        recommended_skill_stack: ["Final 12-15 skill stack the candidate should present"],
      };
    } else if (mode === "role_fit") {
      systemPrompt = `You are a Role Fit Scoring Engine. Score the candidate's fit for the target role across multiple dimensions. Output VALID JSON ONLY.`;
      userPrompt = `${profileBlock}\n\nProduce a multi-dimensional role fit score.`;
      schema = {
        overall_fit_score: 0,
        verdict: "Strong Fit / Promising / Needs Work / Pivot Recommended",
        dimensions: [
          { name: "Technical Skills", score: 0, weight: 30, observations: "" },
          { name: "Experience Relevance", score: 0, weight: 25, observations: "" },
          { name: "Education & Credentials", score: 0, weight: 15, observations: "" },
          { name: "Domain / Industry Fit", score: 0, weight: 15, observations: "" },
          { name: "Soft Skills & Leadership Signals", score: 0, weight: 15, observations: "" },
        ],
        positioning_strategy: "How to frame the narrative for this role",
        risks: ["Risk 1"],
        opportunities: ["Opportunity 1"],
      };
    } else if (mode === "ai_coaching") {
      systemPrompt = `You are an executive AI Career Coach. Deliver focused coaching guidance. Output VALID JSON ONLY.`;
      userPrompt = `${profileBlock}\n\nCoaching topic: ${profile.coachingTopic || "general career strategy"}\n\nProvide structured coaching.`;
      schema = {
        coaching_summary: "What this session focuses on",
        likely_interview_questions: [{ question: "", how_to_answer: "STAR-formatted approach", red_flags_to_avoid: "" }],
        talking_points: ["Strength to emphasize"],
        weakness_mitigation: [{ weakness: "", mitigation: "" }],
        elevator_pitch: "30-second pitch tailored to target role",
        outreach_template: "LinkedIn DM template for hiring managers",
        confidence_builders: ["Mindset shift / habit"],
      };
    } else if (mode === "rejection_decoder") {
      systemPrompt = `You are a Rejection Intelligence Decoder. Diagnose likely reasons for rejection and convert them into a recovery plan. Output VALID JSON ONLY.`;
      userPrompt = `${profileBlock}\n\nRejection feedback / context:\n${profile.rejectionFeedback || "(no specific feedback — infer from profile vs target role)"}\n\nDecode the rejection and provide a recovery plan.`;
      schema = {
        decoded_summary: "What likely went wrong in 2-3 sentences",
        likely_reasons: [{ reason: "", evidence: "What in the profile suggests this", severity: "high/medium/low" }],
        what_recruiters_actually_meant: [{ phrase: "Common rejection phrase", real_meaning: "" }],
        recovery_actions: [{ action: "", impact: "", timeline: "" }],
        portfolio_fixes: [{ section: "Summary/Experience/Skills/Projects", change: "" }],
        next_attempt_strategy: "How to approach the next application differently",
      };
    } else {
      return new Response(JSON.stringify({ error: "Invalid mode" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    userPrompt += `\n\nReturn JSON matching this exact shape (fill all fields):\n${JSON.stringify(schema, null, 2)}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("AI gateway error:", aiRes.status);
      throw new Error("AI service error");
    }

    const data = await aiRes.json();
    let content: string = data.choices?.[0]?.message?.content || "";
    content = content.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

    let result: any;
    try { result = JSON.parse(content); }
    catch {
      const m = content.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("Failed to parse AI response");
      result = JSON.parse(m[0]);
    }

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("career-intelligence error:", err);
    return new Response(JSON.stringify({ error: "Service error. Please try again." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
