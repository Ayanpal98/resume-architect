import { useState } from "react";
import { ComplianceFooter } from "@/components/ComplianceFooter";
import jsPDF from "jspdf";
import { addComplianceFooterBlock } from "@/lib/complianceFooter";
import {
  Compass, Loader2, Target, TrendingUp, BookOpen, Users,
  Calendar, Award, ArrowUpRight, RefreshCw, AlertTriangle, Check, Sparkles, Download,
  Zap, Shield, Star, Rocket, Brain, GraduationCap, MessageSquare, ChevronRight,
  BarChart3, Lightbulb, Clock, Trophy, Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ResumeData } from "@/lib/pdfGenerator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface PortfolioUpgrade {
  section: string;
  priority: string;
  current_state: string;
  recommended_change: string;
  impact_estimate: string;
  implementation_time: string;
}

interface SkillIntel {
  skill: string;
  demand_level: string;
  learning_resource: string;
  time_to_acquire: string;
  impact_on_match: string;
}

interface ExperienceReframe {
  original_role: string;
  optimized_framing: string;
  power_bullets: string[];
  keywords_to_inject: string[];
}

interface CertItem {
  name: string;
  provider: string;
  relevance: string;
  timeline: string;
  cost_estimate: string;
  priority: string;
}

interface MilestonePhase {
  title: string;
  actions: string[];
  expected_match_after: number;
}

interface IntelligentRoadmap {
  current_match_estimate: number;
  target_match: number;
  competitive_positioning: {
    strength_tier: string;
    market_position: string;
    unique_differentiators: string[];
    critical_gaps: string[];
  };
  portfolio_upgrades: PortfolioUpgrade[];
  skill_intelligence: {
    market_demand_skills: SkillIntel[];
    skills_to_highlight: string[];
    skills_to_deprioritize: string[];
  };
  experience_intelligence: {
    reframe_suggestions: ExperienceReframe[];
    missing_experience_bridges: string[];
  };
  certification_roadmap: CertItem[];
  networking_intelligence: {
    target_companies: string[];
    key_communities: string[];
    events_to_attend: string[];
    outreach_template: string;
  };
  milestone_roadmap: {
    week_1: MilestonePhase;
    week_2_4: MilestonePhase;
    month_2: MilestonePhase;
    month_3: MilestonePhase;
  };
  interview_preparation: {
    likely_questions: string[];
    talking_points: string[];
    weakness_mitigation: string[];
  };
  gap_analysis: string;
  role_positioning: string;
  overall_readiness_score: number;
  executive_summary: string;
}

interface CareerRoadmapProps {
  resumeData: ResumeData;
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
}

const priorityColor = (p: string) => {
  if (p === "critical") return "bg-destructive text-destructive-foreground";
  if (p === "high") return "bg-primary text-primary-foreground";
  if (p === "immediate") return "bg-destructive text-destructive-foreground";
  return "bg-muted text-muted-foreground";
};

const demandBadge = (d: string) => {
  if (d === "critical") return "bg-destructive/10 text-destructive border-destructive/20";
  if (d === "high") return "bg-accent/10 text-accent border-accent/20";
  return "bg-muted text-muted-foreground border-border";
};

