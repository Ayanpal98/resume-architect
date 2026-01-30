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

// ATS-friendly section headers - using standard naming conventions
const ATS_SECTIONS = {
  summary: "PROFESSIONAL SUMMARY",
  experience: "WORK EXPERIENCE", 
  education: "EDUCATION",
  skills: "SKILLS",
  certifications: "CERTIFICATIONS",
  projects: "PROJECTS",
};

// Template configurations optimized for ATS
const templateConfigs = {
  classic: {
    colors: { primary: "#1a365d", secondary: "#2d3748", accent: "#2d3748" },
    headerSize: 22,
    sectionSize: 11,
    bodySize: 10,
    lineSpacing: 1.4,
    useDividers: true,
    bulletStyle: "•",
  },
  modern: {
    colors: { primary: "#1e40af", secondary: "#374151", accent: "#1e40af" },
    headerSize: 24,
    sectionSize: 11,
    bodySize: 10,
    lineSpacing: 1.35,
    useDividers: false,
    bulletStyle: "▪",
  },
  minimal: {
    colors: { primary: "#111827", secondary: "#4b5563", accent: "#111827" },
    headerSize: 20,
    sectionSize: 10,
    bodySize: 9.5,
    lineSpacing: 1.3,
    useDividers: true,
    bulletStyle: "-",
  },
  executive: {
    colors: { primary: "#0f172a", secondary: "#334155", accent: "#0f172a" },
    headerSize: 24,
    sectionSize: 12,
    bodySize: 10.5,
    lineSpacing: 1.4,
    useDividers: true,
    bulletStyle: "•",
  },
  creative: {
    colors: { primary: "#7c3aed", secondary: "#4b5563", accent: "#7c3aed" },
    headerSize: 24,
    sectionSize: 11,
    bodySize: 10,
    lineSpacing: 1.35,
    useDividers: false,
    bulletStyle: "◦",
  },
  tech: {
    colors: { primary: "#059669", secondary: "#374151", accent: "#059669" },
    headerSize: 22,
    sectionSize: 11,
    bodySize: 10,
    lineSpacing: 1.35,
    useDividers: true,
    bulletStyle: ">",
  },
};

