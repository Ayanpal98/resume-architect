import { FileText, Sparkles, CheckCircle2, ArrowRight, Upload, Zap, Target, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-hero rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold text-foreground">ResumeATS</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/welcome">
              <Button variant="ghost" size="sm">Sign In</Button>
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
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full text-accent text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                AI-Powered Resume Builder
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight mb-6">
                Build Resumes That <span className="text-gradient">Beat the Bots</span>
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
              <div className="flex items-center gap-6 mt-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                  Free to start
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                  No credit card required
                </div>
              </div>
            </div>
            <div className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
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
      <section className="py-16 bg-card border-y border-border">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "98%", label: "ATS Pass Rate" },
              { value: "50K+", label: "Resumes Created" },
              { value: "3x", label: "More Interviews" },
              { value: "2 min", label: "Average Build Time" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-display font-bold text-gradient mb-2">{stat.value}</div>
                <div className="text-muted-foreground text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Everything You Need to Land Your Dream Job
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our smart resume builder ensures your resume passes ATS screening and impresses recruiters.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "ATS Optimization",
                description: "Our AI analyzes your resume against real ATS systems to ensure maximum compatibility.",
              },
              {
                icon: Zap,
                title: "Instant Analysis",
                description: "Get real-time feedback and suggestions as you build your resume.",
              },
              {
                icon: FileText,
                title: "Clean Formatting",
                description: "Professional templates designed specifically for ATS compatibility.",
              },
              {
                icon: Sparkles,
                title: "AI Content Suggestions",
                description: "Smart recommendations for keywords, skills, and accomplishments.",
              },
              {
                icon: Upload,
                title: "Resume Import",
                description: "Upload your existing resume and we'll optimize it for ATS systems.",
              },
              {
                icon: Users,
                title: "Industry-Specific Tips",
                description: "Tailored advice based on your target industry and role.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group p-6 bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-display font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-card">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Build Your Perfect Resume in 3 Steps
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our streamlined process makes creating an ATS-friendly resume quick and easy.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Enter Your Information",
                description: "Fill in your details or upload an existing resume to get started quickly.",
              },
              {
                step: "02",
                title: "Get ATS Optimization",
                description: "Our AI analyzes and suggests improvements for maximum ATS compatibility.",
              },
              {
                step: "03",
                title: "Download & Apply",
                description: "Export your polished, ATS-friendly resume and start landing interviews.",
              },
            ].map((step, index) => (
              <div key={index} className="relative">
                <div className="text-6xl font-display font-bold text-primary/10 mb-4">{step.step}</div>
                <h3 className="text-xl font-display font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 right-0 w-1/2 h-px bg-gradient-to-r from-primary/30 to-transparent"></div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
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
      <section className="py-24 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-hero opacity-10 rounded-3xl blur-2xl"></div>
            <div className="relative bg-gradient-hero rounded-3xl p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">
                Ready to Land More Interviews?
              </h2>
              <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
                Join thousands of job seekers who have successfully passed ATS screening with our resume builder.
              </p>
              <Link to="/welcome">
                <Button 
                  size="xl" 
                  className="bg-background text-primary hover:bg-background/90 shadow-xl"
                >
                  Create Your Free Resume
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-display font-bold text-foreground">ResumeATS</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2026 ResumeATS. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const ResumePreviewCard = () => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="border-b border-border pb-4">
        <div className="h-6 bg-foreground/10 rounded w-48 mb-2"></div>
        <div className="h-4 bg-muted rounded w-32"></div>
      </div>
      
      {/* ATS Score */}
      <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-lg">
        <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
          <span className="text-accent-foreground font-bold">95</span>
        </div>
        <div>
          <div className="text-sm font-medium text-foreground">ATS Score</div>
          <div className="text-xs text-muted-foreground">Excellent compatibility</div>
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
            {["React", "TypeScript", "Node.js", "Python"].map((skill) => (
              <span key={skill} className="px-2 py-1 bg-primary/10 rounded text-xs text-primary">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
