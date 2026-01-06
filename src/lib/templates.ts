export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  isPremium: boolean;
}

export const templates: ResumeTemplate[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Clean and professional template, perfect for traditional industries",
    preview: "classic",
    isPremium: false,
  },
  {
    id: "modern",
    name: "Modern",
    description: "Contemporary design with a sleek layout for tech and creative roles",
    preview: "modern",
    isPremium: false,
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Simple and elegant with maximum readability",
    preview: "minimal",
    isPremium: false,
  },
  {
    id: "executive",
    name: "Executive",
    description: "Sophisticated design for senior-level positions",
    preview: "executive",
    isPremium: true,
  },
  {
    id: "creative",
    name: "Creative",
    description: "Stand out with a unique layout for design and marketing roles",
    preview: "creative",
    isPremium: true,
  },
  {
    id: "tech",
    name: "Tech Pro",
    description: "Optimized for software developers and IT professionals",
    preview: "tech",
    isPremium: true,
  },
];
