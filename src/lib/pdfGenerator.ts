import jsPDF from "jspdf";

export interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    portfolio: string;
  };
  summary: string;
  experience: {
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }[];
  education: {
    id: string;
    degree: string;
    school: string;
    location: string;
    graduationDate: string;
    gpa: string;
  }[];
  skills: string[];
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr + "-01");
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

// ATS-friendly section headers
const ATS_SECTIONS = {
  summary: "PROFESSIONAL SUMMARY",
  experience: "WORK EXPERIENCE",
  education: "EDUCATION",
  skills: "SKILLS & EXPERTISE",
  contact: "CONTACT",
};

// Template configurations for two-column layout
const templateConfigs = {
  classic: {
    colors: { 
      primary: "#1a365d", 
      secondary: "#2d3748", 
      accent: "#4a5568",
      sidebar: "#f7fafc",
      sidebarText: "#1a365d",
      divider: "#cbd5e0"
    },
    headerSize: 20,
    sectionSize: 10,
    bodySize: 9,
    lineSpacing: 1.3,
    bulletStyle: "•",
    sidebarWidth: 65,
  },
  modern: {
    colors: { 
      primary: "#1e40af", 
      secondary: "#374151", 
      accent: "#3b82f6",
      sidebar: "#1e40af",
      sidebarText: "#ffffff",
      divider: "#60a5fa"
    },
    headerSize: 22,
    sectionSize: 10,
    bodySize: 9,
    lineSpacing: 1.3,
    bulletStyle: "▸",
    sidebarWidth: 65,
  },
  professional: {
    colors: { 
      primary: "#0f172a", 
      secondary: "#334155", 
      accent: "#475569",
      sidebar: "#0f172a",
      sidebarText: "#f8fafc",
      divider: "#64748b"
    },
    headerSize: 20,
    sectionSize: 10,
    bodySize: 9,
    lineSpacing: 1.35,
    bulletStyle: "•",
    sidebarWidth: 62,
  },
  tech: {
    colors: { 
      primary: "#0e7490", 
      secondary: "#334155", 
      accent: "#06b6d4",
      sidebar: "#164e63",
      sidebarText: "#ecfeff",
      divider: "#22d3ee"
    },
    headerSize: 22,
    sectionSize: 10,
    bodySize: 9,
    lineSpacing: 1.3,
    bulletStyle: "▸",
    sidebarWidth: 65,
  },
  finance: {
    colors: { 
      primary: "#065f46", 
      secondary: "#1f2937", 
      accent: "#059669",
      sidebar: "#064e3b",
      sidebarText: "#ecfdf5",
      divider: "#34d399"
    },
    headerSize: 20,
    sectionSize: 10,
    bodySize: 9,
    lineSpacing: 1.35,
    bulletStyle: "•",
    sidebarWidth: 62,
  },
  healthcare: {
    colors: { 
      primary: "#0369a1", 
      secondary: "#374151", 
      accent: "#0284c7",
      sidebar: "#075985",
      sidebarText: "#f0f9ff",
      divider: "#38bdf8"
    },
    headerSize: 20,
    sectionSize: 10,
    bodySize: 9,
    lineSpacing: 1.35,
    bulletStyle: "•",
    sidebarWidth: 65,
  },
};

// Parse description into bullet points
const parseBulletPoints = (description: string): string[] => {
  if (!description) return [];
  const lines = description
    .split(/(?:\r?\n|•|▪|◦|➤|→|►|■|□|●|○|-\s)/)
    .map(line => line.trim())
    .filter(line => line.length > 0);
  return lines;
};

// Group skills into categories
const groupSkills = (skills: string[]): Record<string, string[]> => {
  const categories: Record<string, string[]> = {
    "Technical Skills": [],
    "Soft Skills": [],
    "Tools & Platforms": [],
    "Other": [],
  };
  
  const technicalKeywords = ["javascript", "typescript", "python", "java", "react", "node", "sql", "aws", "azure", "docker", "kubernetes", "git", "api", "html", "css", "c++", "c#", "ruby", "go", "rust", "swift", "kotlin", "php", "scala", "r", "matlab", "linux", "devops", "ci/cd", "agile", "scrum"];
  const softSkillKeywords = ["leadership", "communication", "teamwork", "problem-solving", "analytical", "creative", "time management", "collaboration", "presentation", "negotiation", "mentoring", "strategic", "decision-making"];
  const toolKeywords = ["excel", "powerpoint", "word", "jira", "confluence", "slack", "salesforce", "tableau", "power bi", "figma", "adobe", "photoshop", "trello", "notion", "asana", "github", "gitlab", "vs code", "intellij", "postman", "jenkins", "terraform"];

  skills.forEach(skill => {
    const lowerSkill = skill.toLowerCase();
    if (technicalKeywords.some(kw => lowerSkill.includes(kw))) {
      categories["Technical Skills"].push(skill);
    } else if (softSkillKeywords.some(kw => lowerSkill.includes(kw))) {
      categories["Soft Skills"].push(skill);
    } else if (toolKeywords.some(kw => lowerSkill.includes(kw))) {
      categories["Tools & Platforms"].push(skill);
    } else {
      categories["Other"].push(skill);
    }
  });

  // Remove empty categories
  Object.keys(categories).forEach(key => {
    if (categories[key].length === 0) delete categories[key];
  });

  return categories;
};

