import { ResumeData } from "./pdfGenerator";
import { templates, industryKeywords, ResumeTemplate } from "./templates";

export interface TemplateRecommendation {
  template: ResumeTemplate;
  matchScore: number;
  matchedKeywords: string[];
  reason: string;
}

// Additional context keywords for better industry detection
const industryContextKeywords = {
  tech: [
    "software", "developer", "engineer", "programming", "code", "coding", "technical",
    "database", "frontend", "backend", "full-stack", "fullstack", "web", "mobile", "app",
    "startup", "saas", "platform", "infrastructure", "architecture", "devops", "sre",
    "data science", "analytics", "machine learning", "artificial intelligence", "blockchain",
    "cybersecurity", "security", "network", "systems", "linux", "unix", "windows server"
  ],
  finance: [
    "bank", "banking", "investment", "trading", "capital", "asset", "portfolio",
    "financial", "finance", "accounting", "accountant", "cpa", "audit", "auditor",
    "analyst", "advisory", "consulting", "wealth", "hedge fund", "private equity",
    "venture capital", "vc", "equity", "credit", "risk", "compliance", "treasury",
    "fintech", "insurance", "actuary", "tax", "budget", "revenue", "profit"
  ],
  healthcare: [
    "hospital", "clinic", "medical", "medicine", "physician", "doctor", "nurse", "nursing",
    "patient", "clinical", "health", "healthcare", "pharma", "pharmaceutical", "biotech",
    "biotechnology", "life sciences", "lab", "laboratory", "diagnostic", "therapeutic",
    "surgical", "surgery", "treatment", "therapy", "care", "wellness", "mental health",
    "dental", "radiology", "oncology", "cardiology", "pediatric", "emergency", "icu"
  ],
};

// Job titles strongly associated with each industry
const industryJobTitles = {
  tech: [
    "software engineer", "developer", "programmer", "data scientist", "data analyst",
    "product manager", "ux designer", "ui designer", "devops engineer", "sre",
    "qa engineer", "test engineer", "solutions architect", "cloud engineer",
    "machine learning engineer", "ai engineer", "security engineer", "it manager",
    "scrum master", "tech lead", "engineering manager", "cto", "vp engineering"
  ],
  finance: [
    "financial analyst", "investment banker", "portfolio manager", "trader",
    "risk analyst", "credit analyst", "accountant", "auditor", "controller",
    "cfo", "finance manager", "wealth advisor", "financial planner", "actuary",
    "compliance officer", "underwriter", "loan officer", "tax manager",
    "treasury analyst", "fp&a analyst", "equity analyst", "research analyst"
  ],
  healthcare: [
    "registered nurse", "nurse practitioner", "physician", "doctor", "surgeon",
    "medical assistant", "clinical manager", "healthcare administrator", "pharmacist",
    "physical therapist", "occupational therapist", "radiologist", "lab technician",
    "medical director", "chief nursing officer", "patient care coordinator",
    "health information manager", "clinical research coordinator", "medical coder"
  ],
};

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function getResumeText(data: ResumeData): string {
  const parts: string[] = [];
  
  // Personal info
  if (data.personalInfo.fullName) parts.push(data.personalInfo.fullName);
  
  // Summary
  if (data.summary) parts.push(data.summary);
  
  // Experience
  data.experience.forEach(exp => {
    if (exp.title) parts.push(exp.title);
    if (exp.company) parts.push(exp.company);
    if (exp.description) parts.push(exp.description);
  });
  
  // Education
  data.education.forEach(edu => {
    if (edu.degree) parts.push(edu.degree);
    if (edu.school) parts.push(edu.school);
  });
  
  // Skills
  parts.push(...data.skills);
  
  return normalizeText(parts.join(" "));
}

