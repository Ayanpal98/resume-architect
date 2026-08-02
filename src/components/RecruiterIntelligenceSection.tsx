import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowDown, ListOrdered, Percent, GitCompare, MessageSquare, AlertTriangle, FileBarChart, CheckCircle2 } from "lucide-react";

const KPIS = [
  { value: "95%", label: "Match Accuracy" },
  { value: "Bulk", label: "Resume Screening" },
  { value: "Ranked", label: "Candidate Ranking Engine" },
  { value: "SHRM", label: "Aligned Evaluation" },
];

const CARDS = [
  { icon: ListOrdered, title: "Candidate Ranking" },
  { icon: Percent, title: "Job Match Percentage" },
  { icon: GitCompare, title: "Skills Gap Analysis" },
  { icon: MessageSquare, title: "Interview Recommendations" },
  { icon: AlertTriangle, title: "Hiring Risk Indicators" },
  { icon: FileBarChart, title: "Recruiter PDF Reports" },
];

const FLOW = ["100 Resumes", "Top 10 Candidates", "Interview Shortlist"];

export const RecruiterIntelligenceSection = () => (
  <section id="hiring-intelligence" className="py-16 sm:py-24 px-4 sm:px-6 bg-card border-t border-border/60">
    <div className="container mx-auto max-w-6xl">
      <div className="max-w-2xl mb-10 sm:mb-14">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">— Hiring Intelligence</div>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium text-foreground leading-tight tracking-tight mb-4">
          Hire faster with <em className="italic font-normal text-primary">AI-powered candidate intelligence.</em>
        </h2>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-sans">
          Upload a job description and multiple resumes. ATSFy evaluates, ranks, and explains every candidate using
          recruiter-grade screening logic.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border/60 border border-border/60 rounded-2xl overflow-hidden mb-10">
        {KPIS.map((k) => (
          <div key={k.label} className="bg-card p-5 sm:p-6">
            <div className="font-display text-2xl sm:text-3xl font-medium text-foreground tracking-tight mb-1">{k.value}</div>
            <div className="text-xs text-muted-foreground font-sans">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 grid sm:grid-cols-3 glass rounded-2xl overflow-hidden">
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
          <div className="relative glass-strong rounded-2xl p-6">
            <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground mb-4">Screening Funnel</div>
            <div className="space-y-1">
              {FLOW.map((step, i) => (
                <div key={step}>
                  <div className={`rounded-xl border border-border/60 px-4 py-3 text-center font-display text-base font-medium tracking-tight ${i === FLOW.length - 1 ? "bg-gradient-hero text-primary-foreground" : "bg-background/60 text-foreground"}`}>
                    {step}
                  </div>
                  {i < FLOW.length - 1 && (
                    <div className="flex justify-center py-1.5">
                      <ArrowDown className="w-4 h-4 text-primary" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Link to="/recruiter" className="block mt-5">
              <Button variant="hero" size="lg" className="w-full">
                Screen Candidates
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const SEEKER = [
  "ATS Resume Optimization",
  "Career Roadmaps",
  "Skill Gap Analysis",
  "AI Coaching",
  "Career Intelligence Reports",
];

const RECRUITER = [
  "Candidate Screening",
  "Candidate Ranking",
  "Hiring Recommendations",
  "Interview Intelligence",
  "Recruiter Reports",
];

export const TwoSidedPlatformSection = () => (
  <section className="py-16 sm:py-24 px-4 sm:px-6 border-t border-border/60">
    <div className="container mx-auto max-w-5xl">
      <div className="max-w-2xl mb-10 sm:mb-14">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">— Platform</div>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium text-foreground leading-tight tracking-tight">
          One Platform. <em className="italic font-normal text-primary">Two Intelligence Engines.</em>
        </h2>
      </div>
      <div className="grid md:grid-cols-2 gap-px bg-border/60 border border-border/60 rounded-2xl overflow-hidden">
        {[
          { title: "For Job Seekers", items: SEEKER },
          { title: "For Recruiters", items: RECRUITER },
        ].map((col) => (
          <div key={col.title} className="bg-background p-7 sm:p-10">
            <h3 className="font-display text-xl sm:text-2xl font-medium text-foreground tracking-tight mb-6">{col.title}</h3>
            <ul className="space-y-3.5">
              {col.items.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base text-foreground font-sans">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  </section>
);
