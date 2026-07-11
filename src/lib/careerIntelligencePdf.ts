import jsPDF from "jspdf";

/* ============================================================
 * ATSFy Career Intelligence — Premium PDF Reports
 * Client-side, full-length exports for all 5 modes.
 * ============================================================ */

interface Profile {
  currentRole?: string;
  targetRole?: string;
  yearsOfExperience?: string;
  industry?: string;
  timeline?: string;
  focusAreas?: string[];
}

// Brand palette (matches app tokens visually — hardcoded here because jsPDF
// needs RGB, not CSS variables).
const BRAND = {
  primary: [88, 62, 209] as [number, number, number],     // purple
  accent: [34, 197, 168] as [number, number, number],     // teal-ish accent
  ink: [17, 24, 39] as [number, number, number],
  body: [55, 65, 81] as [number, number, number],
  muted: [107, 114, 128] as [number, number, number],
  soft: [243, 244, 246] as [number, number, number],
  border: [229, 231, 235] as [number, number, number],
  warning: [217, 119, 6] as [number, number, number],
  danger: [220, 38, 38] as [number, number, number],
  success: [22, 163, 74] as [number, number, number],
  footerBg: [248, 248, 248] as [number, number, number],
};

const PAGE = { w: 210, h: 297, ml: 15, mr: 15, mt: 22, mb: 26 };
const CONTENT_W = PAGE.w - PAGE.ml - PAGE.mr;

interface Ctx {
  doc: jsPDF;
  y: number;
  title: string;
  profile: Profile;
  uuid: string;
  generatedAt: string;
}

function newCtx(title: string, profile: Profile): Ctx {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  return {
    doc,
    y: PAGE.mt,
    title,
    profile,
    uuid: cryptoRandomId(),
    generatedAt: new Date().toISOString(),
  };
}

function cryptoRandomId() {
  try {
    return (crypto as any).randomUUID();
  } catch {
    return "atsfy-" + Math.random().toString(36).slice(2, 12);
  }
}

function setFill(doc: jsPDF, c: [number, number, number]) {
  doc.setFillColor(c[0], c[1], c[2]);
}
function setDraw(doc: jsPDF, c: [number, number, number]) {
  doc.setDrawColor(c[0], c[1], c[2]);
}
function setText(doc: jsPDF, c: [number, number, number]) {
  doc.setTextColor(c[0], c[1], c[2]);
}

function ensureSpace(ctx: Ctx, needed: number) {
  if (ctx.y + needed > PAGE.h - PAGE.mb) {
    ctx.doc.addPage();
    ctx.y = PAGE.mt;
    drawRunningHeader(ctx);
  }
}

function drawRunningHeader(ctx: Ctx) {
  const { doc } = ctx;
  setFill(doc, BRAND.primary);
  doc.rect(0, 0, PAGE.w, 6, "F");
  setText(doc, BRAND.muted);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("ATSFy Career Intelligence", PAGE.ml, 12);
  doc.text(ctx.title, PAGE.w - PAGE.mr, 12, { align: "right" });
  setDraw(doc, BRAND.border);
  doc.setLineWidth(0.2);
  doc.line(PAGE.ml, 14, PAGE.w - PAGE.mr, 14);
  ctx.y = Math.max(ctx.y, PAGE.mt);
}

