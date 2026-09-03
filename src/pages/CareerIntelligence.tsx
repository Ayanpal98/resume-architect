import { useState, useEffect } from "react";
import { Seo } from "@/components/Seo";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Compass, Sparkles, ShieldCheck, Award, BookOpen, MessageCircle, Globe,
  TrendingUp, ArrowLeft, Loader2, Target, AlertTriangle, CheckCircle2, Rocket,
  Zap, Users, GraduationCap, Brain, Lightbulb, Star, ChevronRight, Download,
} from "lucide-react";
import { ComplianceFooter } from "@/components/ComplianceFooter";
import {
  exportRoadmapPdf,
  exportSkillAnalysisPdf,
  exportRoleFitPdf,
  exportCoachingPdf,
  exportRejectionDecoderPdf,
  exportCombinedPdf,
} from "@/lib/careerIntelligencePdf";

type FocusArea = "Skill gaps" | "Certifications" | "Networking" | "Salary jump" | "Leadership";
const FOCUS_AREAS: FocusArea[] = ["Skill gaps", "Certifications", "Networking", "Salary jump", "Leadership"];
const TIMELINES = ["3 months", "6 months", "1 year", "2 years"];
const YEARS = ["0-1 years", "1-3 years", "3-5 years", "5-8 years", "8-12 years", "12+ years"];
const INDUSTRIES = [
  "Technology", "Software & SaaS", "Artificial Intelligence & ML", "Data & Analytics", "Cybersecurity",
  "Cloud & DevOps", "Finance", "Banking", "Investment & Capital Markets", "Insurance", "FinTech",
  "Healthcare", "Pharmaceuticals & Biotech", "Medical Devices", "E-Commerce", "Retail & CPG",
  "Consulting", "Education & EdTech", "Manufacturing", "Automotive", "Aerospace & Defense",
  "Energy & Utilities", "Oil & Gas", "Renewable Energy", "Construction & Real Estate",
  "Media & Entertainment", "Gaming", "Telecommunications", "Travel & Hospitality", "Logistics & Supply Chain",
  "Transportation", "Agriculture & AgriTech", "Legal Services", "Government & Public Sector",
  "Non-Profit & NGO", "Marketing & Advertising", "Human Resources", "Design & Creative",
  "Sports & Fitness", "Food & Beverage",
];

interface Profile {
  currentRole: string;
  targetRole: string;
  yearsOfExperience: string;
  currentSkills: string;
  industry: string;
  timeline: string;
  focusAreas: FocusArea[];
  jobDescription: string;
  rejectionFeedback: string;
  coachingTopic: string;
}

const initialProfile: Profile = {
  currentRole: "",
  targetRole: "",
  yearsOfExperience: "",
  currentSkills: "",
  industry: "",
  timeline: "1 year",
  focusAreas: ["Skill gaps", "Certifications"],
  jobDescription: "",
  rejectionFeedback: "",
  coachingTopic: "",
};

type Mode = "roadmap" | "skill_analysis" | "role_fit" | "ai_coaching" | "rejection_decoder";

interface ReportMeta {
  mode: Mode;
  label: string;
  tagline: string;
  icon: React.ReactNode;
}

const REPORT_LIBRARY: ReportMeta[] = [
  { mode: "roadmap", label: "Career Roadmap", tagline: "Your step-by-step path to the target role", icon: <Globe className="w-4 h-4" /> },
  { mode: "skill_analysis", label: "Skill Intelligence", tagline: "What's strong, what's missing, what's next", icon: <Brain className="w-4 h-4" /> },
  { mode: "role_fit", label: "Role Fit", tagline: "How you align with a real job posting", icon: <Target className="w-4 h-4" /> },
  { mode: "ai_coaching", label: "Interview Coaching", tagline: "Questions, answers and your pitch", icon: <MessageCircle className="w-4 h-4" /> },
  { mode: "rejection_decoder", label: "Rejection Decoder", tagline: "Turn a 'no' into your next move", icon: <ShieldCheck className="w-4 h-4" /> },
];

