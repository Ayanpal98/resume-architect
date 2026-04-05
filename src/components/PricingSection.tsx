import { CheckCircle2, ArrowRight, Star, Zap, Crown, Users, Rocket, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const jobSeekerPlans = [
  {
    name: "Free",
    icon: Zap,
    color: "accent",
    price: "₹0",
    period: "forever",
    bestFor: "Quick resume check",
    highlight: false,
    features: [
      "Basic ATS Score",
      "Limited feedback",
      "Keyword match overview",
    ],
    tagline: "Great to get started",
    cta: "Get Free Report",
  },
  {
    name: "Pro",
    icon: Star,
    color: "primary",
    price: "₹999",
    period: "/ report",
    bestFor: "Serious job seekers",
    highlight: true,
    badge: "Most Popular ⭐",
    features: [
      "Full Candidate Screening Report",
      "Job Match Analysis",
      "Skills Gap Breakdown",
      "ATS Optimization Suggestions",
      "Keyword & Content Improvements",
      "Career Roadmap (30-60-90 days)",
    ],
    tagline: "Everything you need to improve your chances",
    cta: "Upgrade to Pro",
  },
  {
    name: "Premium",
    icon: Crown,
    color: "primary",
    price: "₹1,999",
    period: "/ report",
    bestFor: "Maximum results & faster hiring",
    highlight: false,
    features: [
      "Everything in Pro +",
      "Personalized Resume Improvement Suggestions",
      "Advanced Career Strategy Insights",
      "Priority Report Generation",
      "Interview Preparation Questions",
    ],
    tagline: "Your complete job-winning toolkit",
    cta: "Go Premium",
  },
];

const recruiterPlans = [
  {
    name: "Starter",
    icon: Users,
    color: "accent",
    price: "₹7,999",
    period: "/ month",
    bestFor: "Small teams & startups",
    highlight: false,
    features: [
      "Up to 50 candidate reports",
      "Candidate ranking system",
      "Skill match analysis",
      "Interview question suggestions",
    ],
    tagline: "Start hiring smarter",
    cta: "Start Hiring Smarter",
  },
  {
    name: "Growth",
    icon: Rocket,
    color: "primary",
    price: "₹19,999",
    period: "/ month",
    bestFor: "Growing companies",
    highlight: true,
    badge: "Best Value",
    features: [
      "Everything in Starter +",
      "200 candidate reports/month",
      "Advanced candidate comparison",
      "Hiring insights dashboard",
      "Priority support",
    ],
    tagline: "Scale your hiring pipeline",
    cta: "Scale Your Hiring",
  },
  {
    name: "Enterprise",
    icon: Building2,
    color: "primary",
    price: "Custom",
    period: "",
    bestFor: "Large organizations",
    highlight: false,
    features: [
      "Unlimited candidate analysis",
      "API & ATS integration",
      "Custom AI models",
      "Dedicated account manager",
    ],
    tagline: "Built for your scale",
    cta: "Contact Sales",
  },
];

const PlanCard = ({ plan }: { plan: (typeof jobSeekerPlans)[0] }) => (
  <Card
    className={`relative transition-all duration-300 hover:shadow-xl ${
      plan.highlight
        ? "border-primary ring-2 ring-primary/20 shadow-lg scale-[1.02]"
        : "border-border hover:border-primary/30"
    }`}
  >
    {plan.badge && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
        <Badge className="bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold shadow-md">
          {plan.badge}
        </Badge>
      </div>
    )}
    <CardContent className="p-5 sm:p-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            plan.highlight
              ? "bg-primary text-primary-foreground"
              : "bg-primary/10 text-primary"
          }`}
        >
          <plan.icon className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-display font-bold text-foreground">
          {plan.name}
        </h3>
      </div>

      {/* Price */}
      <div className="mb-4">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl sm:text-4xl font-display font-extrabold text-foreground">
            {plan.price}
          </span>
          {plan.period && (
            <span className="text-sm text-muted-foreground">{plan.period}</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Best for: {plan.bestFor}
        </p>
      </div>

      {/* Features */}
      <div className="space-y-2.5 mb-6 flex-1">
        {plan.features.map((feature, i) => (
          <div key={i} className="flex items-start gap-2 text-sm text-foreground">
            <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <span>{feature}</span>
          </div>
        ))}
      </div>

      {/* Tagline */}
      <p className="text-xs text-muted-foreground italic mb-4">
        👉 {plan.tagline}
      </p>

      {/* CTA */}
      <Button
        variant={plan.highlight ? "hero" : "outline"}
        className="w-full"
        size="lg"
      >
        {plan.cta}
        <ArrowRight className="w-4 h-4" />
      </Button>
    </CardContent>
  </Card>
);

export const PricingSection = () => {
  return (
    <section id="pricing" className="py-16 sm:py-24 px-4 sm:px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-foreground mb-3 sm:mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Choose the plan that fits your goals — no hidden fees, no surprises
          </p>
        </div>

        <Tabs defaultValue="jobseeker" className="w-full">
          <div className="flex justify-center mb-8 sm:mb-10">
            <TabsList className="bg-muted p-1 rounded-xl">
              <TabsTrigger
                value="jobseeker"
                className="px-5 py-2.5 rounded-lg text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                👨‍💻 For Job Seekers
              </TabsTrigger>
              <TabsTrigger
                value="recruiter"
                className="px-5 py-2.5 rounded-lg text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                🧑‍💼 For Recruiters
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="jobseeker">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
              {jobSeekerPlans.map((plan) => (
                <PlanCard key={plan.name} plan={plan} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recruiter">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
              {recruiterPlans.map((plan) => (
                <PlanCard key={plan.name} plan={plan} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Trust Builder */}
        <div className="mt-12 sm:mt-16 bg-card rounded-2xl border border-border p-6 sm:p-8">
          <div className="grid sm:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-lg sm:text-xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
                🔥 Why Teams & Candidates Trust ATSFy
              </h3>
              <div className="space-y-3">
                {[
                  "AI-powered candidate evaluation",
                  "Used for both job seekers & recruiters",
                  "Data-driven insights, not guesswork",
                  "Built for real hiring outcomes",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm text-foreground">
                    <CheckCircle2 className="w-4.5 h-4.5 text-accent shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Add-on Upsell */}
            <div className="relative bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border border-primary/20 p-5 sm:p-6">
              <Badge className="absolute -top-2.5 left-4 bg-accent text-accent-foreground text-xs px-2.5 py-0.5 shadow-sm">
                Add-on
              </Badge>
              <div className="flex items-center gap-2 mb-3 mt-1">
                <Zap className="w-5 h-5 text-primary" />
                <h4 className="font-display font-bold text-foreground">
                  Resume Boost
                </h4>
                <span className="ml-auto text-lg font-display font-extrabold text-foreground">
                  ₹499
                </span>
              </div>
              <div className="space-y-2 mb-4">
                {[
                  "Instant resume rewriting suggestions",
                  "Improved ATS compatibility",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full">
                Add to any plan
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
