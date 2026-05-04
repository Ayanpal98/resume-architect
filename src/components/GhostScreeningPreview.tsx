import { Star, ThumbsUp, Minus, Target, Briefcase, GraduationCap, TrendingUp, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// GhostScreeningPreview
// Shown in the Recruiter dashboard when no candidates have been analyzed yet.
// Static, illustrative — rendered with reduced opacity + a "Sample preview"
// label so recruiters understand it is a glimpse of the deliverable, not data.
// ─────────────────────────────────────────────────────────────────────────────

const GHOST = {
  job: "Senior Platform Engineer @ Northwind FinTech",
  candidates: [
    {
      name: "Priya Sharma",
      role: "Senior Backend Engineer · Acme Cloud",
      score: 91,
      rec: "highly_recommended" as const,
      tech: 94, exp: 88, edu: 90, soft: 86,
      matched: ["Kubernetes", "Terraform", "AWS", "CI/CD", "GraphQL", "Datadog"],
      missing: ["Helm"],
      strength: "Led K8s migration cutting cloud spend 38% — direct fit for platform mandate.",
    },
    {
      name: "Marcus Chen",
      role: "Staff DevOps Engineer · Lumen Bank",
      score: 78,
      rec: "recommended" as const,
      tech: 82, exp: 84, edu: 75, soft: 70,
      matched: ["AWS", "Terraform", "CI/CD", "Python", "Helm"],
      missing: ["GraphQL", "Datadog"],
      strength: "10 yrs FinTech infra; strong compliance and SOC2 background.",
    },
    {
      name: "Aisha Patel",
      role: "Backend Engineer II · Stripe Labs",
      score: 64,
      rec: "consider" as const,
      tech: 70, exp: 58, edu: 80, soft: 72,
      matched: ["AWS", "Python", "CI/CD"],
      missing: ["Kubernetes", "Terraform", "GraphQL", "Helm", "Datadog"],
      strength: "Promising junior with payments domain knowledge; needs platform exposure.",
    },
  ],
};

const recBadge = (rec: "highly_recommended" | "recommended" | "consider") => {
  if (rec === "highly_recommended") return { Icon: Star, label: "Highly Recommended", cls: "bg-accent/15 text-accent border-accent/30" };
  if (rec === "recommended") return { Icon: ThumbsUp, label: "Recommended", cls: "bg-primary/15 text-primary border-primary/30" };
  return { Icon: Minus, label: "Consider", cls: "bg-muted text-muted-foreground border-border" };
};

export const GhostScreeningPreview = () => {
  return (
    <div className="relative py-6">
      {/* Sample preview chip */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground border border-border rounded-full px-3 py-1.5 bg-card">
          <Sparkles className="w-3 h-3 text-primary" />
          Sample preview — disappears when you start screening
        </span>
      </div>

      {/* The ghost panel — slightly desaturated/dimmed so it reads as illustrative */}
      <div className="opacity-70 hover:opacity-90 transition-opacity space-y-4 select-none pointer-events-none">
        <div className="rounded-xl border border-dashed border-border bg-card p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-1">Sample job</div>
            <div className="text-sm font-medium text-foreground">{GHOST.job}</div>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
            <span><strong className="text-foreground">{GHOST.candidates.length}</strong> candidates</span>
            <span><strong className="text-accent">1</strong> top fit</span>
            <span>avg <strong className="text-foreground">{Math.round(GHOST.candidates.reduce((s, c) => s + c.score, 0) / GHOST.candidates.length)}%</strong></span>
          </div>
        </div>

        {GHOST.candidates.map((c, idx) => {
          const { Icon, label, cls } = recBadge(c.rec);
          return (
            <div key={c.name} className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex flex-col sm:flex-row gap-4 p-4 sm:p-5">
                {/* Rank + score */}
                <div className="flex sm:flex-col items-center gap-3 sm:gap-2 sm:w-20 sm:border-r sm:border-border sm:pr-4">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Rank</div>
                  <div className="font-display text-2xl font-medium text-foreground leading-none">#{idx + 1}</div>
                  <div className="font-display text-3xl font-medium text-primary leading-none mt-0 sm:mt-2">{c.score}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">/100</div>
                </div>

                {/* Body */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="font-display text-base sm:text-lg font-medium text-foreground">{c.name}</div>
                      <div className="text-xs text-muted-foreground font-sans">{c.role}</div>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border ${cls}`}>
                      <Icon className="w-3 h-3" />
                      {label}
                    </span>
                  </div>

                  {/* Sub-scores */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                    {[
                      { Icon: Target, label: "Technical", v: c.tech },
                      { Icon: Briefcase, label: "Experience", v: c.exp },
                      { Icon: GraduationCap, label: "Education", v: c.edu },
                      { Icon: TrendingUp, label: "Cultural", v: c.soft },
                    ].map((s) => (
                      <div key={s.label} className="rounded-lg border border-border bg-background p-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</span>
                          <s.Icon className="w-3 h-3 text-muted-foreground" />
                        </div>
                        <div className="font-mono text-sm text-foreground">{s.v}%</div>
                        <div className="h-1 bg-muted rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${s.v}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Strength */}
                  <div className="flex items-start gap-2 mb-3 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/80 font-sans">{c.strength}</span>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1">
                    {c.matched.map((k) => (
                      <span key={k} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{k} ✓</span>
                    ))}
                    {c.missing.map((k) => (
                      <span key={k} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border inline-flex items-center gap-1">
                        <AlertCircle className="w-2.5 h-2.5" /> {k}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Helper line below ghost */}
      <div className="text-center mt-8">
        <p className="text-sm text-muted-foreground font-sans max-w-md mx-auto">
          Add a job description and upload candidate resumes — your real screening report appears right here.
        </p>
      </div>
    </div>
  );
};

export default GhostScreeningPreview;
