import { FileText, CheckCircle2, ArrowRight, ArrowDown, LogOut, Target, Menu, ScanSearch, Crosshair, GitCompare, Compass, ShieldCheck, Search, Wrench, Map, User, Briefcase, FileSearch, BarChart3, Lightbulb } from "lucide-react";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LiveStatsCounter } from "@/components/LiveStatsCounter";
import { PricingSection } from "@/components/PricingSection";
import { SampleReportsShowcase } from "@/components/SampleReportsShowcase";
import { WaitlistSection } from "@/components/WaitlistSection";
import { RecruiterIntelligenceSection, TwoSidedPlatformSection } from "@/components/RecruiterIntelligenceSection";
import { TestimonialsSection } from "@/components/TestimonialsSection";

import { useAuth } from "@/contexts/AuthContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const NAV_LINKS = [
  { href: "#problem", label: "Why ATSFy" },
  { href: "#reports", label: "Reports" },
  { href: "#how-it-works", label: "How it Works" },
  { href: "#pricing", label: "Pricing" },
];

const Index = () => {
  const { user, signOut } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <Seo title={"ATSFy — Know Where You Stand Before You Apply"} description={"AI-powered hiring intelligence. Understand your ATS readiness, job match, skill gaps, and what to improve — before you apply."} path={"/"} />
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-nav">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-hero rounded-xl flex items-center justify-center">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-lg sm:text-xl font-display font-bold text-accent tracking-tight">ATSFY</span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-sans">Hiring Intelligence</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <a key={l.href} href={l.href} className="text-muted-foreground hover:text-foreground transition-colors text-sm">{l.label}</a>
            ))}
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground hidden lg:inline">{user.email}</span>
                <Button variant="ghost" size="sm" onClick={signOut} className="gap-1 hidden sm:inline-flex">
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth" className="hidden sm:inline-flex">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link to="/auth">
                  <Button variant="hero" size="sm">Get Started</Button>
                </Link>
              </>
            )}
            {/* Mobile menu */}
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden h-10 w-10" aria-label="Open menu">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[85vw] max-w-sm">
                <div className="flex flex-col gap-1 mt-8">
                  {NAV_LINKS.map((l) => (
                    <a key={l.href} href={l.href} onClick={() => setMobileNavOpen(false)} className="px-4 py-3 text-base text-foreground hover:bg-muted rounded-lg">{l.label}</a>
                  ))}
                  <div className="border-t border-border my-3" />
                  {user ? (
                    <>
                      <div className="px-4 py-2 text-xs text-muted-foreground truncate">{user.email}</div>
                      <button onClick={() => { setMobileNavOpen(false); signOut(); }} className="flex items-center gap-2 px-4 py-3 text-base text-foreground hover:bg-muted rounded-lg text-left">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </>
                  ) : (
                    <Link to="/auth" onClick={() => setMobileNavOpen(false)} className="px-4 py-3 text-base text-foreground hover:bg-muted rounded-lg">Sign In</Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* ─── 1. Hero ─── */}
      <section className="pt-28 sm:pt-36 pb-16 sm:pb-24 px-4 sm:px-6 border-b border-border/60">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-border rounded-full text-xs font-medium text-muted-foreground mb-8 uppercase tracking-[0.15em]">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                AI-powered hiring intelligence
              </div>
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium leading-[1.05] tracking-tight text-foreground mb-6">
                Know where you stand <em className="italic font-normal text-primary">before you apply.</em>
              </h1>
              <p className="text-base md:text-lg text-muted-foreground mb-6 max-w-xl leading-relaxed font-sans">
                Analyze your profile, resume, and target job to understand ATS readiness, job match, skill gaps, and areas for improvement — before you apply.
              </p>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-8 font-sans">
                AI-powered • Explainable • Merit-first
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/welcome">
                  <Button variant="hero" size="xl" className="w-full sm:w-auto">
                    Analyze My Profile
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/recruiter">
                  <Button variant="outline-hero" size="xl" className="w-full sm:w-auto">
                    <Briefcase className="w-5 h-5" />
                    I'm Hiring
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero visual: CANDIDATE → JOB → ANALYSIS → INSIGHT */}
            <div className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <div className="relative rounded-2xl border border-border bg-card p-6 sm:p-8">
                <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground mb-5">How ATSFy reads the picture</div>
                <div className="space-y-1">
                  {[
                    { icon: User, label: "Candidate", desc: "Your profile, experience, and direction" },
                    { icon: Briefcase, label: "Job", desc: "The role you're actually targeting" },
                    { icon: ScanSearch, label: "Analysis", desc: "Readiness, match, and gap signals" },
                    { icon: Lightbulb, label: "Insight", desc: "What to improve — and why" },
                  ].map((step, i, arr) => (
                    <div key={step.label}>
                      <div className={`flex items-center gap-4 rounded-xl border px-4 py-3.5 ${i === arr.length - 1 ? "border-primary/40 bg-primary/5" : "border-border/60 bg-background/60"}`}>
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${i === arr.length - 1 ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                          <step.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-display text-base font-medium text-foreground tracking-tight">{step.label}</div>
                          <div className="text-xs text-muted-foreground font-sans">{step.desc}</div>
                        </div>
                      </div>
                      {i < arr.length - 1 && (
                        <div className="flex justify-start pl-8 py-1">
                          <ArrowDown className="w-4 h-4 text-primary/60" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform activity */}
      <section className="py-12 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl">
          <LiveStatsCounter />
          <p className="text-center text-[11px] text-muted-foreground mt-4 font-sans">Live platform activity — analyses run on ATSFy.</p>
        </div>
      </section>

      {/* ─── 2. Problem ─── */}
      <section id="problem" className="py-16 sm:py-24 px-4 sm:px-6 border-t border-border/60">
        <div className="container mx-auto max-w-6xl">
          <div className="max-w-2xl mb-10 sm:mb-14">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">— The Problem</div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium text-foreground leading-tight tracking-tight mb-4">
              A better resume doesn't always mean a <em className="italic font-normal text-primary">better job match.</em>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-sans">
              You can have an ATS-readable resume and still be poorly aligned with the role you're applying for.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border/60 border border-border/60 rounded-2xl overflow-hidden mb-8">
            {[
              { icon: ScanSearch, title: "Resume Readiness", desc: "Can your resume be understood correctly?" },
              { icon: Crosshair, title: "Role Alignment", desc: "Does your profile actually match the job?" },
              { icon: GitCompare, title: "Skill Gaps", desc: "What required capabilities are missing or not demonstrated?" },
              { icon: Compass, title: "Career Direction", desc: "What should you improve or target next?" },
            ].map((p) => (
              <div key={p.title} className="bg-background p-6 sm:p-8">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                  <p.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display text-lg font-medium text-foreground mb-2 tracking-tight">{p.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed font-sans">{p.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-base sm:text-lg text-foreground font-display font-medium tracking-tight">
            ATSFy connects these signals — instead of treating your resume as the whole story.
          </p>
        </div>
      </section>

      {/* ─── 3. Differentiator ladder ─── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-card border-t border-border/60">
        <div className="container mx-auto max-w-4xl">
          <div className="max-w-2xl mb-10 sm:mb-14">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">— The Difference</div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium text-foreground leading-tight tracking-tight">
              ATS Readiness is only <em className="italic font-normal text-primary">one part of the picture.</em>
            </h2>
          </div>
          <div className="space-y-1">
            {[
              { icon: ScanSearch, title: "ATS Readiness", q: "Can the resume be read?" },
              { icon: Crosshair, title: "Job Match", q: "Does the candidate fit this role?" },
              { icon: Compass, title: "Career Insight", q: "What should improve next?" },
            ].map((step, i, arr) => (
              <div key={step.title}>
                <div className={`flex items-center gap-5 rounded-2xl border p-6 sm:p-8 ${i === arr.length - 1 ? "border-primary/40 bg-primary/5" : "border-border/60 bg-background"}`}>
                  <div className="font-display text-4xl sm:text-5xl font-medium text-muted-foreground/20 leading-none w-14 shrink-0">
                    0{i + 1}
                  </div>
                  <div>
                    <h3 className="font-display text-xl sm:text-2xl font-medium text-foreground tracking-tight mb-1">{step.title}</h3>
                    <p className="text-sm sm:text-base text-muted-foreground font-sans italic">“{step.q}”</p>
                  </div>
                </div>
                {i < arr.length - 1 && (
                  <div className="flex justify-start pl-12 py-1.5">
                    <ArrowDown className="w-5 h-5 text-primary/60" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 4. Report journey ─── */}
      <section id="reports" className="py-16 sm:py-24 px-4 sm:px-6 border-t border-border/60">
        <div className="container mx-auto max-w-6xl">
          <div className="max-w-2xl mb-8 sm:mb-10">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">— The Reports</div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium text-foreground leading-tight tracking-tight mb-4">
              One profile. <em className="italic font-normal text-primary">Multiple layers of intelligence.</em>
            </h2>
          </div>

          {/* Journey chain */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-10 sm:mb-12">
            {["Readiness", "Optimization", "Match", "Insight"].map((s, i) => (
              <div key={s} className="flex items-center gap-2 sm:gap-3">
                <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-primary/40 bg-primary/5 text-primary text-xs sm:text-sm font-medium uppercase tracking-[0.12em]">
                  {s}
                </span>
                {i < 3 && <ArrowRight className="w-4 h-4 text-muted-foreground" />}
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border/60 border border-border/60 rounded-2xl overflow-hidden">
            {[
              { n: "01", title: "ATS Readiness", desc: "Understand how effectively your resume can be processed and interpreted." },
              { n: "02", title: "Resume Optimization", desc: "Identify improvements to clarity, structure, relevance, and job alignment." },
              { n: "03", title: "Job Match Analysis", desc: "Understand how closely your profile aligns with a specific job description." },
              { n: "04", title: "Career Insights", desc: "Identify gaps and areas that may require further development or direction." },
            ].map((r) => (
              <div key={r.n} className="bg-background p-6 sm:p-8">
                <div className="font-display text-4xl font-medium text-primary/25 mb-4 leading-none">{r.n}</div>
                <h3 className="font-display text-lg font-medium text-foreground mb-2 tracking-tight">{r.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed font-sans">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. Honest optimization ─── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-card border-t border-border/60">
        <div className="container mx-auto max-w-6xl">
          <div className="max-w-2xl mb-10 sm:mb-14">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">— Honest Optimization</div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium text-foreground leading-tight tracking-tight mb-4">
              Optimize your profile. <em className="italic font-normal text-primary">Don't fabricate it.</em>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-sans">
              ATSFy is designed to improve how genuine experience, skills, and qualifications are presented — not to invent them.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-px bg-border/60 border border-border/60 rounded-2xl overflow-hidden">
            {[
              { icon: FileSearch, title: "Evidence", desc: "What does the candidate actually demonstrate?" },
              { icon: Crosshair, title: "Alignment", desc: "How does that evidence relate to the target role?" },
              { icon: ShieldCheck, title: "Transparency", desc: "Why did the analysis produce this result?" },
            ].map((p) => (
              <div key={p.title} className="bg-card p-6 sm:p-8">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                  <p.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display text-lg font-medium text-foreground mb-2 tracking-tight">{p.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed font-sans">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 6. For Job Seekers ─── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 border-t border-border/60">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">— For Job Seekers</div>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium text-foreground leading-tight tracking-tight mb-4">
                Make better applications, <em className="italic font-normal text-primary">not just better resumes.</em>
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-sans mb-8">
                Before applying, understand your current position and where your profile aligns — or falls short — against the role you're targeting.
              </p>
              <Link to="/welcome">
                <Button variant="hero" size="xl">
                  Analyze My Profile
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-px bg-border/60 border border-border/60 rounded-2xl overflow-hidden">
              {[
                { icon: Search, step: "Check", desc: "ATS Readiness report" },
                { icon: Wrench, step: "Improve", desc: "Resume Optimization" },
                { icon: Target, step: "Match", desc: "Job Match Analysis" },
                { icon: Map, step: "Plan", desc: "Career Insights" },
              ].map((s) => (
                <div key={s.step} className="bg-background p-6 sm:p-8">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <s.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="font-display text-xl font-medium text-foreground tracking-tight mb-1">{s.step}</div>
                  <div className="text-xs text-muted-foreground font-sans">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. For Recruiters (existing component, reframed copy) ─── */}
      <RecruiterIntelligenceSection />

      {/* Two-sided platform comparison */}
      <TwoSidedPlatformSection />

      {/* ─── 8. Explainable AI ─── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-card border-t border-border/60">
        <div className="container mx-auto max-w-4xl">
          <div className="max-w-2xl mb-10 sm:mb-14">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">— Explainable AI</div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium text-foreground leading-tight tracking-tight mb-4">
              Don't just show a score. <em className="italic font-normal text-primary">Show what it means.</em>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-sans">
              ATSFy uses explainable analysis to help you understand the factors behind your profile and job-alignment results.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-3">
            {[
              { icon: BarChart3, label: "Score", desc: "The result" },
              { icon: FileSearch, label: "Evidence", desc: "What it's based on" },
              { icon: GitCompare, label: "Gap", desc: "What's missing" },
              { icon: Lightbulb, label: "Recommendation", desc: "What to do next" },
            ].map((s, i) => (
              <div key={s.label} className="flex items-center gap-2 sm:gap-3 flex-1">
                <div className="flex-1 rounded-xl border border-border/60 bg-background p-4 sm:p-5">
                  <s.icon className="w-4 h-4 text-primary mb-3" />
                  <div className="font-display text-base font-medium text-foreground tracking-tight">{s.label}</div>
                  <div className="text-xs text-muted-foreground font-sans mt-0.5">{s.desc}</div>
                </div>
                {i < 3 && <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 hidden sm:block" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 9. How ATSFy Works ─── */}
      <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 border-t border-border/60">
        <div className="container mx-auto max-w-6xl">
          <div className="max-w-2xl mb-10 sm:mb-14">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">— How It Works</div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium text-foreground leading-tight tracking-tight">
              Five steps. <em className="italic font-normal text-primary">One clear answer.</em>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-px bg-border/60 border border-border/60 rounded-2xl overflow-hidden">
            {[
              { step: "01", title: "Profile", desc: "Tell us about your background and career direction." },
              { step: "02", title: "Resume", desc: "Provide your existing resume." },
              { step: "03", title: "Target Job", desc: "Add the job description you're considering." },
              { step: "04", title: "Analysis", desc: "ATSFy analyzes the relationship between your profile and the role." },
              { step: "05", title: "Insight", desc: "Understand readiness, alignment, gaps, and areas for improvement." },
            ].map((s) => (
              <div key={s.step} className="bg-background p-6 sm:p-7">
                <div className="font-display text-5xl font-medium text-muted-foreground/15 mb-5 leading-none">{s.step}</div>
                <h3 className="font-display text-lg font-medium text-foreground mb-2 tracking-tight">{s.title}</h3>
                <p className="text-sm text-muted-foreground font-sans leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 10. Who it's for ─── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-card border-t border-border/60">
        <div className="container mx-auto max-w-6xl">
          <div className="max-w-2xl mb-10 sm:mb-14">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">— Who It's For</div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium text-foreground leading-tight tracking-tight">
              Built around <em className="italic font-normal text-primary">real hiring decisions.</em>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-px bg-border/60 border border-border/60 rounded-2xl overflow-hidden">
            {[
              { title: "Students & Freshers", desc: "Understand what your target roles require." },
              { title: "Job Seekers", desc: "Know your match before applying." },
              { title: "Career Switchers", desc: "Identify alignment and transition gaps." },
              { title: "Experienced Professionals", desc: "Evaluate how your profile fits your next target role." },
              { title: "Recruiters", desc: "Evaluate candidates against actual job requirements." },
            ].map((a) => (
              <div key={a.title} className="bg-card p-5 sm:p-6">
                <h3 className="font-display text-base font-medium text-foreground tracking-tight mb-2">{a.title}</h3>
                <p className="text-xs text-muted-foreground font-sans leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 11. Trust ─── */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 border-t border-border/60">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-medium text-foreground leading-tight tracking-tight mb-4">
            Merit over <em className="italic font-normal text-primary">presentation.</em>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-sans max-w-2xl mx-auto">
            ATSFy focuses on evidence, alignment, and transparency — not simply how polished a resume looks.
          </p>
        </div>
      </section>

      {/* ─── 12. Pricing ─── */}
      <PricingSection />

      {/* Sample reports — proof of output */}
      <SampleReportsShowcase />

      {/* Waitlist */}
      <WaitlistSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* ─── 13. Final CTA ─── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 border-t border-border/60">
        <div className="container mx-auto max-w-4xl">
          <div className="relative bg-gradient-hero rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 text-center">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium text-primary-foreground mb-4 tracking-tight leading-tight">
              Before your next application, <em className="italic font-normal">know where you stand.</em>
            </h2>
            <p className="text-primary-foreground/80 text-sm sm:text-base md:text-lg mb-8 max-w-2xl mx-auto font-sans">
              Understand your readiness. Measure your match. Find your gaps. Make your next move with more clarity.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/welcome">
                <Button size="lg" className="bg-background text-primary hover:bg-background/90 shadow-xl">
                  Start Your Analysis
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/recruiter">
                <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  I'm Hiring
                </Button>
              </Link>
            </div>
          </div>

          {/* Trust bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border/60 border border-border/60 rounded-xl overflow-hidden mt-12">
            {[
              "Explainable analysis",
              "For job seekers & recruiters",
              "Evidence, not guesswork",
              "Decision support — not decisions",
            ].map((point) => (
              <div key={point} className="bg-background p-5 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
                <span className="text-xs sm:text-sm text-foreground font-sans">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 px-4 sm:px-6 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-lg font-display font-bold text-foreground">ATSFy</span>
                <span className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground">Hiring Intelligence</span>
              </div>
            </div>
            <div className="flex items-center gap-5 text-xs">
              <Link to="/security" className="text-muted-foreground hover:text-foreground transition-colors">Security</Link>
              <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
              <a href="mailto:grievance.atsfy@gmail.com" className="text-muted-foreground hover:text-foreground transition-colors">Grievance Officer</a>
            </div>
            <div className="text-center sm:text-right space-y-1">
              <p className="text-xs sm:text-sm font-medium text-foreground">
                Built by <span className="text-primary font-bold">ATSFy Technologies™</span>
              </p>
              <p className="text-xs text-muted-foreground">
                © 2026 ATSFy Technologies. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
