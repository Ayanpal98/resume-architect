import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation constants
const MAX_JOB_DESC_LENGTH = 50000; // 50KB max
const MAX_RESUME_DATA_SIZE = 100000; // 100KB max
const MAX_FIELD_LENGTH = 1000;

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

    const { resumeData, jobDescription } = body;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Validate jobDescription
    if (!jobDescription || typeof jobDescription !== 'string') {
      return new Response(
        JSON.stringify({ error: "Job description is required and must be a string" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const trimmedJobDesc = jobDescription.trim();
    if (trimmedJobDesc.length < 50) {
      return new Response(
        JSON.stringify({ error: "Job description is too short. Minimum 50 characters required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (trimmedJobDesc.length > MAX_JOB_DESC_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Job description exceeds maximum length of ${MAX_JOB_DESC_LENGTH} characters.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate resumeData
    if (!resumeData || typeof resumeData !== 'object') {
      return new Response(
        JSON.stringify({ error: "Resume data is required and must be an object" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check resumeData size
    const resumeDataStr = JSON.stringify(resumeData);
    if (resumeDataStr.length > MAX_RESUME_DATA_SIZE) {
      return new Response(
        JSON.stringify({ error: `Resume data exceeds maximum size of ${MAX_RESUME_DATA_SIZE} characters.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Safely extract and sanitize resume fields
    const sanitizeField = (field: any, maxLen = MAX_FIELD_LENGTH): string => {
      if (!field) return "Not provided";
      if (typeof field !== 'string') return "Not provided";
      return field.trim().slice(0, maxLen) || "Not provided";
    };

    const personalInfo = resumeData.personalInfo || {};
    const fullName = sanitizeField(personalInfo.fullName);
    const summary = sanitizeField(resumeData.summary, 2000);

    // Process experience array safely
    let experienceText = "No experience listed";
    if (Array.isArray(resumeData.experience) && resumeData.experience.length > 0) {
      experienceText = resumeData.experience
        .slice(0, 10)
        .map((exp: any) => {
          const title = sanitizeField(exp?.title) || "Position";
          const company = sanitizeField(exp?.company) || "Company";
          const description = sanitizeField(exp?.description, 1000) || "";
          return `- ${title} at ${company}: ${description}`;
        })
        .join("\n");
    }

    // Process skills array safely
    let skillsText = "No skills listed";
    if (Array.isArray(resumeData.skills) && resumeData.skills.length > 0) {
      skillsText = resumeData.skills
        .slice(0, 50)
        .filter((s: any) => typeof s === 'string')
        .map((s: string) => s.trim().slice(0, 100))
        .join(", ");
    }

    // Process education array safely
    let educationText = "No education listed";
    if (Array.isArray(resumeData.education) && resumeData.education.length > 0) {
      educationText = resumeData.education
        .slice(0, 5)
        .map((edu: any) => {
          const degree = sanitizeField(edu?.degree) || "Degree";
          const school = sanitizeField(edu?.school) || "Institution";
          return `- ${degree} from ${school}`;
        })
        .join("\n");
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
Name: ${fullName}
Summary: ${summary}

Experience:
${experienceText}

Skills: ${skillsText}

Education:
${educationText}

JOB DESCRIPTION:
${trimmedJobDesc}

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
