import { CheckCircle2, ArrowRight, Zap, Star, Crown, Sparkles, Users, Building2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";

/* ─── Types ─── */
type Plan = {
  name: string;
  price: string;
  period: string;
  badge?: string;
  icon: React.ReactNode;
  gains: { label: string; detail: string }[];
  features: string[];
  cta: string;
  variant: "standard" | "highlight" | "dark";
};

/* ─── Job Seeker Premium Tiers ─── */
const jobSeekerPlans: Plan[] = [
  {
    name: "Premium Starter",
    price: "₹999",
    period: "/ report",
    badge: "Start Strong",
    icon: <Zap className="w-5 h-5" />,
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
    name: "Premium Professional",
    price: "₹1,499",
    period: "/ report",
    badge: "Most Popular ⭐",
    icon: <Star className="w-5 h-5" />,
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
    name: "Premium Elite",
    price: "₹2,599",
    period: "/ report",
    badge: "Full Power",
    icon: <Crown className="w-5 h-5" />,
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

/* ─── Recruiter Monthly Subscription Tiers ─── */
const recruiterPlans: Plan[] = [
  {
    name: "Recruiter Lite",
    price: "₹4,499",
    period: "/ month",
    badge: "Start Hiring",
    icon: <Users className="w-5 h-5" />,
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
    name: "Recruiter Growth",
    price: "₹6,999",
    period: "/ month",
    badge: "Most Popular ⭐",
    icon: <Building2 className="w-5 h-5" />,
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
    name: "Recruiter Scale",
    price: "₹11,999",
    period: "/ month",
    badge: "High Volume",
    icon: <TrendingUp className="w-5 h-5" />,
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

/* ─── Card Component ─── */
const PlanCard = ({ plan }: { plan: Plan }) => {
  const isHighlight = plan.variant === "highlight";
  const isDark = plan.variant === "dark";

  const cardClasses = [
    "relative flex flex-col h-full rounded-2xl border p-4 sm:p-6 lg:p-8 transition-all duration-300",
    isHighlight && "border-primary ring-2 ring-primary/20 shadow-xl scale-[1.02] bg-card",
    isDark && "border-foreground bg-foreground text-background shadow-xl",
    plan.variant === "standard" && "border-border bg-card hover:border-primary/40 hover:shadow-md",
  ]
    .filter(Boolean)
    .join(" ");

  const mutedText = isDark ? "text-background/60" : "text-muted-foreground";
  const heading = isDark ? "text-background" : "text-foreground";
  const check = isDark ? "text-background" : "text-accent";
  const divider = isDark ? "border-background/15" : "border-border";
  const gainBg = isDark ? "bg-background/10" : "bg-primary/5";
  const gainText = isDark ? "text-background/90" : "text-primary";
  const gainSub = isDark ? "text-background/60" : "text-muted-foreground";

  return (
    <div className={cardClasses}>
      {plan.badge && (
        <div className="absolute -top-2.5 left-4 sm:left-6">
          <Badge
            className={
              isHighlight
                ? "bg-primary text-primary-foreground px-2.5 py-0.5 text-[10px] uppercase tracking-[0.15em] shadow-md"
                : isDark
                  ? "bg-background text-foreground px-2.5 py-0.5 text-[10px] uppercase tracking-[0.15em]"
                  : "bg-background border border-border text-muted-foreground px-2.5 py-0.5 text-[10px] uppercase tracking-[0.15em] font-medium"
            }
          >
            {plan.badge}
          </Badge>
        </div>
      )}

      {/* Header */}
      <div className="mb-3 sm:mb-5">
        <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
          <span className={isDark ? "text-background/80" : "text-primary"}>{plan.icon}</span>
          <h3 className={`font-display text-xl sm:text-2xl font-medium tracking-tight ${heading}`}>
            {plan.name}
          </h3>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className={`font-display text-3xl sm:text-4xl font-medium tracking-tight ${heading}`}>
            {plan.price}
          </span>
          <span className={`text-xs sm:text-sm ${mutedText}`}>{plan.period}</span>
        </div>
      </div>

      {/* Gains */}
      <div className={`rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-5 ${gainBg}`}>
        <p className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-2 sm:mb-3 ${gainText}`}>
          What you gain
        </p>
        <ul className="space-y-2 sm:space-y-3">
          {plan.gains.map((gain, i) => (
            <li key={i} className="flex items-start gap-1.5 sm:gap-2">
              <Sparkles className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 mt-0.5 ${gainText}`} />
              <div>
                <p className={`text-xs sm:text-sm font-medium ${gainText}`}>{gain.label}</p>
                <p className={`text-[10px] sm:text-xs ${gainSub}`}>{gain.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Divider */}
      <div className={`border-t ${divider} mb-4 sm:mb-5`} />

      {/* Features */}
      <ul className="space-y-2 sm:space-y-2.5 mb-5 sm:mb-7 flex-1">
        {plan.features.map((feature, i) => (
          <li key={i} className={`flex items-start gap-2 text-xs sm:text-sm ${heading}`}>
            <CheckCircle2 className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 mt-0.5 ${check}`} />
            <span className="leading-snug">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        variant={isHighlight ? "hero" : isDark ? "default" : "outline"}
        className={
          isDark
            ? "w-full bg-background text-foreground hover:bg-background/90 text-xs sm:text-sm"
            : "w-full text-xs sm:text-sm"
        }
        size="sm"
        asChild
      >
        <Link to="/welcome">
          {plan.cta}
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </Link>
      </Button>
    </div>
  );
};

/* ─── Section ─── */
export const PricingSection = () => {
  return (
    <section id="pricing" className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 border-t border-border/60">
      <div className="container mx-auto max-w-6xl">
        {/* Intro */}
        <div className="max-w-3xl mb-6 sm:mb-8 lg:mb-12">
          <div className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3 sm:mb-4">
            — Pricing
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium text-foreground mb-3 sm:mb-4 leading-tight tracking-tight">
            Pay for what the platform actually does. <em className="italic font-normal text-primary">One report at a time.</em>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg font-sans">
            One-time intelligence reports for candidates. Monthly screening plans for recruiters. Every feature listed below is live in the product today.
          </p>
        </div>

        <Tabs defaultValue="jobseeker" className="w-full">
          <TabsList className="mb-6 sm:mb-8 bg-muted/60 p-1 h-auto rounded-lg">
            <TabsTrigger
              value="jobseeker"
              className="text-xs sm:text-sm uppercase tracking-wider px-3 sm:px-5 py-2 sm:py-2.5 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              For Job Seekers
            </TabsTrigger>
            <TabsTrigger
              value="recruiter"
              className="text-xs sm:text-sm uppercase tracking-wider px-3 sm:px-5 py-2 sm:py-2.5 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              For Recruiters
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobseeker" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {jobSeekerPlans.map((plan) => (
                <PlanCard key={plan.name} plan={plan} />
              ))}
            </div>
            <p className="text-center text-xs sm:text-sm text-muted-foreground mt-8 sm:mt-10 lg:mt-12 max-w-2xl mx-auto font-sans">
              One-time purchases. No subscriptions. No auto-renewals. 7-day money-back guarantee on all paid reports.
            </p>
          </TabsContent>

          <TabsContent value="recruiter" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {recruiterPlans.map((plan) => (
                <PlanCard key={plan.name} plan={plan} />
              ))}
            </div>
            <p className="text-center text-xs sm:text-sm text-muted-foreground mt-8 sm:mt-10 lg:mt-12 max-w-2xl mx-auto font-sans">
              Monthly subscription plans. Cancel anytime. 7-day money-back guarantee.
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};
