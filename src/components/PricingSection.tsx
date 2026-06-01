import { CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

type Plan = {
  name: string;
  price: string;
  period: string;
  badge?: string;
  bestFor: string;
  features: string[];
  cta: string;
  variant: "muted" | "standard" | "highlight" | "dark";
};

const jobSeekerPlans: Plan[] = [
  {
    name: "Free",
    price: "₹0",
    period: "/ forever",
    badge: "Start free",
    bestFor: "First-time check on resume health",
    features: [
      "1 ATS Readiness scan / month",
      "Basic Hiring Readiness score",
      "Top 3 quick-win suggestions",
      "Keyword coverage overview",
      "PDF download (with footer branding)",
    ],
    cta: "Start Free",
    variant: "muted",
  },
  {
    name: "Starter",
    price: "₹199",
    period: "/ report",
    badge: "Quick fix",
    bestFor: "One-time resume cleanup",
    features: [
      "Full ATS Readiness report",
      "Keyword & formatting fixes",
      "Top 10 prioritized suggestions",
      "Clean PDF download (no branding)",
    ],
    cta: "Get Starter Report",
    variant: "standard",
  },
  {
    name: "Pro",
    price: "₹249",
    period: "/ report",
    badge: "Most Popular ⭐",
    bestFor: "Active job seekers applying weekly",
    features: [
      "Everything in Starter",
      "Job-description match analysis",
      "Skills gap & keyword optimization",
      "AI resume rewrite (section-by-section)",
      "Before vs After comparison",
      "Unlimited PDF downloads",
    ],
    cta: "Get Pro Report",
    variant: "highlight",
  },
  {
    name: "Career+",
    price: "₹599",
    period: "/ report",
    badge: "Best value",
    bestFor: "Career switchers & senior roles",
    features: [
      "Everything in Pro",
      "AI cover letter generator",
      "30-60-90 day career roadmap",
      "Interview question pack (role-specific)",
      "LinkedIn headline & About rewrite",
      "Priority report generation",
    ],
    cta: "Unlock Career+",
    variant: "standard",
  },
  {
    name: "Premium",
    price: "₹999",
    period: "/ report",
    badge: "Full platform",
    bestFor: "Maximum results & faster hiring",
    features: [
      "Everything in Career+",
      "Multi-role tailored resume variants",
      "Recruiter-perspective screening report",
      "LinkedIn profile full optimization",
      "30-day re-scan & re-optimization",
      "White-glove report delivery",
    ],
    cta: "Go Premium",
    variant: "dark",
  },
];

const recruiterPlans: Plan[] = [
  {
    name: "Starter",
    price: "₹4,999",
    period: "/ month",
    badge: "Small teams",
    bestFor: "Startups & solo recruiters",
    features: [
      "Up to 75 candidate screenings / month",
      "Auto-ranking with score weights",
      "Skill & experience match analysis",
      "Branded PDF screening reports",
    ],
    cta: "Start Screening",
    variant: "standard",
  },
  {
    name: "Growth",
    price: "₹14,999",
    period: "/ month",
    badge: "Most Popular ⭐",
    bestFor: "Scaling hiring teams",
    features: [
      "Everything in Starter",
      "300 candidate screenings / month",
      "Bulk upload & side-by-side compare",
      "Custom scoring weights per role",
      "Hiring insights dashboard",
      "Priority support",
    ],
    cta: "Scale Hiring",
    variant: "highlight",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    badge: "Full platform",
    bestFor: "Large hiring organizations",
    features: [
      "Unlimited candidate screenings",
      "API & ATS integrations",
      "Custom AI scoring models",
      "SSO, audit logs & dedicated CSM",
    ],
    cta: "Talk to Sales",
    variant: "dark",
  },
];

const PlanCard = ({ plan }: { plan: Plan }) => {
  const isHighlight = plan.variant === "highlight";
  const isDark = plan.variant === "dark";
  const isMuted = plan.variant === "muted";

  const cardClasses = [
    "relative flex flex-col h-full rounded-2xl border p-6 sm:p-7 transition-all duration-300",
    isHighlight && "border-primary ring-2 ring-primary/20 shadow-xl scale-[1.02] bg-card",
    isDark && "border-foreground bg-foreground text-background shadow-xl",
    isMuted && "border-dashed border-border bg-muted/30",
    plan.variant === "standard" && "border-border bg-card hover:border-primary/40 hover:shadow-md",
  ]
    .filter(Boolean)
    .join(" ");

  const mutedTextClass = isDark ? "text-background/60" : "text-muted-foreground";
  const headingClass = isDark ? "text-background" : "text-foreground";
  const checkClass = isDark ? "text-background" : "text-accent";
  const dividerClass = isDark ? "border-background/15" : "border-border";

  return (
    <div className={cardClasses}>
      {plan.badge && (
        <div className="absolute -top-3 left-6">
          <Badge
            className={
              isHighlight
                ? "bg-primary text-primary-foreground px-3 py-1 text-[10px] uppercase tracking-[0.15em] shadow-md"
                : isDark
                  ? "bg-background text-foreground px-3 py-1 text-[10px] uppercase tracking-[0.15em]"
                  : "bg-background border border-border text-muted-foreground px-3 py-1 text-[10px] uppercase tracking-[0.15em] font-medium"
            }
          >
            {plan.badge}
          </Badge>
        </div>
      )}

      <div className="mb-5">
        <h3 className={`font-display text-2xl font-medium tracking-tight ${headingClass}`}>
          {plan.name}
        </h3>
        <p className={`text-xs mt-1 ${mutedTextClass}`}>Best for: {plan.bestFor}</p>
      </div>

      <div className={`pb-5 mb-5 border-b ${dividerClass}`}>
        <div className="flex items-baseline gap-1.5">
          <span className={`font-display text-4xl font-medium tracking-tight ${headingClass}`}>
            {plan.price}
          </span>
          {plan.period && <span className={`text-sm ${mutedTextClass}`}>{plan.period}</span>}
        </div>
      </div>

      <ul className="space-y-3 mb-7 flex-1">
        {plan.features.map((feature, i) => (
          <li key={i} className={`flex items-start gap-2.5 text-sm ${headingClass}`}>
            <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${checkClass}`} />
            <span className="leading-snug">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        variant={isHighlight ? "hero" : isDark ? "default" : "outline"}
        className={
          isDark
            ? "w-full bg-background text-foreground hover:bg-background/90"
            : "w-full"
        }
        size="lg"
      >
        {plan.cta}
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
};

export const PricingSection = () => {
  return (
    <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-6 border-t border-border/60">
      <div className="container mx-auto max-w-6xl">
        <div className="max-w-3xl mb-10 sm:mb-14">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
            — Pricing
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium text-foreground mb-4 leading-tight tracking-tight">
            Simple pricing. <em className="italic font-normal text-primary">Built for Indian job seekers.</em>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg font-sans">
            Start free. Upgrade only when you're ready to apply. No subscriptions, no hidden fees — pay per report.
          </p>
        </div>

        <Tabs defaultValue="jobseeker" className="w-full">
          <div className="flex justify-center mb-10 sm:mb-14">
            <TabsList className="bg-muted p-1 rounded-xl">
              <TabsTrigger
                value="jobseeker"
                className="px-5 py-2.5 rounded-lg text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                For Job Seekers
              </TabsTrigger>
              <TabsTrigger
                value="recruiter"
                className="px-5 py-2.5 rounded-lg text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                For Recruiters
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="jobseeker">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 lg:gap-8">
              {jobSeekerPlans.map((plan) => (
                <PlanCard key={plan.name} plan={plan} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recruiter">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {recruiterPlans.map((plan) => (
                <PlanCard key={plan.name} plan={plan} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <p className="text-center text-sm text-muted-foreground mt-12 max-w-2xl mx-auto font-sans">
          One-time purchases. No subscriptions. No auto-renewals. 7-day money-back guarantee on all paid reports.
        </p>
      </div>
    </section>
  );
};
