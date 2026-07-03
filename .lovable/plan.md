## Goal

Refresh the pricing section header and prune every tier's feature list so it lists **only functions that are actually live in the ATSFy app today**. No aspirational items, no vague marketing lines.

Scope is limited to `src/components/PricingSection.tsx`. No pricing, routing, or backend changes.

---

## 1. Header rewrite

Replace the current intro block:

- Eyebrow: `— Pricing`
- H2: **"Pay for what the platform actually does."** *One report at a time.*
- Sub: "One-time intelligence reports for candidates. Monthly screening plans for recruiters. Every feature listed below is live in the product today."

Tabs stay: **For Job Seekers** / **For Recruiters**.

---

## 2. Job Seeker tiers — features trimmed to shipped capabilities

Only keep items backed by real modules in the app (ATS Readiness, AI rewrite, Job Match, Cover Letter, Skills grouping, Templates, Career Roadmap, Deep Improvement, Comparison view, PDF export).

**Premium Starter — ₹999**
- Full ATS Readiness scan + Hiring Readiness score
- Section-by-section AI rewrite (summary, experience, skills)
- Skills grouped into 3 blocks, capped at 15
- Clean single-column ATS-safe PDF export
- Access to the full template library (6 templates)

**Premium Professional — ₹1,499** *(Most Popular)*
- Everything in Premium Starter
- Job Description match analysis (Before vs After %)
- AI cover letter generator aligned to the JD
- Keyword gap analysis + Quick Wins
- Resume comparison view (before/after diff)
- Action verb enhancer

**Premium Elite — ₹2,599**
- Everything in Premium Professional
- 30-60-90 day Career Roadmap report
- Deep Resume Improvement (evidence-linked rewrite)
- Career Intelligence report export
- ATS Readiness PDF report with score deltas

Removed (not shipped): LinkedIn rewrite, interview question pack, recruiter-perspective screening on the jobseeker side, 30-day re-scan, priority/white-glove support, "2 role-specific variants" as a countable deliverable.

---

## 3. Recruiter tiers — features trimmed to shipped capabilities

Keep only what the recruiter dashboard actually does today (bulk screening, IRS/CSA/SAX scoring, ghost preview, CSV export, PDF reports, JD match).

**Recruiter Lite — ₹2,499/mo**
- 25 candidate screenings / month
- 1 active job requisition
- IRS, CSA, SAX scorecards
- Bulk resume upload + parsing
- Ghost screening preview
- CSV export of screening results

**Recruiter Growth — ₹4,999/mo** *(Most Popular)*
- 100 candidate screenings / month
- 5 active job requisitions
- JD-to-resume match scoring with ranked shortlists
- PDF screening reports per candidate
- Bulk CSV export with score breakdown

**Recruiter Scale — ₹9,999/mo**
- 250 candidate screenings / month
- Unlimited job requisitions
- Custom scoring weights (IRS/CSA/SAX)
- PDF screening reports per candidate
- Full CSV + PDF export bundle

Removed (not shipped): team seats, ATS integration placeholders, API/webhooks, white-label reports, dedicated account manager, email/priority support as a feature bullet.

Each tier's "What you gain" summary block updated to match the new bullets (3 concise gains per card).

---

## 4. Footer disclaimers

Kept as-is:
- Job Seekers: "One-time purchases. No subscriptions. No auto-renewals. 7-day money-back guarantee on all paid reports."
- Recruiters: "Monthly subscription plans. Cancel anytime. 7-day money-back guarantee."

---

## Technical notes

- Single file edit: `src/components/PricingSection.tsx`.
- Update the `jobSeekerPlans` and `recruiterPlans` arrays (`gains` + `features`) and the intro H2/sub copy.
- No changes to `PlanCard`, tab structure, prices, CTA links, icons, or variant styling.
- No route, Supabase, or edge function changes.
