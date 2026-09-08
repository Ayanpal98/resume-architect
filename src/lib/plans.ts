import type { ReactNode } from "react";

export type PlanVariant = "standard" | "highlight" | "dark";

export type Plan = {
  id: string;
  name: string;
  price: string;
  amount: number;
  currency: string;
  period: string;
  audience: "jobseeker" | "recruiter";
  badge?: string;
  iconName: "zap" | "star" | "crown" | "users" | "building" | "trending";
  gains: { label: string; detail: string }[];
  features: string[];
  cta: string;
  variant: PlanVariant;
};

export const jobSeekerPlans: Plan[] = [
  {
    id: "premium-starter",
    name: "Premium Starter",
    price: "₹999",
    amount: 999,
    currency: "INR",
    period: "/ report",
    audience: "jobseeker",
    badge: "Start Strong",
    iconName: "zap",
    gains: [
      { label: "ATS Readiness scan", detail: "Full Hiring Readiness score with issue breakdown" },
      { label: "Section-by-section rewrite", detail: "AI rewrite for summary, experience and skills" },
      { label: "ATS-safe PDF export", detail: "Clean single-column PDF built to parse cleanly" },
    ],
    features: [
      "Full ATS Readiness scan + Hiring Readiness score",
      "Section-by-section AI rewrite",
      "Skills grouped into 3 blocks (capped at 15)",
      "Clean single-column ATS-safe PDF export",
      "Access to the full template library (6 templates)",
    ],
    cta: "Get Premium Starter",
    variant: "standard",
  },
  {
    id: "premium-professional",
    name: "Premium Professional",
    price: "₹1,499",
    amount: 1499,
    currency: "INR",
    period: "/ report",
    audience: "jobseeker",
    badge: "Most Popular ⭐",
    iconName: "star",
    gains: [
      { label: "Job Match analysis", detail: "Before vs After match % against a target JD" },
      { label: "AI cover letter", detail: "Cover letter aligned to the job description" },
      { label: "Keyword & verb tuning", detail: "Gap analysis plus action-verb enhancer" },
    ],
    features: [
      "Everything in Premium Starter",
      "Job Description match analysis (Before vs After %)",
      "AI cover letter generator aligned to the JD",
      "Keyword gap analysis + Quick Wins",
      "Resume comparison view (before/after diff)",
      "Action verb enhancer",
    ],
    cta: "Go Premium Professional",
    variant: "highlight",
  },
  {
    id: "premium-elite",
    name: "Premium Elite",
    price: "₹2,599",
    amount: 2599,
    currency: "INR",
    period: "/ report",
    audience: "jobseeker",
    badge: "Full Power",
    iconName: "crown",
    gains: [
      { label: "90-day Career Roadmap", detail: "30-60-90 day plan to close every profile gap" },
      { label: "Deep Resume Improvement", detail: "Evidence-linked rewrite with fabrication guards" },
      { label: "Career Intelligence export", detail: "Full intelligence report + ATS score deltas" },
    ],
    features: [
      "Everything in Premium Professional",
      "30-60-90 day Career Roadmap report",
      "Deep Resume Improvement (evidence-linked rewrite)",
      "Career Intelligence report export",
      "ATS Readiness PDF report with score deltas",
    ],
    cta: "Unlock Premium Elite",
    variant: "dark",
  },
];

export const recruiterPlans: Plan[] = [
  {
    id: "recruiter-lite",
    name: "Recruiter Lite",
    price: "₹4,499",
    amount: 4499,
    currency: "INR",
    period: "/ month",
    audience: "recruiter",
    badge: "Start Hiring",
    iconName: "users",
    gains: [
      { label: "25 AI screenings", detail: "Candidate-readiness analysis for every upload" },
      { label: "1 job requisition", detail: "Define one target role and benchmark against it" },
      { label: "Scorecards + CSV", detail: "IRS, CSA, SAX scores exportable to CSV" },
    ],
    features: [
      "25 candidate screenings / month",
      "1 active job requisition",
      "IRS, CSA, SAX scorecards",
      "Bulk resume upload + parsing",
      "Ghost screening preview",
      "CSV export of screening results",
    ],
    cta: "Get Started",
    variant: "standard",
  },
  {
    id: "recruiter-growth",
    name: "Recruiter Growth",
    price: "₹6,999",
    amount: 6999,
    currency: "INR",
    period: "/ month",
    audience: "recruiter",
    badge: "Most Popular ⭐",
    iconName: "building",
    gains: [
      { label: "100 AI screenings", detail: "Enough volume for consistent active hiring" },
      { label: "5 job requisitions", detail: "Run parallel roles without swapping configs" },
      { label: "Ranked shortlists", detail: "JD-to-resume match scoring with ranked output" },
    ],
    features: [
      "100 candidate screenings / month",
      "5 active job requisitions",
      "JD-to-resume match scoring with ranked shortlists",
      "PDF screening reports per candidate",
      "Bulk CSV export with score breakdown",
    ],
    cta: "Get Started",
    variant: "highlight",
  },
  {
    id: "recruiter-scale",
    name: "Recruiter Scale",
    price: "₹11,999",
    amount: 11999,
    currency: "INR",
    period: "/ month",
    audience: "recruiter",
    badge: "High Volume",
    iconName: "trending",
    gains: [
      { label: "250 AI screenings", detail: "High-volume hiring with headroom to scale" },
      { label: "Unlimited requisitions", detail: "Open as many roles as your business needs" },
      { label: "Custom scoring weights", detail: "Tune IRS / CSA / SAX weights per role" },
    ],
    features: [
      "250 candidate screenings / month",
      "Unlimited job requisitions",
      "Custom scoring weights (IRS / CSA / SAX)",
      "PDF screening reports per candidate",
      "Full CSV + PDF export bundle",
    ],
    cta: "Get Started",
    variant: "dark",
  },
];

export const allPlans: Plan[] = [...jobSeekerPlans, ...recruiterPlans];

export const getPlanById = (id: string | null | undefined): Plan | undefined =>
  allPlans.find((p) => p.id === id);

export const TRANSPARENCY_LINE =
  "Premium reports are paid. No subscriptions for job seekers, no hidden tiers.";

export type { ReactNode };