// Parse description into bullet points for ATS
const parseBulletPoints = (description: string): string[] => {
  if (!description) return [];
  
  // Split by common bullet patterns or newlines
  const lines = description
    .split(/(?:\r?\n|•|▪|◦|➤|→|►|■|□|●|○|-\s)/)
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
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
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let yPos = 18;

  // Helper function to add text with word wrap - ATS optimized
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number = 4.5): number => {
    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach((line: string, index: number) => {
      if (y + (index * lineHeight) > pageHeight - 15) {
        doc.addPage();
        y = 18;
      }
      doc.text(line, x, y + (index * lineHeight));
    });
    return y + lines.length * lineHeight;
  };

  // Helper to check and add new page if needed
  const checkNewPage = (requiredSpace: number): void => {
    if (yPos + requiredSpace > pageHeight - 15) {
      doc.addPage();
      yPos = 18;
    }
  };

  // Add section header - ATS optimized with consistent formatting
  const addSectionHeader = (title: string): void => {
    checkNewPage(15);
    yPos += 4;
    
    doc.setFontSize(config.sectionSize);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(config.colors.primary);
    doc.text(title.toUpperCase(), margin, yPos);
    
    if (config.useDividers) {
      yPos += 2;
      doc.setDrawColor(config.colors.primary);
      doc.setLineWidth(0.4);
      doc.line(margin, yPos, pageWidth - margin, yPos);
    }
    yPos += 5;
  };

  // ========== HEADER SECTION ==========
  // Name - large and prominent for ATS
  doc.setFontSize(config.headerSize);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(config.colors.primary);
  const name = data.personalInfo.fullName || "Your Name";
  doc.text(name, margin, yPos);
  yPos += 7;

  // Contact info - single line, pipe-separated (ATS-friendly format)
  doc.setFontSize(config.bodySize);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(config.colors.secondary);

  const contactParts = [
    data.personalInfo.email,
    data.personalInfo.phone,
    data.personalInfo.location,
  ].filter(Boolean);

  if (contactParts.length > 0) {
    doc.text(contactParts.join("  |  "), margin, yPos);
    yPos += 4.5;
  }

  // Links on separate line for better ATS parsing
  const linkParts = [
    data.personalInfo.linkedin,
    data.personalInfo.portfolio,
  ].filter(Boolean);
  
  if (linkParts.length > 0) {
    doc.setTextColor(config.colors.accent);
    doc.text(linkParts.join("  |  "), margin, yPos);
    yPos += 4;
  }

  // Header divider
  yPos += 2;
  doc.setDrawColor(config.colors.primary);
  doc.setLineWidth(0.6);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 6;

  // ========== PROFESSIONAL SUMMARY ==========
  if (data.summary && data.summary.trim()) {
    addSectionHeader(ATS_SECTIONS.summary);
    
    doc.setFontSize(config.bodySize);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(config.colors.secondary);
    yPos = addWrappedText(data.summary, margin, yPos, contentWidth, config.lineSpacing * 3.5);
    yPos += 3;
  }

  // ========== WORK EXPERIENCE ==========
  if (data.experience && data.experience.length > 0) {
    addSectionHeader(ATS_SECTIONS.experience);

    data.experience.forEach((exp, index) => {
      checkNewPage(25);

      // Job title - bold and prominent
      doc.setFontSize(config.bodySize + 0.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(config.colors.secondary);
      doc.text(exp.title || "Job Title", margin, yPos);

      // Date range - right aligned
      const dateStr = `${formatDate(exp.startDate)} - ${exp.current ? "Present" : formatDate(exp.endDate)}`;
      doc.setFontSize(config.bodySize);
      doc.setFont("helvetica", "normal");
      doc.text(dateStr, pageWidth - margin, yPos, { align: "right" });
      yPos += 4.5;

      // Company and location
      doc.setFont("helvetica", "normal");
      doc.setTextColor(config.colors.accent);
      const companyLine = [exp.company, exp.location].filter(Boolean).join(", ");
      doc.text(companyLine || "Company", margin, yPos);
      yPos += 5;

      // Description with bullet points - ATS optimized
      if (exp.description) {
        doc.setTextColor(config.colors.secondary);
        const bullets = parseBulletPoints(exp.description);
        
        if (bullets.length > 1) {
          // Multiple bullet points
          bullets.forEach((bullet) => {
            checkNewPage(8);
            const bulletText = `${config.bulletStyle}  ${bullet}`;
            const lines = doc.splitTextToSize(bulletText, contentWidth - 5);
            lines.forEach((line: string, lineIndex: number) => {
              doc.text(lineIndex === 0 ? line : `    ${line}`, margin, yPos);
              yPos += config.lineSpacing * 3.2;
            });
          });
        } else {
          // Single paragraph
          yPos = addWrappedText(exp.description, margin, yPos, contentWidth, config.lineSpacing * 3.2);
        }
      }
      
      yPos += index < data.experience.length - 1 ? 4 : 2;
    });
  }

  // ========== EDUCATION ==========
  if (data.education && data.education.length > 0) {
    addSectionHeader(ATS_SECTIONS.education);

    data.education.forEach((edu) => {
      checkNewPage(18);

      // Degree
      doc.setFontSize(config.bodySize + 0.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(config.colors.secondary);
      doc.text(edu.degree || "Degree", margin, yPos);

      // Graduation date
      if (edu.graduationDate) {
        doc.setFontSize(config.bodySize);
        doc.setFont("helvetica", "normal");
        doc.text(formatDate(edu.graduationDate), pageWidth - margin, yPos, { align: "right" });
      }
      yPos += 4.5;

      // School and location
      doc.setFontSize(config.bodySize);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(config.colors.accent);
      const schoolLine = [edu.school, edu.location].filter(Boolean).join(", ");
      doc.text(schoolLine || "School", margin, yPos);

      // GPA if present
      if (edu.gpa) {
        doc.setTextColor(config.colors.secondary);
        doc.text(`GPA: ${edu.gpa}`, pageWidth - margin, yPos, { align: "right" });
      }
      yPos += 6;
    });
  }

  // ========== SKILLS ==========
  // Skills section - formatted for optimal ATS keyword extraction
  if (data.skills && data.skills.length > 0) {
    addSectionHeader(ATS_SECTIONS.skills);

    doc.setFontSize(config.bodySize);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(config.colors.secondary);
    
    // Format skills with proper separators for ATS
    const skillsText = data.skills.join("  •  ");
    yPos = addWrappedText(skillsText, margin, yPos, contentWidth, config.lineSpacing * 3.2);
  }

  return doc;
};

export const downloadPDF = (data: ResumeData, templateId: string = "classic") => {
  const doc = generatePDF(data, templateId);
  const fileName = `${data.personalInfo.fullName || "resume"}_resume.pdf`.replace(/\s+/g, "_");
  doc.save(fileName);
};
