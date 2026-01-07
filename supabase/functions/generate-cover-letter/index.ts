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
    const { resumeData, jobDescription, companyName, tone } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!jobDescription) {
      throw new Error("Job description is required");
    }

    const systemPrompt = `You are an expert cover letter writer who creates compelling, personalized cover letters. Your cover letters:
- Are tailored specifically to the job description
- Highlight relevant experience and skills from the resume
- Show enthusiasm for the specific company and role
- Use a ${tone || "professional"} tone
- Are concise (3-4 paragraphs, about 250-350 words)
- Include a strong opening hook
- Connect the candidate's experience to the job requirements
- End with a clear call to action
- Do NOT include placeholder text like [Your Name] - use the actual name from the resume
- Format with proper paragraph breaks`;

    const userPrompt = `Generate a cover letter for this candidate applying to ${companyName || "the company"}.

CANDIDATE INFORMATION:
Name: ${resumeData.personalInfo?.fullName || "Candidate"}
Email: ${resumeData.personalInfo?.email || ""}
Phone: ${resumeData.personalInfo?.phone || ""}
Location: ${resumeData.personalInfo?.location || ""}

PROFESSIONAL SUMMARY:
${resumeData.summary || "Not provided"}

WORK EXPERIENCE:
${resumeData.experience?.map((exp: any) => 
  `- ${exp.title} at ${exp.company} (${exp.startDate} - ${exp.current ? "Present" : exp.endDate}): ${exp.description}`
).join("\n") || "Not provided"}

SKILLS:
${resumeData.skills?.join(", ") || "Not provided"}

EDUCATION:
${resumeData.education?.map((edu: any) => 
  `- ${edu.degree} from ${edu.school} (${edu.graduationDate})`
).join("\n") || "Not provided"}

JOB DESCRIPTION:
${jobDescription}

Generate a personalized cover letter that connects the candidate's experience to this specific role.`;

    console.log("Generating cover letter for:", companyName || "company");

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
    const coverLetter = data.choices?.[0]?.message?.content;

    console.log("Cover letter generated successfully");

    return new Response(JSON.stringify({ coverLetter }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-cover-letter function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
