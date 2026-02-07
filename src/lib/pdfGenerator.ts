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

// Template configurations - compact single-page layout
const templateConfigs = {
  classic: {
    colors: { 
      primary: "#1a365d", 
      secondary: "#2d3748", 
      accent: "#4a5568",
      sidebar: "#f1f5f9",
      sidebarText: "#1e293b",
      divider: "#94a3b8"
    },
    headerSize: 16,
    sectionSize: 9,
    bodySize: 8,
    smallSize: 7,
    sidebarWidth: 58,
  },
  modern: {
    colors: { 
      primary: "#1e40af", 
      secondary: "#374151", 
      accent: "#3b82f6",
      sidebar: "#1e3a8a",
      sidebarText: "#ffffff",
      divider: "#60a5fa"
    },
    headerSize: 16,
    sectionSize: 9,
    bodySize: 8,
    smallSize: 7,
    sidebarWidth: 58,
  },
  professional: {
    colors: { 
      primary: "#0f172a", 
      secondary: "#334155", 
      accent: "#475569",
      sidebar: "#1e293b",
      sidebarText: "#f8fafc",
      divider: "#64748b"
    },
    headerSize: 16,
    sectionSize: 9,
    bodySize: 8,
    smallSize: 7,
    sidebarWidth: 56,
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
    headerSize: 16,
    sectionSize: 9,
    bodySize: 8,
    smallSize: 7,
    sidebarWidth: 58,
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
    headerSize: 16,
    sectionSize: 9,
    bodySize: 8,
    smallSize: 7,
    sidebarWidth: 56,
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
    headerSize: 16,
    sectionSize: 9,
    bodySize: 8,
    smallSize: 7,
    sidebarWidth: 58,
  },
};

