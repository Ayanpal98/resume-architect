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

interface PortfolioPayload {
  background?: string;      // what they studied / did so far
  domain?: string;          // field of interest / research domain
  strengths?: string;       // non-technical strengths
  experienceLevel?: string;
  location?: string;
  workStyle?: string;       // remote / hybrid / onsite
  goal?: string;            // what they want next
  toolsComfort?: string;    // comfort with tools
}

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
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
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { profile } = body as { profile: PortfolioPayload };
    if (!profile || typeof profile !== "object") {
      return new Response(JSON.stringify({ error: "profile is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (JSON.stringify(profile).length > 50000) {
      return new Response(JSON.stringify({ error: "Input exceeds maximum length." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const profileBlock = `
CANDIDATE PROFILE (NON-TECHNICAL BACKGROUND)
--------------------------------------------
Background / studies / current work: ${profile.background || "(not provided)"}
Domain / field of research or interest: ${profile.domain || "(not provided)"}
Natural strengths: ${profile.strengths || "(not provided)"}
Experience level: ${profile.experienceLevel || "(not provided)"}
Preferred location: ${profile.location || "(not provided)"}
Work style preference: ${profile.workStyle || "(not provided)"}
Comfort with digital tools: ${profile.toolsComfort || "(not provided)"}
Goal: ${profile.goal || "(not provided)"}
`.trim();

    const schema = {
      positioning_statement: "1-2 sentence plain-English positioning for this person",
      market_snapshot: {
        demand_summary: "Plain-language read on hiring demand in this domain",
        in_demand_capabilities: ["Capability employers are asking for right now"],
        hiring_signals: ["Concrete signal, e.g. rising postings for X"],
      },
      portfolio_blueprint: {
        format_recommendation: "Best portfolio format for a non-technical person (e.g. Notion site, PDF case-study deck, personal one-pager)",
        no_code_tools: [{ tool: "", why: "", cost: "Free / Low" }],
        sections: [{ section: "", purpose: "", what_to_put_here: "Concrete, non-technical instructions" }],
      },
      portfolio_projects: [{
        title: "",
        why_it_impresses: "",
        what_you_will_produce: "Tangible artifact",
        steps: ["Plain-language step"],
        time_estimate: "",
        no_code_tools: [""],
        skills_demonstrated: [""],
      }],
      job_specifications: [{
        job_title: "",
        typical_titles: [""],
        what_you_would_do: "Plain-English day-to-day",
        must_have_requirements: [""],
        nice_to_have: [""],
        tools_used: [""],
        typical_experience: "",
        salary_range_inr: "Indicative annual range in INR",
        entry_path: "How this person specifically breaks in",
        match_reason: "Why this fits their background",
        readiness: "Ready now / 1-3 months / 3-6 months",
      }],
      skills_to_learn: [{ skill: "", why: "", free_resource: "", time_to_learn: "" }],
      thirty_day_plan: [{ week: "Week 1", focus: "", actions: [""], outcome: "" }],
      proof_of_work_checklist: ["Item to have ready before applying"],
    };

    const systemPrompt = `You are a Career Portfolio Strategist who specialises in helping NON-TECHNICAL people (humanities, commerce, science research, arts, operations, teaching, etc.) build credible, market-aligned portfolios and find real roles.

CRITICAL RULES:
- Assume no coding ability unless the profile says otherwise. Recommend no-code / low-code tools only.
- Everything must be concrete and doable: name real tools, real free resources, real role titles.
- Never suggest generic advice like "improve communication". Give artifacts and steps.
- Job specifications must be realistic for the stated domain, location, and experience level. Label salary figures as indicative.
- Encouraging, plain English, no jargon, no buzzwords, no pronouns in bullet lists.
- Output VALID JSON ONLY (no markdown, no fences).`;

    const userPrompt = `${profileBlock}

Produce a market-aligned portfolio blueprint plus job specifications available in this domain.

Return JSON matching this exact shape (fill all fields, 4-6 items in portfolio_projects and job_specifications):
${JSON.stringify(schema, null, 2)}`;

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
    console.error("portfolio-studio error:", err);
    return new Response(JSON.stringify({ error: "Service error. Please try again." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
