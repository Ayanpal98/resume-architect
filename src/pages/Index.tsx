import { FileText, Sparkles, CheckCircle2, ArrowRight, Upload, Zap, Target, Users, LogOut, TrendingUp, ShieldCheck, Activity, Signal, Radar, GitBranch, Network, ShieldAlert, Gauge, Webhook, ScrollText, RefreshCw, Bell, Eye, Cpu, Scale, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LiveStatsCounter } from "@/components/LiveStatsCounter";
import { PricingSection } from "@/components/PricingSection";
import { SampleReportsShowcase } from "@/components/SampleReportsShowcase";
import { useAuth } from "@/contexts/AuthContext";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const Index = () => {
  const { user, signOut } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-nav">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-hero rounded-xl flex items-center justify-center">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-lg sm:text-xl font-display font-bold text-accent tracking-tight">ATSFY</span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-sans">Career Intelligence</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Intelligence</a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors text-sm">How it Works</a>
            <a href="#reports" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Reports</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Pricing</a>
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
                  <a href="#features" onClick={() => setMobileNavOpen(false)} className="px-4 py-3 text-base text-foreground hover:bg-muted rounded-lg">Intelligence</a>
                  <a href="#how-it-works" onClick={() => setMobileNavOpen(false)} className="px-4 py-3 text-base text-foreground hover:bg-muted rounded-lg">How it Works</a>
                  <a href="#reports" onClick={() => setMobileNavOpen(false)} className="px-4 py-3 text-base text-foreground hover:bg-muted rounded-lg">Reports</a>
                  <a href="#pricing" onClick={() => setMobileNavOpen(false)} className="px-4 py-3 text-base text-foreground hover:bg-muted rounded-lg">Pricing</a>
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

      {/* Hero Section */}
      <section className="pt-28 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 border-b border-border/60">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-border rounded-full text-xs font-medium text-muted-foreground mb-8 uppercase tracking-[0.15em]">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                Built on real recruiter logic
              </div>
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-medium leading-[1.05] tracking-tight text-foreground mb-6">
                Career <em className="italic font-normal text-primary">Intelligence</em> for the modern job market.
              </h1>
              <p className="text-base md:text-lg text-muted-foreground mb-8 max-w-xl leading-relaxed font-sans">
                ATSFY doesn't just score your resume — it decodes how hiring systems read, parse, and rank you. Get the visibility machines see, before you apply.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/welcome">
                  <Button variant="hero" size="xl" className="w-full sm:w-auto">
                    Analyze My Profile
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/welcome">
                  <Button variant="outline-hero" size="xl" className="w-full sm:w-auto">
                    <Upload className="w-5 h-5" />
                    Upload Existing Resume
                  </Button>
                </Link>
              </div>
            </div>
            <div className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-hero opacity-10 rounded-3xl blur-2xl"></div>
                <div className="relative glass-strong rounded-2xl p-6">
                  <ResumePreviewCard />
                </div>
                {/* Metric cards */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <MetricCard icon={Target} label="Keyword Match" value="87%" sub="↑ 12% from last version" />
                  <MetricCard icon={Activity} label="Parse Accuracy" value="94%" sub="sections detected" />
                  <MetricCard icon={ShieldCheck} label="Format Score" value="A+" sub="No structure issues" />
                  <MetricCard icon={Signal} label="Signal Strength" value="Strong" sub="Top 8% in field" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Stats Section */}
      <section className="py-12 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl">
          <LiveStatsCounter />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 border-t border-border/60">
        <div className="container mx-auto max-w-6xl">
          <div className="max-w-3xl mb-12 sm:mb-16">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">— Intelligence</div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium text-foreground mb-4 leading-tight tracking-tight">
              Intelligence infrastructure, <em className="italic font-normal text-primary">not another resume builder.</em>
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg font-sans">
              Every layer of ATSFY is engineered around how hiring systems actually work — not keyword stuffing or black-box scores.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 glass rounded-2xl overflow-hidden">
            {[
              { icon: Target, title: "ATS Parsing Engine", description: "Analyzes your resume against real ATS parsing behavior — not just keywords.", tag: "Intelligence layer" },
              { icon: Zap, title: "Real-time Signal Analysis", description: "See exactly how parsers read each section — headers, dates, and formatting issues flagged in real time.", tag: "Analysis" },
              { icon: FileText, title: "Parser-safe Formatting", description: "Uses parser-safe layouts that preserve structure when converted to plain text by ATS software.", tag: "Parsing" },
              { icon: Sparkles, title: "AI Content Intelligence", description: "Recommends action verbs and quantified achievements that match how recruiters actually search.", tag: "Intelligence layer" },
              { icon: Upload, title: "Career Data Extraction", description: "Extracts and restructures your existing content to fix common parsing failures automatically.", tag: "Parsing" },
              { icon: Users, title: "Industry Signal Mapping", description: "Adapts language and section order based on what top-performing resumes in your field include.", tag: "Analysis" },
            ].map((feature, index) => (
              <div key={index} className="group p-6 sm:p-8 border-b border-r border-border/60 last:border-r-0 hover:bg-background/50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display text-xl font-medium text-foreground mb-2 tracking-tight">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4 font-sans">{feature.description}</p>
                <span className="inline-block text-[10px] uppercase tracking-[0.15em] text-muted-foreground border border-border rounded-full px-2.5 py-1">
                  {feature.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 bg-card border-t border-border/60">
        <div className="container mx-auto max-w-6xl">
          <div className="max-w-3xl mb-12 sm:mb-16">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">— Pipeline</div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium text-foreground mb-4 leading-tight tracking-tight">
              Three stages. <em className="italic font-normal text-primary">One outcome.</em>
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg font-sans">
              A streamlined intelligence pipeline that transforms your career data into machine-readable signal.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-px bg-border/60 border border-border/60 rounded-2xl overflow-hidden">
            {[
              { step: "01", title: "Ingest your career data", description: "Fill in your profile or upload an existing resume. Our extraction layer handles restructuring automatically." },
              { step: "02", title: "Run intelligence analysis", description: "ATSFY's parsing engine analyzes and optimizes every signal — formatting, keywords, structure, and ranking potential." },
              { step: "03", title: "Deploy and get seen", description: "Export a polished, ATS-certified profile. Know your score before you apply. Land interviews that matter." },
            ].map((step, index) => (
              <div key={index} className="bg-card p-8 sm:p-10">
                <div className="font-display text-7xl sm:text-8xl font-medium text-muted-foreground/15 mb-6 leading-none">{step.step}</div>
                <h3 className="font-display text-xl sm:text-2xl font-medium text-foreground mb-3 tracking-tight">{step.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground font-sans leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
          <div className="text-left mt-10">
            <Link to="/welcome">
              <Button variant="hero" size="lg">
                Start the Pipeline
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* From ignored → informed: feature mapping + adaptive roadmap */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 border-t border-border/60">
        <div className="container mx-auto max-w-6xl">
          <div className="max-w-3xl mb-12 sm:mb-16">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">— From ignored → informed</div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium text-foreground mb-4 leading-tight tracking-tight">
              Candidates deserve a verdict, <em className="italic font-normal text-primary">not a void.</em>
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg font-sans">
              Six chronic candidate-experience failures — and exactly which ATSFy capabilities answer each one today.
            </p>
          </div>

          <div className="space-y-px bg-border/60 border border-border/60 rounded-2xl overflow-hidden">
            {[
              {
                pain: "Application submitted",
                painSub: "…then silence for weeks",
                answer: "Real-time status tracking",
                answerSub: "Candidate sees every stage update",
                status: "planned",
              },
              {
                pain: "Generic rejection email",
                painSub: "\"We went with another candidate\"",
                answer: "Explainable scorecard",
                answerSub: "Per-dimension feedback via ATS Score Panel & Optimization Report",
                status: "live",
              },
              {
                pain: "\"Did they see my application?\"",
                painSub: "ATS black-box screening",
                answer: "6-engine merit evaluation",
                answerSub: "Recruiter Screening Dashboard — IRS, CSA, SAX scoring",
                status: "live",
              },
              {
                pain: "Followed up — no reply",
                painSub: "Hiring paused? No one knows",
                answer: "Proactive status alerts",
                answerSub: "Candidate notified if role paused or closed",
                status: "planned",
              },
              {
                pain: "Another rejection, another day",
                painSub: "No growth signal, no closure",
                answer: "Career Progression Blueprint",
                answerSub: "CPB engine maps next-step gaps — live in Career Intelligence",
                status: "live",
              },
              {
                pain: "Opaque AI decisions",
                painSub: "Who reviewed me? On what basis?",
                answer: "EU AI Act compliant by architecture",
                answerSub: "Bias-free · Explainable · DISHA/GDPR aligned · Every decision audit-logged",
                status: "partial",
              },
            ].map((row, i) => (
              <div key={i} className="grid md:grid-cols-[1fr_auto_1fr_auto] items-center gap-4 bg-background p-5 sm:p-6">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.15em] text-destructive/70 mb-1">Pain today</div>
                  <div className="font-display text-base sm:text-lg text-foreground tracking-tight">{row.pain}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground font-sans mt-0.5">{row.painSub}</div>
                </div>
                <ArrowRight className="hidden md:block w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="text-[10px] uppercase tracking-[0.15em] text-accent mb-1">ATSFy answer</div>
                  <div className="font-display text-base sm:text-lg text-foreground tracking-tight">{row.answer}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground font-sans mt-0.5">{row.answerSub}</div>
                </div>
                <span
                  className={
                    "justify-self-start md:justify-self-end inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] rounded-full px-2.5 py-1 border " +
                    (row.status === "live"
                      ? "border-accent/40 text-accent bg-accent/5"
                      : row.status === "partial"
                      ? "border-primary/40 text-primary bg-primary/5"
                      : "border-border text-muted-foreground bg-muted/30")
                  }
                >
                  <span className={"w-1.5 h-1.5 rounded-full " + (row.status === "live" ? "bg-accent" : row.status === "partial" ? "bg-primary" : "bg-muted-foreground")} />
                  {row.status === "live" ? "Shipping today" : row.status === "partial" ? "Partial — hardening" : "On roadmap"}
                </span>
              </div>
            ))}
          </div>

          {/* Adaptive Infrastructure Roadmap */}
          <div className="mt-20 sm:mt-24">
            <div className="max-w-3xl mb-12">
              <div className="text-xs uppercase tracking-[0.2em] text-primary mb-4">— What's next · Adaptive Infrastructure</div>
              <h3 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium text-foreground mb-4 leading-tight tracking-tight">
                Beyond compliant. <em className="italic font-normal text-primary">Self-correcting.</em>
              </h3>
              <p className="text-muted-foreground text-base sm:text-lg font-sans">
                The next phase of ATSFy is infrastructure that learns from drift, defends itself, and proves its own fairness — continuously.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 glass rounded-2xl overflow-hidden">
              {[
                { icon: Radar, title: "Bias-drift monitor", description: "Continuous statistical checks on screening outcomes by demographic proxy — auto-pauses scoring if drift exceeds threshold.", horizon: "Q3 · 2026" },
                { icon: GitBranch, title: "Self-healing parser mesh", description: "Multi-engine fallback (Gemini → GPT → local OCR) with automatic re-routing when any provider degrades.", horizon: "Q3 · 2026" },
                { icon: ShieldAlert, title: "Zero-trust rate shield", description: "Per-user, per-org, per-IP adaptive throttling backed by a shared Postgres ledger — replaces in-memory counters.", horizon: "Q4 · 2026" },
                { icon: ScrollText, title: "Immutable explainability ledger", description: "Hash-chained audit log of every AI verdict — exportable for DPDP / EU AI Act regulator requests.", horizon: "Q4 · 2026" },
                { icon: RefreshCw, title: "Recruiter-feedback recalibration", description: "Scoring weights re-tuned weekly from anonymized recruiter accept/reject signals — closes the loop on merit fit.", horizon: "Q1 · 2027" },
                { icon: Webhook, title: "Real-time recruiter event bus", description: "Webhook + SSE stream so candidates receive stage-change pings the instant a recruiter updates status.", horizon: "Q1 · 2027" },
                { icon: Network, title: "Federated candidate signal mesh", description: "Privacy-preserving cross-org skill-gap aggregation — no raw resume ever leaves its tenant.", horizon: "Q2 · 2027" },
                { icon: Gauge, title: "Continuous model-eval harness", description: "Nightly golden-set regression on every prompt + model swap — blocks deploys that regress accuracy or fairness.", horizon: "Q2 · 2027" },
                { icon: Eye, title: "Candidate-side decision viewer", description: "Live mirror of the recruiter scorecard the candidate can open, contest, and download — closing the void.", horizon: "Q3 · 2027" },
              ].map((item, i) => (
                <div key={i} className="group p-6 sm:p-8 border-b border-r border-border/60 last:border-r-0 hover:bg-background/50 transition-colors">
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-sans">{item.horizon}</span>
                  </div>
                  <h4 className="font-display text-lg sm:text-xl font-medium text-foreground mb-2 tracking-tight">{item.title}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed font-sans">{item.description}</p>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground font-sans mt-6 italic">
              Roadmap reflects current engineering intent — horizons are directional, not contractual commitments.
            </p>
          </div>
        </div>
      </section>

      {/* Deep Resume Improvement — for genuine candidates */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 border-t border-border/60 bg-gradient-to-b from-background to-primary/[0.03]">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-primary/30 rounded-full text-xs font-medium text-primary mb-6 uppercase tracking-[0.15em]">
              <ShieldCheck className="w-3.5 h-3.5" />
              For genuine candidates · standalone module
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium text-foreground mb-4 tracking-tight max-w-3xl mx-auto">
              You've earned the experience. Let's make sure it <em className="italic font-normal text-primary">reads that way</em>.
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed font-sans">
              Built for candidates with real depth — not embellishments. A deeper, slower, recruiter-grade pass on your authentic story, rewritten without inventing a single metric.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5 sm:gap-6 mb-10">
            {[
              {
                icon: Eye,
                title: "Evidence-first analysis",
                description: "Every suggestion cites a line from your actual resume. No fabricated metrics, no invented leadership scope, no AI-flavoured filler.",
              },
              {
                icon: ScrollText,
                title: "Depth-aware rewriting",
                description: "Your bullets get sharper positioning and stronger industry language — but only using achievements you actually delivered.",
              },
              {
                icon: Target,
                title: "Section-by-section guidance",
                description: "Summary, experience, skills, and keywords reviewed independently with a current assessment and a recruiter-grade improved version.",
              },
              {
                icon: TrendingUp,
                title: "Gap-to-90% roadmap",
                description: "A concrete 30 / 60 / 90-day plan covering skill development, experience reframing, and networking moves tied to your target role.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="group p-6 sm:p-7 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-elegant transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display text-xl font-medium text-foreground mb-2 tracking-tight">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed font-sans">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-primary/20 bg-card/60 p-6 sm:p-8 mb-10">
            <div className="text-xs uppercase tracking-[0.2em] text-primary mb-4">— How the deep pass works</div>
            <div className="grid sm:grid-cols-4 gap-5">
              {[
                { step: "01", title: "Upload authentic resume", body: "Paste or import your real resume — the messier the better. We work with what you actually have." },
                { step: "02", title: "Drop the target JD", body: "We map your background against the specific role, not a generic template." },
                { step: "03", title: "Read the recruiter pass", body: "Section-by-section assessment with rewritten bullets grounded only in your real history." },
                { step: "04", title: "Follow the 30/60/90 plan", body: "Concrete actions to close the gap to a 90%+ match — without faking anything." },
              ].map((s, i) => (
                <div key={i} className="space-y-2">
                  <div className="font-display text-2xl text-primary/70">{s.step}</div>
                  <div className="font-medium text-foreground text-sm">{s.title}</div>
                  <p className="text-xs text-muted-foreground leading-relaxed font-sans">{s.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/ats-analysis">
              <Button variant="hero" size="xl" className="w-full sm:w-auto">
                Run the deep analysis
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/welcome">
              <Button variant="outline-hero" size="xl" className="w-full sm:w-auto">
                <Upload className="w-5 h-5" />
                Upload my real resume
              </Button>
            </Link>
          </div>

          <p className="text-xs text-muted-foreground font-sans mt-6 italic text-center">
            Standalone module — no metric invention, no fabricated experience. We rewrite how your story reads, never what it claims.
          </p>
        </div>
      </section>

      {/* Sample Reports Showcase */}
      <SampleReportsShowcase />

      {/* Pricing Section */}
      <PricingSection />

      {/* CTA Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 border-t border-border/60">
        <div className="container mx-auto max-w-4xl">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-hero opacity-10 rounded-3xl blur-2xl"></div>
            <div className="relative bg-gradient-hero rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 text-center">
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium text-primary-foreground mb-4 tracking-tight leading-tight">
                Be visible to machines. <em className="italic font-normal">Be chosen by humans.</em>
              </h2>
              <p className="text-primary-foreground/80 text-sm sm:text-base md:text-lg mb-8 max-w-2xl mx-auto font-sans">
                ATSFY decodes how ATS systems read resumes. We don't promise jobs — we guarantee you become visible to the systems that gate them.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/welcome">
                  <Button size="lg" className="bg-background text-primary hover:bg-background/90 shadow-xl">
                    Analyze My Profile
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/welcome">
                  <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                    Create Free Resume
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Trust bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border/60 border border-border/60 rounded-xl overflow-hidden mt-12">
            {[
              "AI-powered candidate evaluation",
              "Used by job seekers & recruiters",
              "Data-driven insights, not guesswork",
              "Built for real hiring outcomes",
            ].map((point, i) => (
              <div key={i} className="bg-background p-5 flex items-center gap-2.5">
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
                <span className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground">Career Intelligence</span>
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

const MetricCard = ({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub: string }) => (
  <div className="glass rounded-xl p-3.5">
    <div className="flex items-center justify-between mb-2">
      <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-sans">{label}</span>
      <Icon className="w-3.5 h-3.5 text-primary" />
    </div>
    <div className="font-display text-2xl font-medium text-foreground leading-none mb-1.5 tracking-tight">{value}</div>
    <div className="text-[10px] text-muted-foreground font-sans">{sub}</div>
  </div>
);

const ResumePreviewCard = () => {
  return <div className="space-y-4">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <div className="h-6 bg-foreground/10 rounded w-48 mb-2"></div>
        <div className="h-4 bg-muted rounded w-32"></div>
      </div>
      
      {/* Hiring Readiness */}
      <div className="p-3 bg-accent/10 rounded-lg space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
            <span className="text-accent-foreground font-bold">95</span>
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">ATS Readibility</div>
            <div className="text-xs text-muted-foreground">How clearly applicant tracking system parse your resume</div>
          </div>
        </div>
        {/* Score Benchmarks */}
        <div className="pt-2 border-t border-accent/20">
          <div className="text-[10px] text-muted-foreground mb-1.5">Score Guide</div>
          <div className="grid grid-cols-4 gap-1 text-[9px]">
            <div className="flex flex-col items-center gap-0.5 p-1 rounded bg-destructive/10">
              <div className="w-2.5 h-2.5 rounded-full bg-destructive"></div>
              <span className="font-medium text-destructive">Fair</span>
              <span className="text-muted-foreground">0-49</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 p-1 rounded bg-warning/10">
              <div className="w-2.5 h-2.5 rounded-full bg-warning"></div>
              <span className="font-medium text-warning">Good</span>
              <span className="text-muted-foreground">50-69</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 p-1 rounded bg-primary/10">
              <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
              <span className="font-medium text-primary">Better</span>
              <span className="text-muted-foreground">70-84</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 p-1 rounded bg-accent/20">
              <div className="w-2.5 h-2.5 rounded-full bg-accent"></div>
              <span className="font-medium text-accent">Best</span>
              <span className="text-muted-foreground">85+</span>
            </div>
          </div>
        </div>
      </div>
    </div>;
};

export default Index;