export const generatePDF = (data: ResumeData, templateId: string = "classic"): jsPDF => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const config = templateConfigs[templateId as keyof typeof templateConfigs] || templateConfigs.classic;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const sidebarWidth = config.sidebarWidth;
  const mainColumnX = sidebarWidth + 8;
  const mainColumnWidth = pageWidth - mainColumnX - margin;
  
  let mainYPos = 18;
  let sidebarYPos = 18;

  // Draw sidebar background
  const drawSidebarBackground = () => {
    doc.setFillColor(config.colors.sidebar);
    doc.rect(0, 0, sidebarWidth, pageHeight, "F");
  };

  drawSidebarBackground();

  // Helper: Add wrapped text
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number = 4): number => {
    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach((line: string, index: number) => {
      if (y + (index * lineHeight) > pageHeight - 12) {
        doc.addPage();
        drawSidebarBackground();
        y = 18;
      }
      doc.text(line, x, y + (index * lineHeight));
    });
    return y + lines.length * lineHeight;
  };

  // Helper: Check new page for main column
  const checkMainNewPage = (requiredSpace: number): void => {
    if (mainYPos + requiredSpace > pageHeight - 12) {
      doc.addPage();
      drawSidebarBackground();
      mainYPos = 18;
    }
  };

  // Helper: Add section header with underline
  const addSectionHeader = (title: string, x: number, y: number, width: number, isSidebar: boolean = false): number => {
    doc.setFontSize(config.sectionSize);
    doc.setFont("helvetica", "bold");
    
    if (isSidebar) {
      doc.setTextColor(config.colors.sidebarText);
    } else {
      doc.setTextColor(config.colors.primary);
    }
    
    doc.text(title.toUpperCase(), x, y);
    
    // Draw underline
    y += 1.5;
    doc.setDrawColor(isSidebar ? config.colors.divider : config.colors.primary);
    doc.setLineWidth(0.4);
    doc.line(x, y, x + width - 4, y);
    
    return y + 5;
  };

  // ========== SIDEBAR CONTENT ==========
  
  // Name in sidebar header
  doc.setFontSize(config.headerSize);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(config.colors.sidebarText);
  
  const name = data.personalInfo.fullName || "Your Name";
  const nameLines = doc.splitTextToSize(name, sidebarWidth - 12);
  nameLines.forEach((line: string, i: number) => {
    doc.text(line, 8, sidebarYPos + (i * 7));
  });
  sidebarYPos += nameLines.length * 7 + 8;

  // Contact section
  sidebarYPos = addSectionHeader(ATS_SECTIONS.contact, 8, sidebarYPos, sidebarWidth - 8, true);
  
  doc.setFontSize(config.bodySize);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(config.colors.sidebarText);
  
  const contactItems = [
    { icon: "✉", value: data.personalInfo.email },
    { icon: "📱", value: data.personalInfo.phone },
    { icon: "📍", value: data.personalInfo.location },
    { icon: "🔗", value: data.personalInfo.linkedin },
    { icon: "🌐", value: data.personalInfo.portfolio },
  ].filter(item => item.value);

  contactItems.forEach(item => {
    doc.text(`${item.icon}  ${item.value}`, 8, sidebarYPos);
    sidebarYPos += 5;
  });
  
  sidebarYPos += 6;

  // Skills section in sidebar
  if (data.skills && data.skills.length > 0) {
    sidebarYPos = addSectionHeader(ATS_SECTIONS.skills, 8, sidebarYPos, sidebarWidth - 8, true);
    
    const groupedSkills = groupSkills(data.skills);
    
    Object.entries(groupedSkills).forEach(([category, skills]) => {
      // Category name
      doc.setFontSize(config.bodySize - 0.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(config.colors.divider);
      doc.text(category, 8, sidebarYPos);
      sidebarYPos += 4;
      
      // Skills as bullet points or wrapped text
      doc.setFont("helvetica", "normal");
      doc.setTextColor(config.colors.sidebarText);
      doc.setFontSize(config.bodySize - 1);
      
      skills.forEach(skill => {
        const skillText = `${config.bulletStyle} ${skill}`;
        const skillLines = doc.splitTextToSize(skillText, sidebarWidth - 14);
        skillLines.forEach((line: string, i: number) => {
          if (sidebarYPos > pageHeight - 12) {
            doc.addPage();
            drawSidebarBackground();
            sidebarYPos = 18;
          }
          doc.text(line, 8, sidebarYPos);
          sidebarYPos += 3.5;
        });
      });
      
      sidebarYPos += 3;
    });
  }

  // Education in sidebar
  if (data.education && data.education.length > 0) {
    sidebarYPos += 3;
    sidebarYPos = addSectionHeader(ATS_SECTIONS.education, 8, sidebarYPos, sidebarWidth - 8, true);
    
    data.education.forEach((edu) => {
      if (sidebarYPos > pageHeight - 25) {
        doc.addPage();
        drawSidebarBackground();
        sidebarYPos = 18;
      }
      
      // Degree
      doc.setFontSize(config.bodySize);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(config.colors.sidebarText);
      const degreeLines = doc.splitTextToSize(edu.degree || "Degree", sidebarWidth - 14);
      degreeLines.forEach((line: string, i: number) => {
        doc.text(line, 8, sidebarYPos);
        sidebarYPos += 4;
      });
      
      // School
      doc.setFont("helvetica", "normal");
      doc.setFontSize(config.bodySize - 1);
      const schoolLines = doc.splitTextToSize(edu.school || "School", sidebarWidth - 14);
      schoolLines.forEach((line: string, i: number) => {
        doc.text(line, 8, sidebarYPos);
        sidebarYPos += 3.5;
      });
      
      // Date and GPA
      if (edu.graduationDate) {
        doc.text(formatDate(edu.graduationDate), 8, sidebarYPos);
        sidebarYPos += 3.5;
      }
      if (edu.gpa) {
        doc.text(`GPA: ${edu.gpa}`, 8, sidebarYPos);
        sidebarYPos += 3.5;
      }
      
      sidebarYPos += 4;
    });
  }

  // ========== MAIN COLUMN CONTENT ==========

  // Professional Summary
  if (data.summary && data.summary.trim()) {
    mainYPos = addSectionHeader(ATS_SECTIONS.summary, mainColumnX, mainYPos, mainColumnWidth);
    
    doc.setFontSize(config.bodySize);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(config.colors.secondary);
    mainYPos = addWrappedText(data.summary, mainColumnX, mainYPos, mainColumnWidth, config.lineSpacing * 3.2);
    mainYPos += 6;
  }

  // Work Experience
  if (data.experience && data.experience.length > 0) {
    mainYPos = addSectionHeader(ATS_SECTIONS.experience, mainColumnX, mainYPos, mainColumnWidth);

    data.experience.forEach((exp, index) => {
      checkMainNewPage(25);

      // Job title
      doc.setFontSize(config.bodySize + 0.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(config.colors.primary);
      doc.text(exp.title || "Job Title", mainColumnX, mainYPos);

      // Date range - right aligned
      const dateStr = `${formatDate(exp.startDate)} - ${exp.current ? "Present" : formatDate(exp.endDate)}`;
      doc.setFontSize(config.bodySize - 0.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(config.colors.accent);
      doc.text(dateStr, pageWidth - margin, mainYPos, { align: "right" });
      mainYPos += 4;

      // Company and location
      doc.setFontSize(config.bodySize);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(config.colors.accent);
      const companyLine = [exp.company, exp.location].filter(Boolean).join(" | ");
      doc.text(companyLine || "Company", mainColumnX, mainYPos);
      mainYPos += 5;

      // Description with bullets
      if (exp.description) {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(config.colors.secondary);
        const bullets = parseBulletPoints(exp.description);

        if (bullets.length > 1) {
          bullets.forEach((bullet) => {
            checkMainNewPage(8);
            const bulletText = `${config.bulletStyle}  ${bullet}`;
            const lines = doc.splitTextToSize(bulletText, mainColumnWidth - 4);
            lines.forEach((line: string, lineIndex: number) => {
              doc.text(lineIndex === 0 ? line : `    ${line}`, mainColumnX, mainYPos);
              mainYPos += config.lineSpacing * 3;
            });
          });
        } else {
          mainYPos = addWrappedText(exp.description, mainColumnX, mainYPos, mainColumnWidth, config.lineSpacing * 3);
        }
      }

      mainYPos += index < data.experience.length - 1 ? 5 : 2;
    });
  }

  return doc;
};

export const downloadPDF = (data: ResumeData, templateId: string = "classic") => {
  const doc = generatePDF(data, templateId);
  const fileName = `${data.personalInfo.fullName || "resume"}_resume.pdf`.replace(/\s+/g, "_");
  doc.save(fileName);
};
