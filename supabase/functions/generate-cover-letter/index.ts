import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation constants
const MAX_JOB_DESC_LENGTH = 50000; // 50KB max
const MAX_FIELD_LENGTH = 1000; // For smaller fields
const MAX_RESUME_DATA_SIZE = 100000; // 100KB max for entire resume data
const VALID_TONES = ["professional", "enthusiastic", "formal", "conversational", "confident"];

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

    const { resumeData, jobDescription, companyName, tone } = body;
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

    // Sanitize optional fields
    const sanitizedCompanyName = companyName && typeof companyName === 'string'
      ? companyName.trim().slice(0, MAX_FIELD_LENGTH)
      : "the company";

    const sanitizedTone = tone && typeof tone === 'string' && VALID_TONES.includes(tone.toLowerCase())
      ? tone.toLowerCase()
      : "professional";

    // Safely extract and sanitize resume fields
    const sanitizeField = (field: any, maxLen = MAX_FIELD_LENGTH): string => {
      if (!field) return "";
      if (typeof field !== 'string') return "";
      return field.trim().slice(0, maxLen);
    };

    const personalInfo = resumeData.personalInfo || {};
    const fullName = sanitizeField(personalInfo.fullName) || "Candidate";
    const email = sanitizeField(personalInfo.email);
    const phone = sanitizeField(personalInfo.phone);
    const location = sanitizeField(personalInfo.location);
    const summary = sanitizeField(resumeData.summary, 2000) || "Not provided";

    // Process experience array safely
    let experienceText = "Not provided";
    if (Array.isArray(resumeData.experience) && resumeData.experience.length > 0) {
      experienceText = resumeData.experience
        .slice(0, 10) // Limit to 10 experiences
        .map((exp: any) => {
          const title = sanitizeField(exp?.title) || "Position";
          const company = sanitizeField(exp?.company) || "Company";
          const startDate = sanitizeField(exp?.startDate) || "";
          const endDate = exp?.current ? "Present" : sanitizeField(exp?.endDate) || "";
          const description = sanitizeField(exp?.description, 1000) || "";
          return `- ${title} at ${company} (${startDate} - ${endDate}): ${description}`;
        })
        .join("\n");
    }

    // Process skills array safely
    let skillsText = "Not provided";
    if (Array.isArray(resumeData.skills) && resumeData.skills.length > 0) {
      skillsText = resumeData.skills
        .slice(0, 50) // Limit to 50 skills
        .filter((s: any) => typeof s === 'string')
        .map((s: string) => s.trim().slice(0, 100))
        .join(", ");
    }

    // Process education array safely
    let educationText = "Not provided";
    if (Array.isArray(resumeData.education) && resumeData.education.length > 0) {
      educationText = resumeData.education
        .slice(0, 5) // Limit to 5 education entries
        .map((edu: any) => {
          const degree = sanitizeField(edu?.degree) || "Degree";
          const school = sanitizeField(edu?.school) || "Institution";
          const gradDate = sanitizeField(edu?.graduationDate) || "";
          return `- ${degree} from ${school} (${gradDate})`;
        })
        .join("\n");
    }

    const systemPrompt = `You are an expert cover letter writer who creates compelling, personalized cover letters. Your cover letters:
- Are tailored specifically to the job description
- Highlight relevant experience and skills from the resume
- Show enthusiasm for the specific company and role
- Use a ${sanitizedTone} tone
- Are concise (3-4 paragraphs, about 250-350 words)
- Include a strong opening hook
- Connect the candidate's experience to the job requirements
- End with a clear call to action
- Do NOT include placeholder text like [Your Name] - use the actual name from the resume
- Format with proper paragraph breaks`;

    const userPrompt = `Generate a cover letter for this candidate applying to ${sanitizedCompanyName}.

CANDIDATE INFORMATION:
Name: ${fullName}
Email: ${email}
Phone: ${phone}
Location: ${location}

PROFESSIONAL SUMMARY:
${summary}

WORK EXPERIENCE:
${experienceText}

SKILLS:
${skillsText}

EDUCATION:
${educationText}

JOB DESCRIPTION:
${trimmedJobDesc}

Generate a personalized cover letter that connects the candidate's experience to this specific role.`;

    console.log("Generating cover letter for:", sanitizedCompanyName);

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
