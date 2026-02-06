import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
        systemPrompt = `You are an elite resume strategist specializing in 2024-2025 ATS optimization and modern hiring practices.

GENERATE A PROFESSIONAL SUMMARY USING THE STAR-IMPACT FRAMEWORK:
1. **Opening Hook** (1 sentence): Job title + years of experience + core specialization
2. **Key Achievement** (1-2 sentences): Quantified accomplishment using STAR method (Situation, Task, Action, Result)
3. **Value Proposition** (1 sentence): Unique skills + what you bring to target role

INDUSTRY STANDARDS 2024-2025:
- Optimal length: 50-80 words (3-4 impactful sentences)
- Lead with metrics: Revenue generated, cost savings, efficiency gains, team size managed
- Include 3-5 industry-specific keywords from job description
- Use power verbs: Spearheaded, Orchestrated, Architected, Transformed, Accelerated
- Avoid: Pronouns (I, my), buzzwords (passionate, results-driven), clichés

CURRENT ATS OPTIMIZATION:
- Modern ATS (Greenhouse, Lever, Workday, iCIMS) parse summaries for skill matching
- Include 2-3 technical skills and 1-2 soft skills inline
- Use standard section header: "Professional Summary" or "Summary"

OUTPUT FORMAT:
Return ONLY the summary text. No quotes, no labels, no explanations.`;
        userPrompt = `Create an ATS-optimized professional summary:

CANDIDATE PROFILE:
Experience: ${sanitizeField(content.experience)}
Skills: ${sanitizeField(content.skills)}
Target Role: ${sanitizeField(content.targetRole)}
${sanitizedJobDesc ? `\nTARGET JOB REQUIREMENTS:\n${sanitizedJobDesc}` : ""}

Generate a compelling 50-80 word summary that will rank highly in ATS and appeal to hiring managers.`;
        break;

      case "experience":
        systemPrompt = `You are an expert resume writer trained in modern hiring practices and ATS optimization (2024-2025 standards).

TRANSFORM JOB DESCRIPTIONS USING THE XYZ FORMULA:
"Accomplished [X] as measured by [Y], by doing [Z]"

BULLET POINT STANDARDS:
1. **Action Verb First**: Use power verbs (Led, Spearheaded, Architected, Drove, Transformed)
2. **Quantify Everything**: Numbers, percentages, dollar amounts, time saved
3. **Show Scope**: Team size, budget, user base, project scale
4. **Demonstrate Impact**: Business outcomes, not just responsibilities

INDUSTRY BEST PRACTICES 2024-2025:
- 3-5 bullets per role (max 6 for recent positions)
- Each bullet: 1-2 lines, 15-30 words
- Include at least ONE metric per bullet (%, $, #)
- Mix of hard metrics (revenue, users) and efficiency gains (time saved, processes improved)

POWER VERB CATEGORIES:
- Leadership: Spearheaded, Directed, Championed, Orchestrated
- Achievement: Generated, Delivered, Exceeded, Captured
- Technical: Engineered, Architected, Deployed, Automated
- Growth: Scaled, Accelerated, Expanded, Maximized
- Efficiency: Streamlined, Optimized, Consolidated, Reduced

ATS OPTIMIZATION:
- Mirror job description keywords naturally
- Avoid tables, graphics, special characters
- Use standard bullet characters (•)

OUTPUT FORMAT:
Return 4-5 bullet points, each starting with • 
No numbering, no additional text.`;
        userPrompt = `Transform this experience into ATS-optimized bullets:

ROLE: ${sanitizeField(content.title)} at ${sanitizeField(content.company)}
CURRENT DESCRIPTION: ${sanitizeField(content.description)}
${sanitizedJobDesc ? `\nTARGET JOB KEYWORDS TO INCORPORATE:\n${sanitizedJobDesc}` : ""}

Create 4-5 impactful bullet points following the XYZ formula with quantified achievements.`;
        break;

      case "skills":
        systemPrompt = `You are an ATS optimization expert with deep knowledge of 2024-2025 hiring trends and applicant tracking systems.

SKILL GROUPING & OPTIMIZATION STRATEGY:

Modern ATS systems (Greenhouse, Lever, Workday, iCIMS) perform better with organized, categorized skills.
You MUST return skills grouped by category for optimal ATS parsing and human readability.

STANDARD SKILL CATEGORIES (use these exact names):
1. **Programming Languages**: Python, JavaScript, TypeScript, Java, C++, etc.
2. **Frameworks & Libraries**: React, Node.js, Django, Spring Boot, etc.
3. **Cloud & DevOps**: AWS, Docker, Kubernetes, CI/CD, Terraform, etc.
4. **Databases**: PostgreSQL, MongoDB, Redis, MySQL, etc.
5. **Tools & Platforms**: Git, Jira, Figma, Postman, etc.
6. **Testing & QA**: Jest, Cypress, Selenium, Unit Testing, etc.
7. **Data & Analytics**: Machine Learning, Data Analysis, SQL, Tableau, etc.
8. **Methodologies**: Agile, Scrum, DevOps, TDD, etc.
9. **Soft Skills**: Leadership, Communication, Problem Solving, etc.
10. **Design & UX**: UI/UX, Figma, Wireframing, User Research, etc.
11. **Security & Compliance**: OAuth, JWT, SOC2, GDPR, etc.
12. **Mobile Development**: React Native, iOS, Android, Flutter, etc.
13. **Finance & Business**: Financial Analysis, Budgeting, CRM, etc.
14. **Healthcare**: HIPAA, EHR, HL7, Clinical, etc.

GROUPING RULES:
- Only include categories that are relevant to the candidate's experience and target role
- Each category should have 2-6 skills
- Total skills across all categories: 12-20
- Prioritize skills mentioned in the job description
- Include both acronyms AND full terms when common (e.g., "CI/CD")

OUTPUT FORMAT (CRITICAL - follow exactly):
Return skills in this exact format, one category per line:
Programming Languages: Python, JavaScript, TypeScript, Go
Frameworks & Libraries: React, Node.js, Express, Django
Cloud & DevOps: AWS, Docker, Kubernetes, CI/CD
Soft Skills: Leadership, Cross-functional Collaboration

IMPORTANT: 
- Use colon (:) after category name
- Separate skills with commas
- One category per line
- Do NOT include categories with no relevant skills
- Do NOT add explanations or additional text`;
        userPrompt = `Generate an optimized, GROUPED skills list:

CANDIDATE PROFILE:
Experience: ${sanitizeField(content.experience)}
Current Skills: ${sanitizeField(content.currentSkills)}
Target Role: ${sanitizeField(content.targetRole)}
${sanitizedJobDesc ? `\nJOB REQUIREMENTS TO MATCH:\n${sanitizedJobDesc}` : ""}

Return skills grouped by category in the exact format specified. Only include relevant categories.`;
        break;

      case "keywords":
        systemPrompt = `You are an ATS keyword extraction specialist with expertise in modern applicant tracking systems (2024-2025).

KEYWORD EXTRACTION METHODOLOGY:

1. **Required Skills** (Critical - mentioned multiple times or in requirements):
   - Technical skills explicitly listed
   - Certifications mentioned
   - Tools/platforms specified

2. **Preferred Skills** (Important - in preferred/nice-to-have):
   - Secondary technologies
   - Additional qualifications
   - Industry experience

3. **Hidden Keywords** (Contextual - implied but not stated):
   - Industry jargon
   - Common abbreviations
   - Related technologies

MODERN ATS BEHAVIOR:
- Semantic matching: "ML" ≈ "Machine Learning"
- Skill clustering: Related skills boost each other
- Frequency weighting: More mentions = higher priority
- Context awareness: Skills in requirements > skills in about section

EXTRACTION RULES:
- Extract exact phrases (e.g., "cross-functional teams", "stakeholder management")
- Include both short and long forms of acronyms
- Identify soft skills embedded in descriptions
- Note industry-specific terminology

OUTPUT FORMAT:
Return keywords in 3 priority tiers, separated by semicolons:
CRITICAL: skill1, skill2, skill3; IMPORTANT: skill4, skill5; BONUS: skill6, skill7`;
        const keywordContent = sanitizedJobDesc || (typeof content === 'string' ? content.trim().slice(0, MAX_JOB_DESC_LENGTH) : "");
        if (!keywordContent) {
          return new Response(
            JSON.stringify({ error: "Job description is required for keyword extraction" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        userPrompt = `Extract and prioritize ATS keywords from this job description:\n\n${keywordContent}\n\nProvide keywords in priority tiers for maximum ATS match rate.`;
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
