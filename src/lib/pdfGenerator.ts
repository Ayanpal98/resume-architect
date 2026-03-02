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
  projects?: {
    id: string;
    name: string;
    description: string;
    tools: string;
  }[];
  certifications?: string[];
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr + "-01");
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

// Template color configurations
const templateConfigs = {
  classic: {
    colors: { primary: "#1a365d", secondary: "#2d3748", accent: "#4a5568", divider: "#1a365d" },
    headerSize: 18,
    sectionSize: 11,
    bodySize: 10,
    smallSize: 9,
  },
  modern: {
    colors: { primary: "#1e40af", secondary: "#374151", accent: "#3b82f6", divider: "#1e40af" },
    headerSize: 18,
    sectionSize: 11,
    bodySize: 10,
    smallSize: 9,
  },
  professional: {
    colors: { primary: "#0f172a", secondary: "#334155", accent: "#475569", divider: "#0f172a" },
    headerSize: 18,
    sectionSize: 11,
    bodySize: 10,
    smallSize: 9,
  },
  tech: {
    colors: { primary: "#0e7490", secondary: "#334155", accent: "#06b6d4", divider: "#0e7490" },
    headerSize: 18,
    sectionSize: 11,
    bodySize: 10,
    smallSize: 9,
  },
  finance: {
    colors: { primary: "#065f46", secondary: "#1f2937", accent: "#059669", divider: "#065f46" },
    headerSize: 18,
    sectionSize: 11,
    bodySize: 10,
    smallSize: 9,
  },
  healthcare: {
    colors: { primary: "#0369a1", secondary: "#374151", accent: "#0284c7", divider: "#0369a1" },
    headerSize: 18,
    sectionSize: 11,
    bodySize: 10,
    smallSize: 9,
  },
};

// Parse description into bullet points — NO limits
const parseBulletPoints = (description: string): string[] => {
  if (!description) return [];
  return description
    .split(/(?:\r?\n|•|▪|◦|➤|→|►|■|□|●|○|-\s)/)
    .map(line => line.trim())
    .filter(line => line.length > 0);
};

