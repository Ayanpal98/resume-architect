import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Input validation constants
const MAX_CONTENT_LENGTH = 50000; // 50KB max
const MAX_JOB_DESC_LENGTH = 30000; // 30KB max
const MAX_FIELD_LENGTH = 5000; // For individual fields
const VALID_TYPES = ["summary", "experience", "skills", "keywords"];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    // Validate request body
    if (!body || typeof body !== 'object') {
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { type, content, jobDescription } = body;

    // Validate type
    if (!type || typeof type !== 'string' || !VALID_TYPES.includes(type)) {
      return new Response(
        JSON.stringify({ error: `Invalid suggestion type. Must be one of: ${VALID_TYPES.join(", ")}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate content
    if (!content) {
      return new Response(
        JSON.stringify({ error: "Content is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate content size
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    if (contentStr.length > MAX_CONTENT_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Content exceeds maximum length of ${MAX_CONTENT_LENGTH} characters` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate and sanitize jobDescription if provided
    let sanitizedJobDesc = "";
    if (jobDescription) {
      if (typeof jobDescription !== 'string') {
        return new Response(
          JSON.stringify({ error: "Job description must be a string" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (jobDescription.length > MAX_JOB_DESC_LENGTH) {
        return new Response(
          JSON.stringify({ error: `Job description exceeds maximum length of ${MAX_JOB_DESC_LENGTH} characters` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      sanitizedJobDesc = jobDescription.trim();
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    // Sanitize content fields
    const sanitizeField = (field: any, maxLen = MAX_FIELD_LENGTH): string => {
      if (!field) return "Not specified";
      if (typeof field !== 'string') return String(field).slice(0, maxLen);
      return field.trim().slice(0, maxLen) || "Not specified";
    };

    switch (type) {
      case "summary":
        systemPrompt = `You are an elite resume strategist. Generate a PROFESSIONAL SUMMARY following this exact rule:

FORMULA: "Who you are + experience + key skills + impact"

STRICT RULES:
1. Role-specific: Tailor every word to the target role
2. Keyword-rich: Embed 3-5 exact keywords from the job description naturally
3. Results-focused: Include at least 1-2 quantified achievements (%, $, #)
4. Lead with job title + years of experience + core specialization
5. Use power verbs: Spearheaded, Orchestrated, Architected, Transformed, Accelerated
6. NO pronouns (I, my), NO buzzwords (passionate, results-driven), NO clichés
7. 3-4 impactful sentences, 50-80 words
8. Must read as a compelling elevator pitch that passes ATS keyword matching

OUTPUT: Return ONLY the summary text. No quotes, no labels, no explanations.`;
        userPrompt = `Create an ATS-optimized professional summary:

CANDIDATE:
Experience: ${sanitizeField(content.experience)}
Skills: ${sanitizeField(content.skills)}
Target Role: ${sanitizeField(content.targetRole)}
${sanitizedJobDesc ? `\nJOB DESCRIPTION:\n${sanitizedJobDesc}` : ""}

Follow the formula: Who you are + experience + key skills + impact.`;
        break;

      case "experience":
        systemPrompt = `You are an expert resume writer. Transform job descriptions into ATS-optimized bullet points.

STRICT RULES FOR EVERY BULLET:
1. MUST start with a strong action verb (Led, Spearheaded, Architected, Drove, Engineered, Automated, Scaled)
2. MUST include a measurable result (numbers, %, $, time saved, team size)
3. NO responsibility-only points — ONLY impact statements
4. Follow XYZ formula: "Accomplished [X] as measured by [Y], by doing [Z]"

POWER VERB CATEGORIES:
- Leadership: Spearheaded, Directed, Championed, Orchestrated
- Achievement: Generated, Delivered, Exceeded, Captured
- Technical: Engineered, Architected, Deployed, Automated
- Growth: Scaled, Accelerated, Expanded, Maximized
- Efficiency: Streamlined, Optimized, Consolidated, Reduced

ANTI-PATTERNS TO AVOID:
- "Responsible for..." → Replace with action + result
- "Worked on..." → Replace with specific contribution + outcome
- "Helped with..." → Replace with led/drove + metric
- Any bullet without a number or measurable outcome

OUTPUT: Return 4-6 bullet points, each starting with •
No numbering, no headers, no additional text.`;
        userPrompt = `Transform this experience into impact-driven bullets:

ROLE: ${sanitizeField(content.title)} at ${sanitizeField(content.company)}
CURRENT DESCRIPTION: ${sanitizeField(content.description)}
${sanitizedJobDesc ? `\nJOB KEYWORDS TO INCORPORATE:\n${sanitizedJobDesc}` : ""}

Every bullet must have: Action verb + Result + Numbers. No responsibility-only points.`;
        break;

      case "skills":
        systemPrompt = `You are an ATS optimization expert with deep knowledge of 2024-2025 hiring trends and modern resume formats.

SKILL OPTIMIZATION FOR TWO-COLUMN SIDEBAR LAYOUT:
Skills appear in the LEFT SIDEBAR under "SKILLS & EXPERTISE" header, grouped by category.

REQUIRED SKILL CATEGORIES (return skills grouped):
1. **Technical Skills**: Programming languages, frameworks, databases, tools
2. **Tools & Platforms**: Software, cloud services, dev tools, productivity apps
3. **Soft Skills**: Leadership, communication, collaboration, problem-solving

CATEGORY FORMAT:
Return skills in this exact format:
Technical Skills: skill1, skill2, skill3, skill4
Tools & Platforms: tool1, tool2, tool3
Soft Skills: softskill1, softskill2, softskill3

MODERN ATS SKILL MATCHING (2024-2025):
- Top ATS use semantic matching, not just exact keywords
- Include both acronyms AND full terms when relevant
- Group related skills logically
- Include proficiency indicators for languages if applicable

SIDEBAR OPTIMIZATION:
- Keep individual skill names short (1-3 words ideal)
- 4-6 skills per category for visual balance
- Most important/relevant skills first within each category
- Total 12-18 skills across all categories

AVOID:
- Generic skills: "Microsoft Office" (unless entry-level)
- Outdated technologies unless specifically required
- Vague terms: "team player", "hard worker", "detail-oriented"
- Overly long skill descriptions

OUTPUT FORMAT:
Return skills grouped by category as shown above.
Each category on its own line with colon separator.`;
        userPrompt = `Generate categorized skills for two-column resume sidebar:

CANDIDATE PROFILE:
Experience: ${sanitizeField(content.experience)}
Current Skills: ${sanitizeField(content.currentSkills)}
Target Role: ${sanitizeField(content.targetRole)}
${sanitizedJobDesc ? `\nJOB REQUIREMENTS TO MATCH:\n${sanitizedJobDesc}` : ""}

Provide 12-18 skills grouped into Technical Skills, Tools & Platforms, and Soft Skills categories.`;
        break;

      case "keywords":
        systemPrompt = `You are an ATS keyword extraction specialist with expertise in modern applicant tracking systems (2024-2025).

KEYWORD EXTRACTION METHODOLOGY:

1. **Required Skills** (Critical - mentioned multiple times or in requirements):
   - Technical skills explicitly listed
   - Certifications mentioned
   - Tools/platforms specified

2. **Preferred Skills** (Important - in preferred/nice-to-have):
   - Secondary technologies
   - Additional qualifications
   - Industry experience

3. **Hidden Keywords** (Contextual - implied but not stated):
   - Industry jargon
   - Common abbreviations
   - Related technologies

MODERN ATS BEHAVIOR:
- Semantic matching: "ML" ≈ "Machine Learning"
- Skill clustering: Related skills boost each other
- Frequency weighting: More mentions = higher priority
- Context awareness: Skills in requirements > skills in about section

EXTRACTION RULES:
- Extract exact phrases (e.g., "cross-functional teams", "stakeholder management")
- Include both short and long forms of acronyms
- Identify soft skills embedded in descriptions
- Note industry-specific terminology

OUTPUT FORMAT:
Return keywords in 3 priority tiers, separated by semicolons:
CRITICAL: skill1, skill2, skill3; IMPORTANT: skill4, skill5; BONUS: skill6, skill7`;
        const keywordContent = sanitizedJobDesc || (typeof content === 'string' ? content.trim().slice(0, MAX_JOB_DESC_LENGTH) : "");
        if (!keywordContent) {
          return new Response(
            JSON.stringify({ error: "Job description is required for keyword extraction" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        userPrompt = `Extract and prioritize ATS keywords from this job description:\n\n${keywordContent}\n\nProvide keywords in priority tiers for maximum ATS match rate.`;
        break;

      default:
        return new Response(
          JSON.stringify({ error: "Invalid suggestion type" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

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
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add more credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI service error");
    }

    const data = await response.json();
    const suggestion = data.choices?.[0]?.message?.content;

    return new Response(JSON.stringify({ suggestion }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in ai-suggestions function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