export const CareerRoadmap = ({
  resumeData,
  jobDescription,
  onJobDescriptionChange,
}: CareerRoadmapProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<IntelligentRoadmap | null>(null);
  const [industryMode, setIndustryMode] = useState("auto");

  const handleGenerate = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please paste a job description first");
      return;
    }
    setIsLoading(true);
    setRoadmap(null);

    try {
      const { data, error } = await supabase.functions.invoke("career-roadmap-ai", {
        body: {
          resumeData,
          jobDescription,
          industryMode: industryMode === "auto" ? undefined : industryMode,
        },
      });

      if (error) throw new Error(error.message || "Failed to generate roadmap");
      if (data.error) throw new Error(data.error);

      if (data.roadmap) {
        setRoadmap(data.roadmap);
        toast.success("AI Career Intelligence Report generated! 🚀");
      } else {
        toast.error("No roadmap data returned");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Roadmap generation failed");
    } finally {
      setIsLoading(false);
    }
  };

  const exportRoadmapPDF = () => {
    if (!roadmap) return;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    const ml = 15, mr = 15, cw = pw - ml - mr, bm = 18;
    let y = 15;
    let pn = 1;

    const C = {
      primary: "#1e3a5f", accent: "#0ea573", destructive: "#c53030",
      warning: "#b7791f", dark: "#1a202c", muted: "#718096",
      light: "#edf2f7", white: "#ffffff", divider: "#cbd5e0", sectionBg: "#f0f4f8",
      gold: "#d4a017",
    };

    const checkPage = (n: number) => { if (y + n > ph - bm) { footerFn(); doc.addPage(); y = 15; } };
    const footerFn = () => {
      doc.setDrawColor(C.divider); doc.setLineWidth(0.3); doc.line(ml, ph - 12, pw - mr, ph - 12);
      doc.setFontSize(7); doc.setFont("helvetica", "normal"); doc.setTextColor(C.muted);
      doc.text("ATSFy Technologies™ — AI Career Intelligence Report", ml, ph - 8);
      doc.text(`Page ${pn}`, pw - mr, ph - 8, { align: "right" });
      pn++;
    };
    const wrap = (text: string, x: number, maxW: number, lh = 4) => {
      doc.splitTextToSize(text, maxW).forEach((line: string) => { checkPage(lh); doc.text(line, x, y); y += lh; });
    };
    const sectionTitle = (title: string, icon?: string) => {
      checkPage(14); y += 5;
      doc.setFillColor(C.primary); doc.roundedRect(ml, y - 4, cw, 10, 2, 2, "F");
      doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(C.white);
      doc.text(icon ? `${icon}  ${title}` : title, ml + 5, y + 3); y += 12;
    };

    // Cover
    doc.setFillColor(C.primary); doc.rect(0, 0, pw, 52, "F");
    doc.setFillColor(C.accent); doc.rect(0, 52, pw, 2.5, "F");
    doc.setFontSize(11); doc.setFont("helvetica", "normal"); doc.setTextColor(C.gold);
    doc.text("AI CAREER INTELLIGENCE", pw / 2, 15, { align: "center" });
    doc.setFontSize(22); doc.setFont("helvetica", "bold"); doc.setTextColor(C.white);
    doc.text("Career Roadmap Report", pw / 2, 28, { align: "center" });
    doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor("#a0b4cc");
    doc.text(`${resumeData.personalInfo?.fullName || "Candidate"} — ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, pw / 2, 40, { align: "center" });
    y = 62;

    // Executive Summary
    if (roadmap.executive_summary) {
      checkPage(20);
      doc.setFillColor("#f7fafc"); doc.setDrawColor(C.accent);
      doc.roundedRect(ml, y, cw, 2, 0, 0, "F");
      doc.setLineWidth(0.8); doc.line(ml, y, ml, y + 20);
      doc.setFontSize(8); doc.setFont("helvetica", "italic"); doc.setTextColor(C.dark);
      y += 5;
      wrap(roadmap.executive_summary, ml + 5, cw - 10, 4);
      y += 5;
    }

    // Match Score
    checkPage(22);
    doc.setFillColor(C.white); doc.setDrawColor(C.divider);
    doc.roundedRect(ml, y, cw, 20, 3, 3, "FD");
    doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(C.primary);
    doc.text("Readiness Score", ml + 5, y + 7);
    const matchPct = roadmap.overall_readiness_score || roadmap.current_match_estimate;
    const matchColor = matchPct >= 80 ? C.accent : matchPct >= 60 ? C.warning : C.destructive;
    doc.setFontSize(18); doc.setFont("helvetica", "bold"); doc.setTextColor(matchColor);
    doc.text(`${matchPct}%`, pw - mr - 5, y + 10, { align: "right" });
    const barY = y + 13; const barW = cw - 10;
    doc.setFillColor(C.light); doc.roundedRect(ml + 5, barY, barW, 3.5, 1.5, 1.5, "F");
    doc.setFillColor(matchColor); doc.roundedRect(ml + 5, barY, Math.max((matchPct / 100) * barW, 3), 3.5, 1.5, 1.5, "F");
    doc.setFontSize(7); doc.setFont("helvetica", "normal"); doc.setTextColor(C.muted);
    doc.text(`Current: ${matchPct}%`, ml + 5, barY + 7);
    doc.text(`Target: ${roadmap.target_match}%`, ml + 5 + barW, barY + 7, { align: "right" });
    y += 28;

    // Competitive Positioning
    if (roadmap.competitive_positioning) {
      sectionTitle("COMPETITIVE POSITIONING");
      doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(C.primary);
      doc.text(`Tier: ${roadmap.competitive_positioning.strength_tier}`, ml + 2, y); y += 5;
      doc.setFont("helvetica", "normal"); doc.setTextColor(C.dark);
      wrap(roadmap.competitive_positioning.market_position, ml + 2, cw - 4, 4); y += 2;
      if (roadmap.competitive_positioning.unique_differentiators?.length) {
        doc.setFont("helvetica", "bold"); doc.setTextColor(C.accent);
        doc.text("Strengths:", ml + 2, y); y += 4;
        doc.setFont("helvetica", "normal"); doc.setTextColor(C.dark);
        roadmap.competitive_positioning.unique_differentiators.forEach(d => {
          checkPage(5); doc.text(`• ${d}`, ml + 5, y); y += 4;
        }); y += 2;
      }
      if (roadmap.competitive_positioning.critical_gaps?.length) {
        doc.setFont("helvetica", "bold"); doc.setTextColor(C.destructive);
        doc.text("Gaps:", ml + 2, y); y += 4;
        doc.setFont("helvetica", "normal"); doc.setTextColor(C.dark);
        roadmap.competitive_positioning.critical_gaps.forEach(g => {
          checkPage(5); doc.text(`• ${g}`, ml + 5, y); y += 4;
        }); y += 2;
      }
    }

    // Portfolio Upgrades
    if (roadmap.portfolio_upgrades?.length) {
      sectionTitle("PORTFOLIO UPGRADE ACTIONS");
      roadmap.portfolio_upgrades.forEach((u, i) => {
        checkPage(20);
        doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(C.primary);
        doc.text(`${i + 1}. [${u.section}] — Priority: ${u.priority.toUpperCase()}`, ml + 2, y); y += 4;
        doc.setFont("helvetica", "normal"); doc.setTextColor(C.muted);
        doc.setFontSize(7);
        wrap(`Current: ${u.current_state}`, ml + 5, cw - 10, 3.5); y += 1;
        doc.setTextColor(C.dark); doc.setFontSize(8);
        wrap(`→ ${u.recommended_change}`, ml + 5, cw - 10, 4);
        doc.setTextColor(C.accent); doc.setFontSize(7);
        doc.text(`Impact: ${u.impact_estimate} | Time: ${u.implementation_time}`, ml + 5, y); y += 6;
      });
    }

    // Skill Intelligence
    if (roadmap.skill_intelligence?.market_demand_skills?.length) {
      sectionTitle("SKILL INTELLIGENCE");
      roadmap.skill_intelligence.market_demand_skills.forEach(s => {
        checkPage(10);
        doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(C.dark);
        doc.text(`${s.skill} [${s.demand_level.toUpperCase()}]`, ml + 2, y); y += 4;
        doc.setFont("helvetica", "normal"); doc.setTextColor(C.muted); doc.setFontSize(7);
        doc.text(`Learn: ${s.learning_resource} | Time: ${s.time_to_acquire} | Impact: ${s.impact_on_match}`, ml + 5, y); y += 5;
      });
    }

    // Certification Roadmap
    if (roadmap.certification_roadmap?.length) {
      sectionTitle("CERTIFICATION ROADMAP");
      roadmap.certification_roadmap.forEach(c => {
        checkPage(12);
        doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(C.primary);
        doc.text(`${c.name} — ${c.provider}`, ml + 2, y); y += 4;
        doc.setFont("helvetica", "normal"); doc.setTextColor(C.dark); doc.setFontSize(7);
        doc.text(`${c.relevance}`, ml + 5, y); y += 3.5;
        doc.setTextColor(C.muted);
        doc.text(`Timeline: ${c.timeline} | Cost: ${c.cost_estimate} | Priority: ${c.priority}`, ml + 5, y); y += 5;
      });
    }

    // Milestone Roadmap
    if (roadmap.milestone_roadmap) {
      sectionTitle("MILESTONE ROADMAP");
      const phases = [
        { key: "week_1", label: "Week 1", color: C.accent },
        { key: "week_2_4", label: "Weeks 2-4", color: C.primary },
        { key: "month_2", label: "Month 2", color: C.warning },
        { key: "month_3", label: "Month 3", color: C.gold },
      ] as const;
      phases.forEach(p => {
        const phase = roadmap.milestone_roadmap[p.key];
        if (!phase) return;
        checkPage(18);
        doc.setFillColor(p.color); doc.rect(ml, y, 3, 14, "F");
        doc.setFontSize(8.5); doc.setFont("helvetica", "bold"); doc.setTextColor(p.color);
        doc.text(`${p.label}: ${phase.title}`, ml + 6, y + 4);
        doc.setFontSize(7); doc.setFont("helvetica", "normal"); doc.setTextColor(C.dark);
        let py = y + 8;
        phase.actions.forEach(a => { checkPage(4); doc.text(`• ${a}`, ml + 8, py); py += 3.5; });
        doc.setTextColor(C.accent); doc.setFontSize(7);
        doc.text(`Expected Match: ${phase.expected_match_after}%`, pw - mr - 5, y + 4, { align: "right" });
        y = py + 4;
      });
    }

    // Interview Preparation
    if (roadmap.interview_preparation) {
      sectionTitle("INTERVIEW INTELLIGENCE");
      if (roadmap.interview_preparation.likely_questions?.length) {
        doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(C.primary);
        doc.text("Likely Questions:", ml + 2, y); y += 4;
        doc.setFont("helvetica", "normal"); doc.setTextColor(C.dark); doc.setFontSize(7);
        roadmap.interview_preparation.likely_questions.forEach((q, i) => {
          checkPage(5); wrap(`${i + 1}. ${q}`, ml + 5, cw - 10, 3.5); y += 1;
        }); y += 2;
      }
      if (roadmap.interview_preparation.talking_points?.length) {
        doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(C.accent);
        doc.text("Key Talking Points:", ml + 2, y); y += 4;
        doc.setFont("helvetica", "normal"); doc.setTextColor(C.dark); doc.setFontSize(7);
        roadmap.interview_preparation.talking_points.forEach(p => {
          checkPage(5); wrap(`✓ ${p}`, ml + 5, cw - 10, 3.5); y += 1;
        }); y += 2;
      }
    }

    // Compliance footer block
    addComplianceFooterBlock(doc, ml, mr, checkPage, () => y, (v) => { y = v; });
    footerFn();
    doc.save(`career-intelligence-${(resumeData.personalInfo?.fullName || "candidate").replace(/\s+/g, "-").toLowerCase()}.pdf`);
    toast.success("Career Intelligence Report PDF exported!");
  };

  const readinessScore = roadmap?.overall_readiness_score || roadmap?.current_match_estimate || 0;
  const readinessColor = readinessScore >= 80 ? "text-accent" : readinessScore >= 60 ? "text-yellow-600" : "text-destructive";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 border border-primary/20 p-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs bg-accent/10 text-accent border-accent/30">AI-Powered</Badge>
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">Premium</Badge>
          </div>
          <h2 className="text-2xl font-display font-bold text-foreground mb-2 flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            Career Intelligence Roadmap
          </h2>
          <p className="text-muted-foreground text-sm">
            AI-powered portfolio analysis with real-time upgrade suggestions, competitive positioning, skill intelligence, and a milestone-driven roadmap to 90%+ job match.
          </p>
        </div>
      </div>

      {/* Input */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-foreground">
          <Target className="w-4 h-4 inline mr-2" />
          Target Job Description
        </label>
        <Textarea
          placeholder="Paste the job description you're targeting..."
          rows={5}
          value={jobDescription}
          onChange={(e) => onJobDescriptionChange(e.target.value)}
          className="resize-none"
        />
        <div className="flex items-center gap-3">
          <Select value={industryMode} onValueChange={setIndustryMode}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto-Detect</SelectItem>
              <SelectItem value="tech">Technology</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleGenerate}
            disabled={isLoading || !jobDescription.trim()}
            className="flex-1"
            variant="hero"
            size="lg"
          >
            {isLoading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating Intelligence Report...</>
            ) : roadmap ? (
              <><RefreshCw className="w-4 h-4 mr-2" /> Regenerate Report</>
            ) : (
              <><Brain className="w-4 h-4 mr-2" /> Generate Career Intelligence</>
            )}
          </Button>
        </div>
      </div>

      {/* Results */}
      {roadmap && (
        <div className="space-y-5">
          {/* Export */}
          <div className="flex justify-end">
            <Button onClick={exportRoadmapPDF} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Intelligence Report PDF
            </Button>
          </div>

          {/* Executive Summary */}
          {roadmap.executive_summary && (
            <div className="p-5 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl border border-primary/20">
              <p className="text-xs font-bold text-primary mb-2 flex items-center gap-1.5">
                <Star className="w-4 h-4" /> EXECUTIVE SUMMARY
              </p>
              <p className="text-sm text-foreground leading-relaxed font-medium">{roadmap.executive_summary}</p>
            </div>
          )}

          {/* Readiness Score */}
          <div className="p-5 bg-card rounded-xl border border-border shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-foreground">Overall Readiness Score</span>
                <p className="text-xs text-muted-foreground">How ready you are for this role</p>
              </div>
              <span className={`text-3xl font-bold ${readinessColor}`}>{readinessScore}%</span>
            </div>
            <Progress value={readinessScore} className="h-3" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Current: {readinessScore}%</span>
              <span className="flex items-center gap-1 text-accent font-medium">
                <ArrowUpRight className="w-3 h-3" />
                Target: {roadmap.target_match}%
              </span>
            </div>
          </div>

          {/* Tabbed Intelligence */}
          <Tabs defaultValue="upgrades" className="w-full">
            <TabsList className="w-full grid grid-cols-5 h-auto">
              <TabsTrigger value="upgrades" className="text-xs py-2"><Zap className="w-3 h-3 mr-1" />Upgrades</TabsTrigger>
              <TabsTrigger value="skills" className="text-xs py-2"><Layers className="w-3 h-3 mr-1" />Skills</TabsTrigger>
              <TabsTrigger value="milestones" className="text-xs py-2"><Rocket className="w-3 h-3 mr-1" />Roadmap</TabsTrigger>
              <TabsTrigger value="certs" className="text-xs py-2"><Award className="w-3 h-3 mr-1" />Certs</TabsTrigger>
              <TabsTrigger value="interview" className="text-xs py-2"><MessageSquare className="w-3 h-3 mr-1" />Interview</TabsTrigger>
            </TabsList>

            {/* Portfolio Upgrades Tab */}
            <TabsContent value="upgrades" className="space-y-4 mt-4">
              {/* Competitive Positioning */}
              {roadmap.competitive_positioning && (
                <div className="p-4 bg-card rounded-xl border border-border">
                  <p className="text-xs font-bold text-primary mb-3 flex items-center gap-1.5">
                    <Shield className="w-4 h-4" /> COMPETITIVE POSITIONING
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-primary/10 text-primary border-primary/20">{roadmap.competitive_positioning.strength_tier}</Badge>
                  </div>
                  <p className="text-sm text-foreground mb-3">{roadmap.competitive_positioning.market_position}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-semibold text-accent mb-1.5">✦ Differentiators</p>
                      {roadmap.competitive_positioning.unique_differentiators?.map((d, i) => (
                        <p key={i} className="text-xs text-foreground mb-1 flex items-start gap-1">
                          <Check className="w-3 h-3 text-accent shrink-0 mt-0.5" />{d}
                        </p>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-destructive mb-1.5">⚠ Critical Gaps</p>
                      {roadmap.competitive_positioning.critical_gaps?.map((g, i) => (
                        <p key={i} className="text-xs text-foreground mb-1 flex items-start gap-1">
                          <AlertTriangle className="w-3 h-3 text-destructive shrink-0 mt-0.5" />{g}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Portfolio Upgrade Actions */}
              {roadmap.portfolio_upgrades?.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-accent" /> Real-Time Portfolio Upgrades
                  </p>
                  {roadmap.portfolio_upgrades.map((u, i) => (
                    <div key={i} className="p-4 bg-card rounded-xl border border-border hover:border-primary/30 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={`text-[10px] ${priorityColor(u.priority)}`}>{u.priority.toUpperCase()}</Badge>
                          <span className="text-xs font-semibold text-primary">{u.section}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                          <Clock className="w-3 h-3" />{u.implementation_time}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1.5 italic">Current: {u.current_state}</p>
                      <div className="flex items-start gap-1.5 mb-2">
                        <ChevronRight className="w-3 h-3 text-accent shrink-0 mt-0.5" />
                        <p className="text-sm text-foreground font-medium">{u.recommended_change}</p>
                      </div>
                      <p className="text-xs text-accent font-medium">📈 {u.impact_estimate}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Gap Analysis */}
              {roadmap.gap_analysis && (
                <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-xl">
                  <p className="text-xs font-semibold text-destructive mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> Gap Analysis
                  </p>
                  <p className="text-sm text-foreground leading-relaxed">{roadmap.gap_analysis}</p>
                </div>
              )}

              {/* Role Positioning */}
              {roadmap.role_positioning && (
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                  <p className="text-xs font-semibold text-primary mb-2 flex items-center gap-1.5">
                    <Target className="w-4 h-4" /> Role Positioning Strategy
                  </p>
                  <p className="text-sm text-foreground leading-relaxed">{roadmap.role_positioning}</p>
                </div>
              )}

              {/* Experience Intelligence */}
              {roadmap.experience_intelligence?.reframe_suggestions?.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-primary" /> Experience Reframing
                  </p>
                  {roadmap.experience_intelligence.reframe_suggestions.map((r, i) => (
                    <div key={i} className="p-4 bg-muted/30 rounded-xl border border-border">
                      <p className="text-xs font-bold text-primary mb-1">{r.original_role}</p>
                      <p className="text-xs text-muted-foreground mb-2 italic">→ {r.optimized_framing}</p>
                      {r.power_bullets?.map((b, bi) => (
                        <p key={bi} className="text-xs text-foreground mb-1 flex items-start gap-1">
                          <Check className="w-3 h-3 text-accent shrink-0 mt-0.5" />{b}
                        </p>
                      ))}
                      {r.keywords_to_inject?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {r.keywords_to_inject.map((k, ki) => (
                            <Badge key={ki} variant="outline" className="text-[10px]">{k}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Skills Intelligence Tab */}
            <TabsContent value="skills" className="space-y-4 mt-4">
              {roadmap.skill_intelligence?.market_demand_skills?.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-primary" /> Market Demand Skills
                  </p>
                  {roadmap.skill_intelligence.market_demand_skills.map((s, i) => (
                    <div key={i} className="p-4 bg-card rounded-xl border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-foreground">{s.skill}</span>
                        <Badge variant="outline" className={`text-[10px] ${demandBadge(s.demand_level)}`}>{s.demand_level.toUpperCase()}</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[11px] text-muted-foreground">
                        <div><BookOpen className="w-3 h-3 inline mr-1" />{s.learning_resource}</div>
                        <div><Clock className="w-3 h-3 inline mr-1" />{s.time_to_acquire}</div>
                        <div className="text-accent font-medium"><TrendingUp className="w-3 h-3 inline mr-1" />{s.impact_on_match}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {roadmap.skill_intelligence?.skills_to_highlight?.length > 0 && (
                <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl">
                  <p className="text-xs font-semibold text-accent mb-2">✦ Skills to Highlight More</p>
                  <div className="flex flex-wrap gap-1.5">
                    {roadmap.skill_intelligence.skills_to_highlight.map((s, i) => (
                      <Badge key={i} className="bg-accent/10 text-accent border-accent/20 text-xs">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {roadmap.skill_intelligence?.skills_to_deprioritize?.length > 0 && (
                <div className="p-4 bg-muted/30 border border-border rounded-xl">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">↓ Skills to Deprioritize</p>
                  <div className="flex flex-wrap gap-1.5">
                    {roadmap.skill_intelligence.skills_to_deprioritize.map((s, i) => (
                      <Badge key={i} variant="outline" className="text-xs text-muted-foreground">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Milestone Roadmap Tab */}
            <TabsContent value="milestones" className="space-y-4 mt-4">
              {roadmap.milestone_roadmap && (
                <div className="space-y-3">
                  <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <Rocket className="w-4 h-4 text-primary" /> Milestone Roadmap to {roadmap.target_match}%
                  </p>
                  {([
                    { key: "week_1" as const, label: "Week 1", icon: "🎯", borderClass: "border-l-accent" },
                    { key: "week_2_4" as const, label: "Weeks 2–4", icon: "📈", borderClass: "border-l-primary" },
                    { key: "month_2" as const, label: "Month 2", icon: "🔥", borderClass: "border-l-yellow-500" },
                    { key: "month_3" as const, label: "Month 3", icon: "🚀", borderClass: "border-l-destructive" },
                  ]).map(p => {
                    const phase = roadmap.milestone_roadmap[p.key];
                    if (!phase) return null;
                    return (
                      <div key={p.key} className={`p-4 rounded-xl border-l-4 ${p.borderClass} bg-card border border-border`}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-bold text-foreground">{p.icon} {p.label}: {phase.title}</p>
                          <Badge className="bg-accent/10 text-accent border-accent/20 text-[10px]">→ {phase.expected_match_after}%</Badge>
                        </div>
                        <ul className="space-y-1.5">
                          {phase.actions.map((a, i) => (
                            <li key={i} className="text-xs text-foreground flex items-start gap-1.5">
                              <Check className="w-3 h-3 text-accent shrink-0 mt-0.5" />{a}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Networking */}
              {roadmap.networking_intelligence && (
                <div className="p-4 bg-card rounded-xl border border-border space-y-3">
                  <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-primary" /> Networking Intelligence
                  </p>
                  {roadmap.networking_intelligence.target_companies?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground mb-1">Target Companies</p>
                      <div className="flex flex-wrap gap-1">{roadmap.networking_intelligence.target_companies.map((c, i) => <Badge key={i} variant="outline" className="text-[10px]">{c}</Badge>)}</div>
                    </div>
                  )}
                  {roadmap.networking_intelligence.key_communities?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground mb-1">Communities</p>
                      <div className="flex flex-wrap gap-1">{roadmap.networking_intelligence.key_communities.map((c, i) => <Badge key={i} variant="outline" className="text-[10px]">{c}</Badge>)}</div>
                    </div>
                  )}
                  {roadmap.networking_intelligence.events_to_attend?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground mb-1">Events</p>
                      <div className="flex flex-wrap gap-1">{roadmap.networking_intelligence.events_to_attend.map((e, i) => <Badge key={i} variant="outline" className="text-[10px]">{e}</Badge>)}</div>
                    </div>
                  )}
                  {roadmap.networking_intelligence.outreach_template && (
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground mb-1">Outreach Template</p>
                      <p className="text-xs text-foreground bg-muted/30 p-3 rounded-lg italic">{roadmap.networking_intelligence.outreach_template}</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Certifications Tab */}
            <TabsContent value="certs" className="space-y-4 mt-4">
              {roadmap.certification_roadmap?.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-primary" /> Certification Roadmap
                  </p>
                  {roadmap.certification_roadmap.map((c, i) => (
                    <div key={i} className="p-4 bg-card rounded-xl border border-border hover:border-primary/30 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.provider}</p>
                        </div>
                        <Badge variant="outline" className={`text-[10px] ${priorityColor(c.priority)}`}>{c.priority.toUpperCase()}</Badge>
                      </div>
                      <p className="text-xs text-foreground mb-2">{c.relevance}</p>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span><Calendar className="w-3 h-3 inline mr-1" />{c.timeline}</span>
                        <span><Trophy className="w-3 h-3 inline mr-1" />{c.cost_estimate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Interview Tab */}
            <TabsContent value="interview" className="space-y-4 mt-4">
              {roadmap.interview_preparation && (
                <>
                  {roadmap.interview_preparation.likely_questions?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-primary" /> Likely Interview Questions
                      </p>
                      {roadmap.interview_preparation.likely_questions.map((q, i) => (
                        <div key={i} className="p-3 bg-card rounded-lg border border-border">
                          <p className="text-xs text-foreground"><span className="font-bold text-primary mr-2">Q{i + 1}.</span>{q}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {roadmap.interview_preparation.talking_points?.length > 0 && (
                    <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl">
                      <p className="text-xs font-semibold text-accent mb-2 flex items-center gap-1.5">
                        <Lightbulb className="w-4 h-4" /> Key Talking Points
                      </p>
                      {roadmap.interview_preparation.talking_points.map((p, i) => (
                        <p key={i} className="text-xs text-foreground mb-1.5 flex items-start gap-1.5">
                          <Check className="w-3 h-3 text-accent shrink-0 mt-0.5" />{p}
                        </p>
                      ))}
                    </div>
                  )}

                  {roadmap.interview_preparation.weakness_mitigation?.length > 0 && (
                    <div className="p-4 bg-muted/30 border border-border rounded-xl">
                      <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                        <Shield className="w-4 h-4 text-primary" /> Weakness Mitigation
                      </p>
                      {roadmap.interview_preparation.weakness_mitigation.map((w, i) => (
                        <p key={i} className="text-xs text-foreground mb-1.5 flex items-start gap-1.5">
                          <ArrowUpRight className="w-3 h-3 text-primary shrink-0 mt-0.5" />{w}
                        </p>
                      ))}
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>

          <ComplianceFooter />
        </div>
      )}

      {!roadmap && !isLoading && (
        <div className="p-6 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 rounded-xl border border-primary/20">
          <div className="flex items-start gap-3">
            <Brain className="w-6 h-6 text-primary shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold text-foreground mb-1">AI Career Intelligence Engine</p>
              <p className="text-muted-foreground mb-3">
                Get a premium, AI-powered career intelligence report with:
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-accent" />Real-time portfolio upgrades</div>
                <div className="flex items-center gap-1.5"><Shield className="w-3 h-3 text-primary" />Competitive positioning</div>
                <div className="flex items-center gap-1.5"><Layers className="w-3 h-3 text-accent" />Skill demand intelligence</div>
                <div className="flex items-center gap-1.5"><Rocket className="w-3 h-3 text-primary" />Milestone roadmap</div>
                <div className="flex items-center gap-1.5"><GraduationCap className="w-3 h-3 text-accent" />Certification roadmap</div>
                <div className="flex items-center gap-1.5"><MessageSquare className="w-3 h-3 text-primary" />Interview preparation</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
