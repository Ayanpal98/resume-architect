import { industryKeywords } from "./templates";

export interface ATSCheckResult {
  overallScore: number;
  categories: ATSCategory[];
  recommendations: string[];
  passStatus: "excellent" | "good" | "fair" | "poor";
  keywordDensity: number;
  readabilityScore: number;
  impactScore: number;
  starScore: number;
  industryMatch: IndustryMatch | null;
}

export interface ATSCategory {
  name: string;
  score: number;
  maxScore: number;
  issues: string[];
  passed: boolean;
  weight: number;
}

export interface IndustryMatch {
  industry: string;
  matchPercentage: number;
  matchedKeywords: string[];
  missingKeywords: string[];
}

interface ResumeDataForCheck {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    portfolio?: string;
  };
  summary: string;
  experience: Array<{
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  education: Array<{
    id: string;
    degree: string;
    school: string;
    location: string;
    graduationDate: string;
    gpa?: string;
  }>;
  skills: string[];
}

// STAR methodology components for impact detection (2024-2025 best practices)
const STAR_PATTERNS = {
  situation: /\b(when|during|while|faced with|tasked with|in response to|given|upon|amid|amidst|following|after|before|upon discovering|in a situation where|challenged by)\b/i,
  task: /\b(responsible for|charged with|assigned to|needed to|required to|expected to|goal was|objective was|mission was|mandate was|role was to|duty was)\b/i,
  action: /\b(led|managed|developed|created|implemented|designed|built|established|launched|initiated|pioneered|orchestrated|spearheaded|executed|delivered|transformed|optimized|streamlined|automated|analyzed|collaborated|negotiated|presented|resolved|architected|engineered|scaled|deployed|integrated|configured|migrated)\b/i,
  result: /\b(resulted in|leading to|which led to|achieving|accomplished|delivered|generated|produced|increased|decreased|reduced|improved|saved|grew|expanded|boosted|enhanced|maximized|minimized|eliminated|accelerated|driving|contributing to|enabling|resulting)\b/i,
};

// Impact multiplier patterns (high-value achievements)
const IMPACT_PATTERNS = {
  revenue: /(?:revenue|sales|profit|income|earnings|ARR|MRR)\s*(?:of|by|to)?\s*\$?[\d,.]+[KMB]?/i,
  cost: /(?:cost|expense|spending|budget)\s*(?:reduction|savings?|cut)\s*(?:of|by)?\s*\$?[\d,.]+[KMB]?|(?:saved?|cut|reduced?)\s*\$?[\d,.]+[KMB]?/i,
  efficiency: /(?:efficiency|productivity|performance)\s*(?:improvement|increase|gain)\s*(?:of|by)?\s*\d+%/i,
  scale: /(?:scaled?|grew?|expanded?)\s*(?:to|by|from)?\s*\d+[xX]|\d+[xX]\s*(?:growth|increase|scale)/i,
  team: /(?:led|managed|mentored|coached|supervised)\s*(?:a\s*)?(?:team\s*of\s*)?\d+\s*(?:people|engineers|developers|members|staff|reports)/i,
  users: /\d+[KMB]?\+?\s*(?:users?|customers?|clients?|subscribers?|DAU|MAU|downloads?)/i,
  time: /(?:reduced?|shortened?|cut|decreased?)\s*(?:time|duration|cycle|turnaround)\s*(?:by)?\s*\d+%/i,
  uptime: /\d+\.?\d*%\s*(?:uptime|availability|reliability)|(?:uptime|availability)\s*(?:of|to)?\s*\d+\.?\d*%/i,
};

// 2024-2025 high-demand technical skills by category
const SKILL_CATEGORIES_2025 = {
  ai_ml: ["machine learning", "ml", "ai", "artificial intelligence", "deep learning", "neural network", "nlp", "llm", "genai", "generative ai", "chatgpt", "langchain", "rag", "vector database", "embeddings", "fine-tuning", "prompt engineering", "pytorch", "tensorflow", "hugging face", "computer vision", "mlops"],
  cloud_devops: ["aws", "azure", "gcp", "google cloud", "kubernetes", "k8s", "docker", "terraform", "ansible", "jenkins", "ci/cd", "gitlab", "github actions", "cloudformation", "serverless", "lambda", "ecs", "eks", "argo", "helm", "istio", "observability", "prometheus", "grafana", "datadog"],
  data_analytics: ["sql", "python", "r", "tableau", "power bi", "looker", "snowflake", "databricks", "spark", "kafka", "airflow", "dbt", "bigquery", "redshift", "data warehouse", "etl", "data pipeline", "data modeling", "analytics", "business intelligence", "bi"],
  backend: ["node.js", "python", "java", "go", "golang", "rust", "c#", ".net", "spring", "django", "flask", "fastapi", "express", "nest.js", "graphql", "rest api", "microservices", "postgresql", "mysql", "mongodb", "redis", "elasticsearch", "rabbitmq", "grpc"],
  frontend: ["react", "typescript", "javascript", "vue", "angular", "next.js", "tailwind", "css", "html", "webpack", "vite", "redux", "zustand", "react query", "testing library", "cypress", "playwright", "storybook", "figma", "responsive design"],
  security: ["cybersecurity", "security", "oauth", "jwt", "sso", "saml", "encryption", "penetration testing", "vulnerability", "compliance", "soc 2", "gdpr", "hipaa", "zero trust", "iam", "rbac"],
  product_agile: ["agile", "scrum", "kanban", "jira", "confluence", "product management", "roadmap", "okr", "kpi", "stakeholder", "user research", "a/b testing", "mvp", "sprint", "backlog", "retrospective"],
};

