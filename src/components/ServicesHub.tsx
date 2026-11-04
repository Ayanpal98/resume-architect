import { Link } from "react-router-dom";
import { Lock, CheckCircle2, ArrowRight } from "lucide-react";
import { usePlan } from "@/hooks/usePlan";
import { Badge } from "@/components/ui/badge";

type Service = { name: string; desc: string; tier: number; to: string };

const PLAN_FOR_TIER: Record<number, { id: string; label: string }> = {
  0: { id: "", label: "Free" },
  1: { id: "premium-starter", label: "Starter ₹999" },
  2: { id: "premium-professional", label: "Professional ₹1,499" },
  3: { id: "premium-elite", label: "Elite ₹2,599" },
};

const SERVICES: Service[] = [
  { name: "Resume Builder", desc: "Create and edit your resume", tier: 0, to: "/builder" },
  { name: "Portfolio Studio", desc: "Showcase your work", tier: 0, to: "/portfolio-studio" },
  { name: "Career Intelligence", desc: "Your readiness overview", tier: 0, to: "/career-intelligence" },
  { name: "ATS Readiness Scan", desc: "See how hiring systems read you", tier: 1, to: "/ats-analysis" },
  { name: "AI Section Rewrite", desc: "Improve summary, experience, skills", tier: 1, to: "/builder" },
  { name: "PDF Export & Templates", desc: "Download in 6 templates", tier: 1, to: "/builder" },
  { name: "Job Match Analysis", desc: "Compare against a job post", tier: 2, to: "/builder" },
  { name: "AI Cover Letter", desc: "Tailored to each role", tier: 2, to: "/builder" },
  { name: "Action Verb Enhancer", desc: "Stronger bullet openers", tier: 2, to: "/builder" },
  { name: "Keyword Gap & Comparison", desc: "Before vs after view", tier: 2, to: "/builder" },
  { name: "Career Roadmap", desc: "30-60-90 day plan", tier: 3, to: "/builder" },
  { name: "Deep Resume Improvement", desc: "Full strategist review", tier: 3, to: "/deep-improvement" },
  { name: "Intelligence PDF Reports", desc: "Export full reports", tier: 3, to: "/career-intelligence" },
];

export const ServicesHub = () => {
  const { tier, loading } = usePlan();
  const current = tier.jobseeker;

  return (
    <section className="rounded-2xl border border-border/60 bg-card p-4 sm:p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">My Services</h2>
          <p className="text-sm text-muted-foreground">Everything in one place. Locked tools open once that plan is paid.</p>
        </div>
        <Badge variant="secondary">{loading ? "Checking plan…" : `Your plan: ${PLAN_FOR_TIER[current].label}`}</Badge>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {SERVICES.map((s) => {
          const open = current >= s.tier;
          const plan = PLAN_FOR_TIER[s.tier];
          const href = open ? s.to : `/checkout?plan=${plan.id}`;
          return (
            <Link
              key={s.name}
              to={href}
              className="group flex items-start gap-3 rounded-xl border border-border/60 bg-muted/30 p-3 transition hover:border-primary/40 hover:bg-muted/50"
            >
              {open ? (
                <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0 text-primary" />
              ) : (
                <Lock className="w-5 h-5 mt-0.5 shrink-0 text-muted-foreground" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
                <p className="mt-1 text-xs font-medium text-primary">
                  {open ? "Open" : `Unlock with ${plan.label}`}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 mt-1 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5" />
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default ServicesHub;
