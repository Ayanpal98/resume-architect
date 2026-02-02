export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
}

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
];