// Industry-standard ATS action verbs (2024-2025 hiring standards - expanded)
const ACTION_VERBS = [
  // Leadership & Management (High ATS weight)
  "led", "managed", "directed", "supervised", "coordinated", "oversaw", "spearheaded", "mentored", "coached",
  "championed", "orchestrated", "steered", "piloted", "governed", "administered",
  // Achievement & Results (Highest ATS weight)
  "achieved", "accomplished", "delivered", "exceeded", "surpassed", "attained", "earned", "generated",
  "captured", "secured", "won", "outperformed", "maximized",
  // Development & Creation
  "developed", "created", "designed", "built", "established", "launched", "initiated", "pioneered", "founded",
  "architected", "engineered", "constructed", "formulated", "innovated", "introduced",
  // Improvement & Optimization (High demand 2024-2025)
  "improved", "enhanced", "optimized", "streamlined", "transformed", "revamped", "modernized", "upgraded",
  "automated", "digitized", "accelerated", "refined", "elevated",
  // Analysis & Research
  "analyzed", "researched", "evaluated", "assessed", "identified", "investigated", "examined", "audited",
  "diagnosed", "forecasted", "measured", "quantified", "benchmarked",
  // Implementation & Execution
  "implemented", "executed", "administered", "operated", "processed", "maintained", "performed",
  "deployed", "integrated", "configured", "migrated", "scaled",
  // Communication & Collaboration
  "collaborated", "communicated", "negotiated", "presented", "facilitated", "liaised", "partnered",
  "influenced", "advocated", "articulated", "convinced", "persuaded",
  // Problem Solving
  "resolved", "troubleshot", "diagnosed", "solved", "addressed", "mitigated", "prevented",
  "remediated", "corrected", "debugged", "recovered",
  // Growth & Expansion
  "increased", "grew", "expanded", "scaled", "accelerated", "maximized", "boosted",
  "amplified", "multiplied", "extended", "broadened",
  // Reduction & Efficiency
  "reduced", "decreased", "minimized", "eliminated", "cut", "consolidated", "saved",
  "lowered", "shortened", "compressed", "condensed",
  // Technical & Engineering (High demand 2024-2025)
  "programmed", "coded", "scripted", "refactored", "containerized", "orchestrated",
  "provisioned", "instrumented", "monitored"
];

