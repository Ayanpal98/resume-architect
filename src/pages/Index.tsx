import { FileText, Sparkles, CheckCircle2, ArrowRight, Upload, Target, LogOut, TrendingUp, ShieldCheck, Activity, Signal, Menu } from "lucide-react";
import { Seo } from "@/components/Seo";
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
      <Seo title={"ATSFy — Career Intelligence for the Modern Job Market"} description={"ATSFy decodes how hiring systems read, parse, and rank your resume. Get the visibility machines see — before you apply."} path={"/"} />
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
          <div className="max-w-2xl mb-10 sm:mb-14">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">— Intelligence</div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium text-foreground leading-tight tracking-tight">
              Not another resume builder. <em className="italic font-normal text-primary">Career intelligence.</em>
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 glass rounded-2xl overflow-hidden">
            {[
              { icon: Target, title: "ATS parsing engine", description: "See your resume the way hiring systems actually read it." },
              { icon: Sparkles, title: "Evidence-linked rewrite", description: "Sharper positioning grounded only in what you truly delivered." },
              { icon: TrendingUp, title: "Career intelligence reports", description: "Role fit, skill gaps, and a 30/60/90 plan — exportable as PDF." },
            ].map((feature, index) => (
              <div key={index} className="p-6 sm:p-8 border-b border-r border-border/60 last:border-r-0">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display text-xl font-medium text-foreground mb-2 tracking-tight">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed font-sans">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 bg-card border-t border-border/60">
        <div className="container mx-auto max-w-6xl">
          <div className="max-w-2xl mb-10 sm:mb-14">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">— Pipeline</div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium text-foreground leading-tight tracking-tight">
              Three stages. <em className="italic font-normal text-primary">One outcome.</em>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-px bg-border/60 border border-border/60 rounded-2xl overflow-hidden">
            {[
              { step: "01", title: "Upload your resume", description: "Import or paste — we restructure it automatically." },
              { step: "02", title: "Run the analysis", description: "Formatting, keywords, structure, and ranking potential, decoded." },
              { step: "03", title: "Export and apply", description: "A parser-safe profile plus the intelligence behind it." },
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

      {/* Deep Resume Improvement — condensed band */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 border-t border-border/60 bg-gradient-to-b from-background to-primary/[0.03]">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-primary/30 rounded-full text-xs font-medium text-primary mb-6 uppercase tracking-[0.15em]">
            <ShieldCheck className="w-3.5 h-3.5" />
            Deep Resume Improvement
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium text-foreground mb-4 tracking-tight">
            You've earned the experience. Let's make sure it <em className="italic font-normal text-primary">reads that way</em>.
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed font-sans mb-8">
            A recruiter-grade pass on your authentic story — every suggestion cited from your real resume. No invented metrics, ever.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/ats-analysis">
              <Button variant="hero" size="xl" className="w-full sm:w-auto">
                Run the deep analysis
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
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