export const generatePDF = (data: ResumeData, templateId: string = "classic"): jsPDF => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const config = templateConfigs[templateId as keyof typeof templateConfigs] || templateConfigs.classic;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginLeft = 15;
  const marginRight = 15;
  const contentWidth = pageWidth - marginLeft - marginRight;
  const bottomMargin = 15;

  let yPos = 15;

  // Helper: check page break and add new page if needed
  const checkPage = (needed: number) => {
    if (yPos + needed > pageHeight - bottomMargin) {
      doc.addPage();
      yPos = 15;
    }
  };

  // Helper: wrapped text, returns new yPos
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number = 4.5): number => {
    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach((line: string, i: number) => {
      checkPage(lineHeight);
      doc.text(line, x, yPos);
      yPos += lineHeight;
    });
    return yPos;
  };

  // Helper: section header with underline
  const addSectionHeader = (title: string) => {
    checkPage(10);
    yPos += 3;
    doc.setFontSize(config.sectionSize);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(config.colors.primary);
    doc.text(title.toUpperCase(), marginLeft, yPos);
    yPos += 1.5;
    doc.setDrawColor(config.colors.divider);
    doc.setLineWidth(0.5);
    doc.line(marginLeft, yPos, pageWidth - marginRight, yPos);
    yPos += 4;
  };

  // ========== NAME (centered) ==========
  doc.setFontSize(config.headerSize);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(config.colors.primary);
  const name = data.personalInfo.fullName || "Your Name";
  doc.text(name, pageWidth / 2, yPos, { align: "center" });
  yPos += 6;

  // ========== CONTACT LINE (centered) ==========
  const contactParts = [
    data.personalInfo.phone,
    data.personalInfo.email,
    data.personalInfo.location,
    data.personalInfo.linkedin,
    data.personalInfo.portfolio,
  ].filter(Boolean);

  if (contactParts.length > 0) {
    doc.setFontSize(config.smallSize);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(config.colors.secondary);
    const contactLine = contactParts.join("  |  ");
    const contactLines = doc.splitTextToSize(contactLine, contentWidth);
    contactLines.forEach((line: string) => {
      doc.text(line, pageWidth / 2, yPos, { align: "center" });
      yPos += 4;
    });
  }
  yPos += 2;

  // ========== PROFESSIONAL SUMMARY ==========
  if (data.summary && data.summary.trim()) {
    addSectionHeader("PROFESSIONAL SUMMARY");
    doc.setFontSize(config.bodySize);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(config.colors.secondary);
    addWrappedText(data.summary, marginLeft, yPos, contentWidth);
    yPos += 2;
  }

  // ========== CORE SKILLS ==========
  if (data.skills && data.skills.length > 0) {
    addSectionHeader("CORE SKILLS");
    doc.setFontSize(config.bodySize);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(config.colors.secondary);

    // Display skills as comma-separated keywords for ATS
    const skillsText = data.skills.join("  •  ");
    addWrappedText(skillsText, marginLeft, yPos, contentWidth);
    yPos += 2;
  }

  // ========== WORK EXPERIENCE ==========
  if (data.experience && data.experience.length > 0) {
    addSectionHeader("WORK EXPERIENCE");

    data.experience.forEach((exp, index) => {
      checkPage(12);

      // Role – Company – Date on one line
      doc.setFontSize(config.bodySize);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(config.colors.primary);
      const rolePart = exp.title || "Role";
      const companyPart = [exp.company, exp.location].filter(Boolean).join(", ");
      doc.text(rolePart, marginLeft, yPos);

      const dateStr = `${formatDate(exp.startDate)} – ${exp.current ? "Present" : formatDate(exp.endDate)}`;
      doc.setFontSize(config.smallSize);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(config.colors.accent);
      doc.text(dateStr, pageWidth - marginRight, yPos, { align: "right" });
      yPos += 4.5;

      // Company line
      if (companyPart) {
        doc.setFontSize(config.smallSize);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(config.colors.accent);
        doc.text(companyPart, marginLeft, yPos);
        yPos += 4.5;
      }

      // Bullet points — NO limits on count or length
      if (exp.description) {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(config.colors.secondary);
        doc.setFontSize(config.smallSize);
        const bullets = parseBulletPoints(exp.description);

        bullets.forEach((bullet) => {
          const bulletText = `•  ${bullet}`;
          const lines = doc.splitTextToSize(bulletText, contentWidth - 4);
          lines.forEach((line: string) => {
            checkPage(4.5);
            doc.text(line, marginLeft + 2, yPos);
            yPos += 4;
          });
        });
      }

      if (index < data.experience.length - 1) {
        yPos += 3;
      }
    });
    yPos += 2;
  }

  // ========== PROJECTS / CERTIFICATIONS ==========
  const hasProjects = data.projects && data.projects.length > 0;
  const hasCerts = data.certifications && data.certifications.length > 0;

  if (hasProjects || hasCerts) {
    addSectionHeader("PROJECTS / CERTIFICATIONS");
    doc.setFontSize(config.bodySize);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(config.colors.secondary);

    if (hasProjects) {
      data.projects!.forEach((proj) => {
        checkPage(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(config.colors.primary);
        doc.text(proj.name || "Project", marginLeft, yPos);
        yPos += 4.5;

        doc.setFont("helvetica", "normal");
        doc.setTextColor(config.colors.secondary);
        if (proj.description) {
          const descText = `•  ${proj.description}`;
          addWrappedText(descText, marginLeft + 2, yPos, contentWidth - 4);
        }
        if (proj.tools) {
          checkPage(4.5);
          doc.setFont("helvetica", "italic");
          doc.text(`Tools: ${proj.tools}`, marginLeft + 2, yPos);
          yPos += 4.5;
        }
        yPos += 2;
      });
    }

    if (hasCerts) {
      data.certifications!.forEach((cert) => {
        checkPage(4.5);
        const certText = `•  ${cert}`;
        addWrappedText(certText, marginLeft + 2, yPos, contentWidth - 4);
      });
      yPos += 2;
    }
  }

  // ========== EDUCATION ==========
  if (data.education && data.education.length > 0) {
    addSectionHeader("EDUCATION");

    data.education.forEach((edu, index) => {
      checkPage(10);

      // Degree – University
      doc.setFontSize(config.bodySize);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(config.colors.primary);
      const degreePart = edu.degree || "Degree";
      const schoolPart = [edu.school, edu.location].filter(Boolean).join(", ");
      doc.text(degreePart, marginLeft, yPos);

      if (edu.graduationDate) {
        doc.setFontSize(config.smallSize);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(config.colors.accent);
        doc.text(formatDate(edu.graduationDate), pageWidth - marginRight, yPos, { align: "right" });
      }
      yPos += 4.5;

      if (schoolPart) {
        doc.setFontSize(config.smallSize);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(config.colors.accent);
        doc.text(schoolPart, marginLeft, yPos);
        yPos += 4.5;
      }

      if (edu.gpa) {
        doc.setFontSize(config.smallSize);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(config.colors.secondary);
        doc.text(`GPA: ${edu.gpa}`, marginLeft, yPos);
        yPos += 4.5;
      }

      if (index < data.education.length - 1) {
        yPos += 2;
      }
    });
  }

  return doc;
};

export const downloadPDF = (data: ResumeData, templateId: string = "classic") => {
  const doc = generatePDF(data, templateId);
  const fileName = `${data.personalInfo.fullName || "resume"}_resume.pdf`.replace(/\s+/g, "_");
  doc.save(fileName);
};
