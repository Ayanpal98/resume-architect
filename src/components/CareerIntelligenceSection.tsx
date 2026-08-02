import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Target, GitCompare, Award, TrendingUp, Bot, CalendarRange } from "lucide-react";

const CARDS = [
  { icon: Target, title: "Role Fit Score" },
  { icon: GitCompare, title: "Skill Gap Analysis" },
  { icon: Award, title: "Certification Recommendations" },
  { icon: TrendingUp, title: "Salary Growth Opportunities" },
  { icon: Bot, title: "AI Career Coaching" },
  { icon: CalendarRange, title: "Personalized 30-60-90 Day Roadmap" },
];

export const CareerIntelligenceSection = () => (
  <section id="career-intelligence" className="py-16 sm:py-24 px-4 sm:px-6 border-t border-border/60">
    <div className="container mx-auto max-w-6xl">
      <div className="max-w-2xl mb-10 sm:mb-14">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">— Career Intelligence</div>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium text-foreground leading-tight tracking-tight mb-4">
          Stop guessing your <em className="italic font-normal text-primary">next career move.</em>
        </h2>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-sans">
          Get a personalized AI career strategist that identifies skill gaps, certifications, salary-growth
          opportunities, and a step-by-step pathway toward your target role.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="grid sm:grid-cols-2 glass rounded-2xl overflow-hidden">
          {CARDS.map((c, i) => (
            <div key={i} className="p-5 sm:p-6 border-b border-r border-border/60 last:border-r-0">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <c.icon className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-display text-base font-medium text-foreground tracking-tight">{c.title}</h3>
            </div>
          ))}
        </div>

        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-hero opacity-10 rounded-3xl blur-2xl" />
          <div className="relative glass-strong rounded-2xl p-6 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Current Role</div>
                <div className="font-display text-lg font-medium text-foreground tracking-tight">Junior Data Analyst</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Target Role</div>
                <div className="font-display text-lg font-medium text-primary tracking-tight">Senior ML Engineer</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-primary/5 border border-border/60">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Role Fit Score</span>
                <span className="font-display text-2xl font-medium text-foreground">63%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-gradient-hero" style={{ width: "63%" }} />
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground mb-2">Critical Gaps</div>
              <div className="flex flex-wrap gap-2">
                {["Machine Learning", "MLOps", "Cloud Deployment"].map((g) => (
                  <span key={g} className="text-xs px-2.5 py-1 rounded-full border border-border bg-background/60 text-foreground font-sans">
                    {g}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground mb-2">Recommended Path</div>
              <div className="space-y-2">
                {[
                  ["Month 1", "Python & ML Foundations"],
                  ["Month 2", "AWS Certification"],
                  ["Month 3", "Portfolio + Interview Preparation"],
                ].map(([m, t]) => (
                  <div key={m} className="flex items-center gap-3 text-sm font-sans">
                    <span className="text-xs text-muted-foreground w-16 flex-shrink-0">{m}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <span className="text-foreground">{t}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link to="/career-intelligence" className="block">
              <Button variant="hero" size="lg" className="w-full">
                Generate Career Roadmap
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  </section>
);