// Parse description into bullet points - limit to 3
const parseBulletPoints = (description: string, maxBullets: number = 3): string[] => {
  if (!description) return [];
  const lines = description
    .split(/(?:\r?\n|•|▪|◦|➤|→|►|■|□|●|○|-\s)/)
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .slice(0, maxBullets);
  return lines;
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
  const margin = 8;
  const sidebarWidth = config.sidebarWidth;
  const mainColumnX = sidebarWidth + 5;
  const mainColumnWidth = pageWidth - mainColumnX - margin;
  
  let mainYPos = 10;
  let sidebarYPos = 10;

  // Draw sidebar background
  doc.setFillColor(config.colors.sidebar);
  doc.rect(0, 0, sidebarWidth, pageHeight, "F");

  // Helper: Add wrapped text compactly
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number = 3.2): number => {
    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach((line: string, index: number) => {
      doc.text(line, x, y + (index * lineHeight));
    });
    return y + lines.length * lineHeight;
  };

  // Helper: Add section header
  const addSectionHeader = (title: string, x: number, y: number, width: number, isSidebar: boolean = false): number => {
    doc.setFontSize(config.sectionSize);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(isSidebar ? config.colors.sidebarText : config.colors.primary);
    doc.text(title.toUpperCase(), x, y);
    y += 1;
    doc.setDrawColor(isSidebar ? config.colors.divider : config.colors.primary);
    doc.setLineWidth(0.3);
    doc.line(x, y, x + width - 2, y);
    return y + 3.5;
  };

  // ========== SIDEBAR ==========
  
  // Name
  doc.setFontSize(config.headerSize);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(config.colors.sidebarText);
  const name = data.personalInfo.fullName || "Your Name";
  const nameLines = doc.splitTextToSize(name, sidebarWidth - 8);
  nameLines.forEach((line: string, i: number) => {
    doc.text(line, 5, sidebarYPos + (i * 5));
  });
  sidebarYPos += nameLines.length * 5 + 5;

  // Contact
  sidebarYPos = addSectionHeader("CONTACT", 5, sidebarYPos, sidebarWidth - 6, true);
  doc.setFontSize(config.smallSize);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(config.colors.sidebarText);
  
  const contactItems = [
    data.personalInfo.email,
    data.personalInfo.phone,
    data.personalInfo.location,
    data.personalInfo.linkedin,
    data.personalInfo.portfolio,
  ].filter(Boolean);

  contactItems.forEach(item => {
    const lines = doc.splitTextToSize(item, sidebarWidth - 8);
    lines.forEach((line: string) => {
      doc.text(line, 5, sidebarYPos);
      sidebarYPos += 3;
    });
  });
  sidebarYPos += 4;

  // Skills
  if (data.skills && data.skills.length > 0) {
    sidebarYPos = addSectionHeader("SKILLS", 5, sidebarYPos, sidebarWidth - 6, true);
    doc.setFontSize(config.smallSize);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(config.colors.sidebarText);
    
    // Display skills as compact list
    data.skills.slice(0, 12).forEach(skill => {
      const skillText = `• ${skill}`;
      const lines = doc.splitTextToSize(skillText, sidebarWidth - 8);
      lines.forEach((line: string) => {
        doc.text(line, 5, sidebarYPos);
        sidebarYPos += 2.8;
      });
    });
    sidebarYPos += 4;
  }

  // Education
  if (data.education && data.education.length > 0) {
    sidebarYPos = addSectionHeader("EDUCATION", 5, sidebarYPos, sidebarWidth - 6, true);
    
    data.education.slice(0, 2).forEach((edu) => {
      doc.setFontSize(config.smallSize);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(config.colors.sidebarText);
      
      const degreeLines = doc.splitTextToSize(edu.degree || "Degree", sidebarWidth - 8);
      degreeLines.forEach((line: string) => {
        doc.text(line, 5, sidebarYPos);
        sidebarYPos += 2.8;
      });
      
      doc.setFont("helvetica", "normal");
      const schoolLines = doc.splitTextToSize(edu.school || "School", sidebarWidth - 8);
      schoolLines.forEach((line: string) => {
        doc.text(line, 5, sidebarYPos);
        sidebarYPos += 2.8;
      });
      
      if (edu.graduationDate) {
        doc.text(formatDate(edu.graduationDate), 5, sidebarYPos);
        sidebarYPos += 2.8;
      }
      sidebarYPos += 2;
    });
  }

  // ========== MAIN COLUMN ==========

  // Summary
  if (data.summary && data.summary.trim()) {
    mainYPos = addSectionHeader("PROFESSIONAL SUMMARY", mainColumnX, mainYPos, mainColumnWidth);
    doc.setFontSize(config.bodySize);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(config.colors.secondary);
    // Truncate summary if too long
    const summaryText = data.summary.length > 400 ? data.summary.slice(0, 400) + "..." : data.summary;
    mainYPos = addWrappedText(summaryText, mainColumnX, mainYPos, mainColumnWidth, 3.2);
    mainYPos += 4;
  }

  // Experience
  if (data.experience && data.experience.length > 0) {
    mainYPos = addSectionHeader("WORK EXPERIENCE", mainColumnX, mainYPos, mainColumnWidth);

    // Limit to 3 experiences for single page
    data.experience.slice(0, 3).forEach((exp, index) => {
      // Job title
      doc.setFontSize(config.bodySize);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(config.colors.primary);
      doc.text(exp.title || "Job Title", mainColumnX, mainYPos);

      // Date
      const dateStr = `${formatDate(exp.startDate)} - ${exp.current ? "Present" : formatDate(exp.endDate)}`;
      doc.setFontSize(config.smallSize);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(config.colors.accent);
      doc.text(dateStr, pageWidth - margin, mainYPos, { align: "right" });
      mainYPos += 3;

      // Company
      doc.setFontSize(config.smallSize);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(config.colors.accent);
      const companyLine = [exp.company, exp.location].filter(Boolean).join(" | ");
      doc.text(companyLine || "Company", mainColumnX, mainYPos);
      mainYPos += 3.5;

      // Bullets - max 3 per job
      if (exp.description) {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(config.colors.secondary);
        doc.setFontSize(config.smallSize);
        const bullets = parseBulletPoints(exp.description, 3);

        bullets.forEach((bullet) => {
          const bulletText = `• ${bullet.length > 120 ? bullet.slice(0, 120) + "..." : bullet}`;
          const lines = doc.splitTextToSize(bulletText, mainColumnWidth - 2);
          lines.slice(0, 2).forEach((line: string) => {
            doc.text(line, mainColumnX, mainYPos);
            mainYPos += 2.8;
          });
        });
      }

      mainYPos += index < Math.min(data.experience.length, 3) - 1 ? 3 : 0;
    });
  }

  return doc;
};

export const downloadPDF = (data: ResumeData, templateId: string = "classic") => {
  const doc = generatePDF(data, templateId);
  const fileName = `${data.personalInfo.fullName || "resume"}_resume.pdf`.replace(/\s+/g, "_");
  doc.save(fileName);
};
