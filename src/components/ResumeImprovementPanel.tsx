import { useState } from "react";
import { Sparkles, Loader2, Check, ChevronDown, ChevronRight, AlertTriangle, Plus, Minus, RefreshCw, Copy, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ResumeData } from "@/lib/pdfGenerator";

interface ImprovementAnalysis {
  summary: {
    current_assessment: string;
    improved_version: string;
    key_changes: string[];
  };
  experience: Array<{
    role: string;
    current_assessment: string;
    improved_bullets: string[];
    missing_keywords_to_add: string[];
  }>;
  skills: {
    keep: string[];
    add: string[];
    remove: string[];
    reorganized: string;
  };
  keywords: {
    found_in_resume: string[];
    missing_critical: string[];
    missing_preferred: string[];
  };
  overall_tips: string[];
}

interface ResumeImprovementPanelProps {
  resumeData: ResumeData;
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
  onApplySummary: (summary: string) => void;
  onApplyExperience: (index: number, description: string) => void;
  onApplySkills: (skills: string[]) => void;
}

export const ResumeImprovementPanel = ({
  resumeData,
  jobDescription,
  onJobDescriptionChange,
  onApplySummary,
  onApplyExperience,
  onApplySkills,
}: ResumeImprovementPanelProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ImprovementAnalysis | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    summary: true, experience: true, skills: true, keywords: true, tips: true,
  });
  const [appliedItems, setAppliedItems] = useState<Set<string>>(new Set());

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const markApplied = (key: string) => {
    setAppliedItems(prev => new Set(prev).add(key));
  };

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please paste a job description first");
      return;
    }
    setIsLoading(true);
    setAnalysis(null);
    setAppliedItems(new Set());

    try {
      const { data, error } = await supabase.functions.invoke("resume-improve", {
        body: { resumeData, jobDescription },
      });

      if (error) throw new Error(error.message || "Failed to analyze");
      if (data.error) throw new Error(data.error);

      setAnalysis(data.analysis);
      toast.success("Analysis complete! Review suggestions below.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Analysis failed");
    } finally {
      setIsLoading(false);
    }
  };

  const SectionHeader = ({ id, title, icon: Icon, count }: { id: string; title: string; icon: any; count?: number }) => (
    <button
      onClick={() => toggleSection(id)}
      className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
    >
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary" />
        <span className="font-semibold text-sm text-foreground">{title}</span>
        {count !== undefined && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{count} suggestions</span>
        )}
      </div>
      {expandedSections[id] ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
    </button>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">AI Resume Improvement</h2>
        <p className="text-muted-foreground">Get section-by-section suggestions tied directly to your resume and the target job.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          <Target className="w-4 h-4 inline mr-2" />
          Target Job Description
        </label>
        <Textarea
          placeholder="Paste the job description you're applying for..."
          rows={6}
          value={jobDescription}
          onChange={(e) => onJobDescriptionChange(e.target.value)}
          className="resize-none"
        />
      </div>

      <Button
        onClick={handleAnalyze}
        disabled={isLoading || !jobDescription.trim()}
        className="w-full"
        variant="default"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Analyzing your resume against JD...
          </>
        ) : analysis ? (
          <>
            <RefreshCw className="w-4 h-4 mr-2" />
            Re-analyze
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Analyze & Get Improvements
          </>
        )}
      </Button>

      {analysis && (
        <div className="space-y-4">
          {/* Summary Section */}
          {analysis.summary && (
            <div className="border border-border rounded-xl overflow-hidden">
              <SectionHeader id="summary" title="Professional Summary" icon={Sparkles} count={analysis.summary.key_changes?.length} />
              {expandedSections.summary && (
                <div className="p-4 space-y-3">
                  <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                    <p className="text-xs font-medium text-destructive mb-1">Current Assessment</p>
                    <p className="text-sm text-foreground">{analysis.summary.current_assessment}</p>
                  </div>
                  <div className="p-3 bg-accent/5 border border-accent/20 rounded-lg">
                    <p className="text-xs font-medium text-accent mb-1">Improved Version</p>
                    <p className="text-sm text-foreground">{analysis.summary.improved_version}</p>
                  </div>
                  {analysis.summary.key_changes?.length > 0 && (
                    <ul className="space-y-1">
                      {analysis.summary.key_changes.map((change, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                          <Check className="w-3 h-3 text-accent shrink-0 mt-0.5" />
                          {change}
                        </li>
                      ))}
                    </ul>
                  )}
                  <Button
                    size="sm"
                    onClick={() => {
                      onApplySummary(analysis.summary.improved_version);
                      markApplied("summary");
                      toast.success("Summary updated!");
                    }}
                    disabled={appliedItems.has("summary")}
                    className="w-full"
                  >
                    {appliedItems.has("summary") ? (
                      <><Check className="w-4 h-4 mr-2" />Applied</>
                    ) : (
                      "Apply Improved Summary"
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Experience Section */}
          {analysis.experience?.length > 0 && (
            <div className="border border-border rounded-xl overflow-hidden">
              <SectionHeader id="experience" title="Work Experience" icon={Sparkles} count={analysis.experience.length} />
              {expandedSections.experience && (
                <div className="p-4 space-y-4">
                  {analysis.experience.map((exp, i) => (
                    <div key={i} className="p-3 bg-muted/30 rounded-lg space-y-2 border border-border">
                      <p className="text-sm font-semibold text-foreground">{exp.role}</p>
                      <p className="text-xs text-muted-foreground">{exp.current_assessment}</p>
                      {exp.improved_bullets?.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-accent">Improved Bullets:</p>
                          {exp.improved_bullets.map((bullet, j) => (
                            <p key={j} className="text-xs text-foreground pl-2">{bullet}</p>
                          ))}
                        </div>
                      )}
                      {exp.missing_keywords_to_add?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="text-xs text-destructive font-medium">Missing: </span>
                          {exp.missing_keywords_to_add.map((kw, j) => (
                            <span key={j} className="text-xs px-1.5 py-0.5 bg-destructive/10 text-destructive rounded">{kw}</span>
                          ))}
                        </div>
                      )}
                      {resumeData.experience[i] && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const bullets = exp.improved_bullets.map(b => b.replace(/^[•\-]\s*/, "")).join("\n• ");
                            onApplyExperience(i, "• " + bullets);
                            markApplied(`exp-${i}`);
                            toast.success(`Experience ${i + 1} updated!`);
                          }}
                          disabled={appliedItems.has(`exp-${i}`)}
                          className="w-full"
                        >
                          {appliedItems.has(`exp-${i}`) ? <><Check className="w-3 h-3 mr-1" />Applied</> : "Apply Improved Bullets"}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Skills Section */}
          {analysis.skills && (
            <div className="border border-border rounded-xl overflow-hidden">
              <SectionHeader id="skills" title="Skills Optimization" icon={Sparkles} count={(analysis.skills.add?.length || 0) + (analysis.skills.remove?.length || 0)} />
              {expandedSections.skills && (
                <div className="p-4 space-y-3">
                  {analysis.skills.keep?.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-accent mb-1 flex items-center gap-1"><Check className="w-3 h-3" /> Keep (matches JD)</p>
                      <div className="flex flex-wrap gap-1">
                        {analysis.skills.keep.map((s, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-accent/10 text-accent rounded-full">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {analysis.skills.add?.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-primary mb-1 flex items-center gap-1"><Plus className="w-3 h-3" /> Add (from JD)</p>
                      <div className="flex flex-wrap gap-1">
                        {analysis.skills.add.map((s, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {analysis.skills.remove?.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-destructive mb-1 flex items-center gap-1"><Minus className="w-3 h-3" /> Remove (not in JD)</p>
                      <div className="flex flex-wrap gap-1">
                        {analysis.skills.remove.map((s, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-destructive/10 text-destructive rounded-full line-through">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {analysis.skills.reorganized && (
                    <div className="p-2 bg-muted/50 rounded-lg">
                      <p className="text-xs font-medium text-foreground mb-1">Reorganized Skills:</p>
                      <p className="text-xs text-muted-foreground">{analysis.skills.reorganized}</p>
                    </div>
                  )}
                  <Button
                    size="sm"
                    onClick={() => {
                      const allSkills = [...(analysis.skills.keep || []), ...(analysis.skills.add || [])];
                      onApplySkills(allSkills);
                      markApplied("skills");
                      toast.success("Skills updated!");
                    }}
                    disabled={appliedItems.has("skills")}
                    className="w-full"
                  >
                    {appliedItems.has("skills") ? <><Check className="w-4 h-4 mr-2" />Applied</> : "Apply Optimized Skills"}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Keywords Gap */}
          {analysis.keywords && (
            <div className="border border-border rounded-xl overflow-hidden">
              <SectionHeader id="keywords" title="Keyword Gap Analysis" icon={AlertTriangle} count={analysis.keywords.missing_critical?.length} />
              {expandedSections.keywords && (
                <div className="p-4 space-y-3">
                  {analysis.keywords.found_in_resume?.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-accent mb-1">✓ Found in Resume</p>
                      <div className="flex flex-wrap gap-1">
                        {analysis.keywords.found_in_resume.map((kw, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-accent/10 text-accent rounded">{kw}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {analysis.keywords.missing_critical?.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-destructive mb-1">✗ Missing (Critical)</p>
                      <div className="flex flex-wrap gap-1">
                        {analysis.keywords.missing_critical.map((kw, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-destructive/10 text-destructive rounded">{kw}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {analysis.keywords.missing_preferred?.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">○ Missing (Preferred)</p>
                      <div className="flex flex-wrap gap-1">
                        {analysis.keywords.missing_preferred.map((kw, i) => (
                          <span key={i} className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded">{kw}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Overall Tips */}
          {analysis.overall_tips?.length > 0 && (
            <div className="border border-border rounded-xl overflow-hidden">
              <SectionHeader id="tips" title="Overall Tips" icon={Sparkles} count={analysis.overall_tips.length} />
              {expandedSections.tips && (
                <div className="p-4">
                  <ul className="space-y-2">
                    {analysis.overall_tips.map((tip, i) => (
                      <li key={i} className="text-sm text-foreground flex items-start gap-2">
                        <span className="text-primary font-bold text-xs mt-0.5">{i + 1}.</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!analysis && !isLoading && (
        <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground mb-1">How This Works</p>
              <p className="text-muted-foreground">
                Paste a job description above, then click "Analyze." The AI will compare your actual resume content
                against the JD and provide specific rewrites, missing keywords, and skill reorganization — all tied
                directly to what you've written.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
