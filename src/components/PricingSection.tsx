import { CheckCircle2, ArrowRight, Zap, Star, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
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

/* ─── Premium Tiers ─── */
const mainPlans: MainPlan[] = [
  {
    name: "Premium Starter",
    price: "₹999",
    period: "/ report",
    badge: "Start Strong",
    icon: <Zap className="w-5 h-5" />,
    gains: [
      { label: "ATS-safe rewrite", detail: "Resume passes 90%+ of applicant tracking systems" },
      { label: "Keyword injection", detail: "Role-aligned keywords placed across every section" },
      { label: "1 role-aligned variant", detail: "One polished resume tuned to your target role" },
    ],
    features: [
      "Full ATS Readiness scan + score",
      "Section-by-section AI rewrite",
      "Clean single-column PDF",
      "Keyword gap analysis",
      "1 tailored resume variant",
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
      { label: "JD-tuned resume", detail: "Resume matched to a specific job description" },
      { label: "Matching cover letter", detail: "AI cover letter that mirrors the JD language" },
      { label: "Skills authority map", detail: "15 top skills ranked by industry demand" },
    ],
    features: [
      "Everything in Premium Starter",
      "Job-description match analysis",
      "AI cover letter generator",
      "15 ranked skills gap & optimization",
      "Before vs After comparison",
      "2 role-specific resume variants",
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
      { label: "90-day roadmap", detail: "30-60-90 day plan to close every profile gap" },
      { label: "LinkedIn rewrite", detail: "Headline, About & featured sections rewritten" },
      { label: "Interview-ready pack", detail: "Role-specific questions + answer frameworks" },
    ],
    features: [
      "Everything in Premium Professional",
      "30-60-90 day career roadmap",
      "LinkedIn profile optimization",
      "Interview question pack",
      "Recruiter-perspective screening",
      "30-day re-scan & re-optimization",
      "Priority support & white-glove delivery",
    ],
    cta: "Unlock Premium Elite",
    variant: "dark",
  },
];

/* ─── Card Component ─── */
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
            Premium career intelligence. <em className="italic font-normal text-primary">One report at a time.</em>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg font-sans">
            One-time report purchases. No subscriptions, no auto-renewals. Choose the depth that matches your next career move.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {mainPlans.map((plan) => (
            <MainPlanCard key={plan.name} plan={plan} />
          ))}
        </div>

        <p className="text-center text-xs sm:text-sm text-muted-foreground mt-8 sm:mt-10 lg:mt-12 max-w-2xl mx-auto font-sans">
          One-time purchases. No subscriptions. No auto-renewals. 7-day money-back guarantee on all paid reports.
        </p>
      </div>
    </section>
  );
};