function calculateIndustryScore(
  resumeText: string, 
  industry: keyof typeof industryKeywords
): { score: number; matchedKeywords: string[] } {
  const keywords = industryKeywords[industry];
  const contextWords = industryContextKeywords[industry];
  const jobTitles = industryJobTitles[industry];
  
  const matchedKeywords: string[] = [];
  let score = 0;
  
  // Check primary keywords (high weight)
  keywords.forEach(keyword => {
    const normalizedKeyword = normalizeText(keyword);
    if (resumeText.includes(normalizedKeyword)) {
      score += 3;
      matchedKeywords.push(keyword);
    }
  });
  
  // Check context keywords (medium weight)
  contextWords.forEach(keyword => {
    const normalizedKeyword = normalizeText(keyword);
    if (resumeText.includes(normalizedKeyword)) {
      score += 2;
      if (!matchedKeywords.includes(keyword)) {
        matchedKeywords.push(keyword);
      }
    }
  });
  
  // Check job titles (highest weight)
  jobTitles.forEach(title => {
    const normalizedTitle = normalizeText(title);
    if (resumeText.includes(normalizedTitle)) {
      score += 5;
      if (!matchedKeywords.includes(title)) {
        matchedKeywords.push(title);
      }
    }
  });
  
  return { score, matchedKeywords };
}

function generateReason(
  industry: string, 
  matchedKeywords: string[], 
  matchScore: number
): string {
  const industryNames: Record<string, string> = {
    tech: "Tech & Engineering",
    finance: "Finance & Banking",
    healthcare: "Healthcare & Medical",
  };
  
  if (matchScore > 30) {
    return `Strong match! Found ${matchedKeywords.length} ${industryNames[industry]} keywords including: ${matchedKeywords.slice(0, 3).join(", ")}.`;
  } else if (matchScore > 15) {
    return `Good match. Detected ${industryNames[industry]} focus with keywords like: ${matchedKeywords.slice(0, 3).join(", ")}.`;
  } else if (matchScore > 5) {
    return `Moderate match. Some ${industryNames[industry]} elements detected.`;
  }
  return `Limited industry-specific content detected.`;
}

export function recommendTemplates(data: ResumeData): TemplateRecommendation[] {
  const resumeText = getResumeText(data);
  
  if (resumeText.length < 20) {
    // Not enough content to analyze - return general templates
    return templates
      .filter(t => !t.industry)
      .map(template => ({
        template,
        matchScore: 0,
        matchedKeywords: [],
        reason: "Add more content for personalized recommendations.",
      }));
  }
  
  const recommendations: TemplateRecommendation[] = [];
  
  // Analyze industry-specific templates
  const industryTemplates = templates.filter(t => t.industry);
  
  industryTemplates.forEach(template => {
    if (!template.industry) return;
    
    const { score, matchedKeywords } = calculateIndustryScore(
      resumeText, 
      template.industry as keyof typeof industryKeywords
    );
    
    recommendations.push({
      template,
      matchScore: score,
      matchedKeywords: matchedKeywords.slice(0, 10),
      reason: generateReason(template.industry, matchedKeywords, score),
    });
  });
  
  // Sort by match score
  recommendations.sort((a, b) => b.matchScore - a.matchScore);
  
  // Add general templates at the end if no strong industry match
  const generalTemplates = templates.filter(t => !t.industry);
  const topScore = recommendations[0]?.matchScore || 0;
  
  if (topScore < 10) {
    // Weak industry match - recommend general templates first
    const generalRecs = generalTemplates.map(template => ({
      template,
      matchScore: 5, // Default score for general
      matchedKeywords: [],
      reason: "Universal format suitable for most industries and roles.",
    }));
    return [...generalRecs, ...recommendations];
  }
  
  // Add general templates as alternatives
  generalTemplates.forEach(template => {
    recommendations.push({
      template,
      matchScore: 0,
      matchedKeywords: [],
      reason: "Classic format works well across all industries.",
    });
  });
  
  return recommendations;
}

export function getTopRecommendation(data: ResumeData): TemplateRecommendation | null {
  const recommendations = recommendTemplates(data);
  return recommendations.length > 0 ? recommendations[0] : null;
}
