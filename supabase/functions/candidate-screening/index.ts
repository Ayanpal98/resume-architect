import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { resumeText, jobDescription } = await req.json();

    if (!resumeText || !jobDescription) {
      return new Response(
        JSON.stringify({ error: "Resume text and job description are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert HR recruiter and ATS (Applicant Tracking System) analyst with deep expertise in candidate evaluation. Your task is to analyze a candidate's resume against a job description using industry-standard hiring practices.

Evaluate the candidate across these weighted dimensions:
1. Skills Match (40%): Technical and soft skills alignment
2. Experience Match (30%): Years and relevance of experience
3. Education Match (15%): Degree requirements and certifications
4. Keywords & ATS Compatibility (15%): Keyword density and formatting

Provide a comprehensive analysis including:
- Exact skill matches and gaps
- Experience level assessment
- Key strengths that make the candidate stand out
- Potential concerns or red flags
- Overall recommendation

Return your analysis as a JSON object with this exact structure:
{
  "name": "Candidate's full name from resume",
  "email": "Email address from resume",
  "phone": "Phone number from resume",
  "overallScore": 0-100,
  "skillsMatch": 0-100,
  "experienceMatch": 0-100,
  "educationMatch": 0-100,
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "experience": "Brief summary of relevant experience",
  "education": "Highest relevant education",
  "strengths": ["strength1", "strength2", "strength3"],
  "concerns": ["concern1", "concern2"],
  "recommendation": "highly_recommended" | "recommended" | "consider" | "not_recommended"
}

Scoring Guidelines:
- 85-100: Highly Recommended - Exceptional match, exceeds requirements
- 70-84: Recommended - Strong match, meets most requirements
- 50-69: Consider - Partial match, may need training
- 0-49: Not Recommended - Significant gaps in requirements`;

    const userPrompt = `Analyze this candidate's resume against the job description:

JOB DESCRIPTION:
${jobDescription}

RESUME:
${resumeText}

Provide your analysis as a JSON object following the specified structure.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
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
      const errorData = await response.text();
      console.error("AI API Error:", errorData);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI service error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI service");
    }

    // Parse the JSON response
    let analysis;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, content];
      const jsonString = jsonMatch[1] || content;
      analysis = JSON.parse(jsonString.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Return a default structure if parsing fails
      analysis = {
        name: "Unknown",
        email: "",
        phone: "",
        overallScore: 50,
        skillsMatch: 50,
        experienceMatch: 50,
        educationMatch: 50,
        matchedSkills: [],
        missingSkills: [],
        experience: "Unable to parse experience",
        education: "Unable to parse education",
        strengths: ["Resume provided for review"],
        concerns: ["Unable to fully analyze - please review manually"],
        recommendation: "consider",
      };
    }

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Candidate screening error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to analyze candidate";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
