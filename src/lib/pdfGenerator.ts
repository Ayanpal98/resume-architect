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

export const generatePDF = (data: ResumeData, templateId: string = "classic"): jsPDF => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPos = 20;

  const colors = {
    classic: { primary: "#1a365d", secondary: "#2d3748", accent: "#3182ce" },
    modern: { primary: "#1e40af", secondary: "#374151", accent: "#3b82f6" },
    minimal: { primary: "#111827", secondary: "#4b5563", accent: "#6b7280" },
    executive: { primary: "#0f172a", secondary: "#334155", accent: "#0ea5e9" },
    creative: { primary: "#7c3aed", secondary: "#4b5563", accent: "#8b5cf6" },
    tech: { primary: "#059669", secondary: "#374151", accent: "#10b981" },
  };

  const theme = colors[templateId as keyof typeof colors] || colors.classic;

  // Helper function to add text with word wrap
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number = 5): number => {
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + lines.length * lineHeight;
  };

  // Helper to check and add new page if needed
  const checkNewPage = (requiredSpace: number) => {
    if (yPos + requiredSpace > 280) {
      doc.addPage();
      yPos = 20;
    }
  };

  // Header - Name
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(theme.primary);
  doc.text(data.personalInfo.fullName || "Your Name", margin, yPos);
  yPos += 8;

  // Contact info
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(theme.secondary);

  const contactParts = [
    data.personalInfo.email,
    data.personalInfo.phone,
    data.personalInfo.location,
  ].filter(Boolean);

  if (contactParts.length > 0) {
    doc.text(contactParts.join(" | "), margin, yPos);
    yPos += 5;
  }

  const linkParts = [data.personalInfo.linkedin, data.personalInfo.portfolio].filter(Boolean);
  if (linkParts.length > 0) {
    doc.setTextColor(theme.accent);
    doc.text(linkParts.join(" | "), margin, yPos);
    yPos += 5;
  }

  // Divider
  yPos += 3;
  doc.setDrawColor(theme.primary);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  // Summary
  if (data.summary) {
    checkNewPage(25);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(theme.primary);
    doc.text("PROFESSIONAL SUMMARY", margin, yPos);
    yPos += 6;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(theme.secondary);
    yPos = addWrappedText(data.summary, margin, yPos, contentWidth);
    yPos += 8;
  }

  // Experience
  if (data.experience.length > 0) {
    checkNewPage(20);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(theme.primary);
    doc.text("WORK EXPERIENCE", margin, yPos);
    yPos += 6;

    data.experience.forEach((exp) => {
      checkNewPage(30);

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(theme.secondary);
      doc.text(exp.title || "Job Title", margin, yPos);

      const dateStr = `${formatDate(exp.startDate)} - ${exp.current ? "Present" : formatDate(exp.endDate)}`;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(dateStr, pageWidth - margin, yPos, { align: "right" });
      yPos += 5;

      doc.setTextColor(theme.accent);
      doc.text(exp.company || "Company", margin, yPos);
      yPos += 5;

      if (exp.description) {
        doc.setTextColor(theme.secondary);
        yPos = addWrappedText(exp.description, margin, yPos, contentWidth);
      }
      yPos += 6;
    });
  }

  // Education
  if (data.education.length > 0) {
    checkNewPage(20);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(theme.primary);
    doc.text("EDUCATION", margin, yPos);
    yPos += 6;

    data.education.forEach((edu) => {
      checkNewPage(20);

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(theme.secondary);
      doc.text(edu.degree || "Degree", margin, yPos);

      if (edu.graduationDate) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(formatDate(edu.graduationDate), pageWidth - margin, yPos, { align: "right" });
      }
      yPos += 5;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(theme.accent);
      doc.text(edu.school || "School", margin, yPos);

      if (edu.gpa) {
        doc.setTextColor(theme.secondary);
        doc.text(`GPA: ${edu.gpa}`, pageWidth - margin, yPos, { align: "right" });
      }
      yPos += 8;
    });
  }

  // Skills
  if (data.skills.length > 0) {
    checkNewPage(20);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(theme.primary);
    doc.text("SKILLS", margin, yPos);
    yPos += 6;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(theme.secondary);
    const skillsText = data.skills.join(" • ");
    yPos = addWrappedText(skillsText, margin, yPos, contentWidth);
  }

  return doc;
};

export const downloadPDF = (data: ResumeData, templateId: string = "classic") => {
  const doc = generatePDF(data, templateId);
  const fileName = `${data.personalInfo.fullName || "resume"}_resume.pdf`.replace(/\s+/g, "_");
  doc.save(fileName);
};
