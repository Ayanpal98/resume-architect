import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, content, jobDescription } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case "summary":
        systemPrompt = `You are an expert resume writer specializing in ATS-optimized resumes. Generate a compelling professional summary that:
- Is 2-4 sentences long
- Highlights key skills and experience
- Uses industry-specific keywords
- Is written in first person but without starting with "I"
- Is ATS-friendly with clear, scannable text`;
        userPrompt = `Generate a professional summary for someone with this background:\n\nExperience: ${content.experience || "Not specified"}\nSkills: ${content.skills || "Not specified"}\nTarget Role: ${content.targetRole || "Not specified"}${jobDescription ? `\n\nTarget Job Description:\n${jobDescription}` : ""}`;
        break;

      case "experience":
        systemPrompt = `You are an expert resume writer. Improve the job description bullet points to be more impactful. Guidelines:
- Start each bullet with a strong action verb
- Include quantifiable achievements where possible
- Use industry-specific keywords
- Keep bullets concise (1-2 lines each)
- Make it ATS-friendly
Return 3-5 improved bullet points.`;
        userPrompt = `Improve this job experience description:\n\nJob Title: ${content.title}\nCompany: ${content.company}\nCurrent Description: ${content.description}${jobDescription ? `\n\nTarget Job Description:\n${jobDescription}` : ""}`;
        break;

      case "skills":
        systemPrompt = `You are an expert resume writer. Suggest relevant skills based on the experience and target role. Guidelines:
- Include both hard skills (technical) and soft skills
- Prioritize skills mentioned in job descriptions
- Include industry-standard certifications if relevant
- Return as a comma-separated list of 8-12 skills`;
        userPrompt = `Suggest skills for this profile:\n\nExperience: ${content.experience || "Not specified"}\nCurrent Skills: ${content.currentSkills || "Not specified"}\nTarget Role: ${content.targetRole || "Not specified"}${jobDescription ? `\n\nTarget Job Description:\n${jobDescription}` : ""}`;
        break;

      case "keywords":
        systemPrompt = `You are an ATS optimization expert. Analyze the job description and extract the most important keywords and phrases that should be included in the resume. Return them as a comma-separated list, prioritized by importance.`;
        userPrompt = `Extract ATS keywords from this job description:\n\n${jobDescription || content}`;
        break;

      default:
        throw new Error("Invalid suggestion type");
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
