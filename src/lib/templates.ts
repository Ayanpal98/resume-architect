export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  industry?: string;
  keywords?: string[];
}

// Industry-specific keyword libraries for ATS optimization
export const industryKeywords = {
  tech: [
    "Agile", "Scrum", "CI/CD", "DevOps", "Cloud", "AWS", "Azure", "GCP", "Kubernetes", "Docker",
    "REST API", "GraphQL", "Microservices", "Machine Learning", "AI/ML", "LLM", "GenAI",
    "TypeScript", "Python", "React", "Node.js", "SQL", "NoSQL", "Git", "TDD", "System Design",
    "Scalability", "Performance Optimization", "Data Pipeline", "ETL", "Full-Stack"
  ],
  finance: [
    "Financial Analysis", "Risk Management", "Portfolio Management", "Due Diligence", "M&A",
    "Valuation", "DCF", "LBO", "Excel Modeling", "Bloomberg Terminal", "SQL", "Python",
    "Regulatory Compliance", "SOX", "GAAP", "IFRS", "Basel III", "AML/KYC", "P&L Management",
    "Forecasting", "Budgeting", "Variance Analysis", "Investment Banking", "Private Equity",
    "Asset Management", "Derivatives", "Fixed Income", "Equity Research", "CFA", "FRM"
  ],
  healthcare: [
    "HIPAA Compliance", "EHR/EMR", "Epic", "Cerner", "Clinical Operations", "Patient Care",
    "Quality Improvement", "Joint Commission", "CMS Regulations", "ICD-10", "CPT Coding",
    "Revenue Cycle", "Population Health", "Care Coordination", "Value-Based Care",
    "Clinical Research", "FDA Regulations", "GCP/GLP", "Pharmacovigilance", "Medical Affairs",
    "Healthcare Analytics", "Telehealth", "Patient Safety", "Nursing Leadership", "BLS/ACLS"
  ],
};

export const templates: ResumeTemplate[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Traditional format trusted by Fortune 500 companies and ATS systems worldwide",
    preview: "classic",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Clean contemporary layout optimized for tech, finance, and professional services",
    preview: "modern",
  },
  {
    id: "professional",
    name: "Professional",
    description: "Executive-level format ideal for senior roles and management positions",
    preview: "professional",
  },
  {
    id: "tech",
    name: "Tech & Engineering",
    description: "Optimized for software, data, DevOps, and technical roles with ATS-friendly keywords",
    preview: "tech",
    industry: "tech",
    keywords: industryKeywords.tech,
  },
  {
    id: "finance",
    name: "Finance & Banking",
    description: "Tailored for investment banking, asset management, and financial services roles",
    preview: "finance",
    industry: "finance",
    keywords: industryKeywords.finance,
  },
  {
    id: "healthcare",
    name: "Healthcare & Medical",
    description: "Designed for clinical, administrative, and healthcare management positions",
    preview: "healthcare",
    industry: "healthcare",
    keywords: industryKeywords.healthcare,
  },
];