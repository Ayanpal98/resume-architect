import jsPDF from "jspdf";
import { checkPdfLayout, type LayoutCheckResult } from "./pdfLayoutCheck";
import { normalizeResumeData } from "./resumeNormalizer";

export interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    portfolio: string;
    github?: string;
    otherLinks?: string;
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
  skillCategoryMap?: Record<string, string>;
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

// Parse description into bullet points — one per line, never merged
const parseBulletPoints = (description: string): string[] => {
  if (!description) return [];
  return description
    .split(/(?:\r?\n|•|▪|◦|➤|→|►|■|□|●|○|(?:^|\s)-\s)/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
};

// Categorize skills into Languages / Frameworks / Tools / Databases
const categorizeSkillsForPDF = (skills: string[]): Record<string, string[]> => {
  const languages = /^(javascript|typescript|python|java|c\+\+|c#|c|ruby|php|swift|kotlin|go|golang|rust|sql|html|css|sass|scss|r|scala|perl|dart|objective-c|assembly|matlab|solidity|elixir|haskell|clojure|bash|shell|lua)$/i;
  const frameworks = /^(react|reactjs|angular|vue|vuejs|next\.?js|nuxt|svelte|express|expressjs|nest\.?js|django|flask|fastapi|spring|spring\s?boot|rails|laravel|\.net|asp\.net|flutter|react\s?native|ember|backbone|jquery|tailwind|bootstrap|material\s?ui|chakra|redux|graphql|node\.?js|nodejs)$/i;
  const databases = /^(mysql|postgresql|postgres|mongodb|redis|elasticsearch|cassandra|dynamodb|sqlite|oracle|mariadb|firebase|firestore|supabase|snowflake|bigquery|redshift|neo4j|couchdb|influxdb|cockroachdb)$/i;
  const tools = /^(jira|confluence|git|github|gitlab|bitbucket|docker|kubernetes|k8s|jenkins|terraform|ansible|aws|azure|gcp|figma|sketch|adobe|photoshop|illustrator|tableau|power\s?bi|looker|excel|slack|notion|trello|asana|postman|vs\s?code|intellij|xcode|salesforce|hubspot|sap|servicenow|datadog|grafana|prometheus|splunk|heroku|vercel|netlify|circleci|travis|webpack|vite|babel|npm|yarn|linux|unix|windows|macos)$/i;

  const groups: Record<string, string[]> = {
    Languages: [],
    Frameworks: [],
    Tools: [],
    Databases: [],
  };

  skills.forEach((skill) => {
    const s = skill.trim();
    if (!s) return;
    if (languages.test(s)) groups.Languages.push(s);
    else if (frameworks.test(s)) groups.Frameworks.push(s);
    else if (databases.test(s)) groups.Databases.push(s);
    else if (tools.test(s)) groups.Tools.push(s);
    else groups.Tools.push(s);
  });

  Object.keys(groups).forEach((k) => {
    if (groups[k].length === 0) delete groups[k];
  });

  return groups;
};

export const generatePDF = (rawData: ResumeData, _templateId: string = "classic"): jsPDF => {
  const data = normalizeResumeData(rawData);
  const doc = new jsPDF({ orientation: "portrait", unit: "in", format: "letter" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 0.6;
  const contentWidth = pageWidth - margin * 2;
  const bottomMargin = 0.6;

  // Color palette
  const colorName = "#1a1a2e";
  const colorBody = "#2d2d2d";
  const colorBorder = "#4a4a8a";
  const colorAccent = "#4a4a8a";

  // Sizes (pt → in handled by jsPDF font size in pt while unit is "in")
  // jsPDF uses pt for font sizes regardless of unit
  const SIZE_NAME = 22;
  const SIZE_SECTION = 11;
  const SIZE_BODY = 10.5;
  const SIZE_SMALL = 9.5;

  // Line height: 1.6 of body size in inches
  const ptToIn = (pt: number) => pt / 72;
  const LH_BODY = ptToIn(SIZE_BODY) * 1.6;
  const LH_SMALL = ptToIn(SIZE_SMALL) * 1.5;

  // Use helvetica as Inter fallback (jsPDF doesn't ship Inter; helvetica is the cleanest sans built-in)
  const FONT = "helvetica";

  let yPos = margin;

  const checkPage = (needed: number) => {
    if (yPos + needed > pageHeight - bottomMargin) {
      doc.addPage();
      yPos = margin;
    }
  };

  const addWrappedText = (text: string, x: number, maxWidth: number, lineHeight: number) => {
    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach((line: string) => {
      checkPage(lineHeight);
      doc.text(line, x, yPos);
      yPos += lineHeight;
    });
  };

  // Letter-spaced uppercase header (manually space chars for 0.12em tracking)
  const drawTrackedHeader = (title: string, x: number, y: number, sizePt: number) => {
    const upper = title.toUpperCase();
    const trackEm = 0.12;
    const trackIn = ptToIn(sizePt) * trackEm;
    let cursor = x;
    doc.setFontSize(sizePt);
    doc.setFont(FONT, "bold");
    for (const ch of upper) {
      doc.text(ch, cursor, y);
      cursor += doc.getTextWidth(ch) + trackIn;
    }
    return cursor;
  };

  const addSectionHeader = (title: string) => {
    checkPage(0.45);
    yPos += 0.1;
    doc.setTextColor(colorName);
    drawTrackedHeader(title, margin, yPos, SIZE_SECTION);
    yPos += 0.06;
    doc.setDrawColor(colorBorder);
    doc.setLineWidth(0.008);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 0.14;
  };

  // ========== NAME (largest, 22pt bold, #1a1a2e, centered) ==========
  doc.setFontSize(SIZE_NAME);
  doc.setFont(FONT, "bold");
  doc.setTextColor(colorName);
  const name = data.personalInfo.fullName || "Your Name";
  doc.text(name, pageWidth / 2, yPos + ptToIn(SIZE_NAME) * 0.8, { align: "center" });
  yPos += ptToIn(SIZE_NAME) * 1.2;

  // ========== CONTACT LINE (single line: phone | email | city | LinkedIn | GitHub) ==========
  const otherLinksList = (data.personalInfo.otherLinks || "")
    .split(/[,\n;|]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const contactParts = [
    data.personalInfo.phone,
    data.personalInfo.email,
    data.personalInfo.location,
    data.personalInfo.linkedin,
    data.personalInfo.github,
    data.personalInfo.portfolio,
    ...otherLinksList,
  ]
    .map((p) => (p || "").trim())
    .filter(Boolean);

  if (contactParts.length > 0) {
    doc.setFontSize(SIZE_SMALL);
    doc.setFont(FONT, "normal");
    doc.setTextColor(colorBody);
    let contactLine = contactParts.join("  |  ");
    // Force single line: shrink if needed
    let fittedSize = SIZE_SMALL;
    while (doc.getTextWidth(contactLine) > contentWidth && fittedSize > 7) {
      fittedSize -= 0.5;
      doc.setFontSize(fittedSize);
    }
    doc.text(contactLine, pageWidth / 2, yPos + ptToIn(fittedSize) * 0.8, { align: "center" });
    yPos += ptToIn(fittedSize) * 1.6;
  }

  yPos += 0.05;

  // ========== PROFESSIONAL SUMMARY ==========
  if (data.summary && data.summary.trim()) {
    addSectionHeader("Professional Summary");
    doc.setFontSize(SIZE_BODY);
    doc.setFont(FONT, "normal");
    doc.setTextColor(colorBody);
    addWrappedText(data.summary.trim(), margin, contentWidth, LH_BODY);
    yPos += 0.05;
  }

  // ========== SKILLS ==========
  if (data.skills && data.skills.length > 0) {
    addSectionHeader("Skills");
    const skillsToUse = data.skills.slice(0, 20);
    const grouped = categorizeSkillsForPDF(skillsToUse);
    const order = ["Languages", "Frameworks", "Tools", "Databases"];

    doc.setFontSize(SIZE_BODY);
    order.forEach((cat) => {
      const items = grouped[cat];
      if (!items || items.length === 0) return;
      checkPage(LH_BODY);
      doc.setFont(FONT, "bold");
      doc.setTextColor(colorName);
      const label = `${cat}: `;
      doc.text(label, margin, yPos);
      const labelWidth = doc.getTextWidth(label);

      doc.setFont(FONT, "normal");
      doc.setTextColor(colorBody);
      const valueText = items.join(", ");
      const lines = doc.splitTextToSize(valueText, contentWidth - labelWidth);
      lines.forEach((line: string, i: number) => {
        if (i > 0) {
          yPos += LH_BODY;
          checkPage(LH_BODY);
        }
        doc.text(line, margin + labelWidth, yPos);
      });
      yPos += LH_BODY;
    });
    yPos += 0.05;
  }

  // ========== WORK EXPERIENCE ==========
  if (data.experience && data.experience.length > 0) {
    addSectionHeader("Work Experience");

    data.experience.forEach((exp, index) => {
      checkPage(LH_BODY * 3);

      doc.setFontSize(SIZE_BODY);
      doc.setFont(FONT, "bold");
      doc.setTextColor(colorName);
      doc.text(exp.title || "Role", margin, yPos);

      const dateStr = `${formatDate(exp.startDate)} – ${exp.current ? "Present" : formatDate(exp.endDate)}`;
      doc.setFontSize(SIZE_SMALL);
      doc.setFont(FONT, "normal");
      doc.setTextColor(colorAccent);
      doc.text(dateStr, pageWidth - margin, yPos, { align: "right" });
      yPos += LH_BODY;

      const companyPart = [exp.company, exp.location].filter(Boolean).join(", ");
      if (companyPart) {
        doc.setFontSize(SIZE_SMALL);
        doc.setFont(FONT, "italic");
        doc.setTextColor(colorAccent);
        doc.text(companyPart, margin, yPos);
        yPos += LH_SMALL;
      }

      if (exp.description) {
        doc.setFontSize(SIZE_BODY);
        doc.setFont(FONT, "normal");
        doc.setTextColor(colorBody);
        const bullets = parseBulletPoints(exp.description);
        const bulletIndent = 0.18;
        bullets.forEach((bullet) => {
          // Each bullet on its own line — wrap with hanging indent
          const lines = doc.splitTextToSize(bullet, contentWidth - bulletIndent);
          lines.forEach((line: string, i: number) => {
            checkPage(LH_BODY);
            if (i === 0) {
              doc.text("•", margin + 0.04, yPos);
              doc.text(line, margin + bulletIndent, yPos);
            } else {
              doc.text(line, margin + bulletIndent, yPos);
            }
            yPos += LH_BODY;
          });
        });
      }

      if (index < data.experience.length - 1) yPos += 0.08;
    });
    yPos += 0.05;
  }

  // ========== PROJECTS ==========
  const validProjects = (data.projects || []).filter(
    (p) => (p?.name && p.name.trim()) || (p?.description && p.description.trim()) || (p?.tools && p.tools.trim())
  );

  if (validProjects.length > 0) {
    addSectionHeader("Projects");

    validProjects.forEach((proj, idx) => {
      checkPage(LH_BODY * 2);

      doc.setFontSize(SIZE_BODY);
      doc.setFont(FONT, "bold");
      doc.setTextColor(colorName);
      doc.text(proj.name?.trim() || "Project", margin, yPos);

      if (proj.tools && proj.tools.trim()) {
        doc.setFontSize(SIZE_SMALL);
        doc.setFont(FONT, "italic");
        doc.setTextColor(colorAccent);
        doc.text(proj.tools.trim(), pageWidth - margin, yPos, { align: "right" });
      }
      yPos += LH_BODY;

      if (proj.description && proj.description.trim()) {
        doc.setFontSize(SIZE_BODY);
        doc.setFont(FONT, "normal");
        doc.setTextColor(colorBody);
        const bullets = parseBulletPoints(proj.description);
        const list = bullets.length > 0 ? bullets : [proj.description.trim()];
        const bulletIndent = 0.18;
        list.forEach((bullet) => {
          const lines = doc.splitTextToSize(bullet, contentWidth - bulletIndent);
          lines.forEach((line: string, i: number) => {
            checkPage(LH_BODY);
            if (i === 0) {
              doc.text("•", margin + 0.04, yPos);
              doc.text(line, margin + bulletIndent, yPos);
            } else {
              doc.text(line, margin + bulletIndent, yPos);
            }
            yPos += LH_BODY;
          });
        });
      }

      if (idx < validProjects.length - 1) yPos += 0.06;
    });
    yPos += 0.05;
  }

  // ========== CERTIFICATIONS ==========
  const validCerts = (data.certifications || [])
    .map((c: any) => {
      if (typeof c === "string") return c;
      if (c && typeof c === "object") return c.name || c.title || c.certification || "";
      return String(c ?? "");
    })
    .filter((c) => c && c.trim());
  if (validCerts.length > 0) {
    addSectionHeader("Certifications");
    doc.setFontSize(SIZE_BODY);
    doc.setFont(FONT, "normal");
    doc.setTextColor(colorBody);
    const bulletIndent = 0.18;
    validCerts.forEach((cert) => {
      const lines = doc.splitTextToSize(cert.trim(), contentWidth - bulletIndent);
      lines.forEach((line: string, i: number) => {
        checkPage(LH_BODY);
        if (i === 0) {
          doc.text("•", margin + 0.04, yPos);
          doc.text(line, margin + bulletIndent, yPos);
        } else {
          doc.text(line, margin + bulletIndent, yPos);
        }
        yPos += LH_BODY;
      });
    });
    yPos += 0.05;
  }

  // ========== EDUCATION ==========
  if (data.education && data.education.length > 0) {
    addSectionHeader("Education");

    data.education.forEach((edu, index) => {
      checkPage(LH_BODY * 2);

      doc.setFontSize(SIZE_BODY);
      doc.setFont(FONT, "bold");
      doc.setTextColor(colorName);
      doc.text(edu.degree || "Degree", margin, yPos);

      if (edu.graduationDate) {
        doc.setFontSize(SIZE_SMALL);
        doc.setFont(FONT, "normal");
        doc.setTextColor(colorAccent);
        doc.text(formatDate(edu.graduationDate), pageWidth - margin, yPos, { align: "right" });
      }
      yPos += LH_BODY;

      const schoolPart = [edu.school, edu.location].filter(Boolean).join(", ");
      if (schoolPart) {
        doc.setFontSize(SIZE_SMALL);
        doc.setFont(FONT, "italic");
        doc.setTextColor(colorAccent);
        doc.text(schoolPart, margin, yPos);
        yPos += LH_SMALL;
      }

      if (edu.gpa) {
        doc.setFontSize(SIZE_SMALL);
        doc.setFont(FONT, "normal");
        doc.setTextColor(colorBody);
        doc.text(`GPA: ${edu.gpa}`, margin, yPos);
        yPos += LH_SMALL;
      }

      if (index < data.education.length - 1) yPos += 0.05;
    });
  }

  // No watermark, no footer text.

  return doc;
};

export const downloadPDF = (data: ResumeData, templateId: string = "classic"): LayoutCheckResult => {
  const doc = generatePDF(data, templateId);
  let result: LayoutCheckResult = { passed: true, checks: [], failures: [] };
  try {
    result = checkPdfLayout(doc, data);
    if (!result.passed) {
      console.warn("[PDF Layout Check] Non-blocking failures:", result.failures);
    } else {
      console.info("[PDF Layout Check] All checks passed");
    }
  } catch (e) {
    console.warn("[PDF Layout Check] Check threw, continuing with download:", e);
  }
  const fileName = `${data.personalInfo.fullName || "resume"}_resume.pdf`.replace(/\s+/g, "_");
  doc.save(fileName);
  return result;
};
