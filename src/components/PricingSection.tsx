import { CheckCircle2, ArrowRight, Zap, Star, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

/* ─── Types ─── */
type MainPlan = {
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

type AddonPlan = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
};

/* ─── Main Tiers ─── */
const mainPlans: MainPlan[] = [
  {
    name: "Essentials",
    price: "₹599",
    period: "/ report",
    badge: "Start Strong",
    icon: <Zap className="w-5 h-5" />,
    gains: [
      { label: "ATS Visibility", detail: "Resume passes 90%+ of applicant tracking systems" },
      { label: "Keyword Match", detail: "Role-aligned keywords injected across all sections" },
      { label: "Clean Format", detail: "Single-column ATS-safe PDF with zero parsing errors" },
    ],
    features: [
      "Full ATS Readiness scan + score",
      "Keyword coverage & gap analysis",
      "Section-by-section AI rewrite",
      "1 tailored resume variant",
      "PDF + DOCX download",
    ],
    cta: "Get Essentials",
    variant: "standard",
  },
  {
    name: "Professional",
    price: "₹999",
    period: "/ report",
    badge: "Most Popular ⭐",
    icon: <Star className="w-5 h-5" />,
    gains: [
      { label: "Job Match Boost", detail: "Resume tuned to a specific job description — 2× interviews" },
      { label: "Skills Authority", detail: "15 top skills ranked by industry demand for your role" },
      { label: "Cover Letter", detail: "Matching AI cover letter that mirrors the JD language" },
    ],
    features: [
      "Everything in Essentials",
      "Job-description match analysis",
      "AI cover letter generator",
      "Skills gap & optimization",
      "Before vs After comparison",
      "2 resume variants (role-specific)",
    ],
    cta: "Go Professional",
    variant: "highlight",
  },
  {
    name: "Premium",
    price: "₹1,499",
    period: "/ report",
    badge: "Full Power",
    icon: <Crown className="w-5 h-5" />,
    gains: [
      { label: "Career Roadmap", detail: "30-60-90 day plan to close every gap in your profile" },
      { label: "LinkedIn Sync", detail: "Headline, About & featured sections rewritten for recruiters" },
      { label: "Interview Ready", detail: "Role-specific question pack + answer frameworks" },
    ],
    features: [
      "Everything in Professional",
      "30-60-90 day career roadmap",
      "LinkedIn profile optimization",
      "Interview question pack",
      "Recruiter-perspective screening",
      "30-day re-scan & re-optimization",
      "Priority support & white-glove delivery",
    ],
    cta: "Unlock Premium",
    variant: "dark",
  },
];

/* ─── Add-on Tiers ─── */
const addonPlans: AddonPlan[] = [
  {
    name: "Quick Scan",
    price: "₹99",
    period: "/ scan",
    description: "Not ready to buy? Get a fast health check first.",
    features: [
      "ATS Readiness score (0-100)",
      "Top 5 quick-win fixes",
      "Keyword density snapshot",
      "Delivered in 2 minutes",
    ],
    cta: "Run Quick Scan",
  },
  {
    name: "Deep Analysis",
    price: "₹399",
    period: "/ report",
    description: "Evidence-first rewrite that keeps your real scope intact.",
    features: [
      "Evidence-first resume read",
      "Depth-aware section rewriting",
      "Recruiter-pass line-level fixes",
      "Gap-to-90% Hiring Readiness plan",
    ],
    cta: "Run Deep Analysis",
  },
  {
    name: "Career Boost",
    price: "₹799",
    period: "/ bundle",
    description: "Everything a career switcher or senior candidate needs.",
    features: [
      "Professional tier resume + cover letter",
      "LinkedIn headline & About rewrite",
      "30-60-90 day transition roadmap",
      "Senior-role interview question pack",
    ],
    cta: "Get Career Boost",
  },
];

/* ─── Card Components ─── */
const MainPlanCard = ({ plan }: { plan: MainPlan }) => {
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
      >
        {plan.cta}
        <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </Button>
    </div>
  );
};

