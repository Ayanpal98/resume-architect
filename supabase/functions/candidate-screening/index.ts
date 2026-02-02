import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Input validation constants
const MAX_RESUME_LENGTH = 100000; // 100KB max
const MAX_JOB_DESC_LENGTH = 50000; // 50KB max
const MAX_FIELD_LENGTH = 500; // For smaller fields
const MIN_CONTENT_LENGTH = 50;

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

    const { resumeText, jobDescription, jobTitle, requiredExperience, requiredEducation } = body;

    // Validate required fields
    if (!resumeText || typeof resumeText !== 'string') {
      return new Response(
        JSON.stringify({ error: "Resume text is required and must be a string" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!jobDescription || typeof jobDescription !== 'string') {
      return new Response(
        JSON.stringify({ error: "Job description is required and must be a string" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Trim inputs
    const trimmedResume = resumeText.trim();
    const trimmedJobDesc = jobDescription.trim();

    // Validate lengths
    if (trimmedResume.length < MIN_CONTENT_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Resume text is too short. Minimum ${MIN_CONTENT_LENGTH} characters required.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (trimmedResume.length > MAX_RESUME_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Resume text exceeds maximum length of ${MAX_RESUME_LENGTH} characters.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (trimmedJobDesc.length < MIN_CONTENT_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Job description is too short. Minimum ${MIN_CONTENT_LENGTH} characters required.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (trimmedJobDesc.length > MAX_JOB_DESC_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Job description exceeds maximum length of ${MAX_JOB_DESC_LENGTH} characters.` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate optional fields
    const sanitizedJobTitle = jobTitle && typeof jobTitle === 'string' 
      ? jobTitle.trim().slice(0, MAX_FIELD_LENGTH) 
      : '';
    const sanitizedExperience = requiredExperience && typeof requiredExperience === 'string'
      ? requiredExperience.trim().slice(0, MAX_FIELD_LENGTH)
      : '';
    const sanitizedEducation = requiredEducation && typeof requiredEducation === 'string'
      ? requiredEducation.trim().slice(0, MAX_FIELD_LENGTH)
      : '';

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert HR recruiter and ATS (Applicant Tracking System) analyst with 15+ years of experience in talent acquisition. Your task is to analyze a candidate's resume against a job description using industry-standard hiring practices aligned with SHRM (Society for Human Resource Management) and EEOC guidelines.

## Evaluation Framework (Industry Standard Weighted Scoring)

Evaluate candidates across these weighted dimensions:

### 1. Technical Skills Match (30%)
- Hard skills alignment with job requirements
- Technical proficiency levels (beginner/intermediate/expert)
- Tool and technology stack compatibility
- Industry-specific certifications

### 2. Experience Relevance (25%)
- Years of relevant experience vs. requirements
- Role progression and career trajectory
- Industry experience alignment
- Project complexity and scope

### 3. Education & Certifications (15%)
- Degree level vs. requirements
- Field of study relevance
- Professional certifications
- Continuing education

### 4. Soft Skills & Culture Fit (15%)
- Communication indicators in resume
- Leadership and teamwork evidence
- Problem-solving examples
- Adaptability signals

### 5. ATS Optimization (10%)
- Keyword density and placement
- Resume formatting quality
- Action verb usage
- Quantifiable achievements

### 6. Red Flags Analysis (5% penalty factor)
- Employment gaps (unexplained)
- Job hopping patterns
- Overqualification concerns
- Inconsistencies

## Output Requirements

Return your analysis as a JSON object with this exact structure:
{
  "name": "Candidate's full name",
  "email": "Email address",
  "phone": "Phone number",
  "location": "City, State/Country",
  "currentRole": "Current or most recent job title",
  "totalExperience": "X years",
  "overallScore": 0-100,
  "technicalSkillsScore": 0-100,
  "experienceScore": 0-100,
  "educationScore": 0-100,
  "softSkillsScore": 0-100,
  "atsScore": 0-100,
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "partialSkills": ["skill with partial match"],
  "experienceSummary": "Brief summary of relevant experience",
  "educationDetails": {
    "degree": "Highest degree",
    "field": "Field of study",
    "institution": "University/College",
    "certifications": ["cert1", "cert2"]
  },
  "strengths": [
    {"point": "Strength description", "evidence": "Supporting evidence from resume"}
  ],
  "concerns": [
    {"point": "Concern description", "severity": "low|medium|high", "mitigation": "Possible mitigation"}
  ],
  "keyAchievements": ["Quantified achievement 1", "Achievement 2"],
  "interviewQuestions": ["Suggested question 1", "Question 2", "Question 3"],
  "salaryRange": "Estimated market range based on experience",
  "recommendation": "highly_recommended|recommended|consider|not_recommended",
  "recommendationReason": "Brief explanation of the recommendation",
  "fitScore": {
    "technical": 0-100,
    "cultural": 0-100,
    "growth": 0-100
  },
  "competitiveAnalysis": {
    "percentile": "Top X% of candidates typically seen for this role",
    "standoutFactors": ["Factor 1", "Factor 2"],
    "improvementAreas": ["Area 1", "Area 2"]
  }
}

## Scoring Guidelines
- 90-100: Exceptional - Exceeds all requirements, immediate hire potential
- 80-89: Highly Recommended - Strong match, proceed to final rounds
- 70-79: Recommended - Good match, worth interviewing
- 60-69: Consider - Partial match, may need development
- 50-59: Weak - Significant gaps, consider only if talent pool is limited
- 0-49: Not Recommended - Does not meet minimum requirements

Be objective, fair, and thorough. Focus on job-relevant qualifications only.`;

    const userPrompt = `Analyze this candidate's resume against the job requirements:

${sanitizedJobTitle ? `JOB TITLE: ${sanitizedJobTitle}` : ''}
${sanitizedExperience ? `REQUIRED EXPERIENCE: ${sanitizedExperience}` : ''}
${sanitizedEducation ? `REQUIRED EDUCATION: ${sanitizedEducation}` : ''}

JOB DESCRIPTION:
${trimmedJobDesc}

CANDIDATE RESUME:
${trimmedResume}

Provide a comprehensive analysis following the JSON structure specified. Be thorough but fair in your evaluation.`;

    console.log("Sending request to AI service for candidate analysis...");

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
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI service error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI service");
    }

    console.log("Successfully received AI response");

    // Parse the JSON response
    let analysis;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, content];
      const jsonString = jsonMatch[1] || content;
      analysis = JSON.parse(jsonString.trim());
      
      // Ensure all required fields exist with defaults
      analysis = {
        name: analysis.name || "Unknown",
        email: analysis.email || "",
        phone: analysis.phone || "",
        location: analysis.location || "",
        currentRole: analysis.currentRole || "",
        totalExperience: analysis.totalExperience || "N/A",
        overallScore: analysis.overallScore ?? 50,
        technicalSkillsScore: analysis.technicalSkillsScore ?? analysis.skillsMatch ?? 50,
        experienceScore: analysis.experienceScore ?? analysis.experienceMatch ?? 50,
        educationScore: analysis.educationScore ?? analysis.educationMatch ?? 50,
        softSkillsScore: analysis.softSkillsScore ?? 50,
        atsScore: analysis.atsScore ?? 50,
        matchedSkills: analysis.matchedSkills || [],
        missingSkills: analysis.missingSkills || [],
        partialSkills: analysis.partialSkills || [],
        experienceSummary: analysis.experienceSummary || analysis.experience || "",
        educationDetails: analysis.educationDetails || { degree: "", field: "", institution: "", certifications: [] },
        strengths: Array.isArray(analysis.strengths) 
          ? analysis.strengths.map((s: any) => typeof s === 'string' ? { point: s, evidence: "" } : s)
          : [],
        concerns: Array.isArray(analysis.concerns)
          ? analysis.concerns.map((c: any) => typeof c === 'string' ? { point: c, severity: "medium", mitigation: "" } : c)
          : [],
        keyAchievements: analysis.keyAchievements || [],
        interviewQuestions: analysis.interviewQuestions || [],
        salaryRange: analysis.salaryRange || "Not estimated",
        recommendation: analysis.recommendation || "consider",
        recommendationReason: analysis.recommendationReason || "",
        fitScore: analysis.fitScore || { technical: 50, cultural: 50, growth: 50 },
        competitiveAnalysis: analysis.competitiveAnalysis || { percentile: "N/A", standoutFactors: [], improvementAreas: [] },
      };
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      analysis = {
        name: "Unknown",
        email: "",
        phone: "",
        location: "",
        currentRole: "",
        totalExperience: "N/A",
        overallScore: 50,
        technicalSkillsScore: 50,
        experienceScore: 50,
        educationScore: 50,
        softSkillsScore: 50,
        atsScore: 50,
        matchedSkills: [],
        missingSkills: [],
        partialSkills: [],
        experienceSummary: "Unable to parse experience",
        educationDetails: { degree: "", field: "", institution: "", certifications: [] },
        strengths: [{ point: "Resume provided for review", evidence: "" }],
        concerns: [{ point: "Unable to fully analyze - please review manually", severity: "medium", mitigation: "" }],
        keyAchievements: [],
        interviewQuestions: [],
        salaryRange: "Not estimated",
        recommendation: "consider",
        recommendationReason: "Manual review recommended due to parsing issues",
        fitScore: { technical: 50, cultural: 50, growth: 50 },
        competitiveAnalysis: { percentile: "N/A", standoutFactors: [], improvementAreas: [] },
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
