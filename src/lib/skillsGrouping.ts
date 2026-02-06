// Skill categories and grouping utilities for ATS-optimized resume building

export interface SkillGroup {
  category: string;
  skills: string[];
  icon?: string;
}

export interface GroupedSkills {
  groups: SkillGroup[];
  ungrouped: string[];
}

// Standard skill categories recognized by ATS systems
export const SKILL_CATEGORIES = {
  programming: {
    name: "Programming Languages",
    keywords: [
      "javascript", "typescript", "python", "java", "c++", "c#", "ruby", "go", "golang",
      "rust", "swift", "kotlin", "php", "scala", "r", "matlab", "perl", "bash", "shell",
      "powershell", "sql", "html", "css", "sass", "less", "graphql", "solidity"
    ],
  },
  frameworks: {
    name: "Frameworks & Libraries",
    keywords: [
      "react", "reactjs", "react.js", "angular", "vue", "vuejs", "vue.js", "next.js", "nextjs",
      "nuxt", "svelte", "node", "nodejs", "node.js", "express", "expressjs", "django",
      "flask", "fastapi", "spring", "spring boot", "springboot", ".net", "dotnet", "asp.net",
      "rails", "ruby on rails", "laravel", "symfony", "nestjs", "gatsby", "remix",
      "tailwind", "tailwindcss", "bootstrap", "material-ui", "mui", "chakra", "antd",
      "jquery", "redux", "mobx", "zustand", "tanstack", "react query", "prisma", "sequelize",
      "mongoose", "typeorm", "hibernate", "pytorch", "tensorflow", "keras", "scikit-learn",
      "pandas", "numpy", "dbt", "spark", "hadoop"
    ],
  },
  cloud: {
    name: "Cloud & DevOps",
    keywords: [
      "aws", "amazon web services", "azure", "microsoft azure", "gcp", "google cloud",
      "google cloud platform", "docker", "kubernetes", "k8s", "terraform", "ansible",
      "jenkins", "gitlab ci", "github actions", "circleci", "travis ci", "ci/cd", "cicd",
      "devops", "linux", "ubuntu", "centos", "nginx", "apache", "cloudflare", "vercel",
      "netlify", "heroku", "digitalocean", "lambda", "serverless", "ec2", "s3", "rds",
      "cloudwatch", "cloudformation", "ecs", "eks", "fargate", "helm", "istio", "prometheus",
      "grafana", "datadog", "new relic", "splunk", "elk", "elasticsearch", "logstash", "kibana"
    ],
  },
  databases: {
    name: "Databases",
    keywords: [
      "postgresql", "postgres", "mysql", "mariadb", "sql server", "mssql", "oracle",
      "mongodb", "redis", "cassandra", "dynamodb", "firebase", "firestore", "supabase",
      "neo4j", "couchdb", "couchbase", "influxdb", "timescaledb", "sqlite", "snowflake",
      "bigquery", "redshift", "databricks", "dbt"
    ],
  },
  tools: {
    name: "Tools & Platforms",
    keywords: [
      "git", "github", "gitlab", "bitbucket", "jira", "confluence", "slack", "trello",
      "asana", "notion", "figma", "sketch", "adobe xd", "invision", "zeplin", "postman",
      "insomnia", "swagger", "openapi", "vscode", "visual studio", "intellij", "webstorm",
      "pycharm", "eclipse", "vim", "emacs", "npm", "yarn", "pnpm", "webpack", "vite",
      "rollup", "parcel", "babel", "eslint", "prettier", "storybook", "chromatic",
      "sentry", "amplitude", "mixpanel", "segment", "hotjar", "google analytics",
      "looker", "tableau", "power bi", "excel", "google sheets", "airtable", "zapier",
      "make", "retool", "appsmith", "salesforce", "hubspot", "zendesk", "intercom"
    ],
  },
  testing: {
    name: "Testing & QA",
    keywords: [
      "jest", "mocha", "chai", "jasmine", "cypress", "playwright", "selenium", "puppeteer",
      "testing library", "react testing library", "enzyme", "vitest", "pytest", "unittest",
      "junit", "testng", "rspec", "cucumber", "postman", "k6", "jmeter", "locust",
      "tdd", "bdd", "unit testing", "integration testing", "e2e testing", "qa", "quality assurance"
    ],
  },
  security: {
    name: "Security & Compliance",
    keywords: [
      "oauth", "oauth2", "jwt", "saml", "sso", "ldap", "active directory", "iam",
      "rbac", "encryption", "ssl", "tls", "https", "cors", "csrf", "xss", "sql injection",
      "penetration testing", "vulnerability assessment", "soc2", "soc 2", "hipaa",
      "gdpr", "pci", "pci-dss", "iso 27001", "nist", "owasp", "security+", "cissp",
      "cism", "ceh", "oscp", "firewall", "vpn", "waf", "siem"
    ],
  },
  data: {
    name: "Data & Analytics",
    keywords: [
      "data analysis", "data analytics", "data science", "machine learning", "ml",
      "deep learning", "ai", "artificial intelligence", "nlp", "natural language processing",
      "computer vision", "predictive modeling", "statistical analysis", "a/b testing",
      "etl", "data pipeline", "data warehouse", "data lake", "business intelligence", "bi",
      "data visualization", "data modeling", "feature engineering", "mlops", "llm",
      "generative ai", "genai", "chatgpt", "openai", "langchain", "rag", "vector database",
      "pinecone", "weaviate", "chromadb"
    ],
  },
  mobile: {
    name: "Mobile Development",
    keywords: [
      "ios", "android", "react native", "flutter", "xamarin", "cordova", "ionic",
      "swift", "swiftui", "objective-c", "kotlin", "java android", "xcode",
      "android studio", "mobile development", "app development", "testflight",
      "app store", "play store", "push notifications", "firebase", "expo"
    ],
  },
  methodologies: {
    name: "Methodologies",
    keywords: [
      "agile", "scrum", "kanban", "waterfall", "lean", "six sigma", "devops",
      "devsecops", "sre", "site reliability", "itil", "prince2", "pmp",
      "safe", "scaled agile", "xp", "extreme programming", "pair programming",
      "code review", "sprint planning", "retrospective", "standup", "okr", "kpi"
    ],
  },
  soft: {
    name: "Soft Skills",
    keywords: [
      "leadership", "team leadership", "management", "project management", "product management",
      "communication", "written communication", "verbal communication", "presentation",
      "public speaking", "negotiation", "conflict resolution", "problem solving",
      "critical thinking", "analytical thinking", "decision making", "time management",
      "organization", "prioritization", "multitasking", "attention to detail",
      "teamwork", "collaboration", "cross-functional", "stakeholder management",
      "mentoring", "coaching", "training", "customer service", "customer success",
      "relationship building", "networking", "adaptability", "flexibility", "creativity",
      "innovation", "strategic thinking", "strategic planning", "budgeting", "forecasting"
    ],
  },
  design: {
    name: "Design & UX",
    keywords: [
      "ui", "ux", "ui/ux", "user interface", "user experience", "product design",
      "interaction design", "visual design", "graphic design", "web design",
      "responsive design", "mobile design", "design systems", "wireframing",
      "prototyping", "user research", "usability testing", "accessibility", "a11y",
      "wcag", "figma", "sketch", "adobe xd", "invision", "principle", "framer",
      "photoshop", "illustrator", "after effects", "animation", "motion design"
    ],
  },
  finance: {
    name: "Finance & Business",
    keywords: [
      "financial analysis", "financial modeling", "valuation", "budgeting", "forecasting",
      "p&l", "profit and loss", "revenue", "cost analysis", "roi", "irr", "npv",
      "cash flow", "balance sheet", "income statement", "gaap", "ifrs", "sox",
      "audit", "tax", "accounting", "bookkeeping", "quickbooks", "sap", "oracle financials",
      "workday", "netsuite", "erp", "crm", "salesforce", "hubspot", "marketo",
      "business development", "sales", "account management", "client relations"
    ],
  },
  healthcare: {
    name: "Healthcare",
    keywords: [
      "hipaa", "ehr", "electronic health records", "emr", "epic", "cerner", "meditech",
      "hl7", "fhir", "icd-10", "cpt", "medical coding", "medical billing", "clinical",
      "patient care", "healthcare management", "pharmacy", "nursing", "telemedicine",
      "telehealth", "medical devices", "fda", "clinical trials", "regulatory affairs"
    ],
  },
};