const AddonCard = ({ plan }: { plan: AddonPlan }) => {
  return (
    <div className="flex flex-col h-full rounded-xl border border-dashed border-border bg-muted/30 p-4 sm:p-5 lg:p-6 transition-all hover:border-primary/30 hover:bg-muted/50">
      <div className="mb-2 sm:mb-3">
        <h4 className="font-display text-base sm:text-lg font-medium text-foreground">{plan.name}</h4>
        <div className="flex items-baseline gap-1.5 mt-0.5 sm:mt-1">
          <span className="font-display text-xl sm:text-2xl font-medium text-foreground">{plan.price}</span>
          <span className="text-xs sm:text-sm text-muted-foreground">{plan.period}</span>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">{plan.description}</p>
      </div>

      <ul className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-5 flex-1">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm text-foreground">
            <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 mt-0.5 text-accent" />
            <span className="leading-snug">{feature}</span>
          </li>
        ))}
      </ul>

      <Button variant="ghost" className="w-full text-xs sm:text-sm" size="sm">
        {plan.cta}
        <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 ml-1" />
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
        <div className="max-w-3xl mb-8 sm:mb-10 lg:mb-14">
          <div className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3 sm:mb-4">
            — Pricing
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium text-foreground mb-3 sm:mb-4 leading-tight tracking-tight">
            Simple pricing. <em className="italic font-normal text-primary">Built for Indian job seekers.</em>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg font-sans">
            One-time report purchases. No subscriptions, no auto-renewals. Pick a full package or bolt on exactly what you need.
          </p>
        </div>

        <Tabs defaultValue="jobseeker" className="w-full">
          <div className="flex justify-center mb-8 sm:mb-10 lg:mb-14">
            <TabsList className="bg-muted p-1 rounded-xl">
              <TabsTrigger
                value="jobseeker"
                className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                For Job Seekers
              </TabsTrigger>
              <TabsTrigger
                value="recruiter"
                className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                For Recruiters
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="jobseeker" className="space-y-8 sm:space-y-10 lg:space-y-12">
            {/* Main Plans */}
            <div>
              <h3 className="font-display text-lg sm:text-xl lg:text-2xl font-medium text-foreground mb-4 sm:mb-6 text-center">
                Full Report Packages
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {mainPlans.map((plan) => (
                  <MainPlanCard key={plan.name} plan={plan} />
                ))}
              </div>
            </div>

            {/* Add-ons */}
            <div>
              <h3 className="font-display text-lg sm:text-xl lg:text-2xl font-medium text-foreground mb-4 sm:mb-6 text-center">
                Special Add-ons
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                {addonPlans.map((plan) => (
                  <AddonCard key={plan.name} plan={plan} />
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="recruiter">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {[
                {
                  name: "Starter",
                  price: "₹4,999",
                  period: "/ month",
                  badge: "Small teams",
                  icon: <Zap className="w-5 h-5" />,
                  gains: [
                    { label: "Time Saved", detail: "Screen 75 candidates in minutes, not days" },
                    { label: "Consistent Scoring", detail: "Same AI weights applied to every resume" },
                    { label: "Branded Reports", detail: "PDFs carry your company logo & colors" },
                  ],
                  features: [
                    "Up to 75 candidate screenings / month",
                    "Auto-ranking with score weights",
                    "Skill & experience match analysis",
                    "Branded PDF screening reports",
                  ],
                  cta: "Start Screening",
                  variant: "standard" as const,
                },
                {
                  name: "Growth",
                  price: "₹14,999",
                  period: "/ month",
                  badge: "Most Popular ⭐",
                  icon: <Star className="w-5 h-5" />,
                  gains: [
                    { label: "Bulk Power", detail: "Upload 300 resumes and compare side-by-side" },
                    { label: "Custom Weights", detail: "Tune scoring per role, team, or department" },
                    { label: "Hiring Insights", detail: "Dashboard shows funnel & pipeline trends" },
                  ],
                  features: [
                    "Everything in Starter",
                    "300 candidate screenings / month",
                    "Bulk upload & side-by-side compare",
                    "Custom scoring weights per role",
                    "Hiring insights dashboard",
                    "Priority support",
                  ],
                  cta: "Scale Hiring",
                  variant: "highlight" as const,
                },
                {
                  name: "Enterprise",
                  price: "Custom",
                  period: "",
                  badge: "Full platform",
                  icon: <Crown className="w-5 h-5" />,
                  gains: [
                    { label: "Unlimited Volume", detail: "No caps on screenings or team members" },
                    { label: "Integration Ready", detail: "API + ATS connectors for seamless flow" },
                    { label: "Enterprise Security", detail: "SSO, audit logs & dedicated success manager" },
                  ],
                  features: [
                    "Unlimited candidate screenings",
                    "API & ATS integrations",
                    "Custom AI scoring models",
                    "SSO, audit logs & dedicated CSM",
                  ],
                  cta: "Talk to Sales",
                  variant: "dark" as const,
                },
              ].map((plan) => (
                <MainPlanCard key={plan.name} plan={plan} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <p className="text-center text-xs sm:text-sm text-muted-foreground mt-8 sm:mt-10 lg:mt-12 max-w-2xl mx-auto font-sans">
          One-time purchases. No subscriptions. No auto-renewals. 7-day money-back guarantee on all paid reports.
        </p>
      </div>
    </section>
  );
};
