import { FileText, Sparkles, CheckCircle2, ArrowRight, Upload, Zap, Target, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
const Index = () => {
  return <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-hero rounded-xl flex items-center justify-center">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
            <span className="text-lg sm:text-xl font-display font-bold text-accent">ATSFY</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/welcome">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Sign In</Button>
            </Link>
            <Link to="/welcome">
              <Button variant="hero" size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center border-0">
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full text-accent text-sm font-medium mb-6">Built for Humans. Ready For Machine​<Sparkles className="w-4 h-4" />
                ​
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground leading-tight mb-6 lg:text-2xl">Build Resumes Machines can read.  Understand why your resume passes ATS- not just a score.<span className="text-gradient"></span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                Create ATS-friendly resumes that get past automated screening systems and land you more interviews. Start from scratch or upload your existing resume.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/welcome">
                  <Button variant="hero" size="xl" className="w-full sm:w-auto">
                    Create Your Resume
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
            <div className="animate-fade-up" style={{
            animationDelay: "0.2s"
          }}>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-hero opacity-10 rounded-3xl blur-2xl"></div>
                <div className="relative bg-card rounded-2xl shadow-xl border border-border p-6">
                  <ResumePreviewCard />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-foreground mb-3 sm:mb-4">
              Everything You Need to Land Your Dream Job
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              Built using real recruiter logic - not guesswork or black-box scores          
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[{
            icon: Target,
            title: "ATS Optimization",
            description: "Analyzes your resume against real ATS parsing behavior — not just keywords."
          }, {
            icon: Zap,
            title: "Instant Analysis",
            description: "See exactly how parsers read each section — headers, dates, and formatting issues flagged in real time."
          }, {
            icon: FileText,
            title: "Clean Formatting",
            description: "Uses parser-safe layouts that preserve structure when converted to plain text by ATS software."
          }, {
            icon: Sparkles,
            title: "AI Content Suggestions",
            description: "Recommends action verbs and quantified achievements that match how recruiters actually search."
          }, {
            icon: Upload,
            title: "Resume Import",
            description: "Extracts and restructures your existing content to fix common parsing failures automatically."
          }, {
            icon: Users,
            title: "Industry-Specific Tips",
            description: "Adapts language and section order based on what top-performing resumes in your field include."
          }].map((feature, index) => <div key={index} className="group p-4 sm:p-6 bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <h3 className="text-base sm:text-lg font-display font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-xs sm:text-sm">{feature.description}</p>
              </div>)}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 bg-card">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-foreground mb-3 sm:mb-4">
              Build Your Perfect Resume in 3 Steps
            </h2>
            <p className="text-muted-foreground text-sm sm:text-lg max-w-2xl mx-auto">
              Our streamlined process makes creating an ATS-friendly resume quick and easy.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {[{
            step: "01",
            title: "Enter Your Information",
            description: "Fill in your details or upload an existing resume to get started quickly."
          }, {
            step: "02",
            title: "Get ATS Optimization",
            description: "Our AI analyzes and suggests improvements for maximum ATS compatibility."
          }, {
            step: "03",
            title: "Download & Apply",
            description: "Export your polished, ATS-friendly resume and start landing interviews."
          }].map((step, index) => <div key={index} className="relative text-center sm:text-left">
                <div className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-primary/10 mb-3 sm:mb-4">{step.step}</div>
                <h3 className="text-lg sm:text-xl font-display font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground">{step.description}</p>
                {index < 2 && <div className="hidden md:block absolute top-8 right-0 w-1/2 h-px bg-gradient-to-r from-primary/30 to-transparent"></div>}
              </div>)}
          </div>
          <div className="text-center mt-8 sm:mt-12">
            <Link to="/welcome">
              <Button variant="hero" size="lg">
                Start Building Now
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-hero opacity-10 rounded-3xl blur-2xl"></div>
            <div className="relative bg-gradient-hero rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-3 sm:mb-4">
                Ready to Land More Interviews?
              </h2>
              <p className="text-primary-foreground/80 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto">
                ATSfy explains how ATS systems read resumes. We don't promise jobs - we help you become visible
              </p>
              <Link to="/welcome">
                <Button size="lg" className="bg-background text-primary hover:bg-background/90 shadow-xl">
                  Create Your Free Resume
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
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
              <span className="text-lg font-display font-bold text-foreground">ResumeATS</span>
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground">
              © 2026 ResumeATS. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>;
};
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

      {/* Sections */}
      <div className="space-y-3">
        <div>
          <div className="h-4 bg-primary/20 rounded w-24 mb-2"></div>
          <div className="h-3 bg-muted rounded w-full mb-1"></div>
          <div className="h-3 bg-muted rounded w-5/6"></div>
        </div>
        <div>
          <div className="h-4 bg-primary/20 rounded w-28 mb-2"></div>
          <div className="h-3 bg-muted rounded w-full mb-1"></div>
          <div className="h-3 bg-muted rounded w-4/5 mb-1"></div>
          <div className="h-3 bg-muted rounded w-3/4"></div>
        </div>
        <div>
          <div className="h-4 bg-primary/20 rounded w-20 mb-2"></div>
          <div className="flex gap-2 flex-wrap">
            {["React", "TypeScript", "Node.js", "Python"].map(skill => <span key={skill} className="px-2 py-1 bg-primary/10 rounded text-xs text-primary">
                {skill}
              </span>)}
          </div>
        </div>
      </div>
    </div>;
};
export default Index;