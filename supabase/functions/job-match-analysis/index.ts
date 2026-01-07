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
    const { resumeData, jobDescription } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!jobDescription) {
      throw new Error("Job description is required");
    }

    const systemPrompt = `You are an expert ATS and job matching analyst. Analyze how well a resume matches a job description.

You MUST respond with ONLY a valid JSON object in this exact format, no other text:
{
  "overallMatch": <number 0-100>,
  "skillsMatch": {
    "score": <number 0-100>,
    "matched": ["skill1", "skill2"],
    "missing": ["skill3", "skill4"],
    "suggestions": ["suggestion1"]
  },
  "experienceMatch": {
    "score": <number 0-100>,
    "strengths": ["strength1"],
    "gaps": ["gap1"],
    "suggestions": ["suggestion1"]
  },
  "keywordAnalysis": {
    "found": ["keyword1", "keyword2"],
    "missing": ["keyword3"],
    "density": <number 0-100>
  },
  "recommendations": ["rec1", "rec2", "rec3"],
  "summary": "Brief 2-3 sentence summary of the match"
}`;

    const userPrompt = `Analyze how well this resume matches the job description.

RESUME DATA:
Name: ${resumeData.personalInfo?.fullName || "Not provided"}
Summary: ${resumeData.summary || "Not provided"}

Experience:
${resumeData.experience?.map((exp: any) => 
  `- ${exp.title} at ${exp.company}: ${exp.description}`
).join("\n") || "No experience listed"}

Skills: ${resumeData.skills?.join(", ") || "No skills listed"}

Education:
${resumeData.education?.map((edu: any) => 
  `- ${edu.degree} from ${edu.school}`
).join("\n") || "No education listed"}

JOB DESCRIPTION:
${jobDescription}

Provide a detailed match analysis as JSON.`;

    console.log("Analyzing job match...");

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
    const content = data.choices?.[0]?.message?.content;

    // Parse the JSON response
    let analysis;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Return a default structure if parsing fails
      analysis = {
        overallMatch: 50,
        skillsMatch: { score: 50, matched: [], missing: [], suggestions: [] },
        experienceMatch: { score: 50, strengths: [], gaps: [], suggestions: [] },
        keywordAnalysis: { found: [], missing: [], density: 50 },
        recommendations: ["Unable to fully analyze. Please try again."],
        summary: "Analysis could not be completed. Please try again."
      };
    }

    console.log("Job match analysis completed");

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in job-match-analysis function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
