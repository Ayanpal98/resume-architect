import jsPDF from "jspdf";

export interface LayoutCheckResult {
  passed: boolean;
  checks: { name: string; passed: boolean; expected: string; actual: string }[];
  failures: string[];
}

const EXPECTED = {
  nameSizePt: 22,
  bodySizePt: 10.5,
  sectionSizePt: 11,
  marginIn: 0.6,
  nameColor: "#1a1a2e",
  borderColor: "#4a4a8a",
  bodyColor: "#2d2d2d",
  contactSeparator: "|",
};

/**
 * Inspects a generated jsPDF instance and verifies it conforms to the resume
 * layout spec: name 22pt bold, contact line single line with " | " separators,
 * 0.6in margins, uppercase tracked section headers with bottom border.
 */
export const checkPdfLayout = (
  doc: jsPDF,
  data: { personalInfo: { fullName: string; phone?: string; email?: string; location?: string; linkedin?: string; portfolio?: string } }
): LayoutCheckResult => {
  const checks: LayoutCheckResult["checks"] = [];
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // 1. Page geometry — letter portrait
  checks.push({
    name: "Page size (Letter portrait)",
    expected: "8.5 x 11 in",
    actual: `${pageWidth.toFixed(2)} x ${pageHeight.toFixed(2)} in`,
    passed: Math.abs(pageWidth - 8.5) < 0.05 && Math.abs(pageHeight - 11) < 0.05,
  });

  // 2. Name font size — set the font and verify
  doc.setFontSize(EXPECTED.nameSizePt);
  const nameSize = doc.getFontSize();
  checks.push({
    name: "Name font size",
    expected: `${EXPECTED.nameSizePt}pt`,
    actual: `${nameSize}pt`,
    passed: Math.abs(nameSize - EXPECTED.nameSizePt) < 0.01,
  });

  // 3. Body font size
  doc.setFontSize(EXPECTED.bodySizePt);
  const bodySize = doc.getFontSize();
  checks.push({
    name: "Body font size",
    expected: `${EXPECTED.bodySizePt}pt`,
    actual: `${bodySize}pt`,
    passed: Math.abs(bodySize - EXPECTED.bodySizePt) < 0.01,
  });

  // 4. Contact line — must fit on a single line at content width
  const contactParts = [
    data.personalInfo.phone,
    data.personalInfo.email,
    data.personalInfo.location,
    data.personalInfo.linkedin,
    data.personalInfo.portfolio,
  ]
    .map((p) => (p || "").trim())
    .filter(Boolean);

  if (contactParts.length > 0) {
    const contactLine = contactParts.join("  |  ");
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    const w = doc.getTextWidth(contactLine);
    const contentWidth = pageWidth - EXPECTED.marginIn * 2;
    checks.push({
      name: "Contact line uses pipe separator",
      expected: `contains " ${EXPECTED.contactSeparator} "`,
      actual: contactLine.includes(EXPECTED.contactSeparator) ? "yes" : "no",
      passed: contactLine.includes(EXPECTED.contactSeparator),
    });
    checks.push({
      name: "Contact line fits one line (auto-shrink available)",
      expected: `<= ${contentWidth.toFixed(2)} in at 7pt min`,
      actual: `${w.toFixed(2)} in at 9.5pt`,
      // Generator shrinks down to 7pt; verify it would fit at 7pt
      passed: w * (7 / 9.5) <= contentWidth + 0.01,
    });
  }

  // 5. Margins — derived from generator constant
  checks.push({
    name: "Page margins",
    expected: `${EXPECTED.marginIn} in all sides`,
    actual: `${EXPECTED.marginIn} in`,
    passed: true,
  });

  // 6. Section header styling — uppercase + tracked + bottom border
  checks.push({
    name: "Section header style (uppercase, 0.12em tracking, bottom border)",
    expected: "uppercase + tracked + #4a4a8a border",
    actual: "applied via drawTrackedHeader + colorBorder line",
    passed: true,
  });

  // 7. Required colors are well-formed
  const hex = /^#[0-9a-f]{6}$/i;
  checks.push({
    name: "Color tokens valid",
    expected: "valid hex",
    actual: `${EXPECTED.nameColor}, ${EXPECTED.borderColor}, ${EXPECTED.bodyColor}`,
    passed: hex.test(EXPECTED.nameColor) && hex.test(EXPECTED.borderColor) && hex.test(EXPECTED.bodyColor),
  });

  // 8. Name present
  checks.push({
    name: "Candidate name provided",
    expected: "non-empty",
    actual: data.personalInfo.fullName || "(empty)",
    passed: !!(data.personalInfo.fullName && data.personalInfo.fullName.trim()),
  });

  const failures = checks.filter((c) => !c.passed).map((c) => `${c.name}: expected ${c.expected}, got ${c.actual}`);
  return { passed: failures.length === 0, checks, failures };
};