// Industry-standard quantifiable patterns (2024-2025 metrics)
const QUANTIFIABLE_PATTERNS = [
  /\d+%/,                                           // Percentages
  /\$[\d,]+(?:\.\d{2})?(?:K|M|B)?/i,               // Dollar amounts
  /\d+\s*(?:years?|yrs?|months?|mos?)/i,           // Time periods
  /\d+\s*(?:team|people|members|employees|staff|reports|engineers|developers)/i, // Team size
  /\d+\s*(?:projects?|initiatives?|programs?|products?|features?)/i,    // Project counts
  /\d+\s*(?:clients?|customers?|accounts?|users?|subscribers?|DAU|MAU)/i, // Customer metrics
  /(?:increased|improved|grew|boosted|raised|accelerated).*?\d/i,
  /(?:reduced|decreased|cut|saved|lowered|eliminated).*?\d/i,
  /\d+\s*(?:per|\/)\s*(?:day|week|month|year|hour|sprint|quarter)/i, // Rate metrics
  /(?:top|#)\s*\d+/i,                               // Rankings
  /\d+x|\d+X/,                                      // Multipliers
  /\d{1,3}(?:,\d{3})+/,                            // Large numbers with commas
  /\d+\s*(?:hours?|days?|weeks?)\s*(?:saved|faster|quicker)/i, // Time saved
  /\d+\s*(?:bugs?|issues?|defects?|incidents?)\s*(?:resolved|fixed)/i, // Bug fixes
  /(?:SLA|uptime|availability)\s*(?:of\s*)?\d+/i,  // SLA metrics
  /\d+\s*(?:API|endpoints?|microservices?|repositories?)/i, // Technical scale
  /(?:NPS|CSAT|satisfaction)\s*(?:score\s*)?(?:of\s*)?\d+/i, // Customer satisfaction
  /\d+\s*(?:deployments?|releases?|sprints?)/i,    // DevOps metrics
];

// ATS-friendly section headers (industry standard 2024-2025)
const STANDARD_SECTIONS = [
  "summary", "professional summary", "executive summary", "career summary",
  "experience", "work experience", "professional experience", "employment history", "work history",
  "education", "academic background", "qualifications", "educational background",
  "skills", "technical skills", "core competencies", "areas of expertise", "key skills",
  "certifications", "licenses", "credentials", "professional certifications",
  "projects", "key projects", "notable projects",
  "achievements", "accomplishments", "awards", "honors"
];

// Common ATS-breaking elements to avoid
const PROBLEMATIC_CHARACTERS = /[│┃┄┅┆┇┈┉┊┋╌╍╎╏═║╒╓╔╕╖╗╘╙╚╛╜╝╞╟★☆●○◆◇■□▲△▶▷◀◁♦♠♣♥🔹🔸⭐️✨💡🎯📊📈]/;
const EXCESSIVE_PUNCTUATION = /[!@#$%^&*()]{3,}/;
const URL_PATTERN = /https?:\/\/[^\s]+/gi;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[\d\s\-\+\(\)\.]{10,}$/;

export const checkATSCompatibility = (resumeData: ResumeDataForCheck): ATSCheckResult => {
  const categories: ATSCategory[] = [];
  const recommendations: string[] = [];

  // 1. Contact Information Check (Weight: 1.0 - Essential)
  const contactCheck = checkContactInfo(resumeData.personalInfo);
  categories.push(contactCheck.category);
  recommendations.push(...contactCheck.recommendations);

  // 2. Professional Summary Check (Weight: 1.2 - High importance)
  const summaryCheck = checkSummary(resumeData.summary);
  categories.push(summaryCheck.category);
  recommendations.push(...summaryCheck.recommendations);

  // 3. Work Experience Check (Weight: 1.5 - Highest importance)
  const experienceCheck = checkExperience(resumeData.experience);
  categories.push(experienceCheck.category);
  recommendations.push(...experienceCheck.recommendations);

  // 4. Education Check (Weight: 0.8 - Important but less weighted)
  const educationCheck = checkEducation(resumeData.education);
  categories.push(educationCheck.category);
  recommendations.push(...educationCheck.recommendations);

  // 5. Skills Section Check (Weight: 1.3 - Very important for ATS)
  const skillsCheck = checkSkills(resumeData.skills);
  categories.push(skillsCheck.category);
  recommendations.push(...skillsCheck.recommendations);

  // 6. Keyword Optimization Check (Weight: 1.4 - Critical for ATS matching)
  const keywordCheck = checkKeywordOptimization(resumeData);
  categories.push(keywordCheck.category);
  recommendations.push(...keywordCheck.recommendations);

  // 7. Formatting & ATS Compatibility (Weight: 1.0 - Essential)
  const formattingCheck = checkFormatting(resumeData);
  categories.push(formattingCheck.category);
  recommendations.push(...formattingCheck.recommendations);

  // Calculate weighted overall score (industry standard approach)
  let weightedTotal = 0;
  let weightedMaxTotal = 0;
  
  categories.forEach(cat => {
    weightedTotal += (cat.score / cat.maxScore) * 100 * cat.weight;
    weightedMaxTotal += 100 * cat.weight;
  });
  
  const overallScore = Math.round((weightedTotal / weightedMaxTotal) * 100);

  // Calculate keyword density
  const keywordDensity = calculateKeywordDensity(resumeData);
  
  // Calculate readability score
  const readabilityScore = calculateReadabilityScore(resumeData);

  // Calculate STAR methodology score (2024-2025 interview standard)
  const starScore = calculateStarScore(resumeData);

  // Calculate impact score (high-value achievement density)
  const impactScore = calculateImpactScore(resumeData);

  // Calculate industry match
  const industryMatch = calculateIndustryMatch(resumeData);

  // Determine pass status based on industry thresholds
  let passStatus: ATSCheckResult["passStatus"];
  if (overallScore >= 80) passStatus = "excellent";
  else if (overallScore >= 65) passStatus = "good";
  else if (overallScore >= 50) passStatus = "fair";
  else passStatus = "poor";

  // Prioritize recommendations by impact
  const prioritizedRecommendations = prioritizeRecommendations(recommendations, categories);

  return {
    overallScore,
    categories,
    recommendations: prioritizedRecommendations.slice(0, 10),
    passStatus,
    keywordDensity,
    readabilityScore,
    impactScore,
    starScore,
    industryMatch,
  };
};

function checkContactInfo(personalInfo: ResumeDataForCheck["personalInfo"]) {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 0;
  const maxScore = 20;

  // Full name check (5 points) - Critical for ATS parsing
  if (personalInfo.fullName && personalInfo.fullName.trim().length > 0) {
    const name = personalInfo.fullName.trim();
    score += 3;
    
    // Check for proper capitalization
    if (/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+$/.test(name)) {
      score += 2;
    } else if (/^[A-Z]/.test(name)) {
      score += 1;
      issues.push("Name formatting could be improved (use proper capitalization)");
    } else {
      issues.push("Name should start with capital letter");
    }
    
    // Check for special characters in name
    if (/[^a-zA-Z\s\-\.]/.test(name)) {
      issues.push("Name contains special characters that may confuse ATS");
      score -= 1;
    }
  } else {
    issues.push("Full name is missing - this is critical for ATS");
    recommendations.push("Add your full legal name as it appears on official documents");
  }

  // Email check (5 points) - Must be parseable
  if (personalInfo.email && personalInfo.email.trim().length > 0) {
    const email = personalInfo.email.trim().toLowerCase();
    
    if (EMAIL_PATTERN.test(email)) {
      score += 4;
      
      // Check for professional email domain
      if (!/gmail|yahoo|hotmail|outlook|aol/i.test(email)) {
        score += 1; // Custom domain bonus
      } else {
        score += 0.5;
      }
      
      // Check for unprofessional email patterns
      if (/\d{4,}|sexy|hot|cool|ninja|420|69/i.test(email)) {
        issues.push("Email may appear unprofessional");
        score -= 1;
      }
    } else {
      issues.push("Email format is invalid - ATS may fail to parse");
      recommendations.push("Use a valid email format (example@domain.com)");
    }
  } else {
    issues.push("Email address is missing - required for recruiter contact");
    recommendations.push("Add a professional email address");
  }

  // Phone check (4 points)
  if (personalInfo.phone && personalInfo.phone.trim().length > 0) {
    const phone = personalInfo.phone.replace(/\D/g, "");
    
    if (phone.length >= 10 && phone.length <= 15) {
      score += 4;
    } else if (phone.length >= 7) {
      score += 2;
      issues.push("Phone number may be incomplete");
    } else {
      issues.push("Phone number appears invalid");
    }
  } else {
    issues.push("Phone number is missing");
    recommendations.push("Add a phone number - recruiters need multiple contact options");
  }

  // Location check (3 points) - Important for location-based filtering
  if (personalInfo.location && personalInfo.location.trim().length > 0) {
    const location = personalInfo.location.trim();
    
    // Check for city, state/country format
    if (/,/.test(location) || location.split(" ").length >= 2) {
      score += 3;
    } else {
      score += 2;
      issues.push("Location should include city and state/country");
    }
  } else {
    issues.push("Location is missing - important for job matching");
    recommendations.push("Add city and state/country for location-based job matching");
  }

  // LinkedIn check (3 points) - Bonus for professional presence
  if (personalInfo.linkedin && personalInfo.linkedin.trim().length > 0) {
    const linkedin = personalInfo.linkedin.trim().toLowerCase();
    
    if (linkedin.includes("linkedin.com/in/")) {
      score += 3;
    } else if (linkedin.includes("linkedin")) {
      score += 2;
      issues.push("LinkedIn URL format should be linkedin.com/in/yourname");
    } else {
      score += 1;
      issues.push("LinkedIn URL appears invalid");
    }
  } else {
    recommendations.push("Add LinkedIn profile URL - 87% of recruiters use LinkedIn");
  }

  return {
    category: {
      name: "Contact Information",
      score: Math.min(Math.max(score, 0), maxScore),
      maxScore,
      issues,
      passed: score >= maxScore * 0.7,
      weight: 1.0,
    },
    recommendations,
  };
}

function checkSummary(summary: string) {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 0;
  const maxScore = 20;

  if (!summary || summary.trim().length === 0) {
    issues.push("Professional summary is missing");
    recommendations.push("Add a 2-4 sentence professional summary highlighting your value proposition");
    return {
      category: { name: "Professional Summary", score: 0, maxScore, issues, passed: false, weight: 1.2 },
      recommendations,
    };
  }

  const wordCount = summary.split(/\s+/).filter(w => w.length > 0).length;
  const sentences = summary.split(/[.!?]+/).filter(s => s.trim().length > 0);

  // Length optimization (6 points) - Industry standard: 50-150 words
  if (wordCount >= 50 && wordCount <= 150) {
    score += 6;
  } else if (wordCount >= 30 && wordCount <= 200) {
    score += 4;
    if (wordCount < 50) {
      issues.push("Summary is short - aim for 50-150 words");
    } else {
      issues.push("Summary is slightly long - ATS may truncate");
    }
  } else if (wordCount >= 20) {
    score += 2;
    recommendations.push("Expand your summary to 50-150 words for optimal ATS parsing");
  } else {
    issues.push("Summary is too brief to communicate your value");
    recommendations.push("Write a compelling 50-150 word summary showcasing your expertise");
  }

  // Action verb presence (4 points)
  const actionVerbCount = ACTION_VERBS.filter(verb => 
    new RegExp(`\\b${verb}\\w*\\b`, 'i').test(summary)
  ).length;
  
  if (actionVerbCount >= 3) {
    score += 4;
  } else if (actionVerbCount >= 2) {
    score += 3;
  } else if (actionVerbCount >= 1) {
    score += 2;
    recommendations.push("Use more action verbs (developed, managed, achieved) in your summary");
  } else {
    issues.push("No action verbs found - weakens impact");
    recommendations.push("Start sentences with action verbs like 'Developed', 'Led', 'Achieved'");
  }

  // Quantifiable achievements (4 points)
  const hasQuantifiable = QUANTIFIABLE_PATTERNS.some(pattern => pattern.test(summary));
  if (hasQuantifiable) {
    score += 4;
  } else {
    issues.push("No quantifiable achievements");
    recommendations.push("Add metrics (e.g., 'increased revenue by 25%', 'managed team of 10')");
  }

  // Role/Industry keywords (3 points)
  const rolePatterns = /\b(engineer|developer|manager|analyst|designer|specialist|consultant|coordinator|director|lead|architect|executive|officer|administrator|associate)\b/i;
  const industryPatterns = /\b(software|marketing|finance|healthcare|technology|sales|operations|product|data|business|project|customer|human resources|IT)\b/i;
  
  const hasRole = rolePatterns.test(summary);
  const hasIndustry = industryPatterns.test(summary);
  
  if (hasRole && hasIndustry) {
    score += 3;
  } else if (hasRole || hasIndustry) {
    score += 2;
    recommendations.push("Include both your target role and industry keywords");
  } else {
    issues.push("Missing job title and industry keywords");
    recommendations.push("Mention your target job title and industry for better ATS matching");
  }

  // Years of experience (3 points)
  const yearsPattern = /(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s+)?(?:experience)?/i;
  const hasYears = yearsPattern.test(summary);
  if (hasYears) {
    score += 3;
  } else {
    recommendations.push("Consider mentioning your years of experience (e.g., '8+ years')");
  }

  return {
    category: {
      name: "Professional Summary",
      score: Math.min(score, maxScore),
      maxScore,
      issues,
      passed: score >= maxScore * 0.6,
      weight: 1.2,
    },
    recommendations,
  };
}

function checkExperience(experience: ResumeDataForCheck["experience"]) {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 0;
  const maxScore = 30;

  if (!experience || experience.length === 0) {
    issues.push("No work experience listed - critical for ATS ranking");
    recommendations.push("Add at least 2-3 relevant positions with detailed achievements");
    return {
      category: { name: "Work Experience", score: 0, maxScore, issues, passed: false, weight: 1.5 },
      recommendations,
    };
  }

  // Number of experiences (6 points) - Industry standard: 3-5 positions
  if (experience.length >= 3 && experience.length <= 5) {
    score += 6;
  } else if (experience.length >= 2 && experience.length <= 7) {
    score += 4;
    if (experience.length < 3) {
      issues.push("Consider adding more relevant experience");
    }
  } else if (experience.length === 1) {
    score += 2;
    issues.push("Only one position listed - add more if available");
  } else if (experience.length > 7) {
    score += 4;
    issues.push("Too many positions - focus on most recent/relevant 5-7");
  }

  let totalDescriptionScore = 0;
  let entriesWithDates = 0;
  let entriesWithActionVerbs = 0;
  let entriesWithQuantifiables = 0;
  let bulletPointCount = 0;

  experience.forEach((exp, index) => {
    const entryIssues: string[] = [];
    const position = index + 1;

    // Title check - Must be ATS-parseable
    if (!exp.title || exp.title.trim().length === 0) {
      entryIssues.push(`Position ${position}: Missing job title (critical)`);
    } else if (exp.title.length > 50) {
      entryIssues.push(`Position ${position}: Job title too long - may be truncated`);
    }

    // Company check
    if (!exp.company || exp.company.trim().length === 0) {
      entryIssues.push(`Position ${position}: Missing company name`);
    }

    // Date validation - Industry standard format
    if (exp.startDate) {
      entriesWithDates++;
      if (!exp.endDate && !exp.current) {
        entryIssues.push(`Position ${position}: Missing end date`);
      }
    } else {
      entryIssues.push(`Position ${position}: Missing start date`);
    }

    // Description quality analysis
    if (exp.description && exp.description.trim().length > 0) {
      const desc = exp.description;
      const descWords = desc.split(/\s+/).filter(w => w.length > 0).length;
      const bullets = (desc.match(/[•\-\*]/g) || []).length;
      bulletPointCount += bullets;

      // Word count scoring
      if (descWords >= 50 && descWords <= 150) {
        totalDescriptionScore += 4; // Optimal length per position
      } else if (descWords >= 30 && descWords <= 200) {
        totalDescriptionScore += 3;
      } else if (descWords >= 15) {
        totalDescriptionScore += 2;
        entryIssues.push(`Position ${position}: Description could be more detailed`);
      } else {
        totalDescriptionScore += 1;
        entryIssues.push(`Position ${position}: Description too brief`);
      }

      // Action verb check per entry
      const hasActionVerb = ACTION_VERBS.some(verb => 
        new RegExp(`\\b${verb}\\w*\\b`, 'i').test(desc)
      );
      if (hasActionVerb) {
        entriesWithActionVerbs++;
      } else {
        entryIssues.push(`Position ${position}: Missing action verbs`);
      }

      // Quantifiable results check
      const hasQuantifiable = QUANTIFIABLE_PATTERNS.some(pattern => 
        pattern.test(desc)
      );
      if (hasQuantifiable) {
        entriesWithQuantifiables++;
      }
    } else {
      entryIssues.push(`Position ${position}: No description provided`);
    }

    // Only add first 3 issues per entry to avoid overwhelm
    issues.push(...entryIssues.slice(0, 3));
  });

  // Date completeness (5 points)
  const dateRatio = entriesWithDates / experience.length;
  score += Math.round(dateRatio * 5);

  // Description quality (7 points)
  const avgDescScore = totalDescriptionScore / experience.length;
  score += Math.min(Math.round(avgDescScore * 1.75), 7);

  // Action verbs usage (6 points) - Critical for ATS keyword matching
  const actionVerbRatio = entriesWithActionVerbs / experience.length;
  score += Math.round(actionVerbRatio * 6);
  if (actionVerbRatio < 0.8) {
    recommendations.push("Start each bullet point with a strong action verb (Led, Developed, Achieved)");
  }

  // Quantifiable achievements (6 points) - Major differentiator
  const quantifiableRatio = entriesWithQuantifiables / experience.length;
  score += Math.round(quantifiableRatio * 6);
  if (quantifiableRatio < 0.6) {
    recommendations.push("Add measurable achievements (%, $, numbers) to at least 60% of positions");
  }

  // Bullet point usage bonus
  if (bulletPointCount >= experience.length * 3) {
    score += 1; // Bonus for structured formatting
  }

  return {
    category: {
      name: "Work Experience",
      score: Math.min(Math.max(score, 0), maxScore),
      maxScore,
      issues: issues.slice(0, 6),
      passed: score >= maxScore * 0.6,
      weight: 1.5,
    },
    recommendations,
  };
}

function checkEducation(education: ResumeDataForCheck["education"]) {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 0;
  const maxScore = 15;

  if (!education || education.length === 0) {
    issues.push("No education listed");
    recommendations.push("Add your highest degree with institution name and graduation date");
    return {
      category: { name: "Education", score: 0, maxScore, issues, passed: false, weight: 0.8 },
      recommendations,
    };
  }

  // Has education entries (4 points)
  score += Math.min(education.length * 2, 4);

  education.forEach((edu, index) => {
    const position = index + 1;

    // Degree check (4 points for primary)
    if (edu.degree && edu.degree.trim().length > 0) {
      if (index === 0) {
        score += 4;
        // Check for degree type keywords
        const degreeKeywords = /\b(bachelor|master|phd|doctorate|associate|diploma|certificate|mba|bs|ba|ms|ma)\b/i;
        if (!degreeKeywords.test(edu.degree)) {
          issues.push("Consider specifying degree type (e.g., Bachelor's, Master's)");
        }
      } else {
        score += 1;
      }
    } else {
      issues.push(`Education ${position}: Missing degree/certification`);
    }

    // School/Institution check (3 points for primary)
    if (edu.school && edu.school.trim().length > 0) {
      if (index === 0) score += 3;
    } else {
      issues.push(`Education ${position}: Missing institution name`);
    }

    // Graduation date (2 points for primary)
    if (edu.graduationDate && edu.graduationDate.trim().length > 0) {
      if (index === 0) score += 2;
    } else {
      issues.push(`Education ${position}: Missing graduation date`);
    }
  });

  // GPA mention bonus (2 points) - Only if strong (3.5+)
  const strongGPA = education.some(edu => edu.gpa && parseFloat(edu.gpa) >= 3.5);
  if (strongGPA) {
    score += 2;
  } else {
    const hasGPA = education.some(edu => edu.gpa && parseFloat(edu.gpa) >= 3.0);
    if (hasGPA) {
      score += 1;
    }
  }

  return {
    category: {
      name: "Education",
      score: Math.min(score, maxScore),
      maxScore,
      issues,
      passed: score >= maxScore * 0.6,
      weight: 0.8,
    },
    recommendations,
  };
}

function checkSkills(skills: string[]) {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 0;
  const maxScore = 20;

  if (!skills || skills.length === 0) {
    issues.push("No skills listed - critical for ATS keyword matching");
    recommendations.push("Add 10-20 relevant skills matching your target job requirements");
    return {
      category: { name: "Skills", score: 0, maxScore, issues, passed: false, weight: 1.3 },
      recommendations,
    };
  }

  // Number of skills (8 points) - Industry optimal: 10-20 skills
  if (skills.length >= 10 && skills.length <= 20) {
    score += 8;
  } else if (skills.length >= 8 && skills.length <= 25) {
    score += 6;
    if (skills.length < 10) {
      issues.push("Add more skills - aim for 10-20 relevant skills");
    } else {
      issues.push("Consider focusing on most relevant 15-20 skills");
    }
  } else if (skills.length >= 5) {
    score += 4;
    recommendations.push("Expand skills section to 10-20 items for better ATS matching");
  } else {
    score += 2;
    issues.push("Skills section needs significant expansion");
    recommendations.push("Add 10-20 skills including both technical and transferable skills");
  }

  // Skill categorization and variety (6 points)
  const skillsJoined = skills.join(" ").toLowerCase();
  
  // Technical skills detection (2024-2025 high-demand skills expanded)
  const technicalPatterns = /\b(javascript|typescript|python|java|c\+\+|c#|ruby|php|swift|kotlin|go|golang|rust|sql|mysql|postgresql|mongodb|react|angular|vue|next\.?js|node\.?js|express|django|flask|fastapi|spring|docker|kubernetes|k8s|aws|azure|gcp|git|github|gitlab|jenkins|ci\/cd|terraform|ansible|api|rest|graphql|grpc|html|css|sass|tailwind|webpack|vite|excel|tableau|power\s?bi|looker|salesforce|sap|hubspot|jira|confluence|agile|scrum|kanban|linux|windows|macos|redis|kafka|elasticsearch|spark|hadoop|pytorch|tensorflow|machine\s?learning|ml|ai|llm|genai|devops|sre|security|oauth|jwt|microservices|serverless|lambda|cloudflare)\b/gi;
  
  // Soft skills detection (2024-2025 hiring priorities)
  const softSkillPatterns = /\b(communication|leadership|teamwork|problem[\s\-]?solving|analytical|creative|management|collaboration|presentation|organization|critical\s?thinking|time\s?management|adaptability|attention\s?to\s?detail|interpersonal|negotiation|conflict\s?resolution|decision[\s\-]?making|strategic\s?planning|stakeholder\s?management|cross[\s\-]?functional|mentoring|coaching|emotional\s?intelligence|remote\s?collaboration|async\s?communication)\b/gi;

  const technicalMatches = skillsJoined.match(technicalPatterns) || [];
  const softSkillMatches = skillsJoined.match(softSkillPatterns) || [];

  const hasTechnical = technicalMatches.length >= 3;
  const hasSoftSkills = softSkillMatches.length >= 2;

  if (hasTechnical && hasSoftSkills) {
    score += 6;
  } else if (hasTechnical) {
    score += 4;
    recommendations.push("Add 2-3 soft skills (communication, leadership, stakeholder management)");
  } else if (hasSoftSkills) {
    score += 3;
    recommendations.push("Add more technical/hard skills relevant to your field");
  } else {
    score += 1;
    recommendations.push("Add a mix of technical and soft skills for comprehensive coverage");
  }

  // Skill specificity (3 points) - Avoid vague skills
  const vagueSkills = /\b(hardworking|motivated|team\s?player|detail[\s\-]?oriented|self[\s\-]?starter|fast\s?learner|passionate)\b/gi;
  const vagueMatches = skillsJoined.match(vagueSkills) || [];
  
  if (vagueMatches.length === 0) {
    score += 3;
  } else if (vagueMatches.length <= 2) {
    score += 2;
    issues.push("Replace vague skills with specific, measurable abilities");
  } else {
    score += 1;
    recommendations.push("Remove generic skills like 'hardworking' - focus on specific competencies");
  }

  // Skill formatting (3 points)
  const avgSkillLength = skills.reduce((sum, s) => sum + s.length, 0) / skills.length;
  const hasProperFormat = skills.every(s => s.length >= 2 && s.length <= 40);
  
  if (hasProperFormat && avgSkillLength <= 25) {
    score += 3;
  } else if (avgSkillLength <= 30) {
    score += 2;
  } else {
    score += 1;
    issues.push("Some skills are too verbose - keep them concise (1-4 words each)");
  }

  return {
    category: {
      name: "Skills",
      score: Math.min(score, maxScore),
      maxScore,
      issues,
      passed: score >= maxScore * 0.6,
      weight: 1.3,
    },
    recommendations,
  };
}

function checkKeywordOptimization(resumeData: ResumeDataForCheck) {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 0;
  const maxScore = 15;

  // Combine all text for analysis
  const allText = [
    resumeData.summary,
    ...resumeData.experience.map(e => `${e.title} ${e.company} ${e.description}`),
    ...resumeData.education.map(e => `${e.degree} ${e.school}`),
    resumeData.skills.join(" ")
  ].join(" ").toLowerCase();

  const wordCount = allText.split(/\s+/).filter(w => w.length > 2).length;

  // Action verb density (5 points)
  const actionVerbMatches = ACTION_VERBS.filter(verb => 
    new RegExp(`\\b${verb}\\w*\\b`, 'i').test(allText)
  );
  const actionVerbDensity = actionVerbMatches.length;

  if (actionVerbDensity >= 15) {
    score += 5;
  } else if (actionVerbDensity >= 10) {
    score += 4;
  } else if (actionVerbDensity >= 5) {
    score += 3;
    recommendations.push("Use more varied action verbs throughout your resume");
  } else {
    score += 1;
    issues.push("Insufficient action verbs for strong ATS performance");
    recommendations.push("Incorporate 15+ different action verbs across your resume");
  }

  // Keyword repetition check (5 points) - Key skills should appear 2-3 times
  const skillsLower = resumeData.skills.map(s => s.toLowerCase());
  let repeatedSkills = 0;
  
  skillsLower.forEach(skill => {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matches = allText.match(regex) || [];
    if (matches.length >= 2) {
      repeatedSkills++;
    }
  });

  const repetitionRatio = resumeData.skills.length > 0 ? repeatedSkills / resumeData.skills.length : 0;
  
  if (repetitionRatio >= 0.5) {
    score += 5;
  } else if (repetitionRatio >= 0.3) {
    score += 3;
    recommendations.push("Mention your top skills in both Skills section and Experience descriptions");
  } else {
    score += 1;
    issues.push("Skills aren't reinforced throughout the resume");
    recommendations.push("Integrate key skills into your experience descriptions for better ATS matching");
  }

  // Industry-specific keyword presence (5 points) - 2024-2025 business terminology
  const industryKeywords = /\b(project|team|client|customer|stakeholder|budget|deadline|process|system|strategy|implementation|development|analysis|report|presentation|training|performance|quality|compliance|innovation|optimization|efficiency|growth|revenue|cost|profit|ROI|OKR|KPI|metrics|pipeline|roadmap|sprint|backlog|milestone|deliverable|initiative|transformation|digital|automation|scalability|sustainability|agile|data[\s\-]?driven|user[\s\-]?centric|cross[\s\-]?functional)\b/gi;
  const industryMatches = allText.match(industryKeywords) || [];
  
  if (industryMatches.length >= 25) {
    score += 5;
  } else if (industryMatches.length >= 15) {
    score += 4;
  } else if (industryMatches.length >= 8) {
    score += 2;
    recommendations.push("Add more business/industry keywords (stakeholder, metrics, roadmap, etc.)");
  } else {
    score += 1;
    issues.push("Missing common professional keywords");
  }

  return {
    category: {
      name: "Keyword Optimization",
      score: Math.min(score, maxScore),
      maxScore,
      issues,
      passed: score >= maxScore * 0.6,
      weight: 1.4,
    },
    recommendations,
  };
}

function checkFormatting(resumeData: ResumeDataForCheck) {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 0;
  const maxScore = 15;

  const allText = JSON.stringify(resumeData);

  // Check for problematic characters (4 points)
  if (!PROBLEMATIC_CHARACTERS.test(allText)) {
    score += 4;
  } else {
    issues.push("Contains special characters that may break ATS parsing");
    recommendations.push("Remove decorative characters, symbols, and graphics");
    score += 1;
  }

  // Check for excessive punctuation (2 points)
  if (!EXCESSIVE_PUNCTUATION.test(allText)) {
    score += 2;
  } else {
    issues.push("Excessive punctuation detected");
    score += 1;
  }

  // Date consistency (3 points)
  const dates: string[] = [];
  resumeData.experience.forEach(exp => {
    if (exp.startDate) dates.push(exp.startDate);
    if (exp.endDate) dates.push(exp.endDate);
  });
  resumeData.education.forEach(edu => {
    if (edu.graduationDate) dates.push(edu.graduationDate);
  });

  if (dates.length > 1) {
    // Check format consistency
    const hasSlashes = dates.some(d => d.includes('/'));
    const hasDashes = dates.some(d => d.includes('-'));
    const hasTextMonths = dates.some(d => /[A-Za-z]/.test(d));
    
    const formatTypes = [hasSlashes, hasDashes, hasTextMonths].filter(Boolean).length;
    
    if (formatTypes <= 1) {
      score += 3;
    } else {
      score += 1;
      issues.push("Inconsistent date formats detected");
      recommendations.push("Use consistent date format (e.g., 'Jan 2020' or '01/2020' throughout)");
    }
  } else {
    score += 3;
  }

  // Content length check (3 points) - Industry standard: 400-800 words
  const wordCount = allText.split(/\s+/).filter(w => w.length > 2).length;
  
  if (wordCount >= 400 && wordCount <= 800) {
    score += 3;
  } else if (wordCount >= 300 && wordCount <= 1000) {
    score += 2;
    if (wordCount < 400) {
      issues.push("Resume content is thin - add more detail");
    } else {
      issues.push("Resume may be too lengthy");
    }
  } else if (wordCount >= 200) {
    score += 1;
    recommendations.push("Aim for 400-800 words of content for optimal ATS parsing");
  } else {
    issues.push("Resume needs significantly more content");
  }

  // Section completeness (3 points)
  const hasAllSections = 
    resumeData.personalInfo.fullName &&
    resumeData.summary &&
    resumeData.experience.length > 0 &&
    resumeData.education.length > 0 &&
    resumeData.skills.length > 0;

  if (hasAllSections) {
    score += 3;
  } else {
    score += 1;
    issues.push("Resume is missing standard sections");
    recommendations.push("Include all standard sections: Contact, Summary, Experience, Education, Skills");
  }

  return {
    category: {
      name: "ATS Formatting",
      score: Math.min(score, maxScore),
      maxScore,
      issues,
      passed: score >= maxScore * 0.6,
      weight: 1.0,
    },
    recommendations,
  };
}

function calculateKeywordDensity(resumeData: ResumeDataForCheck): number {
  const allText = [
    resumeData.summary,
    ...resumeData.experience.map(e => e.description),
    resumeData.skills.join(" ")
  ].join(" ").toLowerCase();

  const words = allText.split(/\s+/).filter(w => w.length > 3);
  const totalWords = words.length;
  
  if (totalWords === 0) return 0;

  // Count action verbs and key terms
  let keywordCount = 0;
  ACTION_VERBS.forEach(verb => {
    const regex = new RegExp(`\\b${verb}\\w*\\b`, 'gi');
    const matches = allText.match(regex) || [];
    keywordCount += matches.length;
  });

  return Math.round((keywordCount / totalWords) * 100);
}

function calculateReadabilityScore(resumeData: ResumeDataForCheck): number {
  const allText = [
    resumeData.summary,
    ...resumeData.experience.map(e => e.description)
  ].join(" ");

  const sentences = allText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = allText.split(/\s+/).filter(w => w.length > 0);
  
  if (sentences.length === 0 || words.length === 0) return 0;

  const avgWordsPerSentence = words.length / sentences.length;
  const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;

  // Simplified Flesch-based score (higher is better for resumes)
  // Optimal: 15-20 words per sentence, 5-7 chars per word
  let score = 100;
  
  if (avgWordsPerSentence > 25) score -= 20;
  else if (avgWordsPerSentence > 20) score -= 10;
  else if (avgWordsPerSentence < 8) score -= 15;
  
  if (avgWordLength > 8) score -= 15;
  else if (avgWordLength > 7) score -= 5;

  return Math.max(Math.min(score, 100), 0);
}

// Calculate STAR methodology adherence score
function calculateStarScore(resumeData: ResumeDataForCheck): number {
  const allDescriptions = resumeData.experience.map(e => e.description).join(" ");
  
  if (!allDescriptions || allDescriptions.length < 50) return 0;
  
  let starComponents = 0;
  
  // Check for each STAR component
  if (STAR_PATTERNS.situation.test(allDescriptions)) starComponents++;
  if (STAR_PATTERNS.task.test(allDescriptions)) starComponents++;
  if (STAR_PATTERNS.action.test(allDescriptions)) starComponents++;
  if (STAR_PATTERNS.result.test(allDescriptions)) starComponents++;
  
  // Score based on how many STAR components are present
  // Perfect STAR = 100, missing components reduce score
  return Math.round((starComponents / 4) * 100);
}

// Calculate high-impact achievement density
function calculateImpactScore(resumeData: ResumeDataForCheck): number {
  const allText = [
    resumeData.summary,
    ...resumeData.experience.map(e => e.description),
  ].join(" ");
  
  if (!allText || allText.length < 50) return 0;
  
  let impactCount = 0;
  let maxImpact = Object.keys(IMPACT_PATTERNS).length;
  
  // Check each impact pattern
  Object.values(IMPACT_PATTERNS).forEach(pattern => {
    if (pattern.test(allText)) {
      impactCount++;
    }
  });
  
  // Also count total quantifiable achievements
  const quantifiableMatches = allText.match(/\$[\d,]+[KMB]?|\d+%|\d+[xX]|\d+\s*(?:users?|customers?|people|members)/gi) || [];
  const quantifiableBonus = Math.min(quantifiableMatches.length * 5, 30);
  
  const baseScore = Math.round((impactCount / maxImpact) * 70);
  
  return Math.min(baseScore + quantifiableBonus, 100);
}

// Calculate industry-specific keyword match
function calculateIndustryMatch(resumeData: ResumeDataForCheck): IndustryMatch | null {
  const allText = [
    resumeData.summary,
    ...resumeData.experience.map(e => `${e.title} ${e.company} ${e.description}`),
    ...resumeData.education.map(e => `${e.degree} ${e.school}`),
    resumeData.skills.join(" "),
  ].join(" ").toLowerCase();
  
  if (allText.length < 50) return null;
  
  let bestMatch: IndustryMatch | null = null;
  let highestScore = 0;
  
  // Check each industry
  Object.entries(industryKeywords).forEach(([industry, keywords]) => {
    const matchedKeywords: string[] = [];
    const missingKeywords: string[] = [];
    
    keywords.forEach(keyword => {
      const normalizedKeyword = keyword.toLowerCase();
      if (allText.includes(normalizedKeyword)) {
        matchedKeywords.push(keyword);
      } else {
        missingKeywords.push(keyword);
      }
    });
    
    const matchPercentage = Math.round((matchedKeywords.length / keywords.length) * 100);
    
    if (matchPercentage > highestScore && matchedKeywords.length >= 3) {
      highestScore = matchPercentage;
      bestMatch = {
        industry,
        matchPercentage,
        matchedKeywords: matchedKeywords.slice(0, 10),
        missingKeywords: missingKeywords.slice(0, 8),
      };
    }
  });
  
  // Also check 2025 skill categories for tech-specific roles
  let techSkillMatches = 0;
  let techSkillTotal = 0;
  
  Object.entries(SKILL_CATEGORIES_2025).forEach(([category, skills]) => {
    skills.forEach(skill => {
      techSkillTotal++;
      if (allText.includes(skill.toLowerCase())) {
        techSkillMatches++;
      }
    });
  });
  
  // If tech skills dominate, boost tech industry match
  if (techSkillMatches >= 10 && bestMatch?.industry === "tech") {
    const techBonus = Math.min(Math.round((techSkillMatches / 20) * 20), 20);
    bestMatch.matchPercentage = Math.min(bestMatch.matchPercentage + techBonus, 100);
  }
  
  return bestMatch;
}

function prioritizeRecommendations(recommendations: string[], categories: ATSCategory[]): string[] {
  // Remove duplicates
  const unique = [...new Set(recommendations)];
  
  // Sort by category weight (higher weight = higher priority)
  const priorityKeywords: { [key: string]: number } = {
    "action verb": 5,
    "quantifiable": 5,
    "skill": 4,
    "keyword": 4,
    "experience": 4,
    "summary": 3,
    "metric": 3,
    "education": 2,
    "format": 2,
    "contact": 2,
  };

  return unique.sort((a, b) => {
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();
    
    let aPriority = 0;
    let bPriority = 0;
    
    Object.entries(priorityKeywords).forEach(([keyword, priority]) => {
      if (aLower.includes(keyword)) aPriority = Math.max(aPriority, priority);
      if (bLower.includes(keyword)) bPriority = Math.max(bPriority, priority);
    });
    
    return bPriority - aPriority;
  });
}

// Updated scales: Low 35-49, Moderate 50-69, High 70-85, Excellent 85+
// Use amber/blue for low scores, red only for critical blockers
export const getScoreColor = (score: number): string => {
  if (score >= 85) return "text-accent";
  if (score >= 70) return "text-emerald-500";
  if (score >= 50) return "text-amber-500";
  return "text-blue-500";
};

export const getScoreBgColor = (score: number): string => {
  if (score >= 85) return "bg-accent";
  if (score >= 70) return "bg-emerald-500";
  if (score >= 50) return "bg-amber-500";
  return "bg-blue-500";
};

export const getScoreLabel = (score: number): string => {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "High";
  if (score >= 50) return "Moderate";
  return "Low";
};

export const getPassProbabilityLabel = (score: number): string => {
  if (score >= 85) return "Outstanding! You're interview-ready 🎯";
  if (score >= 70) return "Great progress! Almost there ✨";
  if (score >= 50) return "Good start! A few tweaks will help";
  return "Let's build your success together 💪";
};
