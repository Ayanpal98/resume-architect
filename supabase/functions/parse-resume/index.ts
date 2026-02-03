import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Input validation constants
const MAX_TEXT_LENGTH = 100000; // 100KB max for resume text
const MIN_TEXT_LENGTH = 50; // Minimum meaningful resume content

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Input validation
    if (!body || typeof body !== 'object') {
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { text } = body;

    // Validate text parameter
    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: "Resume text is required and must be a string" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Trim and validate length
    const trimmedText = text.trim();
    
    if (trimmedText.length < MIN_TEXT_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Resume text is too short. Minimum ${MIN_TEXT_LENGTH} characters required.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (trimmedText.length > MAX_TEXT_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Resume text exceeds maximum length of ${MAX_TEXT_LENGTH} characters.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an elite ATS (Applicant Tracking System) resume parser trained on 2024-2025 hiring standards. Your parsing must maximize compatibility with modern ATS platforms (Greenhouse, Lever, Workday, iCIMS, Taleo).

PARSING STANDARDS (2024-2025):

1. **CONTACT INFORMATION** - Parse with 100% accuracy:
   - Full name (First Last format)
   - Email (professional format validation)
   - Phone (with country code if present)
   - Location (City, State/Country - essential for job matching)
   - LinkedIn URL (full URL format)
   - Portfolio/GitHub (if present)

2. **PROFESSIONAL SUMMARY** - Critical for ATS ranking:
   - Extract complete summary/objective verbatim
   - Identify years of experience mentioned
   - Extract key achievements with metrics
   - Identify target role/industry keywords

3. **WORK EXPERIENCE** - Highest weight in ATS scoring:
   - Job title (standardize to common industry titles)
   - Company name (full legal name)
   - Location (City, State/Country)
   - Dates (YYYY-MM format, handle "Present"/"Current")
   - Full description with all bullet points
   - CRITICAL: Extract ALL quantifiable metrics (%, $, numbers)
   - Identify STAR method components (Situation, Task, Action, Result)
   - Extract action verbs used

4. **EDUCATION** - Essential for entry/mid-level:
   - Degree type + Field of study
   - Institution name
   - Graduation date (YYYY-MM)
   - GPA if 3.5+ or explicitly mentioned
   - Honors/Awards

5. **SKILLS** - Critical for ATS keyword matching:
   - Technical/Hard skills (languages, frameworks, tools)
   - Soft skills (leadership, communication)
   - Industry-specific keywords
   - Certifications/Licenses

6. **ADDITIONAL SECTIONS**:
   - Certifications with issuing body and date
   - Projects with technologies and outcomes
   - Languages with proficiency level

PARSING RULES:
- Standardize dates to YYYY-MM (e.g., "Jan 2020" → "2020-01")
- For "Present"/"Current", set endDate empty and current=true
- Merge skill variations (JS/JavaScript → JavaScript)
- Extract ALL numbers as potential achievements
- Confidence scores: 0.0-1.0 based on section completeness
- Never return null - use empty strings/arrays

RETURN VALID JSON WITH THIS EXACT STRUCTURE:
{
  "personalInfo": {
    "fullName": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": "",
    "portfolio": "",
    "github": ""
  },
  "summary": "",
  "experience": [
    {
      "title": "",
      "company": "",
      "location": "",
      "startDate": "YYYY-MM",
      "endDate": "YYYY-MM or empty if current",
      "current": false,
      "description": "",
      "achievements": ["quantified achievement 1", "achievement 2"],
      "actionVerbs": ["led", "managed", "developed"]
    }
  ],
  "education": [
    {
      "degree": "",
      "field": "",
      "school": "",
      "location": "",
      "graduationDate": "YYYY-MM",
      "gpa": "",
      "honors": ""
    }
  ],
  "skills": {
    "technical": ["skill1", "skill2"],
    "soft": ["skill1", "skill2"],
    "industryKeywords": ["keyword1", "keyword2"]
  },
  "certifications": [
    {
      "name": "",
      "issuer": "",
      "date": "YYYY-MM",
      "expiration": ""
    }
  ],
  "projects": [
    {
      "title": "",
      "description": "",
      "technologies": ["tech1", "tech2"],
      "outcomes": ""
    }
  ],
  "languages": [
    {
      "language": "",
      "proficiency": ""
    }
  ],
  "atsKeywords": ["keyword1", "keyword2"],
  "parsingConfidence": {
    "overall": 0.0,
    "sections": {
      "contact": 0.0,
      "experience": 0.0,
      "education": 0.0,
      "skills": 0.0
    }
  }
}

Return ONLY the JSON object. No markdown, no explanation, no code blocks.`;

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
          { role: "user", content: `Parse this resume for ATS optimization:\n\n${trimmedText}` },
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
    let content = data.choices?.[0]?.message?.content || "";
    
    // Clean up the response - remove markdown code blocks if present
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    let parsedResume;
    try {
      parsedResume = JSON.parse(content);
    } catch (parseError) {
      console.error("JSON parse error:", parseError, "Content:", content);
      throw new Error("Failed to parse AI response as JSON");
    }

    // Normalize the parsed data for backward compatibility
    const normalizedResume = normalizeResumeData(parsedResume);

    console.log("Successfully parsed resume with confidence:", normalizedResume.parsingConfidence?.overall);

    return new Response(JSON.stringify({ data: normalizedResume }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in parse-resume function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to parse resume" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Normalize resume data for backward compatibility with existing components
function normalizeResumeData(parsed: any): any {
  // Handle skills - convert new format to array for backward compatibility
  let skills: string[] = [];
  if (parsed.skills) {
    if (Array.isArray(parsed.skills)) {
      skills = parsed.skills;
    } else if (typeof parsed.skills === 'object') {
      skills = [
        ...(parsed.skills.technical || []),
        ...(parsed.skills.soft || []),
        ...(parsed.skills.industryKeywords || [])
      ];
    }
  }

  // Normalize education - ensure field compatibility
  const education = (parsed.education || []).map((edu: any) => ({
    degree: edu.degree || edu.field ? `${edu.degree || ''}${edu.field ? ' in ' + edu.field : ''}`.trim() : '',
    school: edu.school || '',
    location: edu.location || '',
    graduationDate: edu.graduationDate || '',
    gpa: edu.gpa || '',
    honors: edu.honors || ''
  }));

  // Normalize experience - ensure all fields exist
  const experience = (parsed.experience || []).map((exp: any) => ({
    title: exp.title || '',
    company: exp.company || '',
    location: exp.location || '',
    startDate: exp.startDate || '',
    endDate: exp.endDate || '',
    current: exp.current || false,
    description: exp.description || '',
    achievements: exp.achievements || [],
    actionVerbs: exp.actionVerbs || []
  }));

  return {
    personalInfo: {
      fullName: parsed.personalInfo?.fullName || '',
      email: parsed.personalInfo?.email || '',
      phone: parsed.personalInfo?.phone || '',
      location: parsed.personalInfo?.location || '',
      linkedin: parsed.personalInfo?.linkedin || '',
      portfolio: parsed.personalInfo?.portfolio || '',
      github: parsed.personalInfo?.github || ''
    },
    summary: parsed.summary || '',
    experience,
    education,
    skills,
    skillsDetailed: parsed.skills || { technical: [], soft: [], industryKeywords: [] },
    certifications: parsed.certifications || [],
    projects: parsed.projects || [],
    languages: parsed.languages || [],
    atsKeywords: parsed.atsKeywords || [],
    parsingConfidence: parsed.parsingConfidence || {
      overall: 0.5,
      sections: { contact: 0.5, experience: 0.5, education: 0.5, skills: 0.5 }
    }
  };
}