const CareerIntelligence = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [activeTab, setActiveTab] = useState<Mode>("roadmap");
  const [loadingMode, setLoadingMode] = useState<Mode | null>(null);
  const [results, setResults] = useState<Record<Mode, any | null>>({
    roadmap: null,
    skill_analysis: null,
    role_fit: null,
    ai_coaching: null,
    rejection_decoder: null,
  });

  // Role hint only — never force-redirect away from an explicitly requested page.
  const [recruiterAccount, setRecruiterAccount] = useState(false);
  useEffect(() => {
    (async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: { user } } = await supabase.auth.getUser();
      setRecruiterAccount((user?.user_metadata as any)?.user_type === "institution");
    })();
  }, []);

  const switchToJobSeeker = async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    await supabase.auth.updateUser({ data: { user_type: "jobseeker" } });
    localStorage.setItem("atsfy_user_type", "jobseeker");
    setRecruiterAccount(false);
    toast.success("Switched to Job Seeker mode.");
  };



  const toggleFocus = (f: FocusArea) => {
    setProfile((p) => ({
      ...p,
      focusAreas: p.focusAreas.includes(f)
        ? p.focusAreas.filter((x) => x !== f)
        : [...p.focusAreas, f],
    }));
  };

  const generate = async (mode: Mode) => {
    if (!profile.targetRole.trim()) {
      toast.error("Please enter your target role to begin.");
      return;
    }
    setLoadingMode(mode);
    try {
      const { data, error } = await supabase.functions.invoke("career-intelligence", {
        body: { mode, profile },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResults((r) => ({ ...r, [mode]: data.result }));
      setActiveTab(mode);
      toast.success("Intelligence ready.");
    } catch (e: any) {
      toast.error(e.message || "Could not generate. Please try again.");
    } finally {
      setLoadingMode(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo title={"Career Intelligence — ATSFy"} description={"Premium 5-module career engine: roadmap, skill analysis, role fit, AI coaching, and rejection decoder."} path={"/career-intelligence"} />
      <h1 className="sr-only">ATSFy Career Intelligence</h1>
      {/* Header */}
      <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Home</span>
            </Link>
            <div className="h-5 w-px bg-border hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
                <Compass className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <div className="font-display font-bold text-foreground leading-none">Career Intelligence</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">by ATSFy</div>
              </div>
              <Badge className="ml-2 bg-accent text-accent-foreground hidden sm:inline-flex">BETA</Badge>
            </div>
          </div>
          <Badge variant="outline" className="hidden md:inline-flex gap-1.5 border-accent/40 text-accent-foreground bg-accent/10">
            <Sparkles className="w-3 h-3" /> Job Seekers Only
          </Badge>
        </div>
      </nav>

      {recruiterAccount && (
        <div className="container mx-auto px-4 sm:px-6 pt-4">
          <div className="glass rounded-xl border border-border/60 p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <p className="text-sm text-muted-foreground">
              Your account is set to Recruiter / HR. Career Intelligence is built for job seekers.
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="hero" onClick={switchToJobSeeker}>Switch to Job Seeker</Button>
              <Button size="sm" variant="outline" onClick={() => navigate("/recruiter")}>Go to Recruiter</Button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 py-6 grid lg:grid-cols-[340px_1fr] gap-6">
        {/* Profile Builder Sidebar */}
        <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto pb-4 order-2 lg:order-1">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-accent font-semibold mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" /> Your Details
            </div>
            <h2 className="text-lg font-display font-bold text-foreground">Where you are, where you're going</h2>
            <p className="text-xs text-muted-foreground mt-1">The more you share, the sharper your intelligence.</p>
          </div>


          {/* Candidate */}
          <Card className="border-border/60">
            <CardContent className="p-4 space-y-3">
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Candidate Profile</div>
              <div>
                <label className="text-xs font-medium text-foreground">Current role / title</label>
                <Input
                  placeholder="e.g. Junior Data Analyst"
                  value={profile.currentRole}
                  onChange={(e) => setProfile({ ...profile, currentRole: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground">Target role</label>
                <Input
                  placeholder="e.g. Senior ML Engineer"
                  value={profile.targetRole}
                  onChange={(e) => setProfile({ ...profile, targetRole: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground">Years of experience</label>
                <Select value={profile.yearsOfExperience} onValueChange={(v) => setProfile({ ...profile, yearsOfExperience: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {YEARS.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Skills Snapshot */}
          <Card className="border-border/60">
            <CardContent className="p-4 space-y-3">
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Skills Snapshot</div>
              <div>
                <label className="text-xs font-medium text-foreground">Current skills (comma-separated)</label>
                <Textarea
                  placeholder="Python, SQL, Excel, Power BI..."
                  value={profile.currentSkills}
                  onChange={(e) => setProfile({ ...profile, currentSkills: e.target.value })}
                  className="mt-1 min-h-[90px] resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground">Industry / domain</label>
                <Select value={profile.industry} onValueChange={(v) => setProfile({ ...profile, industry: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Goals */}
          <Card className="border-border/60">
            <CardContent className="p-4 space-y-3">
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Goals & Priorities</div>
              <div>
                <label className="text-xs font-medium text-foreground">Timeline to goal</label>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {TIMELINES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setProfile({ ...profile, timeline: t })}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        profile.timeline === t
                          ? "bg-accent text-accent-foreground border-accent"
                          : "bg-background text-foreground border-border hover:border-accent/50"
                      }`}
                    >{t}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground">Focus areas</label>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {FOCUS_AREAS.map((f) => {
                    const active = profile.focusAreas.includes(f);
                    return (
                      <button
                        key={f}
                        onClick={() => toggleFocus(f)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          active
                            ? "bg-accent/15 text-accent-foreground border-accent/60"
                            : "bg-background text-foreground border-border hover:border-accent/40"
                        }`}
                      >{f}</button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Optional JD */}
          <Card className="border-border/60">
            <CardContent className="p-4 space-y-2">
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Job Description (Optional)</div>
              <Textarea
                placeholder="Paste a target job description to get a precision-matched roadmap..."
                value={profile.jobDescription}
                onChange={(e) => setProfile({ ...profile, jobDescription: e.target.value })}
                className="min-h-[100px] resize-none text-sm"
              />
            </CardContent>
          </Card>

          <Button
            variant="hero"
            size="lg"
            className="w-full"
            disabled={loadingMode !== null}
            onClick={() => generate("roadmap")}
          >
            {loadingMode === "roadmap" ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Generate Career Roadmap</>
            )}
          </Button>
        </aside>

        {/* Main panel */}
        <main className="min-w-0 order-1 lg:order-2 space-y-8">
          {/* 1 + 2 + 3 + 4 — Command center */}
          <CommandCenter
            profile={profile}
            results={results}
            loadingMode={loadingMode}
            onGenerate={generate}
            onOpen={(m) => setActiveTab(m)}
            onNavigate={(to) => navigate(to)}
          />

          {/* 5 — Your Target Jobs */}
          <TargetJobsSection
            profile={profile}
            results={results}
            loading={loadingMode === "role_fit"}
            onAnalyze={() => generate("role_fit")}
            onOpen={() => setActiveTab("role_fit")}
          />

          {/* 6 — Your Progress */}
          <ProgressSection results={results} />

          {/* 7 — Your Intelligence library + reports */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Mode)}>
            <SectionLead
              eyebrow="Your Intelligence"
              title="Career Intelligence Library"
              desc="Every report you generate stays here — ready to read, re-run or download."
              action={(() => {
                const readyCount = (Object.values(results) as any[]).filter(Boolean).length;
                if (readyCount === 0) return null;
                return (
                  <Button
                    size="sm"
                    variant="hero"
                    className="gap-1.5"
                    onClick={() => {
                      try {
                        exportCombinedPdf(results, profile);
                        toast.success("Combined PDF downloaded.");
                      } catch (e: any) {
                        toast.error(e?.message || "Could not export combined PDF.");
                      }
                    }}
                  >
                    <Download className="w-4 h-4" /> Download all ({readyCount})
                  </Button>
                );
              })()}
            />

            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3 mb-6">
              {REPORT_LIBRARY.map((r) => (
                <LibraryCard
                  key={r.mode}
                  meta={r}
                  ready={Boolean(results[r.mode])}
                  active={activeTab === r.mode}
                  loading={loadingMode === r.mode}
                  onOpen={() => setActiveTab(r.mode)}
                  onGenerate={() => generate(r.mode)}
                />
              ))}
            </div>

            {/* Roadmap */}
            <TabsContent value="roadmap" className="mt-0">
              {results.roadmap ? (
                <RoadmapView data={results.roadmap} profile={profile} />
              ) : (
                <ActionEmpty
                  title="No roadmap yet"
                  desc="Add your target role, then build a step-by-step path from where you are to where you want to be."
                  loading={loadingMode === "roadmap"}
                  onRun={() => generate("roadmap")}
                  cta="Build my roadmap"
                  icon={<Globe className="w-7 h-7 text-primary" />}
                />
              )}
            </TabsContent>

            {/* Skill Analysis */}
            <TabsContent value="skill_analysis" className="mt-0">
              {results.skill_analysis ? (
                <SkillAnalysisView data={results.skill_analysis} profile={profile} />
              ) : (
                <ActionEmpty
                  title="No skill review yet"
                  desc="See which of your skills carry weight in the market, what's missing, and how to close the gap."
                  loading={loadingMode === "skill_analysis"}
                  onRun={() => generate("skill_analysis")}
                  cta="Review my skills"
                  icon={<Brain className="w-7 h-7 text-primary" />}
                />
              )}
            </TabsContent>

            {/* Role Fit */}
            <TabsContent value="role_fit" className="mt-0">
              {results.role_fit ? (
                <RoleFitView data={results.role_fit} profile={profile} />
              ) : (
                <ActionEmpty
                  title="No job analysis yet"
                  desc="Your next opportunity starts here. Analyse a real job and see how you align before you apply."
                  loading={loadingMode === "role_fit"}
                  onRun={() => generate("role_fit")}
                  cta="Analyse a job"
                  icon={<Target className="w-7 h-7 text-primary" />}
                />
              )}
            </TabsContent>

            {/* AI Coaching */}
            <TabsContent value="ai_coaching" className="mt-0">
              <Card className="border-border/60 mb-4">
                <CardContent className="p-4 space-y-2">
                  <label className="text-xs font-medium text-foreground">What do you want coaching on? (optional)</label>
                  <Input
                    placeholder="e.g. interview prep for product analytics role"
                    value={profile.coachingTopic}
                    onChange={(e) => setProfile({ ...profile, coachingTopic: e.target.value })}
                  />
                </CardContent>
              </Card>
              {results.ai_coaching ? (
                <CoachingView data={results.ai_coaching} profile={profile} />
              ) : (
                <ActionEmpty
                  title="No coaching session yet"
                  desc="Get the questions you'll likely face, how to answer them, and how to talk about your gaps."
                  loading={loadingMode === "ai_coaching"}
                  onRun={() => generate("ai_coaching")}
                  cta="Prepare me"
                  icon={<MessageCircle className="w-7 h-7 text-primary" />}
                />
              )}
            </TabsContent>

            {/* Rejection Decoder */}
            <TabsContent value="rejection_decoder" className="mt-0">
              <Card className="border-border/60 mb-4">
                <CardContent className="p-4 space-y-2">
                  <label className="text-xs font-medium text-foreground">Paste the rejection you received (optional)</label>
                  <Textarea
                    placeholder="Paste the recruiter's rejection email, or describe what happened..."
                    value={profile.rejectionFeedback}
                    onChange={(e) => setProfile({ ...profile, rejectionFeedback: e.target.value })}
                    className="min-h-[90px] resize-none"
                  />
                </CardContent>
              </Card>
              {results.rejection_decoder ? (
                <RejectionView data={results.rejection_decoder} profile={profile} />
              ) : (
                <ActionEmpty
                  title="Nothing to decode yet"
                  desc="Turn a rejection into a plan. Find out what likely went wrong and what to fix first."
                  loading={loadingMode === "rejection_decoder"}
                  onRun={() => generate("rejection_decoder")}
                  cta="Decode a rejection"
                  icon={<ShieldCheck className="w-7 h-7 text-primary" />}
                />
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>


      <ComplianceFooter />
    </div>
  );
};

/* ---------- Result Views ---------- */

const SectionHeader = ({ icon, title, sub }: { icon: React.ReactNode; title: string; sub?: string }) => (
  <div className="flex items-start gap-3 mb-3">
    <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">{icon}</div>
    <div>
      <h3 className="font-display font-semibold text-foreground">{title}</h3>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  </div>
);

const ExportBar = ({ label, onExport }: { label: string; onExport: () => void }) => (
  <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
    <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
    <Button
      size="sm"
      variant="outline"
      onClick={() => {
        try {
          onExport();
          toast.success("PDF report downloaded.");
        } catch (e: any) {
          toast.error(e?.message || "Could not export PDF.");
        }
      }}
      className="gap-1.5"
    >
      <Download className="w-4 h-4" /> Download Full PDF Report
    </Button>
  </div>
);

const RoadmapView = ({ data, profile }: { data: any; profile: Profile }) => (
  <div className="space-y-5 animate-fade-up">
    <ExportBar label="Career Roadmap" onExport={() => exportRoadmapPdf(data, profile)} />
    <Card className="bg-gradient-card border-accent/30">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <Badge className="bg-accent text-accent-foreground mb-2">Executive Summary</Badge>
            <p className="text-sm text-foreground leading-relaxed">{data.executive_summary}</p>
          </div>
          <div className="flex gap-3">
            <ScoreBlock label="Today" value={data.readiness_score} />
            <ScoreBlock label="Target" value={data.target_score} accent />
          </div>
        </div>
      </CardContent>
    </Card>

    {Array.isArray(data.quick_wins) && data.quick_wins.length > 0 && (
      <Card>
        <CardContent className="p-5">
          <SectionHeader icon={<Zap className="w-5 h-5" />} title="Quick Wins" sub="Move the needle in under an hour" />
          <ul className="space-y-2">
            {data.quick_wins.map((w: string, i: number) => (
              <li key={i} className="flex gap-2 text-sm text-foreground">
                <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" /> {w}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    )}

    {Array.isArray(data.phases) && data.phases.map((p: any, i: number) => (
      <Card key={i} className="border-l-4 border-l-primary">
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <div>
              <Badge variant="outline" className="mb-1">{p.phase}</Badge>
              <h3 className="font-display font-semibold text-foreground">{p.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{p.objective}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Expected score</span>
              <span className="text-xl font-bold text-primary">{p.expected_score_after}%</span>
            </div>
          </div>
          {Array.isArray(p.actions) && (
            <ul className="space-y-1.5 mb-3">
              {p.actions.map((a: string, j: number) => (
                <li key={j} className="flex gap-2 text-sm text-foreground">
                  <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" /> {a}
                </li>
              ))}
            </ul>
          )}
          {Array.isArray(p.deliverables) && p.deliverables.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {p.deliverables.map((d: string, k: number) => (
                <Badge key={k} variant="secondary" className="text-xs">{d}</Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    ))}

    {Array.isArray(data.certifications) && data.certifications.length > 0 && (
      <Card>
        <CardContent className="p-5">
          <SectionHeader icon={<Award className="w-5 h-5" />} title="Certifications" />
          <div className="grid sm:grid-cols-2 gap-3">
            {data.certifications.map((c: any, i: number) => (
              <div key={i} className="border border-border rounded-lg p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-medium text-sm text-foreground">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.provider}</div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{c.priority}</Badge>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>{c.time_to_complete}</span>
                  <span>{c.cost_estimate}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )}

    {data.networking && (
      <Card>
        <CardContent className="p-5">
          <SectionHeader icon={<Users className="w-5 h-5" />} title="Networking Intelligence" />
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <NetworkBlock title="Target Companies" items={data.networking.target_companies} />
            <NetworkBlock title="Communities" items={data.networking.communities} />
            <NetworkBlock title="Events" items={data.networking.events} />
          </div>
        </CardContent>
      </Card>
    )}
  </div>
);

const NetworkBlock = ({ title, items }: { title: string; items?: string[] }) => (
  <div>
    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{title}</div>
    <ul className="space-y-1">
      {(items || []).map((it, i) => <li key={i} className="text-sm text-foreground">• {it}</li>)}
    </ul>
  </div>
);

const ScoreBlock = ({ label, value, accent }: { label: string; value: number; accent?: boolean }) => (
  <div className="text-center">
    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    <div className={`text-2xl font-bold ${accent ? "text-accent" : "text-primary"}`}>{value || 0}%</div>
  </div>
);

const SkillAnalysisView = ({ data, profile }: { data: any; profile: Profile }) => (
  <div className="space-y-5 animate-fade-up">
    <ExportBar label="Skill Intelligence" onExport={() => exportSkillAnalysisPdf(data, profile)} />
    <Card className="bg-gradient-card">
      <CardContent className="p-5">
        <p className="text-sm text-foreground">{data.summary}</p>
      </CardContent>
    </Card>

    <SkillBlock
      icon={<Star className="w-5 h-5 text-accent" />}
      title="Strong Skills"
      items={(data.strong_skills || []).map((s: any) => ({
        primary: s.skill, secondary: s.evidence, badge: s.market_value,
      }))}
      tone="accent"
    />
    <SkillBlock
      icon={<AlertTriangle className="w-5 h-5 text-warning" />}
      title="Missing Critical Skills"
      items={(data.missing_critical_skills || []).map((s: any) => ({
        primary: s.skill,
        secondary: `${s.why_critical} • ${s.learning_resource} • ${s.time_to_acquire}`,
        badge: s.impact_on_match,
      }))}
      tone="warning"
    />
    {Array.isArray(data.emerging_skills_to_watch) && data.emerging_skills_to_watch.length > 0 && (
      <SkillBlock
        icon={<TrendingUp className="w-5 h-5 text-primary" />}
        title="Emerging Skills to Watch"
        items={data.emerging_skills_to_watch.map((s: any) => ({
          primary: s.skill, secondary: `${s.trend} • ${s.relevance}`,
        }))}
        tone="primary"
      />
    )}
    {Array.isArray(data.recommended_skill_stack) && (
      <Card>
        <CardContent className="p-5">
          <SectionHeader icon={<Lightbulb className="w-5 h-5" />} title="Recommended Skill Stack" sub="The skills to lead with on your resume" />
          <div className="flex flex-wrap gap-1.5">
            {data.recommended_skill_stack.map((s: string, i: number) => (
              <Badge key={i} className="bg-primary/10 text-primary hover:bg-primary/15 border border-primary/20">{s}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    )}
  </div>
);

const SkillBlock = ({ icon, title, items, tone }: { icon: React.ReactNode; title: string; items: any[]; tone: string }) => {
  const border = tone === "warning" ? "border-l-warning" : tone === "accent" ? "border-l-accent" : "border-l-primary";
  if (!items.length) return null;
  return (
    <Card className={`border-l-4 ${border}`}>
      
      <CardContent className="p-5">
        <SectionHeader icon={icon} title={title} />
        <ul className="space-y-2">
          {items.map((it, i) => (
            <li key={i} className="flex items-start justify-between gap-3 text-sm">
              <div className="min-w-0">
                <div className="font-medium text-foreground">{it.primary}</div>
                {it.secondary && <div className="text-xs text-muted-foreground mt-0.5">{it.secondary}</div>}
              </div>
              {it.badge && <Badge variant="outline" className="shrink-0 text-[10px]">{it.badge}</Badge>}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

const RoleFitView = ({ data, profile }: { data: any; profile: Profile }) => (
  <div className="space-y-5 animate-fade-up">
    <ExportBar label="Role Fit Score" onExport={() => exportRoleFitPdf(data, profile)} />
    <Card className="bg-gradient-hero text-primary-foreground">
      <CardContent className="p-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs uppercase tracking-wider opacity-80">Overall Fit</div>
          <div className="text-5xl font-bold">{data.overall_fit_score}%</div>
          <Badge className="mt-2 bg-white/15 text-primary-foreground border-0">{data.verdict}</Badge>
        </div>
        <div className="max-w-md text-sm opacity-95">{data.positioning_strategy}</div>
      </CardContent>
    </Card>

    <Card>
      <CardContent className="p-5">
        <SectionHeader icon={<Target className="w-5 h-5" />} title="Dimension Breakdown" />
        <div className="space-y-3">
          {(data.dimensions || []).map((d: any, i: number) => (
            <div key={i}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-foreground">{d.name}</span>
                <span className="text-muted-foreground">{d.score}% <span className="text-xs">/ weight {d.weight}%</span></span>
              </div>
              <Progress value={d.score} className="h-2" />
              {d.observations && <p className="text-xs text-muted-foreground mt-1">{d.observations}</p>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    <div className="grid sm:grid-cols-2 gap-4">
      <Card>
        <CardContent className="p-5">
          <SectionHeader icon={<AlertTriangle className="w-5 h-5" />} title="Risks" />
          <ul className="space-y-1.5 text-sm">
            {(data.risks || []).map((r: string, i: number) => (
              <li key={i} className="flex gap-2"><span className="text-warning">•</span> {r}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-5">
          <SectionHeader icon={<Rocket className="w-5 h-5" />} title="Opportunities" />
          <ul className="space-y-1.5 text-sm">
            {(data.opportunities || []).map((r: string, i: number) => (
              <li key={i} className="flex gap-2"><span className="text-accent">•</span> {r}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  </div>
);

const CoachingView = ({ data, profile }: { data: any; profile: Profile }) => (
  <div className="space-y-5 animate-fade-up">
    <ExportBar label="AI Coaching Session" onExport={() => exportCoachingPdf(data, profile)} />
    <Card className="bg-gradient-card">
      <CardContent className="p-5">
        <p className="text-sm text-foreground">{data.coaching_summary}</p>
      </CardContent>
    </Card>

    <Card>
      <CardContent className="p-5">
        <SectionHeader icon={<MessageCircle className="w-5 h-5" />} title="Likely Interview Questions" />
        <div className="space-y-3">
          {(data.likely_interview_questions || []).map((q: any, i: number) => (
            <div key={i} className="border border-border rounded-lg p-3">
              <div className="text-sm font-medium text-foreground">Q{i + 1}. {q.question}</div>
              <div className="text-xs text-muted-foreground mt-1.5"><span className="font-semibold text-accent">How to answer: </span>{q.how_to_answer}</div>
              {q.red_flags_to_avoid && (
                <div className="text-xs text-muted-foreground mt-1"><span className="font-semibold text-warning">Avoid: </span>{q.red_flags_to_avoid}</div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    <div className="grid md:grid-cols-2 gap-4">
      <Card>
        <CardContent className="p-5">
          <SectionHeader icon={<Star className="w-5 h-5" />} title="Talking Points" />
          <ul className="text-sm space-y-1.5">
            {(data.talking_points || []).map((p: string, i: number) => <li key={i}>• {p}</li>)}
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-5">
          <SectionHeader icon={<ShieldCheck className="w-5 h-5" />} title="Weakness Mitigation" />
          <ul className="text-sm space-y-2">
            {(data.weakness_mitigation || []).map((w: any, i: number) => (
              <li key={i}>
                <div className="font-medium text-foreground">{w.weakness}</div>
                <div className="text-xs text-muted-foreground">{w.mitigation}</div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardContent className="p-5">
        <SectionHeader icon={<Sparkles className="w-5 h-5" />} title="Elevator Pitch" />
        <p className="text-sm text-foreground italic border-l-2 border-accent pl-3">{data.elevator_pitch}</p>
      </CardContent>
    </Card>

    <Card>
      <CardContent className="p-5">
        <SectionHeader icon={<Users className="w-5 h-5" />} title="Outreach Template" />
        <pre className="text-sm text-foreground whitespace-pre-wrap font-sans bg-muted/40 rounded p-3">{data.outreach_template}</pre>
      </CardContent>
    </Card>

    {Array.isArray(data.confidence_builders) && data.confidence_builders.length > 0 && (
      <Card>
        <CardContent className="p-5">
          <SectionHeader icon={<GraduationCap className="w-5 h-5" />} title="Confidence Builders" />
          <ul className="text-sm space-y-1.5">
            {data.confidence_builders.map((c: string, i: number) => <li key={i}>• {c}</li>)}
          </ul>
        </CardContent>
      </Card>
    )}
  </div>
);

const RejectionView = ({ data, profile }: { data: any; profile: Profile }) => (
  <div className="space-y-5 animate-fade-up">
    <ExportBar label="Rejection Decoder" onExport={() => exportRejectionDecoderPdf(data, profile)} />
    <Card className="border-l-4 border-l-warning bg-warning/5">
      <CardContent className="p-5">
        <SectionHeader icon={<ShieldCheck className="w-5 h-5" />} title="Decoded Summary" />
        <p className="text-sm text-foreground">{data.decoded_summary}</p>
      </CardContent>
    </Card>

    <Card>
      <CardContent className="p-5">
        <SectionHeader icon={<AlertTriangle className="w-5 h-5" />} title="Likely Reasons" />
        <ul className="space-y-2">
          {(data.likely_reasons || []).map((r: any, i: number) => (
            <li key={i} className="flex items-start justify-between gap-3 text-sm">
              <div>
                <div className="font-medium text-foreground">{r.reason}</div>
                <div className="text-xs text-muted-foreground">{r.evidence}</div>
              </div>
              <Badge variant="outline" className="text-[10px]">{r.severity}</Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>

    {Array.isArray(data.what_recruiters_actually_meant) && data.what_recruiters_actually_meant.length > 0 && (
      <Card>
        <CardContent className="p-5">
          <SectionHeader icon={<Lightbulb className="w-5 h-5" />} title="What Recruiters Actually Meant" />
          <div className="space-y-2">
            {data.what_recruiters_actually_meant.map((r: any, i: number) => (
              <div key={i} className="text-sm border border-border rounded-md p-3">
                <div className="text-foreground italic">"{r.phrase}"</div>
                <div className="text-xs text-muted-foreground mt-1">→ {r.real_meaning}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )}

    <Card>
      <CardContent className="p-5">
        <SectionHeader icon={<Rocket className="w-5 h-5" />} title="Recovery Plan" />
        <ul className="space-y-2">
          {(data.recovery_actions || []).map((a: any, i: number) => (
            <li key={i} className="text-sm">
              <div className="font-medium text-foreground">{a.action}</div>
              <div className="text-xs text-muted-foreground">{a.impact} • {a.timeline}</div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>

    {Array.isArray(data.portfolio_fixes) && data.portfolio_fixes.length > 0 && (
      <Card>
        <CardContent className="p-5">
          <SectionHeader icon={<Target className="w-5 h-5" />} title="Portfolio Fixes" />
          <ul className="space-y-1.5 text-sm">
            {data.portfolio_fixes.map((f: any, i: number) => (
              <li key={i}><span className="font-medium text-primary">{f.section}:</span> {f.change}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    )}

    <Card className="bg-gradient-card border-accent/30">
      <CardContent className="p-5">
        <div className="text-xs uppercase tracking-wider text-accent font-semibold mb-1">Next Attempt Strategy</div>
        <p className="text-sm text-foreground">{data.next_attempt_strategy}</p>
      </CardContent>
    </Card>
  </div>
);

/* ---------- Command Center & Layout Primitives ---------- */

const SectionLead = ({ eyebrow, title, desc, action }: { eyebrow: string; title: string; desc?: string; action?: React.ReactNode }) => (
  <div className="flex items-end justify-between gap-4 flex-wrap mb-4">
    <div className="min-w-0">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-accent font-semibold mb-1">
        <span className="w-1.5 h-1.5 rounded-full bg-accent" /> {eyebrow}
      </div>
      <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground leading-tight">{title}</h2>
      {desc && <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{desc}</p>}
    </div>
    {action}
  </div>
);

const LibraryCard = ({
  meta, ready, active, loading, onOpen, onGenerate,
}: {
  meta: ReportMeta; ready: boolean; active: boolean; loading: boolean;
  onOpen: () => void; onGenerate: () => void;
}) => (
  <button
    type="button"
    onClick={ready ? onOpen : onGenerate}
    disabled={loading}
    className={`text-left rounded-xl border p-4 transition-all group ${
      active ? "border-accent/70 bg-accent/5 shadow-sm" : "border-border/70 bg-card hover:border-accent/40"
    }`}
  >
    <div className="flex items-start justify-between gap-2">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${ready ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"}`}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : meta.icon}
      </div>
      <Badge variant="outline" className="text-[10px] shrink-0">
        {loading ? "Working" : ready ? "Ready" : "Not run"}
      </Badge>
    </div>
    <div className="mt-3 font-display font-semibold text-sm text-foreground">{meta.label}</div>
    <p className="text-xs text-muted-foreground mt-0.5">{meta.tagline}</p>
    <div className="mt-3 text-xs font-medium text-primary inline-flex items-center gap-1">
      {ready ? "Open report" : "Generate"} <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
    </div>
  </button>
);

const StatTile = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
  <div className="rounded-xl border border-border/70 bg-card p-4">
    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
    <div className="text-base font-display font-bold text-foreground mt-1 truncate">{value}</div>
    {hint && <div className="text-xs text-muted-foreground mt-0.5 truncate">{hint}</div>}
  </div>
);

const CommandCenter = ({
  profile, results, loadingMode, onGenerate, onOpen, onNavigate,
}: {
  profile: Profile;
  results: Record<Mode, any | null>;
  loadingMode: Mode | null;
  onGenerate: (m: Mode) => void;
  onOpen: (m: Mode) => void;
  onNavigate: (to: string) => void;
}) => {
  const roadmap = results.roadmap;
  const readiness: number | null = typeof roadmap?.readiness_score === "number" ? roadmap.readiness_score : null;
  const target: number | null = typeof roadmap?.target_score === "number" ? roadmap.target_score : null;

  const gaps: string[] = (results.skill_analysis?.missing_critical_skills || [])
    .map((s: any) => s?.skill).filter(Boolean).slice(0, 4);

  const nextActions: string[] = (
    roadmap?.quick_wins?.length
      ? roadmap.quick_wins
      : roadmap?.phases?.[0]?.actions || []
  ).slice(0, 3);

  return (
    <section className="rounded-2xl border border-border/70 bg-gradient-card overflow-hidden">
      <div className="p-5 sm:p-6 border-b border-border/60">
        <div className="flex items-start justify-between gap-5 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-accent font-semibold mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" /> Command Center
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground leading-tight">
              {profile.targetRole
                ? <>Your path to <span className="text-gradient">{profile.targetRole}</span></>
                : "Where you are, and what's next"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-xl">
              {readiness !== null
                ? "Here's your current readiness, the gaps holding you back, and the next moves that matter."
                : "Fill in your details on the left, then generate your roadmap to see readiness, gaps and next steps."}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Readiness</div>
              <div className="text-4xl font-bold text-primary leading-none mt-1">{readiness !== null ? `${readiness}%` : "—"}</div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Target</div>
              <div className="text-4xl font-bold text-accent leading-none mt-1">{target !== null ? `${target}%` : "—"}</div>
            </div>
          </div>
        </div>

        {readiness !== null && (
          <div className="mt-5">
            <Progress value={readiness} className="h-2" />
          </div>
        )}
      </div>

      <div className="p-5 sm:p-6 grid gap-4 md:grid-cols-3">
        <StatTile label="Today" value={profile.currentRole || "Add your current role"} hint={profile.yearsOfExperience || "Experience not set"} />
        <StatTile label="Destination" value={profile.targetRole || "Add a target role"} hint={profile.industry || "Industry not set"} />
        <StatTile label="Timeline" value={profile.timeline} hint={`${profile.focusAreas.length} focus area${profile.focusAreas.length === 1 ? "" : "s"}`} />
      </div>

      <div className="px-5 sm:px-6 pb-5 sm:pb-6 grid gap-4 lg:grid-cols-2">
        {/* Gaps */}
        <div className="rounded-xl border border-border/70 bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <h3 className="font-display font-semibold text-sm text-foreground">What's holding you back</h3>
          </div>
          {gaps.length > 0 ? (
            <ul className="space-y-1.5">
              {gaps.map((g, i) => (
                <li key={i} className="text-sm text-foreground flex gap-2">
                  <span className="text-warning">•</span> {g}
                </li>
              ))}
            </ul>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Run a skill review to see the exact gaps between you and the role.</p>
              <Button size="sm" variant="outline" disabled={loadingMode !== null} onClick={() => onGenerate("skill_analysis")}>
                {loadingMode === "skill_analysis" ? <><Loader2 className="w-4 h-4 animate-spin" /> Reviewing...</> : <>Review my skills</>}
              </Button>
            </div>
          )}
        </div>

        {/* Next actions */}
        <div className="rounded-xl border border-border/70 bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Rocket className="w-4 h-4 text-accent" />
            <h3 className="font-display font-semibold text-sm text-foreground">Do this next</h3>
          </div>
          {nextActions.length > 0 ? (
            <ul className="space-y-1.5">
              {nextActions.map((a, i) => (
                <li key={i} className="text-sm text-foreground flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" /> {a}
                </li>
              ))}
            </ul>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Your roadmap will tell you exactly what to do first.</p>
              <Button size="sm" variant="hero" disabled={loadingMode !== null} onClick={() => onGenerate("roadmap")}>
                {loadingMode === "roadmap" ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate roadmap</>}
              </Button>
            </div>
          )}
          <div className="flex flex-wrap gap-2 mt-4">
            {roadmap && (
              <Button size="sm" variant="outline" onClick={() => onOpen("roadmap")}>Open roadmap</Button>
            )}
            <Button size="sm" variant="ghost" className="gap-1" onClick={() => onNavigate("/builder")}>
              Update my resume <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

const TargetJobsSection = ({
  profile, results, loading, onAnalyze, onOpen,
}: {
  profile: Profile;
  results: Record<Mode, any | null>;
  loading: boolean;
  onAnalyze: () => void;
  onOpen: () => void;
}) => {
  const fit = results.role_fit;
  const hasJd = profile.jobDescription.trim().length > 0;

  return (
    <section>
      <SectionLead
        eyebrow="Your Target Jobs"
        title="How you align with the roles you want"
        desc="Paste a job description in the panel on the left, then see where you match and where you fall short — before you apply."
        action={
          <Button size="sm" variant={fit ? "outline" : "hero"} disabled={loading} onClick={fit ? onOpen : onAnalyze}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analysing...</> : fit ? "Open analysis" : "Analyse this job"}
          </Button>
        }
      />
      <div className="rounded-2xl border border-border/70 bg-card p-5">
        {fit ? (
          <div className="grid gap-4 sm:grid-cols-[auto_1fr] items-center">
            <div className="text-center sm:text-left">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Overall fit</div>
              <div className="text-4xl font-bold text-primary">{fit.overall_fit_score}%</div>
              {fit.verdict && <Badge variant="outline" className="mt-1 text-[10px]">{fit.verdict}</Badge>}
            </div>
            <div className="min-w-0">
              <p className="text-sm text-foreground">{fit.positioning_strategy}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {(fit.dimensions || []).slice(0, 4).map((d: any, i: number) => (
                  <Badge key={i} variant="secondary" className="text-[10px]">{d.name}: {d.score}%</Badge>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <Target className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <div className="font-display font-semibold text-foreground">Your next opportunity starts here</div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {hasJd ? "Job description added — run the analysis to see your alignment." : "Add a job description to unlock a precise fit score."}
                </p>
              </div>
            </div>
            <Button variant="hero" disabled={loading} onClick={onAnalyze}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analysing...</> : <><Sparkles className="w-4 h-4" /> Analyse alignment</>}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

const ProgressSection = ({ results }: { results: Record<Mode, any | null> }) => {
  const done = REPORT_LIBRARY.filter((r) => Boolean(results[r.mode]));
  const pct = Math.round((done.length / REPORT_LIBRARY.length) * 100);

  return (
    <section>
      <SectionLead
        eyebrow="Your Progress"
        title="How complete your career picture is"
        desc="Each report adds another layer of clarity. Complete all five for the full view."
      />
      <div className="rounded-2xl border border-border/70 bg-card p-5">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-medium text-foreground">{done.length} of {REPORT_LIBRARY.length} reports generated</span>
          <span className="text-muted-foreground">{pct}%</span>
        </div>
        <Progress value={pct} className="h-2" />
        <div className="flex flex-wrap gap-1.5 mt-4">
          {REPORT_LIBRARY.map((r) => {
            const ready = Boolean(results[r.mode]);
            return (
              <Badge
                key={r.mode}
                variant="outline"
                className={`text-[10px] gap-1 ${ready ? "border-accent/50 text-accent" : "text-muted-foreground"}`}
              >
                {ready ? <CheckCircle2 className="w-3 h-3" /> : <span className="w-3 h-3 rounded-full border border-current inline-block" />}
                {r.label}
              </Badge>
            );
          })}
        </div>
      </div>
    </section>
  );
};

/* ---------- Empty States ---------- */


const ActionEmpty = ({ title, desc, loading, onRun, cta, icon }: { title: string; desc: string; loading: boolean; onRun: () => void; cta: string; icon: React.ReactNode }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center shadow-sm mb-5">{icon}</div>
    <h3 className="text-2xl font-display font-bold text-foreground mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground max-w-md mb-5">{desc}</p>
    <Button variant="hero" size="lg" disabled={loading} onClick={onRun}>
      {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> {cta}</>}
    </Button>
  </div>
);

export default CareerIntelligence;