// Normalize a skill for matching
const normalizeSkill = (skill: string): string => {
  return skill.toLowerCase().trim().replace(/[^\w\s+#.-]/g, "");
};

// Find the category for a skill
export const categorizeSkill = (skill: string): string | null => {
  const normalized = normalizeSkill(skill);
  
  for (const [categoryKey, category] of Object.entries(SKILL_CATEGORIES)) {
    if (category.keywords.some(keyword => {
      const normalizedKeyword = normalizeSkill(keyword);
      return normalized === normalizedKeyword || 
             normalized.includes(normalizedKeyword) ||
             normalizedKeyword.includes(normalized);
    })) {
      return category.name;
    }
  }
  
  return null;
};

// Group skills by category
export const groupSkills = (skills: string[]): GroupedSkills => {
  const groupMap = new Map<string, string[]>();
  const ungrouped: string[] = [];
  
  skills.forEach(skill => {
    const category = categorizeSkill(skill);
    if (category) {
      const existing = groupMap.get(category) || [];
      existing.push(skill);
      groupMap.set(category, existing);
    } else {
      ungrouped.push(skill);
    }
  });
  
  // Convert to array and sort by group size (largest first)
  const groups: SkillGroup[] = Array.from(groupMap.entries())
    .map(([category, skills]) => ({ category, skills }))
    .sort((a, b) => b.skills.length - a.skills.length);
  
  return { groups, ungrouped };
};

// Parse AI-generated grouped skills response
export const parseGroupedSkillsResponse = (response: string): GroupedSkills => {
  const groups: SkillGroup[] = [];
  const ungrouped: string[] = [];
  
  // Try to parse structured format: "CATEGORY: skill1, skill2, skill3"
  const lines = response.split(/\n|;/).map(l => l.trim()).filter(Boolean);
  
  lines.forEach(line => {
    // Match pattern like "Programming Languages: Python, JavaScript, TypeScript"
    const match = line.match(/^([^:]+):\s*(.+)$/);
    if (match) {
      const category = match[1].trim();
      const skills = match[2].split(/,/).map(s => s.trim()).filter(Boolean);
      if (skills.length > 0) {
        groups.push({ category, skills });
      }
    } else {
      // If no category pattern, add as comma-separated ungrouped skills
      const skills = line.split(/,/).map(s => s.trim()).filter(Boolean);
      ungrouped.push(...skills);
    }
  });
  
  return { groups, ungrouped };
};

// Flatten grouped skills back to a simple array
export const flattenGroupedSkills = (grouped: GroupedSkills): string[] => {
  const allSkills: string[] = [];
  grouped.groups.forEach(group => {
    allSkills.push(...group.skills);
  });
  allSkills.push(...grouped.ungrouped);
  return allSkills;
};

// Get suggested categories based on job description keywords
export const suggestCategories = (jobDescription: string): string[] => {
  const normalized = jobDescription.toLowerCase();
  const suggestedCategories: string[] = [];
  
  for (const [, category] of Object.entries(SKILL_CATEGORIES)) {
    const matchCount = category.keywords.filter(keyword => 
      normalized.includes(normalizeSkill(keyword))
    ).length;
    
    if (matchCount >= 2) {
      suggestedCategories.push(category.name);
    }
  }
  
  return suggestedCategories;
};

// Get category icons for UI display
export const getCategoryIcon = (categoryName: string): string => {
  const iconMap: Record<string, string> = {
    "Programming Languages": "code",
    "Frameworks & Libraries": "package",
    "Cloud & DevOps": "cloud",
    "Databases": "database",
    "Tools & Platforms": "wrench",
    "Testing & QA": "check-circle",
    "Security & Compliance": "shield",
    "Data & Analytics": "bar-chart",
    "Mobile Development": "smartphone",
    "Methodologies": "git-branch",
    "Soft Skills": "users",
    "Design & UX": "palette",
    "Finance & Business": "briefcase",
    "Healthcare": "heart",
  };
  
  return iconMap[categoryName] || "tag";
};
