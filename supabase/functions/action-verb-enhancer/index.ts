import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED = [/^https?:\/\/localhost(:\d+)?$/, /\.lovable\.app$/, /\.lovable\.dev$/, /\.lovableproject\.com$/];
function cors(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") || "";
  let ok = false;
  try { ok = ALLOWED.some((re) => re.test(origin) || re.test(new URL(origin).host)); } catch { ok = false; }
  return {
    "Access-Control-Allow-Origin": ok ? origin : "https://atsfycareerintelligentplatform.lovable.app",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

const MAX_BULLETS = 40;
const MAX_BULLET_LEN = 600;

serve(async (req) => {
  const h = cors(req);
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...h, "Content-Type": "application/json" } });
  if (req.method === "OPTIONS") return new Response(null, { headers: h });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: auth } },
    });
    const { data: claims, error: cErr } = await sb.auth.getClaims(auth.replace("Bearer ", ""));
    if (cErr || !claims?.claims) return json({ error: "Unauthorized" }, 401);

    // Plan entitlement: Action Verb Enhancer requires Professional (tier 2) or above.
    const { data: tier } = await sb.rpc("get_plan_tier");
    if (((tier as any)?.jobseeker ?? 0) < 2) return json({ error: "upgrade_required" }, 402);

    const body = await req.json().catch(() => null);
    const bullets = body?.bullets;
    if (!Array.isArray(bullets) || bullets.length === 0 || bullets.length > MAX_BULLETS) {
      return json({ error: "Provide between 1 and 40 bullet points" }, 400);
    }
    const clean = bullets
      .filter((b: unknown) => typeof b === "string")
      .map((b: string) => b.trim().slice(0, MAX_BULLET_LEN))
      .filter((b: string) => b.length > 0);
    if (clean.length === 0) return json({ error: "Provide between 1 and 40 bullet points" }, 400);
    const role = typeof body?.targetRole === "string" ? body.targetRole.slice(0, 200) : "";

    const key = Deno.env.get("LOVABLE_API_KEY");
    if (!key) throw new Error("missing key");

    const system = `You are a Senior Resume Strategist. For each resume bullet, identify the opening verb and judge whether it is weak (e.g. "responsible for", "worked on", "helped", "did", "handled", "assisted", "was involved in", "made", "used").
For each bullet return: index, weakVerb (the weak phrase, or "" if the verb is already strong), category (one of Leadership, Achievement, Technical, Communication, Analysis, Creation, Improvement), suggestions (3 power verbs fitting the category), rewrite (the bullet rewritten starting with the best power verb using XYZ structure where the facts allow).
Never invent metrics, tools or facts not present in the bullet. No pronouns, no buzzwords. Keep rewrites to one sentence.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: `${role ? `Target role: ${role}\n` : ""}Bullets:\n${clean.map((b: string, i: number) => `${i}. ${b}`).join("\n")}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "return_verbs",
            parameters: {
              type: "object",
              properties: {
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      index: { type: "number" },
                      weakVerb: { type: "string" },
                      category: { type: "string" },
                      suggestions: { type: "array", items: { type: "string" } },
                      rewrite: { type: "string" },
                    },
                    required: ["index", "weakVerb", "category", "suggestions", "rewrite"],
                  },
                },
              },
              required: ["items"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "return_verbs" } },
      }),
    });
    if (res.status === 429) return json({ error: "Too many requests, please try again shortly." }, 429);
    if (res.status === 402) return json({ error: "AI service temporarily unavailable." }, 503);
    if (!res.ok) throw new Error(`gateway ${res.status}`);
    const data = await res.json();
    const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    const parsed = args ? JSON.parse(args) : { items: [] };
    const items = (parsed.items || [])
      .filter((it: any) => Number.isInteger(it.index) && it.index >= 0 && it.index < clean.length)
      .map((it: any) => ({ ...it, original: clean[it.index], suggestions: (it.suggestions || []).slice(0, 3) }));
    return json({ items });
  } catch (e) {
    console.error("action-verb-enhancer error", e);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
});
