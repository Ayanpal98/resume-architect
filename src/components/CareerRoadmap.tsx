import { useState } from "react";
import jsPDF from "jspdf";
import {
  Compass, Loader2, Target, TrendingUp, BookOpen, Users,
  Calendar, Award, ArrowUpRight, RefreshCw, AlertTriangle, Check, Sparkles, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
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

interface CareerGuidance {
  current_match_estimate: number;
  target_match: number;
  gap_analysis: string;
  role_positioning: string;
  immediate_actions: string[];
  skill_development_plan: string[];
  experience_reframing: string[];
  networking_strategy: string;
  "30_60_90_plan": {
    "30_days": string;
    "60_days": string;
    "90_days": string;
  };
}

interface CareerRoadmapProps {
  resumeData: ResumeData;
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
}

export const CareerRoadmap = ({
  resumeData,
  jobDescription,
  onJobDescriptionChange,
}: CareerRoadmapProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [guidance, setGuidance] = useState<CareerGuidance | null>(null);
  const [industryMode, setIndustryMode] = useState("auto");

  const handleGenerate = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please paste a job description first");
      return;
    }
    setIsLoading(true);
    setGuidance(null);

    try {
      const { data, error } = await supabase.functions.invoke("resume-improve", {
        body: {
          resumeData,
          jobDescription,
          industryMode: industryMode === "auto" ? undefined : industryMode,
        },
      });

      if (error) throw new Error(error.message || "Failed to generate roadmap");
      if (data.error) throw new Error(data.error);

      if (data.analysis?.career_guidance) {
        setGuidance(data.analysis.career_guidance);
        toast.success("Career roadmap generated! 🚀");
      } else {
        toast.error("No career guidance data returned");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Roadmap generation failed");
    } finally {
      setIsLoading(false);
    }
  };

  const exportRoadmapPDF = () => {
    if (!guidance) return;
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
    };

    const checkPage = (n: number) => { if (y + n > ph - bm) { footerFn(); doc.addPage(); y = 15; } };
    const footerFn = () => {
      doc.setDrawColor(C.divider); doc.setLineWidth(0.3); doc.line(ml, ph - 12, pw - mr, ph - 12);
      doc.setFontSize(7); doc.setFont("helvetica", "normal"); doc.setTextColor(C.muted);
      doc.text("ATSFy Technologies\u2122 \u2014 Career Guidance Roadmap", ml, ph - 8);
      doc.text(`Page ${pn}`, pw - mr, ph - 8, { align: "right" });
      pn++;
    };
    const wrap = (text: string, x: number, maxW: number, lh = 4) => {
      doc.splitTextToSize(text, maxW).forEach((line: string) => { checkPage(lh); doc.text(line, x, y); y += lh; });
    };
    const sectionTitle = (title: string) => {
      checkPage(12); y += 4;
      doc.setFillColor(C.sectionBg); doc.roundedRect(ml, y - 4, cw, 9, 2, 2, "F");
      doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(C.primary);
      doc.text(title, ml + 4, y + 2); y += 9;
    };

    // Cover
    doc.setFillColor(C.primary); doc.rect(0, 0, pw, 48, "F");
    doc.setFillColor(C.accent); doc.rect(0, 48, pw, 2, "F");
    doc.setFontSize(22); doc.setFont("helvetica", "bold"); doc.setTextColor(C.white);
    doc.text("Career Guidance Roadmap", pw / 2, 22, { align: "center" });
    doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor("#a0b4cc");
    doc.text(`${resumeData.name || "Candidate"} \u2014 ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, pw / 2, 34, { align: "center" });
    y = 58;

    // Match Score
    doc.setFillColor(C.white); doc.setDrawColor(C.divider);
    doc.roundedRect(ml, y, cw, 20, 3, 3, "FD");
    doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(C.primary);
    doc.text("Job Match Score", ml + 5, y + 7);
    const matchPct = guidance.current_match_estimate;
    const matchColor = matchPct >= 80 ? C.accent : matchPct >= 60 ? C.warning : C.destructive;
    doc.setFontSize(18); doc.setFont("helvetica", "bold"); doc.setTextColor(matchColor);
    doc.text(`${matchPct}%`, pw - mr - 5, y + 10, { align: "right" });
    // Bar
    const barY = y + 13; const barW = cw - 10;
    doc.setFillColor(C.light); doc.roundedRect(ml + 5, barY, barW, 3.5, 1.5, 1.5, "F");
    doc.setFillColor(matchColor); doc.roundedRect(ml + 5, barY, Math.max((matchPct / 100) * barW, 3), 3.5, 1.5, 1.5, "F");
    doc.setFontSize(7); doc.setFont("helvetica", "normal"); doc.setTextColor(C.muted);
    doc.text(`Current: ${matchPct}%`, ml + 5, barY + 7);
    doc.text(`Target: ${guidance.target_match}%`, ml + 5 + barW, barY + 7, { align: "right" });
    y += 28;

    // Gap Analysis
    if (guidance.gap_analysis) {
      sectionTitle("GAP ANALYSIS");
      doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(C.dark);
      wrap(guidance.gap_analysis, ml + 2, cw - 4, 4);
      y += 3;
    }

    // Role Positioning
    if (guidance.role_positioning) {
      sectionTitle("ROLE POSITIONING STRATEGY");
      doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(C.dark);
      wrap(guidance.role_positioning, ml + 2, cw - 4, 4);
      y += 3;
    }

    // Immediate Actions
    if (guidance.immediate_actions?.length > 0) {
      sectionTitle("IMMEDIATE ACTIONS");
      guidance.immediate_actions.forEach((action, i) => {
        checkPage(6);
        doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(C.accent);
        doc.text(`${i + 1}.`, ml + 2, y);
        doc.setFont("helvetica", "normal"); doc.setTextColor(C.dark);
        const lines = doc.splitTextToSize(action, cw - 14);
        lines.forEach((line: string) => { checkPage(4); doc.text(line, ml + 10, y); y += 4; });
        y += 1;
      });
    }

    // Skills & Certifications
    if (guidance.skill_development_plan?.length > 0) {
      sectionTitle("SKILLS & CERTIFICATIONS TO ACQUIRE");
      guidance.skill_development_plan.forEach((skill) => {
        checkPage(5);
        doc.setFillColor(C.accent); doc.circle(ml + 3, y - 1, 0.8, "F");
        doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(C.dark);
        const lines = doc.splitTextToSize(skill, cw - 10);
        lines.forEach((line: string) => { checkPage(4); doc.text(line, ml + 6, y); y += 4; });
        y += 1;
      });
    }

    // Experience Reframing
    if (guidance.experience_reframing?.length > 0) {
      sectionTitle("EXPERIENCE REFRAMING");
      guidance.experience_reframing.forEach((item) => {
        checkPage(5);
        doc.setFillColor(C.primary); doc.circle(ml + 3, y - 1, 0.8, "F");
        doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(C.dark);
        const lines = doc.splitTextToSize(item, cw - 10);
        lines.forEach((line: string) => { checkPage(4); doc.text(line, ml + 6, y); y += 4; });
        y += 1;
      });
    }

    // Networking Strategy
    if (guidance.networking_strategy) {
      sectionTitle("NETWORKING STRATEGY");
      doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(C.dark);
      wrap(guidance.networking_strategy, ml + 2, cw - 4, 4);
      y += 3;
    }

    // 30/60/90 Plan
    if (guidance["30_60_90_plan"]) {
      sectionTitle("30 / 60 / 90 DAY ACTION PLAN");
      const plans = [
        { label: "First 30 Days \u2014 Quick Wins", text: guidance["30_60_90_plan"]["30_days"], color: C.accent },
        { label: "60 Days \u2014 Build Momentum", text: guidance["30_60_90_plan"]["60_days"], color: C.primary },
        { label: "90 Days \u2014 Strategic Positioning", text: guidance["30_60_90_plan"]["90_days"], color: C.destructive },
      ];
      plans.forEach((p) => {
        checkPage(16);
        doc.setFillColor(p.color); doc.rect(ml, y, 3, 12, "F");
        doc.setFontSize(8.5); doc.setFont("helvetica", "bold"); doc.setTextColor(p.color);
        doc.text(p.label, ml + 6, y + 4);
        doc.setFont("helvetica", "normal"); doc.setTextColor(C.dark); doc.setFontSize(8);
        const pLines = doc.splitTextToSize(p.text, cw - 12);
        let py = y + 8;
        pLines.forEach((line: string) => { checkPage(4); doc.text(line, ml + 6, py); py += 4; });
        y = py + 3;
      });
    }

    footerFn();
    doc.save(`career-roadmap-${(resumeData.name || "candidate").replace(/\s+/g, "-").toLowerCase()}.pdf`);
    toast.success("Career Roadmap PDF exported!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2 flex items-center gap-2">
          <Compass className="w-6 h-6 text-primary" />
          Career Guidance Roadmap
        </h2>
        <p className="text-muted-foreground">
          Get a personalized roadmap with short, mid, and long-term goals — including roles to target, skills to learn, certifications, and action steps to reach 90%+ job match.
        </p>
      </div>

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
            variant="default"
          >
            {isLoading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating roadmap...</>
            ) : guidance ? (
              <><RefreshCw className="w-4 h-4 mr-2" /> Regenerate Roadmap</>
            ) : (
              <><Compass className="w-4 h-4 mr-2" /> Generate Career Roadmap</>
            )}
          </Button>
        </div>
      </div>

      {guidance && (
        <div className="space-y-4">
          {/* Match Progress */}
          <div className="p-5 bg-card rounded-xl border border-border shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Job Match Score</span>
              <span className="text-2xl font-bold text-primary">{guidance.current_match_estimate}%</span>
            </div>
            <Progress value={guidance.current_match_estimate} className="h-3" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Current: {guidance.current_match_estimate}%</span>
              <span className="flex items-center gap-1 text-accent font-medium">
                <ArrowUpRight className="w-3 h-3" />
                Target: {guidance.target_match}%
              </span>
            </div>
          </div>

          {/* Gap Analysis */}
          {guidance.gap_analysis && (
            <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-xl">
              <p className="text-xs font-semibold text-destructive mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Gap Analysis
              </p>
              <p className="text-sm text-foreground leading-relaxed">{guidance.gap_analysis}</p>
            </div>
          )}

          {/* Role Positioning */}
          {guidance.role_positioning && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
              <p className="text-xs font-semibold text-primary mb-2 flex items-center gap-1.5">
                <Target className="w-4 h-4" /> Role Positioning Strategy
              </p>
              <p className="text-sm text-foreground leading-relaxed">{guidance.role_positioning}</p>
            </div>
          )}

          {/* Immediate Actions */}
          {guidance.immediate_actions?.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-accent" /> Immediate Actions
              </p>
              <ul className="space-y-2">
                {guidance.immediate_actions.map((action, i) => (
                  <li key={i} className="text-sm text-foreground flex items-start gap-2 p-3 bg-accent/5 rounded-lg border border-accent/10">
                    <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Skills & Certifications */}
          {guidance.skill_development_plan?.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Award className="w-4 h-4 text-primary" /> Skills & Certifications to Acquire
              </p>
              <ul className="space-y-2">
                {guidance.skill_development_plan.map((skill, i) => (
                  <li key={i} className="text-sm text-foreground flex items-start gap-2 p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <BookOpen className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Experience Reframing */}
          {guidance.experience_reframing?.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" /> Experience Reframing
              </p>
              <ul className="space-y-2">
                {guidance.experience_reframing.map((item, i) => (
                  <li key={i} className="text-sm text-foreground flex items-start gap-2 p-3 bg-muted/50 rounded-lg border border-border">
                    <ArrowUpRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Networking */}
          {guidance.networking_strategy && (
            <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl">
              <p className="text-xs font-semibold text-accent mb-2 flex items-center gap-1.5">
                <Users className="w-4 h-4" /> Networking Strategy
              </p>
              <p className="text-sm text-foreground leading-relaxed">{guidance.networking_strategy}</p>
            </div>
          )}

          {/* 30/60/90 Day Plan */}
          {guidance["30_60_90_plan"] && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-primary" /> 30 / 60 / 90 Day Action Plan
              </p>
              <div className="grid gap-3">
                <div className="p-4 rounded-xl border-l-4 border-l-accent bg-accent/5">
                  <p className="text-xs font-bold text-accent mb-1.5">🎯 First 30 Days — Quick Wins</p>
                  <p className="text-sm text-foreground leading-relaxed">{guidance["30_60_90_plan"]["30_days"]}</p>
                </div>
                <div className="p-4 rounded-xl border-l-4 border-l-primary bg-primary/5">
                  <p className="text-xs font-bold text-primary mb-1.5">📈 60 Days — Build Momentum</p>
                  <p className="text-sm text-foreground leading-relaxed">{guidance["30_60_90_plan"]["60_days"]}</p>
                </div>
                <div className="p-4 rounded-xl border-l-4 border-l-destructive bg-destructive/5">
                  <p className="text-xs font-bold text-destructive mb-1.5">🚀 90 Days — Strategic Positioning</p>
                  <p className="text-sm text-foreground leading-relaxed">{guidance["30_60_90_plan"]["90_days"]}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {!guidance && !isLoading && (
        <div className="p-5 bg-primary/5 rounded-xl border border-primary/20">
          <div className="flex items-start gap-3">
            <Compass className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground mb-1">Your Personalized Career Roadmap</p>
              <p className="text-muted-foreground">
                Paste a target job description and generate a strategic roadmap with gap analysis, role positioning, 
                skills to acquire, certifications to pursue, and a 30/60/90 day action plan — all tailored to your 
                resume and career goals.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
