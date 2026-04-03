import jsPDF from "jspdf";

/**
 * Mandatory compliance footer block for all ATSFy reports.
 * Cannot be skipped or hidden. Applies to 100% of reports.
 */
export const addComplianceFooterBlock = (
  doc: jsPDF,
  ml: number,
  mr: number,
  checkPageFn: (needed: number) => void,
  getCurrentY: () => number,
  setY: (val: number) => void
) => {
  const pw = doc.internal.pageSize.getWidth();
  const cw = pw - ml - mr;
  const reportId = crypto.randomUUID();
  const timestamp = new Date().toLocaleString("en-US", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit", timeZoneName: "short",
  });

  const lines = [
    "⚠️ Beta Notice",
    "ATSFy Technologies™ is currently in Beta (est. 2026).",
    "This report is AI-generated guidance only and must not be used as the sole basis for any employment decision.",
    `Report ID: ${reportId}  |  Generated: ${timestamp}`,
    "Your resume data is automatically deleted within 24 hours.",
    "To contest any finding: info.atsfy@gmail.com",
    "© 2026 ATSFy Technologies. All rights reserved.",
  ];

  // Calculate block height
  const lineHeight = 3.8;
  const padding = 5;
  const accentBorderW = 3;
  let totalTextHeight = 0;

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  lines.forEach((line, i) => {
    if (i === 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
    }
    const wrapped = doc.splitTextToSize(line, cw - accentBorderW - padding * 2);
    totalTextHeight += wrapped.length * lineHeight;
    if (i < lines.length - 1) totalTextHeight += 0.5;
  });

  const blockHeight = totalTextHeight + padding * 2;

  checkPageFn(blockHeight + 4);
  let y = getCurrentY();
  y += 4;

  // Grey background (#F8F8F8) with left accent border
  doc.setFillColor("#F8F8F8");
  doc.roundedRect(ml, y, cw, blockHeight, 2, 2, "F");

  // Left accent border
  doc.setFillColor("#718096");
  doc.rect(ml, y, accentBorderW, blockHeight, "F");

  let textY = y + padding;

  lines.forEach((line, i) => {
    if (i === 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor("#1a202c");
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor("#4a5568");
    }
    const wrapped = doc.splitTextToSize(line, cw - accentBorderW - padding * 2);
    wrapped.forEach((wl: string) => {
      doc.text(wl, ml + accentBorderW + padding, textY);
      textY += lineHeight;
    });
    if (i < lines.length - 1) textY += 0.5;
  });

  setY(y + blockHeight + 2);
};

/**
 * Proprietary IP footnote to replace Weight columns in category tables.
 */
export const SCORING_ENGINE_FOOTNOTE = "Evaluated by ATSFy Scoring Engine™ — weightings are proprietary IP";

/**
 * Pattern-based observation disclaimer for flags about email, name,
 * communication style, years of experience, or resume length.
 */
export const PATTERN_OBSERVATION_DISCLAIMER = "⚠️ Pattern-based observation only. May not reflect all cultural or regional standards.";

/**
 * Check if a text flag mentions sensitive pattern-based criteria.
 */
export const needsPatternDisclaimer = (text: string): boolean => {
  const lower = text.toLowerCase();
  return (
    lower.includes("email") ||
    lower.includes("name") ||
    lower.includes("communication style") ||
    lower.includes("years of experience") ||
    lower.includes("resume length")
  );
};

/**
 * Note for 0% change in before/after comparisons.
 */
export const ZERO_CHANGE_NOTE = "No automated changes applied. All recommendations require manual action by the candidate.";

/**
 * Compliance footer as a React component for web report views.
 */
export const getComplianceFooterData = () => ({
  reportId: crypto.randomUUID(),
  timestamp: new Date().toLocaleString("en-US", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit", timeZoneName: "short",
  }),
});
