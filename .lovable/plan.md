
## Goal
Add a polished, full-length PDF export for each of the 5 Career Intelligence outputs — Roadmap, Skill Analysis, Role Fit Score, AI Coaching, and Rejection Decoder — including every field from the AI response, styled as a premium, easy-to-read user report.

## Approach
Client-side generation using `jsPDF` + `jspdf-autotable` (already used elsewhere for report exports). No edge function changes, no new server calls. Each report is generated from the existing `results[mode]` state so the full JSON payload is rendered — no data omitted.

## What gets added

**1. New util: `src/lib/careerIntelligencePdf.ts`**
A single module exporting one function per mode:
- `exportRoadmapPdf(data, profile)`
- `exportSkillAnalysisPdf(data, profile)`
- `exportRoleFitPdf(data, profile)`
- `exportCoachingPdf(data, profile)`
- `exportRejectionDecoderPdf(data, profile)`

Each function shares a common premium layout:
- Cover header: ATSFy gradient bar, report title, candidate current → target role, industry, timeline, generation date
- Executive summary / verdict block
- Section-per-field rendering with auto page-breaks
- Tables for structured arrays (phases, dimensions, skills, questions, reasons, actions)
- Bullet lists for string arrays
- Readiness/score visual bars where numeric scores exist
- Footer on every page: page X of Y, ATSFy Technologies™ trademark, UUID, timestamp, 24h data deletion notice, AI disclaimer (matches project compliance rules)
- Consistent typography: sans-serif, heading weights, muted section labels, accent color for scores

Field coverage per mode (all fields from the edge function schemas):
- **Roadmap**: executive_summary, readiness_score, target_score, phases[] (phase, title, objective, actions, deliverables, expected_score_after), quick_wins, certifications[] (name, provider, priority, cost, time), networking (target_companies, communities, events)
- **Skill Analysis**: summary, strong_skills[], missing_critical_skills[], skills_to_deprioritize[], emerging_skills_to_watch[], recommended_skill_stack
- **Role Fit**: overall_fit_score, verdict, dimensions[] (name, score, weight, observations) as a table, positioning_strategy, risks, opportunities
- **AI Coaching**: coaching_summary, likely_interview_questions[] (question, how_to_answer, red_flags_to_avoid), talking_points, weakness_mitigation[], elevator_pitch, outreach_template, confidence_builders
- **Rejection Decoder**: decoded_summary, likely_reasons[] with severity color coding, what_recruiters_actually_meant[], recovery_actions[], portfolio_fixes[], next_attempt_strategy

**2. `src/pages/CareerIntelligence.tsx` edits**
- Import the export functions.
- Add a "Download PDF Report" button (with Download icon) to the top-right of each of the 5 result views (`RoadmapView`, `SkillAnalysisView`, `RoleFitView`, `CoachingView`, `RejectionDecoderView`), passing the current `data` and `profile`.
- Button disabled when data is null; toast on success/failure.

## Not changing
- Edge functions
- AI prompts / schemas
- Pricing, auth, layout of the input sidebar

## Technical notes
- jsPDF + jspdf-autotable are already in `package.json` (used by `pdfGenerator.ts` / `reportGenerator.ts`), so no new deps.
- Long text fields use `splitTextToSize` for proper wrapping.
- Every section calls a `checkPageBreak(y, needed)` helper so nothing gets cut off — "full length" is guaranteed.
- Filenames: `ATSFy_<Mode>_<TargetRole>_<YYYY-MM-DD>.pdf`.

## Files touched
- Create: `src/lib/careerIntelligencePdf.ts`
- Edit: `src/pages/CareerIntelligence.tsx` (5 buttons + imports)
