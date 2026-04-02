import { useState } from "react";
import {
  Compass, Loader2, Target, TrendingUp, BookOpen, Users,
  Calendar, Award, ArrowUpRight, RefreshCw, AlertTriangle, Check, Sparkles
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
