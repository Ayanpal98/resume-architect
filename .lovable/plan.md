Update the landing-page PricingSection to show only 3 premium Job Seeker tiers. Remove the Special Add-ons row and the Recruiter tab entirely. Keep all existing payment logic, Supabase calls, checkout functions, and routing untouched.

New tier layout (exact copy to be written in `src/components/PricingSection.tsx`):

1. Premium Starter — ₹999 / report
   - Best for: Mid-level professionals ready for a serious visibility upgrade
   - Gains: ATS-safe rewrite, keyword injection, 1 role-aligned variant
   - Features: ATS Readiness scan, section-by-section rewrite, clean single-column PDF, keyword gap analysis, 1 tailored variant
   - CTA: Get Premium Starter

2. Premium Professional — ₹1,499 / report
   - Best for: Targeted job applications that need to beat the ATS + human recruiter
   - Gains: JD-tuned resume, matching cover letter, skills authority map
   - Features: everything in Premium Starter, job-description match analysis, AI cover letter, 15 ranked skills, before/after comparison, 2 role-specific variants
   - CTA: Go Premium Professional
   - Badge: Most Popular ⭐

3. Premium Elite — ₹2,599 / report
   - Best for: Senior candidates, career switchers, and leadership roles
   - Gains: 90-day roadmap, LinkedIn rewrite, interview-ready prep pack
   - Features: everything in Premium Professional, 30-60-90 day career roadmap, LinkedIn profile optimization, interview question pack, recruiter-perspective screening, 30-day re-scan, priority support
   - CTA: Unlock Premium Elite

Visual changes:
- Remove the Recruiter `Tabs` completely; keep the section as a single Job Seeker grid.
- Remove the `addonPlans` block and its heading.
- Keep the existing card, badge, gains, and feature styling so the section stays mobile-responsive.
- Keep the bottom trust line: "One-time purchases. No subscriptions. No auto-renewals. 7-day money-back guarantee on all paid reports."
- Remove unused imports (`Tabs`, `TabsContent`, `TabsList`, `TabsTrigger`, `Sparkles`) after the layout changes.

Technical notes:
- File changed: `src/components/PricingSection.tsx` only.
- No changes to payment processing, Supabase purchase records, auth/session handling, or API calls.
- Build verification (`bun run build` or equivalent) after the edit.