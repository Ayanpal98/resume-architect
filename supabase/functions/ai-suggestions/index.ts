import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
        systemPrompt = `You are an expert resume writer specializing in ATS-optimized resumes. Generate a compelling professional summary that:
- Is 2-4 sentences long
- Highlights key skills and experience
- Uses industry-specific keywords
- Is written in first person but without starting with "I"
- Is ATS-friendly with clear, scannable text`;
        userPrompt = `Generate a professional summary for someone with this background:\n\nExperience: ${sanitizeField(content.experience)}\nSkills: ${sanitizeField(content.skills)}\nTarget Role: ${sanitizeField(content.targetRole)}${sanitizedJobDesc ? `\n\nTarget Job Description:\n${sanitizedJobDesc}` : ""}`;
        break;

      case "experience":
        systemPrompt = `You are an expert resume writer. Improve the job description bullet points to be more impactful. Guidelines:
- Start each bullet with a strong action verb
- Include quantifiable achievements where possible
- Use industry-specific keywords
- Keep bullets concise (1-2 lines each)
- Make it ATS-friendly
Return 3-5 improved bullet points.`;
        userPrompt = `Improve this job experience description:\n\nJob Title: ${sanitizeField(content.title)}\nCompany: ${sanitizeField(content.company)}\nCurrent Description: ${sanitizeField(content.description)}${sanitizedJobDesc ? `\n\nTarget Job Description:\n${sanitizedJobDesc}` : ""}`;
        break;

      case "skills":
        systemPrompt = `You are an expert resume writer. Suggest relevant skills based on the experience and target role. Guidelines:
- Include both hard skills (technical) and soft skills
- Prioritize skills mentioned in job descriptions
- Include industry-standard certifications if relevant
- Return as a comma-separated list of 8-12 skills`;
        userPrompt = `Suggest skills for this profile:\n\nExperience: ${sanitizeField(content.experience)}\nCurrent Skills: ${sanitizeField(content.currentSkills)}\nTarget Role: ${sanitizeField(content.targetRole)}${sanitizedJobDesc ? `\n\nTarget Job Description:\n${sanitizedJobDesc}` : ""}`;
        break;

      case "keywords":
        systemPrompt = `You are an ATS optimization expert. Analyze the job description and extract the most important keywords and phrases that should be included in the resume. Return them as a comma-separated list, prioritized by importance.`;
        const keywordContent = sanitizedJobDesc || (typeof content === 'string' ? content.trim().slice(0, MAX_JOB_DESC_LENGTH) : "");
        if (!keywordContent) {
          return new Response(
            JSON.stringify({ error: "Job description is required for keyword extraction" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        userPrompt = `Extract ATS keywords from this job description:\n\n${keywordContent}`;
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
