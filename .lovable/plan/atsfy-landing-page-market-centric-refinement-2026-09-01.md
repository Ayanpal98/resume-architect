# ATSFy Landing Page — Market-Centric Refinement

Frontend-only repositioning of the landing page: copy, layout, and visual hierarchy. No changes to backend, DB, APIs, auth, routes, scoring, reports, or any dashboard functionality. All existing CTAs keep their current routes (`/welcome`, `/auth`, `/recruiter`).

## Scope: files touched

- `src/pages/Index.tsx` — full section reorder + copy rewrite (largest change)
- `src/components/PricingSection.tsx` — copy polish only (transparency line, "Premium reports are paid"); keep ₹199/₹499/₹1499 and recruiter tiers exactly as-is
- `src/components/RecruiterIntelligenceSection.tsx` — headline/copy reframed as candidate-job alignment decision support (layout kept)
- `src/components/CareerIntelligenceSection.tsx` — light copy alignment to "Insight" layer of the report journey
- `src/components/TestimonialsSection.tsx` — verify personas are clearly fictional/illustrative; remove or soften any success-rate claims
- `src/components/LiveStatsCounter.tsx` — keep component, but label counters as platform activity (no fake success metrics); hero metric cards labeled "Illustrative example"
- Not touched: routes, auth, builder, recruiter dashboard, edge functions, pricing amounts, brand tokens

## New landing page structure (top → bottom)

1. **Nav** — unchanged; links updated to new anchors (Problem, How it Works, Reports, Pricing)
2. **Hero** — Headline: "Know Where You Stand Before You Apply." Sub: ATS readiness, job match, skill gaps, improvement areas before applying. Primary CTA "Analyze My Profile" → `/welcome`; secondary "I'm Hiring" → `/recruiter`. Support line: "AI-powered • Explainable • Merit-first". Right-side visual reworked from resume skeleton to the CANDIDATE → JOB → ANALYSIS → INSIGHT flow; metric cards labeled "Illustrative example".
3. **Problem** — "A better resume doesn't always mean a better job match." Four cards: Resume Readiness / Role Alignment / Skill Gaps / Career Direction, ending with "ATSfy connects these signals instead of treating your resume as the whole story."
4. **Differentiator ladder** — "ATS Readiness is only one part of the picture." Visual vertical flow: ATS Readiness → Job Match → Career Insight, each with its one-line question. Any numbers marked "Illustrative example".
5. **Report journey** — "One profile. Multiple layers of intelligence." Numbered 01–04 (ATS Readiness, Resume Optimization, Job Match Analysis, Career Insights) with the visual READINESS → OPTIMIZATION → MATCH → INSIGHT chain. Reuses existing report descriptions; links into existing SampleReportsShowcase.
6. **Honest optimization** — "Optimize your profile. Don't fabricate it." Three principles: Evidence / Alignment / Transparency. (Absorbs the current Deep Resume Improvement band's message.)
7. **For Job Seekers** — "Make Better Applications, Not Just Better Resumes." Check → Improve → Match → Plan chips mapped to existing reports. CTA "Analyze My Profile".
8. **For Recruiters** — reuse RecruiterIntelligenceSection with reframed headline "Understand Candidate-Job Alignment", decision-support disclaimer, CTA "I'm Hiring" → `/recruiter`. Keep TwoSidedPlatformSection.
9. **Explainable AI** — "Don't just show a score. Show what it means." Flow: Score → Evidence → Gap → Recommendation.
10. **How ATSFy Works** — replace current 3-step pipeline with the 5-step flow: Profile → Resume → Target Job → Analysis → Insight.
11. **Who it's for** — compact 5-chip grid: Students & Freshers, Job Seekers, Career Switchers, Experienced Professionals, Recruiters.
12. **Trust** — "Merit over presentation." Evidence/alignment/transparency copy; no bias-free or guaranteed-outcome claims. Keep Security/Privacy/Grievance footer links.
13. **Pricing** — existing section + added line "Premium reports are paid. No subscriptions for job seekers, no hidden tiers."
14. **Sample reports showcase** — kept, moved after pricing as proof of output.
15. **Waitlist + Testimonials** — kept; testimonials checked for unsupported claims.
16. **Final CTA** — "Before your next application, know where you stand." with "Start Your Analysis" / "I'm Hiring".
17. **Footer** — unchanged.

## Removed/toned down

- Excessive glassmorphism and blur orbs reduced to subtle accents (tokens unchanged, fewer usages)
- Hero metric cards and any stats framed as illustrative, not performance claims
- "We guarantee you become visible…" replaced with defensible wording
- LiveStatsCounter retained but framed as platform activity, not success rates

## Verification

- Typecheck passes; preview loads on desktop + mobile viewport
- Click through every CTA: `/welcome`, `/auth`, `/recruiter`, `/security`, `/privacy` still work
- Acceptance checklist: positioning clear in hero, audiences separated, report journey connected, pricing ₹199/₹499/₹1499 visible, no fabricated stats, no functionality touched
