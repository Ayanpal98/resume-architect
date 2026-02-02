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

    const systemPrompt = `You are an expert ATS (Applicant Tracking System) resume parser following industry standards. Your goal is to extract and structure resume data for maximum ATS compatibility.

EXTRACTION RULES:
1. CONTACT INFORMATION: Extract full name, email, phone (with country code if present), city/state/country, LinkedIn URL, portfolio/website, GitHub profile
2. PROFESSIONAL SUMMARY: Capture the entire summary/objective section verbatim, preserving action verbs and quantifiable achievements
3. WORK EXPERIENCE: For each role extract:
   - Exact job title (standardize common variations)
   - Company name (full legal name if possible)
   - Location (City, State/Country)
   - Start and end dates in YYYY-MM format
   - Whether currently employed there
   - Full description with all bullet points combined
   - Extract quantifiable achievements (numbers, percentages, dollar amounts)
   - Identify action verbs used
4. EDUCATION: Extract degree type, field of study, institution name, location, graduation date, GPA if mentioned, honors/awards
5. SKILLS: Categorize into:
   - Technical/Hard skills (programming languages, tools, frameworks, certifications)
   - Soft skills (leadership, communication, teamwork)
   - Industry-specific keywords
6. CERTIFICATIONS: Name, issuing organization, date obtained, expiration if applicable
7. PROJECTS: Title, description, technologies used, outcomes
8. LANGUAGES: Language and proficiency level
9. ATS METADATA: Extract any keywords that match common ATS filters

Return a valid JSON object with this EXACT structure:
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
      "achievements": ["quantifiable achievement 1", "achievement 2"],
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

CRITICAL PARSING GUIDELINES:
- Standardize date formats to YYYY-MM (e.g., "January 2020" → "2020-01", "2020" → "2020-01")
- For "Present" or "Current", set endDate to empty string and current to true
- Merge all skill variations (e.g., "JS", "JavaScript", "Javascript" → "JavaScript")
- Extract ALL quantifiable metrics (%, $, numbers) as achievements
- Identify common ATS action verbs: achieved, built, created, delivered, enhanced, facilitated, generated, helped, implemented, joined, kept, led, managed, negotiated, organized, produced, qualified, reduced, streamlined, trained, unified, validated, worked, executed, yielded, zeroed
- Confidence scores should be 0.0-1.0 based on how complete each section is
- If a section is not found, return empty string/array but never null
- Parse bullet points into separate achievement entries
- Return ONLY the JSON object, no markdown, no explanation, no code blocks`;

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
