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

const MAX_RESUME_LENGTH = 100000;
const MAX_JD_LENGTH = 50000;

function auditAuth(req: Request, event: string, details: Record<string, unknown> = {}) {
  try {
    const url = new URL(req.url);
    console.log("AUDIT " + JSON.stringify({
      audit: true, ts: new Date().toISOString(), fn: "deep-improvement",
      required_role: "jobseeker", event, path: url.pathname, method: req.method,
      ip: req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || null,
      ua: req.headers.get("user-agent") || null, origin: req.headers.get("origin") || null,
      ...details,
    }));
  } catch (_e) { /* noop */ }
}

/**
 * Fabrication guard.
 * Extracts "concrete claims" from text: numbers, percentages, currency, years,
 * and Capitalized proper-noun tokens (likely tools/orgs/products).
 * A rewrite is considered fabricated if it introduces a concrete claim that
 * does NOT appear (case-insensitive) in the source span.
 */
function extractClaims(text: string): { numbers: string[]; propers: string[] } {
  const numbers = Array.from(text.matchAll(/\b\d[\d,.]*\s?%?\b|\$\s?\d[\d,.]*|₹\s?\d[\d,.]*/g)).map((m) => m[0].toLowerCase().replace(/\s+/g, ""));
  const propers = Array.from(text.matchAll(/\b[A-Z][a-zA-Z0-9+.#-]{1,}(?:\s+[A-Z][a-zA-Z0-9+.#-]{1,}){0,2}\b/g))
    .map((m) => m[0])
    .filter((w) => !/^(I|The|A|An|And|Or|But|At|In|On|For|To|Of|With|By|My|Our)$/i.test(w));
  return { numbers, propers };
}

const STOP_PROPERS = new Set(["Team", "Project", "Company", "Role", "Manager", "Lead", "Engineer", "Developer", "Senior", "Junior"]);

function detectFabrication(source: string, rewrite: string): { fabricated: boolean; introduced: string[] } {
  const src = extractClaims(source);
  const rw = extractClaims(rewrite);
  const sourceLower = source.toLowerCase();
  const introduced: string[] = [];
  for (const n of rw.numbers) {
    if (!src.numbers.includes(n) && !sourceLower.includes(n)) introduced.push(n);
  }
  for (const p of rw.propers) {
    if (STOP_PROPERS.has(p)) continue;
    if (!sourceLower.includes(p.toLowerCase())) introduced.push(p);
  }
  return { fabricated: introduced.length > 0, introduced: [...new Set(introduced)] };
}

type Suggestion = {
  section: string;
  sourceSpan: string;
  rewrite: string;
  rationale: string;
  clarifyingQuestion?: string | null;
  evidence: { fabricated: boolean; introduced: string[] };
};

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      auditAuth(req, "auth_missing_bearer");
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const supabaseClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      auditAuth(req, "auth_invalid_token", { error: claimsError?.message || "no_claims" });
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userMeta = (claimsData.claims as any).user_metadata || {};
    const sub = (claimsData.claims as any).sub;
    if (_userMetadata.user_type === "institution") {
      auditAuth(req, "authz_role_mismatch", { user_id: sub, actual_role: userMeta.user_type });
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    auditAuth(req, "auth_success", { user_id: sub, role: userMeta.user_type || "unset" });

    const body = await req.json().catch(() => ({}));
    const resumeText: string = body.resumeText || "";
    const jobDescription: string = body.jobDescription || "";

    if (typeof resumeText !== "string" || resumeText.trim().length < 100) {
      return new Response(JSON.stringify({ error: "Resume text is too short for a deep analysis." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (resumeText.length > MAX_RESUME_LENGTH) {
      return new Response(JSON.stringify({ error: "Resume exceeds size limit." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (jobDescription && jobDescription.length > MAX_JD_LENGTH) {
      return new Response(JSON.stringify({ error: "Job description exceeds size limit." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const systemPrompt = `You are a Senior Resume Strategist running in DEEP IMPROVEMENT mode for genuine candidates with real depth.

ABSOLUTE RULES (non-negotiable):
1. NEVER invent metrics, numbers, percentages, tools, technologies, employers, scope, team sizes, durations, certifications, or outcomes that are not literally present in the candidate's resume text.
2. If a bullet needs a number, tool, or outcome that is NOT in the source, do NOT guess — instead set "rewrite" to a tightened version using ONLY what exists in the source, and put the missing data as a "clarifyingQuestion" the candidate must answer.
3. Preserve the candidate's actual scope, seniority and ownership. Never inflate.
4. Every suggestion must be traceable: "sourceSpan" must be a verbatim short excerpt copied from the resume (10–280 chars).
5. Ban first-person pronouns (I, my, we) and generic buzzwords (passionate, results-driven, team player, synergy, dynamic).
6. Use STAR-Impact / XYZ phrasing where source supports it.

OUTPUT — strict JSON, no markdown, no commentary:
{
  "hiringReadiness": <integer 0-100>,
  "depthSignal": "<one-line read on whether the resume shows real depth or thin claims>",
  "suggestions": [
    {
      "section": "summary" | "experience" | "skills" | "education" | "projects",
      "sourceSpan": "<verbatim excerpt from resume>",
      "rewrite": "<improved version using ONLY facts from sourceSpan>",
      "rationale": "<1 sentence — why this is stronger>",
      "clarifyingQuestion": "<question to ask candidate, or null if none needed>"
    }
  ],
  "gapToNinety": ["<concrete action 1>", "<concrete action 2>", "<concrete action 3>"]
}

Return 6–12 suggestions. Spread them across sections present in the resume.`;

    const userPrompt = `RESUME (verbatim):
"""
${resumeText}
"""

${jobDescription ? `TARGET JOB DESCRIPTION:\n"""\n${jobDescription}\n"""\n` : ""}

Produce the deep, evidence-linked improvement JSON now.`;

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
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits and retry." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      console.error("AI gateway error", aiRes.status, await aiRes.text());
      throw new Error("AI service error");
    }

    const aiJson = await aiRes.json();
    let content: string = aiJson.choices?.[0]?.message?.content || "";
    content = content.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

    let parsed: any;
    try { parsed = JSON.parse(content); } catch {
      const m = content.match(/\{[\s\S]*\}/);
      if (!m) throw new Error("AI response not parseable");
      parsed = JSON.parse(m[0]);
    }

    const rawSuggestions: any[] = Array.isArray(parsed.suggestions) ? parsed.suggestions : [];
    const resumeLower = resumeText.toLowerCase();

    const suggestions: Suggestion[] = rawSuggestions.map((s) => {
      const section = String(s.section || "experience");
      const sourceSpan = String(s.sourceSpan || "").slice(0, 600);
      let rewrite = String(s.rewrite || "").slice(0, 800);
      const rationale = String(s.rationale || "").slice(0, 280);
      let clarifyingQuestion: string | null = s.clarifyingQuestion ? String(s.clarifyingQuestion).slice(0, 280) : null;

      // Guard 1: sourceSpan must actually exist in resume (case-insensitive, whitespace-loose)
      const spanExists = sourceSpan.length > 0 && resumeLower.includes(sourceSpan.toLowerCase().slice(0, Math.min(60, sourceSpan.length)));
      // Guard 2: rewrite must not introduce new concrete claims beyond source span
      const evidence = detectFabrication(sourceSpan, rewrite);

      if (evidence.fabricated) {
        const introducedStr = evidence.introduced.slice(0, 3).join(", ");
        clarifyingQuestion = clarifyingQuestion || `Can you confirm specifics for: ${introducedStr}? We won't add it unless you provide it.`;
        rewrite = `[Held back — needs your input] We can strengthen this line, but the proposed rewrite introduced "${introducedStr}" which isn't in your resume. Answer the clarifying question and we'll regenerate using only your real data.`;
      }

      return {
        section,
        sourceSpan: spanExists ? sourceSpan : sourceSpan + " (⚠ not found verbatim in resume)",
        rewrite,
        rationale,
        clarifyingQuestion,
        evidence,
      };
    });

    return new Response(JSON.stringify({
      hiringReadiness: Number.isFinite(parsed.hiringReadiness) ? parsed.hiringReadiness : null,
      depthSignal: parsed.depthSignal || "",
      suggestions,
      gapToNinety: Array.isArray(parsed.gapToNinety) ? parsed.gapToNinety.slice(0, 6) : [],
      meta: {
        guard: "evidence-linked-v1",
        totalSuggestions: suggestions.length,
        flaggedFabrications: suggestions.filter((s) => s.evidence.fabricated).length,
      },
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("deep-improvement error", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