function drawCover(ctx: Ctx) {
  const { doc, profile } = ctx;
  // Top brand bar
  setFill(doc, BRAND.primary);
  doc.rect(0, 0, PAGE.w, 32, "F");
  setFill(doc, BRAND.accent);
  doc.rect(0, 30, PAGE.w, 2, "F");

  setText(doc, [255, 255, 255]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("ATSFY  •  CAREER INTELLIGENCE", PAGE.ml, 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Premium AI-Generated Career Report", PAGE.ml, 22);

  ctx.y = 46;
  setText(doc, BRAND.ink);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  const titleLines = doc.splitTextToSize(ctx.title, CONTENT_W);
  doc.text(titleLines, PAGE.ml, ctx.y);
  ctx.y += titleLines.length * 9 + 4;

  setText(doc, BRAND.muted);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const subtitle = `Generated ${new Date(ctx.generatedAt).toLocaleString()}`;
  doc.text(subtitle, PAGE.ml, ctx.y);
  ctx.y += 8;

  // Candidate card
  setFill(doc, BRAND.soft);
  doc.roundedRect(PAGE.ml, ctx.y, CONTENT_W, 46, 2, 2, "F");
  const cx = PAGE.ml + 6;
  let cy = ctx.y + 8;
  setText(doc, BRAND.muted);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("CANDIDATE SNAPSHOT", cx, cy);
  cy += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  setText(doc, BRAND.ink);

  const rows: [string, string][] = [
    ["Current Role", profile.currentRole || "—"],
    ["Target Role", profile.targetRole || "—"],
    ["Experience", profile.yearsOfExperience || "—"],
    ["Industry", profile.industry || "—"],
    ["Timeline", profile.timeline || "—"],
  ];
  rows.forEach(([k, v], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = cx + col * (CONTENT_W / 2 - 4);
    const yy = cy + row * 7;
    setText(doc, BRAND.muted);
    doc.setFontSize(8);
    doc.text(k.toUpperCase(), x, yy);
    setText(doc, BRAND.ink);
    doc.setFontSize(10);
    const val = doc.splitTextToSize(v, CONTENT_W / 2 - 10)[0];
    doc.text(val, x + 24, yy);
  });

  ctx.y += 46 + 8;
}

function h1(ctx: Ctx, text: string) {
  ensureSpace(ctx, 14);
  const { doc } = ctx;
  setFill(doc, BRAND.primary);
  doc.rect(PAGE.ml, ctx.y - 3.5, 2, 6, "F");
  setText(doc, BRAND.ink);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(text, PAGE.ml + 5, ctx.y + 1.5);
  ctx.y += 8;
}

function h2(ctx: Ctx, text: string) {
  ensureSpace(ctx, 10);
  const { doc } = ctx;
  setText(doc, BRAND.primary);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(text, PAGE.ml, ctx.y);
  ctx.y += 5.5;
}

function paragraph(ctx: Ctx, text: string, opts: { color?: [number, number, number]; size?: number } = {}) {
  if (!text) return;
  const { doc } = ctx;
  setText(doc, opts.color || BRAND.body);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(opts.size || 10);
  const lines = doc.splitTextToSize(text, CONTENT_W);
  ensureSpace(ctx, lines.length * 5);
  doc.text(lines, PAGE.ml, ctx.y);
  ctx.y += lines.length * 5 + 2;
}

function bulletList(ctx: Ctx, items: string[]) {
  if (!items || !items.length) return;
  const { doc } = ctx;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  setText(doc, BRAND.body);
  items.forEach((raw) => {
    const t = String(raw || "").trim();
    if (!t) return;
    const lines = doc.splitTextToSize(t, CONTENT_W - 5);
    ensureSpace(ctx, lines.length * 5 + 1);
    setText(doc, BRAND.accent);
    doc.text("•", PAGE.ml, ctx.y);
    setText(doc, BRAND.body);
    doc.text(lines, PAGE.ml + 4, ctx.y);
    ctx.y += lines.length * 5 + 1;
  });
  ctx.y += 1;
}

function keyValueBox(ctx: Ctx, pairs: [string, string][]) {
  if (!pairs.length) return;
  const { doc } = ctx;
  const rowH = 6.5;
  const totalH = pairs.length * rowH + 4;
  ensureSpace(ctx, totalH);
  setFill(doc, BRAND.soft);
  doc.roundedRect(PAGE.ml, ctx.y, CONTENT_W, totalH, 2, 2, "F");
  let yy = ctx.y + 5;
  pairs.forEach(([k, v]) => {
    setText(doc, BRAND.muted);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(k.toUpperCase(), PAGE.ml + 4, yy);
    setText(doc, BRAND.ink);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const val = doc.splitTextToSize(v || "—", CONTENT_W - 46)[0] || "—";
    doc.text(val, PAGE.ml + 42, yy);
    yy += rowH;
  });
  ctx.y += totalH + 3;
}

function card(ctx: Ctx, drawInner: (innerY: number) => number, options: { accent?: [number, number, number] } = {}) {
  const { doc } = ctx;
  // Predict height by running drawInner into a shadow y and measuring
  const startY = ctx.y + 3;
  const before = ctx.y;
  // temporary: draw content, then wrap. Simpler: give the caller a starting y and let it return height.
  // We'll pre-check space by allowing at least 20mm.
  ensureSpace(ctx, 24);
  const innerStart = ctx.y + 5;
  const endY = drawInner(innerStart);
  const h = endY - ctx.y + 4;
  // Draw border retroactively
  setDraw(doc, BRAND.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(PAGE.ml, before, CONTENT_W, h, 2, 2, "S");
  if (options.accent) {
    setFill(doc, options.accent);
    doc.rect(PAGE.ml, before, 1.5, h, "F");
  }
  ctx.y = before + h + 3;
  // avoid unused warning
  void startY;
}

function scoreBar(ctx: Ctx, label: string, value: number, weight?: number, note?: string) {
  const { doc } = ctx;
  ensureSpace(ctx, 14 + (note ? 6 : 0));
  const barW = CONTENT_W;
  setText(doc, BRAND.ink);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(label, PAGE.ml, ctx.y);
  const right = `${value}%${weight != null ? `  •  weight ${weight}%` : ""}`;
  setText(doc, BRAND.muted);
  doc.setFont("helvetica", "normal");
  doc.text(right, PAGE.w - PAGE.mr, ctx.y, { align: "right" });
  ctx.y += 2.5;
  setFill(doc, BRAND.soft);
  doc.roundedRect(PAGE.ml, ctx.y, barW, 3.5, 1.5, 1.5, "F");
  const clamped = Math.max(0, Math.min(100, value || 0));
  setFill(doc, BRAND.primary);
  doc.roundedRect(PAGE.ml, ctx.y, (barW * clamped) / 100, 3.5, 1.5, 1.5, "F");
  ctx.y += 6;
  if (note) {
    setText(doc, BRAND.muted);
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(note, CONTENT_W);
    ensureSpace(ctx, lines.length * 4.5);
    doc.text(lines, PAGE.ml, ctx.y);
    ctx.y += lines.length * 4.5 + 2;
  }
}

function pill(ctx: Ctx, text: string, color: [number, number, number]) {
  const { doc } = ctx;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  const w = doc.getTextWidth(text) + 6;
  setFill(doc, color);
  doc.roundedRect(PAGE.ml, ctx.y - 4, w, 5.5, 2.5, 2.5, "F");
  setText(doc, [255, 255, 255]);
  doc.text(text, PAGE.ml + 3, ctx.y);
  ctx.y += 4;
}

function drawFooterAllPages(ctx: Ctx) {
  const { doc } = ctx;
  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    setFill(doc, BRAND.footerBg);
    doc.rect(0, PAGE.h - 20, PAGE.w, 20, "F");
    setDraw(doc, BRAND.border);
    doc.setLineWidth(0.2);
    doc.line(0, PAGE.h - 20, PAGE.w, PAGE.h - 20);

    setText(doc, BRAND.muted);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    const line1 = `ATSFy Technologies™  •  Report ID: ${ctx.uuid}  •  Generated: ${new Date(ctx.generatedAt).toLocaleString()}`;
    doc.text(line1, PAGE.ml, PAGE.h - 13);
    const line2 = "AI-assisted analysis for guidance only. Data is retained for 24 hours then deleted. Not legal or employment advice.";
    doc.text(line2, PAGE.ml, PAGE.h - 8.5);
    doc.text(`Page ${p} of ${total}`, PAGE.w - PAGE.mr, PAGE.h - 8.5, { align: "right" });
  }
}

function save(ctx: Ctx, filename: string) {
  drawFooterAllPages(ctx);
  ctx.doc.save(filename);
}

function safeName(s?: string) {
  return (s || "report").replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "").slice(0, 40) || "report";
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function severityColor(sev?: string): [number, number, number] {
  const s = (sev || "").toLowerCase();
  if (s.includes("high")) return BRAND.danger;
  if (s.includes("med")) return BRAND.warning;
  return BRAND.success;
}

function priorityColor(p?: string): [number, number, number] {
  const s = (p || "").toLowerCase();
  if (s.includes("immediate")) return BRAND.danger;
  if (s.includes("short")) return BRAND.warning;
  return BRAND.primary;
}

/* ============================================================
 * Mode: Roadmap
 * ============================================================ */
function buildRoadmapSection(ctx: Ctx, data: any) {
  if (data.executive_summary) {
    h1(ctx, "Executive Summary");
    paragraph(ctx, data.executive_summary);
  }

  if (data.readiness_score != null || data.target_score != null) {
    h1(ctx, "Readiness Trajectory");
    keyValueBox(ctx, [
      ["Today", `${data.readiness_score ?? 0}%`],
      ["Target", `${data.target_score ?? 0}%`],
      ["Delta", `+${Math.max(0, (data.target_score ?? 0) - (data.readiness_score ?? 0))}%`],
    ]);
  }

  if (Array.isArray(data.quick_wins) && data.quick_wins.length) {
    h1(ctx, "Quick Wins");
    paragraph(ctx, "Actions under an hour that move the needle.", { color: BRAND.muted, size: 9 });
    bulletList(ctx, data.quick_wins);
  }

  if (Array.isArray(data.phases) && data.phases.length) {
    h1(ctx, "Phased Action Plan");
    data.phases.forEach((p: any, i: number) => {
      ensureSpace(ctx, 20);
      h2(ctx, `Phase ${i + 1} — ${p.phase || ""}${p.title ? ` : ${p.title}` : ""}`);
      if (p.objective) paragraph(ctx, p.objective, { color: BRAND.muted, size: 9 });
      if (p.expected_score_after != null) {
        scoreBar(ctx, "Expected Hiring Readiness after phase", p.expected_score_after);
      }
      if (Array.isArray(p.actions) && p.actions.length) {
        setText(ctx.doc, BRAND.ink);
        ctx.doc.setFont("helvetica", "bold");
        ctx.doc.setFontSize(9.5);
        ensureSpace(ctx, 6);
        ctx.doc.text("Actions", PAGE.ml, ctx.y);
        ctx.y += 4;
        bulletList(ctx, p.actions);
      }
      if (Array.isArray(p.deliverables) && p.deliverables.length) {
        setText(ctx.doc, BRAND.ink);
        ctx.doc.setFont("helvetica", "bold");
        ctx.doc.setFontSize(9.5);
        ensureSpace(ctx, 6);
        ctx.doc.text("Deliverables", PAGE.ml, ctx.y);
        ctx.y += 4;
        bulletList(ctx, p.deliverables);
      }
      ctx.y += 2;
    });
  }

  if (Array.isArray(data.certifications) && data.certifications.length) {
    h1(ctx, "Recommended Certifications");
    data.certifications.forEach((c: any) => {
      ensureSpace(ctx, 22);
      const startY = ctx.y;
      setDraw(ctx.doc, BRAND.border);
      ctx.doc.setLineWidth(0.3);
      setText(ctx.doc, BRAND.ink);
      ctx.doc.setFont("helvetica", "bold");
      ctx.doc.setFontSize(10.5);
      ctx.doc.text(c.name || "Certification", PAGE.ml + 3, ctx.y + 5);
      setText(ctx.doc, BRAND.muted);
      ctx.doc.setFont("helvetica", "normal");
      ctx.doc.setFontSize(9);
      ctx.doc.text(c.provider || "", PAGE.ml + 3, ctx.y + 10);
      const meta = [c.time_to_complete, c.cost_estimate].filter(Boolean).join("  •  ");
      if (meta) ctx.doc.text(meta, PAGE.ml + 3, ctx.y + 15);
      if (c.priority) {
        const label = String(c.priority).toUpperCase();
        ctx.doc.setFont("helvetica", "bold");
        ctx.doc.setFontSize(7.5);
        const w = ctx.doc.getTextWidth(label) + 6;
        setFill(ctx.doc, priorityColor(c.priority));
        ctx.doc.roundedRect(PAGE.ml + CONTENT_W - w - 3, ctx.y + 3, w, 5, 2, 2, "F");
        setText(ctx.doc, [255, 255, 255]);
        ctx.doc.text(label, PAGE.ml + CONTENT_W - w + 0, ctx.y + 6.5);
      }
      ctx.doc.setDrawColor(BRAND.border[0], BRAND.border[1], BRAND.border[2]);
      ctx.doc.roundedRect(PAGE.ml, startY, CONTENT_W, 19, 2, 2, "S");
      ctx.y = startY + 22;
    });
  }

  if (data.networking) {
    h1(ctx, "Networking Intelligence");
    const n = data.networking;
    if (Array.isArray(n.target_companies) && n.target_companies.length) {
      h2(ctx, "Target Companies");
      bulletList(ctx, n.target_companies);
    }
    if (Array.isArray(n.communities) && n.communities.length) {
      h2(ctx, "Communities");
      bulletList(ctx, n.communities);
    }
    if (Array.isArray(n.events) && n.events.length) {
      h2(ctx, "Events");
      bulletList(ctx, n.events);
    }
  }
}

export function exportRoadmapPdf(data: any, profile: Profile) {
  const ctx = newCtx("Career Roadmap Report", profile);
  drawCover(ctx);
  buildRoadmapSection(ctx, data);
  save(ctx, `ATSFy_Roadmap_${safeName(profile.targetRole)}_${todayStr()}.pdf`);
}

/* ============================================================
 * Mode: Skill Analysis
 * ============================================================ */
export function exportSkillAnalysisPdf(data: any, profile: Profile) {
  const ctx = newCtx("Skill Intelligence Report", profile);
  drawCover(ctx);

  if (data.summary) {
    h1(ctx, "Summary");
    paragraph(ctx, data.summary);
  }

  const strong = data.strong_skills || [];
  if (strong.length) {
    h1(ctx, "Strong Skills");
    strong.forEach((s: any) => {
      ensureSpace(ctx, 12);
      setText(ctx.doc, BRAND.ink);
      ctx.doc.setFont("helvetica", "bold");
      ctx.doc.setFontSize(10.5);
      ctx.doc.text(s.skill || "—", PAGE.ml, ctx.y);
      if (s.market_value) {
        const mv = `Market: ${String(s.market_value).toUpperCase()}`;
        setText(ctx.doc, BRAND.accent);
        ctx.doc.setFontSize(8.5);
        ctx.doc.text(mv, PAGE.w - PAGE.mr, ctx.y, { align: "right" });
      }
      ctx.y += 4.5;
      if (s.evidence) paragraph(ctx, s.evidence, { color: BRAND.muted, size: 9 });
    });
  }

  const missing = data.missing_critical_skills || [];
  if (missing.length) {
    h1(ctx, "Missing Critical Skills");
    missing.forEach((s: any) => {
      ensureSpace(ctx, 16);
      setText(ctx.doc, BRAND.ink);
      ctx.doc.setFont("helvetica", "bold");
      ctx.doc.setFontSize(10.5);
      ctx.doc.text(s.skill || "—", PAGE.ml, ctx.y);
      if (s.impact_on_match) {
        setText(ctx.doc, BRAND.warning);
        ctx.doc.setFontSize(8.5);
        ctx.doc.text(String(s.impact_on_match), PAGE.w - PAGE.mr, ctx.y, { align: "right" });
      }
      ctx.y += 4.5;
      const details: [string, string][] = [];
      if (s.why_critical) details.push(["Why Critical", s.why_critical]);
      if (s.learning_resource) details.push(["Resource", s.learning_resource]);
      if (s.time_to_acquire) details.push(["Time", s.time_to_acquire]);
      keyValueBox(ctx, details);
    });
  }

  const depri = data.skills_to_deprioritize || [];
  if (depri.length) {
    h1(ctx, "Skills to Deprioritize");
    depri.forEach((s: any) => {
      ensureSpace(ctx, 10);
      setText(ctx.doc, BRAND.ink);
      ctx.doc.setFont("helvetica", "bold");
      ctx.doc.setFontSize(10);
      ctx.doc.text(s.skill || "—", PAGE.ml, ctx.y);
      ctx.y += 4.5;
      if (s.reason) paragraph(ctx, s.reason, { color: BRAND.muted, size: 9 });
    });
  }

  const emerging = data.emerging_skills_to_watch || [];
  if (emerging.length) {
    h1(ctx, "Emerging Skills to Watch");
    emerging.forEach((s: any) => {
      ensureSpace(ctx, 10);
      setText(ctx.doc, BRAND.ink);
      ctx.doc.setFont("helvetica", "bold");
      ctx.doc.setFontSize(10);
      ctx.doc.text(s.skill || "—", PAGE.ml, ctx.y);
      ctx.y += 4.5;
      const info = [s.trend, s.relevance].filter(Boolean).join(" • ");
      if (info) paragraph(ctx, info, { color: BRAND.muted, size: 9 });
    });
  }

  const stack = data.recommended_skill_stack || [];
  if (stack.length) {
    h1(ctx, "Recommended Skill Stack");
    paragraph(ctx, "The skills to lead with on your resume.", { color: BRAND.muted, size: 9 });
    bulletList(ctx, stack);
  }

  save(ctx, `ATSFy_SkillAnalysis_${safeName(profile.targetRole)}_${todayStr()}.pdf`);
}

/* ============================================================
 * Mode: Role Fit Score
 * ============================================================ */
export function exportRoleFitPdf(data: any, profile: Profile) {
  const ctx = newCtx("Role Fit Score Report", profile);
  drawCover(ctx);

  // Big score hero
  ensureSpace(ctx, 40);
  setFill(ctx.doc, BRAND.primary);
  ctx.doc.roundedRect(PAGE.ml, ctx.y, CONTENT_W, 34, 3, 3, "F");
  setText(ctx.doc, [255, 255, 255]);
  ctx.doc.setFont("helvetica", "bold");
  ctx.doc.setFontSize(9);
  ctx.doc.text("OVERALL FIT", PAGE.ml + 6, ctx.y + 8);
  ctx.doc.setFontSize(34);
  ctx.doc.text(`${data.overall_fit_score ?? 0}%`, PAGE.ml + 6, ctx.y + 24);
  ctx.doc.setFont("helvetica", "normal");
  ctx.doc.setFontSize(10);
  if (data.verdict) ctx.doc.text(String(data.verdict), PAGE.ml + 6, ctx.y + 30);
  ctx.y += 40;

  if (data.positioning_strategy) {
    h1(ctx, "Positioning Strategy");
    paragraph(ctx, data.positioning_strategy);
  }

  const dims = data.dimensions || [];
  if (dims.length) {
    h1(ctx, "Dimension Breakdown");
    dims.forEach((d: any) => {
      scoreBar(ctx, d.name || "Dimension", d.score ?? 0, d.weight, d.observations);
    });
  }

  if (Array.isArray(data.risks) && data.risks.length) {
    h1(ctx, "Risks");
    bulletList(ctx, data.risks);
  }
  if (Array.isArray(data.opportunities) && data.opportunities.length) {
    h1(ctx, "Opportunities");
    bulletList(ctx, data.opportunities);
  }

  save(ctx, `ATSFy_RoleFit_${safeName(profile.targetRole)}_${todayStr()}.pdf`);
}

/* ============================================================
 * Mode: AI Coaching
 * ============================================================ */
export function exportCoachingPdf(data: any, profile: Profile) {
  const ctx = newCtx("AI Coaching Session Report", profile);
  drawCover(ctx);

  if (data.coaching_summary) {
    h1(ctx, "Coaching Summary");
    paragraph(ctx, data.coaching_summary);
  }

  const qs = data.likely_interview_questions || [];
  if (qs.length) {
    h1(ctx, "Likely Interview Questions");
    qs.forEach((q: any, i: number) => {
      ensureSpace(ctx, 20);
      setText(ctx.doc, BRAND.ink);
      ctx.doc.setFont("helvetica", "bold");
      ctx.doc.setFontSize(10.5);
      const qLines = ctx.doc.splitTextToSize(`Q${i + 1}. ${q.question || ""}`, CONTENT_W);
      ctx.doc.text(qLines, PAGE.ml, ctx.y);
      ctx.y += qLines.length * 5 + 1;
      if (q.how_to_answer) {
        setText(ctx.doc, BRAND.accent);
        ctx.doc.setFont("helvetica", "bold");
        ctx.doc.setFontSize(9);
        ctx.doc.text("How to answer:", PAGE.ml, ctx.y);
        ctx.y += 4;
        paragraph(ctx, q.how_to_answer, { color: BRAND.body, size: 9.5 });
      }
      if (q.red_flags_to_avoid) {
        setText(ctx.doc, BRAND.warning);
        ctx.doc.setFont("helvetica", "bold");
        ctx.doc.setFontSize(9);
        ctx.doc.text("Avoid:", PAGE.ml, ctx.y);
        ctx.y += 4;
        paragraph(ctx, q.red_flags_to_avoid, { color: BRAND.body, size: 9.5 });
      }
      ctx.y += 2;
    });
  }

  if (Array.isArray(data.talking_points) && data.talking_points.length) {
    h1(ctx, "Talking Points");
    bulletList(ctx, data.talking_points);
  }

  const wm = data.weakness_mitigation || [];
  if (wm.length) {
    h1(ctx, "Weakness Mitigation");
    wm.forEach((w: any) => {
      ensureSpace(ctx, 12);
      setText(ctx.doc, BRAND.ink);
      ctx.doc.setFont("helvetica", "bold");
      ctx.doc.setFontSize(10);
      ctx.doc.text(w.weakness || "—", PAGE.ml, ctx.y);
      ctx.y += 4.5;
      if (w.mitigation) paragraph(ctx, w.mitigation, { color: BRAND.muted, size: 9 });
    });
  }

  if (data.elevator_pitch) {
    h1(ctx, "Elevator Pitch");
    ensureSpace(ctx, 20);
    setFill(ctx.doc, BRAND.soft);
    const lines = ctx.doc.splitTextToSize(data.elevator_pitch, CONTENT_W - 8);
    const h = lines.length * 5 + 8;
    ctx.doc.roundedRect(PAGE.ml, ctx.y, CONTENT_W, h, 2, 2, "F");
    setFill(ctx.doc, BRAND.accent);
    ctx.doc.rect(PAGE.ml, ctx.y, 2, h, "F");
    setText(ctx.doc, BRAND.ink);
    ctx.doc.setFont("helvetica", "italic");
    ctx.doc.setFontSize(10);
    ctx.doc.text(lines, PAGE.ml + 6, ctx.y + 6);
    ctx.y += h + 4;
  }

  if (data.outreach_template) {
    h1(ctx, "Outreach Template");
    ensureSpace(ctx, 20);
    const lines = ctx.doc.splitTextToSize(data.outreach_template, CONTENT_W - 8);
    const h = lines.length * 5 + 8;
    ensureSpace(ctx, h);
    setFill(ctx.doc, BRAND.soft);
    ctx.doc.roundedRect(PAGE.ml, ctx.y, CONTENT_W, h, 2, 2, "F");
    setText(ctx.doc, BRAND.body);
    ctx.doc.setFont("courier", "normal");
    ctx.doc.setFontSize(9.5);
    ctx.doc.text(lines, PAGE.ml + 4, ctx.y + 6);
    ctx.y += h + 4;
  }

  if (Array.isArray(data.confidence_builders) && data.confidence_builders.length) {
    h1(ctx, "Confidence Builders");
    bulletList(ctx, data.confidence_builders);
  }

  save(ctx, `ATSFy_Coaching_${safeName(profile.targetRole)}_${todayStr()}.pdf`);
}

/* ============================================================
 * Mode: Rejection Decoder
 * ============================================================ */
export function exportRejectionDecoderPdf(data: any, profile: Profile) {
  const ctx = newCtx("Rejection Decoder Report", profile);
  drawCover(ctx);

  if (data.decoded_summary) {
    h1(ctx, "Decoded Summary");
    paragraph(ctx, data.decoded_summary);
  }

  const reasons = data.likely_reasons || [];
  if (reasons.length) {
    h1(ctx, "Likely Reasons");
    reasons.forEach((r: any) => {
      ensureSpace(ctx, 14);
      setText(ctx.doc, BRAND.ink);
      ctx.doc.setFont("helvetica", "bold");
      ctx.doc.setFontSize(10.5);
      const t = r.reason || "—";
      const lines = ctx.doc.splitTextToSize(t, CONTENT_W - 26);
      ctx.doc.text(lines, PAGE.ml, ctx.y);
      // severity pill right side
      if (r.severity) {
        const label = String(r.severity).toUpperCase();
        ctx.doc.setFont("helvetica", "bold");
        ctx.doc.setFontSize(7.5);
        const w = ctx.doc.getTextWidth(label) + 6;
        setFill(ctx.doc, severityColor(r.severity));
        ctx.doc.roundedRect(PAGE.w - PAGE.mr - w, ctx.y - 3.5, w, 5, 2, 2, "F");
        setText(ctx.doc, [255, 255, 255]);
        ctx.doc.text(label, PAGE.w - PAGE.mr - w + 3, ctx.y);
      }
      ctx.y += lines.length * 5 + 1;
      if (r.evidence) paragraph(ctx, r.evidence, { color: BRAND.muted, size: 9 });
    });
  }

  const meant = data.what_recruiters_actually_meant || [];
  if (meant.length) {
    h1(ctx, "What Recruiters Actually Meant");
    meant.forEach((m: any) => {
      ensureSpace(ctx, 14);
      setText(ctx.doc, BRAND.ink);
      ctx.doc.setFont("helvetica", "bolditalic");
      ctx.doc.setFontSize(10);
      const q = ctx.doc.splitTextToSize(`"${m.phrase || ""}"`, CONTENT_W);
      ctx.doc.text(q, PAGE.ml, ctx.y);
      ctx.y += q.length * 5 + 1;
      if (m.real_meaning) {
        setText(ctx.doc, BRAND.accent);
        ctx.doc.setFont("helvetica", "bold");
        ctx.doc.setFontSize(9);
        ctx.doc.text("→", PAGE.ml, ctx.y);
        setText(ctx.doc, BRAND.body);
        ctx.doc.setFont("helvetica", "normal");
        const rm = ctx.doc.splitTextToSize(m.real_meaning, CONTENT_W - 6);
        ctx.doc.text(rm, PAGE.ml + 5, ctx.y);
        ctx.y += rm.length * 5 + 2;
      }
    });
  }

  const actions = data.recovery_actions || [];
  if (actions.length) {
    h1(ctx, "Recovery Plan");
    actions.forEach((a: any) => {
      ensureSpace(ctx, 12);
      setText(ctx.doc, BRAND.ink);
      ctx.doc.setFont("helvetica", "bold");
      ctx.doc.setFontSize(10);
      ctx.doc.text(a.action || "—", PAGE.ml, ctx.y);
      ctx.y += 4.5;
      const meta = [a.impact, a.timeline].filter(Boolean).join(" • ");
      if (meta) paragraph(ctx, meta, { color: BRAND.muted, size: 9 });
    });
  }

  const fixes = data.portfolio_fixes || [];
  if (fixes.length) {
    h1(ctx, "Portfolio Fixes");
    fixes.forEach((f: any) => {
      ensureSpace(ctx, 10);
      setText(ctx.doc, BRAND.primary);
      ctx.doc.setFont("helvetica", "bold");
      ctx.doc.setFontSize(10);
      const label = `${f.section || "Section"}:`;
      ctx.doc.text(label, PAGE.ml, ctx.y);
      const w = ctx.doc.getTextWidth(label) + 2;
      setText(ctx.doc, BRAND.body);
      ctx.doc.setFont("helvetica", "normal");
      const rest = ctx.doc.splitTextToSize(f.change || "", CONTENT_W - w);
      ctx.doc.text(rest, PAGE.ml + w, ctx.y);
      ctx.y += rest.length * 5 + 1;
    });
  }

  if (data.next_attempt_strategy) {
    h1(ctx, "Next Attempt Strategy");
    ensureSpace(ctx, 20);
    const lines = ctx.doc.splitTextToSize(data.next_attempt_strategy, CONTENT_W - 8);
    const h = lines.length * 5 + 8;
    setFill(ctx.doc, BRAND.soft);
    ctx.doc.roundedRect(PAGE.ml, ctx.y, CONTENT_W, h, 2, 2, "F");
    setFill(ctx.doc, BRAND.accent);
    ctx.doc.rect(PAGE.ml, ctx.y, 2, h, "F");
    setText(ctx.doc, BRAND.ink);
    ctx.doc.setFont("helvetica", "normal");
    ctx.doc.setFontSize(10);
    ctx.doc.text(lines, PAGE.ml + 6, ctx.y + 6);
    ctx.y += h + 4;
  }

  save(ctx, `ATSFy_RejectionDecoder_${safeName(profile.targetRole)}_${todayStr()}.pdf`);
}
