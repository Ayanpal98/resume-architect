Add a recruiter pricing tab to the existing landing-page PricingSection. Keep the current Job Seeker 3-tier premium grid untouched and add a second tab with 3 monthly subscription tiers for recruiters. No checkout logic, payment provider, or backend changes are in scope.

## New layout
- Convert the Pricing section into a shadcn `Tabs` block with two tabs:
  - **For Job Seekers** — existing 3 tiers (₹999 / ₹1,499 / ₹2,599)
  - **For Recruiters** — new 3-tier monthly subscription grid
- Default tab remains **For Job Seekers**.
- Tab labels use the same muted/uppercase styling as the section label.

## Recruiter tier details
| Tier | Price | Positioning | Core gains | Key features | CTA | Variant |
|---|---|---|---|---|---|---|
| **Recruiter Lite** | ₹2,499 / month | Small teams, occasional hiring | 25 AI screenings, 1 job requisition, basic scorecards | CSV export, email support, candidate ranking, ghost-screening preview | Get Started | standard |
| **Recruiter Growth** | ₹4,999 / month | Active hiring teams | 100 AI screenings, 5 job requisitions, advanced match scoring | Team collaboration, ATS integration placeholders, priority support | Get Started | highlight |
| **Recruiter Scale** | ₹9,999 / month | High-volume / enterprise hiring | 250 AI screenings, unlimited requisitions, custom scoring | API access, white-label reports, custom scoring weights, dedicated account manager | Get Started | dark |

- All recruiter CTAs route to `/welcome` (the existing sign-up / role-selection flow).
- The feature list for each tier should reuse the same gains box and bullet list pattern used by the job seeker cards.

## File changes
- **Edit `src/components/PricingSection.tsx`** only.
  - Add imports: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` from `@/components/ui/tabs`, and `Link` from `react-router-dom`.
  - Keep the `MainPlan` type and `mainPlans` data.
  - Add a `RecruiterPlan` type and `recruiterPlans` data.
  - Reuse `MainPlanCard` for both grids by making the card component accept `period` and `cta` generically.
  - Wrap the two grids in `Tabs` with `defaultValue="jobseeker"`.
  - Make the bottom trust line tab-aware:
    - Job Seeker tab: "One-time purchases. No subscriptions. No auto-renewals. 7-day money-back guarantee on all paid reports."
    - Recruiter tab: "Monthly subscription plans. Cancel anytime. 7-day money-back guarantee."
  - Keep the existing intro heading but update the subheadline to: "One-time reports for candidates. Monthly plans for recruiters. Choose the side of the hiring market you play on."

## Out of scope
- No payment processor integration (Paddle/Stripe/Shopify) unless explicitly requested later.
- No changes to `/welcome`, `/auth`, `/recruiter`, or any backend edge functions.
- No changes to existing job seeker prices, features, or CTAs.

## Verification
- Run `bun run build` to confirm no TypeScript/import errors.
- Check the pricing section at mobile, tablet, and desktop widths to ensure the tab bar and 3-column grid do not overflow.