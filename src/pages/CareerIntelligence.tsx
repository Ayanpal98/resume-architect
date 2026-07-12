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

  // Job-Seeker-only gating — authoritative check is in the edge function via
  // user_metadata.user_type; this is a UX-only client-side hint.
  useEffect(() => {
    (async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: { user } } = await supabase.auth.getUser();
      const serverType = (user?.user_metadata as any)?.user_type;
      const userType = serverType;
      if (userType === "institution") {
        toast.error("Career Intelligence is available for Job Seekers only.");
        navigate("/recruiter");
      }
    })();
  }, [navigate]);


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
      {/* Header */}
      <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to="/builder" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Back to Builder</span>
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

      <div className="container mx-auto px-4 sm:px-6 py-6 grid lg:grid-cols-[360px_1fr] gap-6">
        {/* Profile Builder Sidebar */}
        <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-accent font-semibold mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" /> Profile Builder
            </div>
            <h2 className="text-xl font-display font-bold text-foreground">Tell us about yourself</h2>
            <p className="text-xs text-muted-foreground mt-1">The more we know, the more precise your roadmap.</p>
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
        <main className="min-w-0">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Mode)}>
            {(() => {
              const readyCount = (Object.values(results) as any[]).filter(Boolean).length;
              if (readyCount === 0) return null;
              return (
                <div className="mb-3 flex items-center justify-between gap-3 flex-wrap rounded-lg border border-accent/30 bg-gradient-card p-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-foreground">Export All Reports</div>
                    <div className="text-xs text-muted-foreground">
                      {readyCount} of 5 sections ready — combine into one full-length PDF.
                    </div>
                  </div>
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
                    <Download className="w-4 h-4" /> Export All Reports
                  </Button>
                </div>
              );
            })()}
            <TabsList className="w-full justify-start overflow-x-auto bg-card border border-border h-auto p-1">
              <TabsTrigger value="roadmap" className="gap-1.5"><TrendingUp className="w-4 h-4" /> Roadmap</TabsTrigger>
              <TabsTrigger value="skill_analysis" className="gap-1.5"><Brain className="w-4 h-4" /> Skill Analysis</TabsTrigger>
              <TabsTrigger value="role_fit" className="gap-1.5"><Target className="w-4 h-4" /> Role Fit Score</TabsTrigger>
              <TabsTrigger value="ai_coaching" className="gap-1.5"><MessageCircle className="w-4 h-4" /> AI Coaching</TabsTrigger>
              <TabsTrigger value="rejection_decoder" className="gap-1.5"><ShieldCheck className="w-4 h-4" /> Rejection Decoder</TabsTrigger>
            </TabsList>

            {/* Roadmap */}
            <TabsContent value="roadmap" className="mt-5">
              {results.roadmap ? (
                <RoadmapView data={results.roadmap} profile={profile} />
              ) : (
                <EmptyState
                  icon={<Globe className="w-7 h-7 text-primary" />}
                  title="Build your career roadmap"
                  desc="Fill in your profile and click Generate to receive a personalised, step-by-step pathway crafted by AI."
                  cards={[
                    { icon: <BookOpen className="w-4 h-4" />, label: "Skill Analysis" },
                    { icon: <Award className="w-4 h-4" />, label: "Certifications" },
                    { icon: <Zap className="w-4 h-4" />, label: "AI Coaching" },
                  ]}
                />
              )}
            </TabsContent>

            {/* Skill Analysis */}
            <TabsContent value="skill_analysis" className="mt-5">
              {results.skill_analysis ? (
                <SkillAnalysisView data={results.skill_analysis} profile={profile} />
              ) : (
                <ActionEmpty
                  title="Skill Intelligence Report"
                  desc="See which of your skills are market-strong, what's missing, and the exact resources to close the gap."
                  loading={loadingMode === "skill_analysis"}
                  onRun={() => generate("skill_analysis")}
                  cta="Run Skill Analysis"
                  icon={<Brain className="w-7 h-7 text-primary" />}
                />
              )}
            </TabsContent>

            {/* Role Fit */}
            <TabsContent value="role_fit" className="mt-5">
              {results.role_fit ? (
                <RoleFitView data={results.role_fit} profile={profile} />
              ) : (
                <ActionEmpty
                  title="Role Fit Score"
                  desc="A multi-dimensional assessment of your readiness for the target role."
                  loading={loadingMode === "role_fit"}
                  onRun={() => generate("role_fit")}
                  cta="Calculate Fit Score"
                  icon={<Target className="w-7 h-7 text-primary" />}
                />
              )}
            </TabsContent>

            {/* AI Coaching */}
            <TabsContent value="ai_coaching" className="mt-5">
              <Card className="border-border/60 mb-4">
                <CardContent className="p-4 space-y-2">
                  <label className="text-xs font-medium text-foreground">Coaching focus (optional)</label>
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
                  title="AI Coaching Session"
                  desc="Get likely interview questions, talking points, weakness mitigation, and an outreach template."
                  loading={loadingMode === "ai_coaching"}
                  onRun={() => generate("ai_coaching")}
                  cta="Start Coaching"
                  icon={<MessageCircle className="w-7 h-7 text-primary" />}
                />
              )}
            </TabsContent>

            {/* Rejection Decoder */}
            <TabsContent value="rejection_decoder" className="mt-5">
              <Card className="border-border/60 mb-4">
                <CardContent className="p-4 space-y-2">
                  <label className="text-xs font-medium text-foreground">Paste rejection feedback (optional)</label>
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
                  title="Rejection Decoder"
                  desc="Decode why applications were rejected and convert it into a targeted recovery plan."
                  loading={loadingMode === "rejection_decoder"}
                  onRun={() => generate("rejection_decoder")}
                  cta="Decode Rejection"
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
      <Seo title={"Career Intelligence — ATSFy"} description={"Premium 5-module career engine: roadmap, skill analysis, role fit, AI coaching, and rejection decoder."} path={"/career-intelligence"} />
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

/* ---------- Empty States ---------- */

const EmptyState = ({ icon, title, desc, cards }: { icon: React.ReactNode; title: string; desc: string; cards: { icon: React.ReactNode; label: string }[] }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center shadow-sm mb-5">
      {icon}
    </div>
    <h3 className="text-2xl font-display font-bold text-foreground mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground max-w-md mb-6">{desc}</p>
    <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
      {cards.map((c, i) => (
        <div key={i} className="rounded-xl border border-border bg-card p-3 text-center">
          <div className="w-8 h-8 mx-auto rounded-lg bg-muted flex items-center justify-center text-foreground mb-1.5">{c.icon}</div>
          <div className="text-xs text-muted-foreground">{c.label}</div>
        </div>
      ))}
    </div>
  </div>
);

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
