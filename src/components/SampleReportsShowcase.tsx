import { useState } from "react";
import { FileText, Target, Briefcase, Map, GitCompare, ArrowRight, CheckCircle2, Sparkles, Lock, User, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// ─────────────────────────────────────────────────────────────────────────────
// Built-in sample: a single consistent candidate + target job
// All report visuals below derive their data from this fixture so users see a
// coherent "this is what your output looks like" story.
// ─────────────────────────────────────────────────────────────────────────────

const SAMPLE = {
  candidate: {
    name: "Priya Sharma",
    currentRole: "Senior Backend Engineer",
    company: "Acme Cloud",
    yearsExp: 6,
    skills: ["JavaScript", "React", "Node.js", "PostgreSQL", "REST APIs", "Git", "HTML/CSS", "Jest"],
    summary:
      "Backend engineer with 6 years of experience building web applications. Worked on backend systems and helped the team with deployments and code reviews. Familiar with cloud and modern JavaScript.",
    bulletBefore:
      "Responsible for working on backend systems and helping the team with deployments.",
  },
  job: {
    title: "Senior Platform Engineer",
    company: "Northwind FinTech",
    mustHave: ["Kubernetes", "Terraform", "AWS", "CI/CD", "Python", "GraphQL", "Datadog", "Helm"],
    niceToHave: ["Go", "gRPC"],
  },
  optimized: {
    skills: [
      "TypeScript", "React", "Node.js", "PostgreSQL", "GraphQL", "AWS",
      "Docker", "Kubernetes", "Redis", "CI/CD", "Jest", "Tailwind",
      "Terraform", "Datadog", "REST APIs",
    ],
    summary:
      "Senior backend engineer with 6 years building distributed payment systems. Led platform migrations on AWS + Kubernetes serving 18M+ daily transactions and reduced release cycles 95% through Terraform-driven CI/CD. Mentored 4 engineers across infrastructure, observability, and reliability practices.",
    bulletAfter:
      "Engineered a Kubernetes-based deployment pipeline on AWS that reduced release cycles from 4 hours to 12 minutes, enabling 8 weekly releases across 3 payment services and cutting cloud spend 38%.",
  },
  scoring: {
    before: { readiness: 58, match: 52 },
    after: { readiness: 91, match: 89 },
    sections: [
      { label: "Contact & Header", v: 100 },
      { label: "Work Experience", v: 92 },
      { label: "Skills Coverage", v: 88 },
      { label: "Education", v: 95 },
      { label: "Format & Structure", v: 90 },
    ],
  },
};

type ReportKey = "ats" | "optimization" | "jobMatch" | "coverLetter" | "roadmap" | "comparison";

type Report = {
  key: ReportKey;
  icon: any;
  title: string;
  tag: string;
  tier: string;
  summary: string;
  highlights: string[];
};

const REPORTS: Report[] = [
  {
    key: "ats",
    icon: Target,
    title: "ATS Readiness Report",
    tag: "Parsing",
    tier: "Free • Pro",
    summary: "A line-by-line breakdown of how applicant tracking systems read, parse, and rank your resume — with fix priorities.",
    highlights: [
      "Hiring Readiness score with 4-tier benchmark",
      "Section-level parse accuracy diagnostics",
      "Prioritized fix list with severity tags",
    ],
  },
  {
    key: "optimization",
    icon: Sparkles,
    title: "AI Optimization Report",
    tag: "Intelligence",
    tier: "Pro",
    summary: "Section-by-section rewrite recommendations using STAR-Impact and XYZ formulas — applied with one click.",
    highlights: [
      "Bullet-by-bullet rewrite suggestions",
      "Action verb upgrades with categorized alternatives",
      "Quantified impact recommendations",
    ],
  },
  {
    key: "jobMatch",
    icon: Briefcase,
    title: "Job Match Comparison",
    tag: "Analysis",
    tier: "Pro",
    summary: "See exactly how your resume aligns with a target job description — before and after optimization.",
    highlights: [
      "Match percentage shift visualization",
      "Missing keyword & skill gap detection",
      "Side-by-side resume vs JD breakdown",
    ],
  },
  {
    key: "coverLetter",
    icon: FileText,
    title: "AI Cover Letter",
    tag: "Generation",
    tier: "Pro",
    summary: "A tailored, recruiter-tested cover letter generated from your resume and the target role's requirements.",
    highlights: [
      "Role-specific opening hook",
      "Quantified achievement weaving",
      "Tone calibrated to industry",
    ],
  },
  {
    key: "roadmap",
    icon: Map,
    title: "Career Roadmap",
    tag: "Premium",
    tier: "Elite",
    summary: "A 30-60-90 day intelligence roadmap mapping skill gaps, target roles, and growth signals.",
    highlights: [
      "30-60-90 day action plan",
      "Skill gap → certification mapping",
      "Target role progression intelligence",
    ],
  },
  {
    key: "comparison",
    icon: GitCompare,
    title: "Before & After Comparison",
    tag: "Diff View",
    tier: "Pro",
    summary: "A transparent diff view of every change applied to your resume — skills, summary, and bullet rewrites.",
    highlights: [
      "Visual diff of skills & summary",
      "Score improvement deltas",
      "Full revision history",
    ],
  },
];

export const SampleReportsShowcase = () => {
  const [active, setActive] = useState<ReportKey>("ats");
  const activeReport = REPORTS.find((r) => r.key === active)!;

  return (
    <section id="reports" className="py-16 sm:py-24 px-4 sm:px-6 border-t border-border/60 bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="max-w-3xl mb-8 sm:mb-12">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">— Deliverables</div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium text-foreground mb-4 leading-tight tracking-tight">
            See what you actually <em className="italic font-normal text-primary">get back.</em>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg font-sans">
            Every plan ships real, exportable intelligence reports — not vanity scores. Preview the deliverables before you pay.
          </p>
        </div>

        {/* Sample fixture banner */}
        <div className="mb-6 rounded-xl border border-border bg-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Sample resume</div>
              <div className="text-sm font-medium text-foreground font-sans">{SAMPLE.candidate.name} — {SAMPLE.candidate.currentRole}</div>
            </div>
          </div>
          <div className="hidden sm:block w-px h-8 bg-border" />
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-accent/10 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-accent" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Target job</div>
              <div className="text-sm font-medium text-foreground font-sans">{SAMPLE.job.title} @ {SAMPLE.job.company}</div>
            </div>
          </div>
          <div className="sm:ml-auto text-[11px] text-muted-foreground font-sans">
            All visuals below are generated from this sample.
          </div>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-px bg-border/60 border border-border/60 rounded-2xl overflow-hidden">
          {/* Tabs */}
          <div className="bg-card flex lg:flex-col overflow-x-auto lg:overflow-visible">
            {REPORTS.map((r) => {
              const isActive = r.key === active;
              return (
                <button
                  key={r.key}
                  onClick={() => setActive(r.key)}
                  className={`flex-shrink-0 lg:flex-shrink text-left p-4 sm:p-5 border-b border-border/60 transition-colors min-w-[180px] lg:min-w-0 ${
                    isActive ? "bg-background" : "hover:bg-background/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center ${isActive ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                      <r.icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{r.tag}</span>
                  </div>
                  <div className={`font-display text-base font-medium tracking-tight ${isActive ? "text-foreground" : "text-foreground/70"}`}>
                    {r.title}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5 font-sans">{r.tier}</div>
                </button>
              );
            })}
          </div>

          {/* Preview */}
          <div className="bg-card p-6 sm:p-8 lg:p-10">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">{activeReport.tag} Report</div>
                <h3 className="font-display text-2xl sm:text-3xl font-medium text-foreground tracking-tight mb-2">{activeReport.title}</h3>
                <p className="text-sm text-muted-foreground font-sans max-w-xl">{activeReport.summary}</p>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] text-muted-foreground border border-border rounded-full px-2.5 py-1">
                <Lock className="w-3 h-3" /> Sample
              </span>
            </div>

            <div className="mb-6">
              <ReportVisual reportKey={active} />
            </div>

            <div className="grid sm:grid-cols-3 gap-px bg-border/60 border border-border/60 rounded-xl overflow-hidden">
              {activeReport.highlights.map((h, i) => (
                <div key={i} className="bg-background p-4 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-foreground font-sans leading-snug">{h}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6 items-start sm:items-center">
              <Link to="/welcome">
                <Button variant="hero" size="lg">
                  Generate My Report
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <span className="text-xs text-muted-foreground font-sans">
                Generated from a built-in sample resume. Yours will use your real data.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const ReportVisual = ({ reportKey }: { reportKey: ReportKey }) => (
  <div className="rounded-xl border border-border bg-background overflow-hidden shadow-sm">
    <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border bg-muted/40">
      <span className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
      <span className="w-2.5 h-2.5 rounded-full bg-warning/60" />
      <span className="w-2.5 h-2.5 rounded-full bg-accent/60" />
      <span className="ml-3 text-[10px] text-muted-foreground font-sans">
        atsfy.report / {SAMPLE.candidate.name.toLowerCase().replace(" ", "-")} / {reportKey}
      </span>
    </div>
    <div className="p-5 sm:p-6">
      {reportKey === "ats" && <ATSVisual />}
      {reportKey === "optimization" && <OptimizationVisual />}
      {reportKey === "jobMatch" && <JobMatchVisual />}
      {reportKey === "coverLetter" && <CoverLetterVisual />}
      {reportKey === "roadmap" && <RoadmapVisual />}
      {reportKey === "comparison" && <ComparisonVisual />}
    </div>
  </div>
);

const ATSVisual = () => (
  <div className="space-y-4">
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
        <span className="text-accent-foreground font-display text-2xl font-bold">{SAMPLE.scoring.after.readiness}</span>
      </div>
      <div>
        <div className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Hiring Readiness — {SAMPLE.candidate.name}</div>
        <div className="font-display text-xl font-medium text-foreground">Strong — Top 9% for {SAMPLE.job.title}</div>
      </div>
    </div>
    <div className="space-y-2">
      {SAMPLE.scoring.sections.map((row) => (
        <div key={row.label} className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground w-32 font-sans">{row.label}</span>
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${row.v}%` }} />
          </div>
          <span className="text-xs font-mono text-foreground w-8 text-right">{row.v}%</span>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-3 gap-2 pt-2">
      <Stat label="Critical Fixes" value="2" tone="destructive" />
      <Stat label="Suggested" value="6" tone="warning" />
      <Stat label="Resolved" value="14" tone="accent" />
    </div>
  </div>
);

const OptimizationVisual = () => (
  <div className="space-y-3">
    <div className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1">
      Bullet rewrite — {SAMPLE.candidate.currentRole} @ {SAMPLE.candidate.company}
    </div>
    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
      <div className="text-[10px] uppercase tracking-wider text-destructive mb-1.5">Before</div>
      <p className="text-xs text-foreground/80 font-sans">{SAMPLE.candidate.bulletBefore}</p>
    </div>
    <div className="rounded-lg border border-accent/40 bg-accent/5 p-3">
      <div className="text-[10px] uppercase tracking-wider text-accent mb-1.5">After — STAR-Impact</div>
      <p className="text-xs text-foreground font-sans">{SAMPLE.optimized.bulletAfter}</p>
    </div>
    <div className="flex flex-wrap gap-2 pt-1">
      <Pill>+ Quantified impact</Pill>
      <Pill>+ Action verb</Pill>
      <Pill>+ Tech specificity</Pill>
      <Pill>+ Cost outcome</Pill>
    </div>
  </div>
);

const JobMatchVisual = () => {
  const matched = SAMPLE.job.mustHave.filter((k) => SAMPLE.optimized.skills.some((s) => s.toLowerCase().includes(k.toLowerCase())));
  const missing = SAMPLE.job.mustHave.filter((k) => !matched.includes(k));
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-border p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Before</div>
          <div className="font-display text-3xl font-medium text-foreground">{SAMPLE.scoring.before.match}%</div>
          <div className="text-[10px] text-muted-foreground">vs {SAMPLE.job.title}</div>
        </div>
        <div className="rounded-lg border border-accent bg-accent/5 p-4">
          <div className="text-[10px] uppercase tracking-wider text-accent mb-1">After</div>
          <div className="font-display text-3xl font-medium text-foreground">{SAMPLE.scoring.after.match}%</div>
          <div className="text-[10px] text-muted-foreground">+{SAMPLE.scoring.after.match - SAMPLE.scoring.before.match} points</div>
        </div>
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">JD keyword coverage</div>
        <div className="flex flex-wrap gap-1.5">
          {matched.map((k) => (
            <span key={k} className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">{k} ✓</span>
          ))}
          {missing.map((k) => (
            <span key={k} className="text-[10px] px-2 py-1 rounded-full bg-muted text-muted-foreground border border-border">{k} +</span>
          ))}
        </div>
      </div>
    </div>
  );
};

const CoverLetterVisual = () => (
  <div className="space-y-2 font-sans">
    <div className="text-xs text-muted-foreground">Dear {SAMPLE.job.company} Hiring Team,</div>
    <p className="text-xs text-foreground/85 leading-relaxed">
      Your team's mission to scale developer velocity through internal payment platforms maps directly to my last three years engineering deployment infrastructure at {SAMPLE.candidate.company}.
    </p>
    <p className="text-xs text-foreground/85 leading-relaxed">
      Most recently, I led an AWS + Kubernetes migration that reduced cloud spend by <span className="text-primary font-medium">38%</span> while doubling release throughput across 3 payment services — the exact tradeoff space your platform team is navigating for the {SAMPLE.job.title} role.
    </p>
    <div className="flex flex-wrap gap-2 pt-2">
      <Pill>Role-specific hook</Pill>
      <Pill>Quantified proof</Pill>
      <Pill>Tone matched to FinTech</Pill>
    </div>
  </div>
);

const RoadmapVisual = () => (
  <div className="space-y-3">
    {[
      { period: "30 days", title: "Close keyword gap", items: ["Earn AWS Solutions Architect Associate", "Ship 1 Terraform module to internal registry"] },
      { period: "60 days", title: "Build platform signal", items: ["Publish 2 case studies on K8s deployment wins", "Lead 1 cross-team observability initiative with Datadog"] },
      { period: "90 days", title: `Position for ${SAMPLE.job.title}`, items: [`Apply to 8 FinTech platform roles`, "Refresh resume + LinkedIn with platform vocabulary"] },
    ].map((p, i) => (
      <div key={i} className="flex gap-3 items-start">
        <div className="font-display text-xs uppercase tracking-wider text-muted-foreground/60 w-16 flex-shrink-0 pt-0.5">{p.period}</div>
        <div className="flex-1 border-l border-border pl-3">
          <div className="font-display text-sm font-medium text-foreground mb-1">{p.title}</div>
          <ul className="space-y-0.5">
            {p.items.map((it) => (
              <li key={it} className="text-xs text-muted-foreground font-sans flex gap-1.5">
                <span className="text-accent">•</span> {it}
              </li>
            ))}
          </ul>
        </div>
      </div>
    ))}
  </div>
);

const ComparisonVisual = () => (
  <div className="grid sm:grid-cols-2 gap-3">
    <div className="rounded-lg border border-border p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Original skills ({SAMPLE.candidate.skills.length})</div>
      <div className="flex flex-wrap gap-1">
        {SAMPLE.candidate.skills.map((s) => (
          <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-muted text-foreground/70 border border-border">{s}</span>
        ))}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-3 mb-1">Original summary</div>
      <p className="text-[11px] text-foreground/70 font-sans leading-snug">{SAMPLE.candidate.summary}</p>
    </div>
    <div className="rounded-lg border border-accent/40 bg-accent/5 p-3">
      <div className="text-[10px] uppercase tracking-wider text-accent mb-2">Optimized skills ({SAMPLE.optimized.skills.length})</div>
      <div className="flex flex-wrap gap-1">
        {SAMPLE.optimized.skills.map((s) => (
          <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">{s}</span>
        ))}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-accent mt-3 mb-1">Optimized summary</div>
      <p className="text-[11px] text-foreground font-sans leading-snug">{SAMPLE.optimized.summary}</p>
    </div>
  </div>
);

const Stat = ({ label, value, tone }: { label: string; value: string; tone: "destructive" | "warning" | "accent" }) => {
  const toneClass =
    tone === "destructive" ? "text-destructive bg-destructive/10 border-destructive/20" :
    tone === "warning" ? "text-warning bg-warning/10 border-warning/20" :
    "text-accent bg-accent/10 border-accent/20";
  return (
    <div className={`rounded-lg border p-2.5 ${toneClass}`}>
      <div className="font-display text-lg font-medium leading-none">{value}</div>
      <div className="text-[10px] mt-1 uppercase tracking-wider opacity-80">{label}</div>
    </div>
  );
};

const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-sans">{children}</span>
);

export default SampleReportsShowcase;
