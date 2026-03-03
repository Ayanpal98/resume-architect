import { useState } from "react";
import { FileText, Download, Loader2, Sparkles, CheckCircle2, AlertCircle, BarChart3, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ResumeData } from "@/lib/pdfGenerator";
import { downloadOptimizationReport, OptimizationReportData } from "@/lib/reportGenerator";
import { checkATSCompatibility } from "@/lib/atsChecker";

interface OptimizationReportProps {
  resumeData: ResumeData;
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
}

interface AnalysisData {
  summary?: {
    current_assessment: string;
    improved_version: string;
    key_changes: string[];
  };
  experience?: Array<{
    role: string;
    current_assessment: string;
    improved_bullets: string[];
    missing_keywords_to_add: string[];
  }>;
  skills?: {
    keep: string[];
    add: string[];
    remove: string[];
    reorganized: string;
  };
  keywords?: {
    found_in_resume: string[];
    missing_critical: string[];
    missing_preferred: string[];
  };
  overall_tips?: string[];
}

export const OptimizationReport = ({
  resumeData,
  jobDescription,
  onJobDescriptionChange,
}: OptimizationReportProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleGenerateReport = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please paste a job description first");
      return;
    }
    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke("resume-improve", {
        body: { resumeData, jobDescription },
      });

      if (error) throw new Error(error.message || "Failed to analyze");
      if (data.error) throw new Error(data.error);

      setAnalysis(data.analysis);
      toast.success("Report ready! Review the summary below and export as PDF.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExportPDF = () => {
    if (!analysis) return;
    setIsExporting(true);

    try {
      const atsResult = checkATSCompatibility(resumeData);
      const reportData: OptimizationReportData = {
        resumeData,
        jobDescription,
        analysis,
        appliedChanges: new Set(), // Report shows all as recommendations
        atsScore: atsResult.overallScore,
      };
      downloadOptimizationReport(reportData);
      toast.success("Report downloaded!");
    } catch {
      toast.error("Failed to generate PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const keywordCoverage = analysis?.keywords
    ? Math.round(
        ((analysis.keywords.found_in_resume?.length || 0) /
          Math.max(
            (analysis.keywords.found_in_resume?.length || 0) +
              (analysis.keywords.missing_critical?.length || 0) +
              (analysis.keywords.missing_preferred?.length || 0),
            1
          )) *
          100
      )
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">Optimization Report</h2>
        <p className="text-muted-foreground text-sm">
          Generate a comprehensive, exportable PDF report analyzing every section of your resume against a job description.
        </p>
      </div>

      {/* Job Description Input */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          <Target className="w-4 h-4 inline mr-2" />
          Target Job Description
        </label>
        <Textarea
          placeholder="Paste the job description to analyze against..."
          rows={5}
          value={jobDescription}
          onChange={(e) => onJobDescriptionChange(e.target.value)}
          className="resize-none"
        />
      </div>

      <Button
        onClick={handleGenerateReport}
        disabled={isAnalyzing || !jobDescription.trim()}
        className="w-full"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Analyzing resume against JD...
          </>
        ) : (
          <>
            <BarChart3 className="w-4 h-4 mr-2" />
            Generate Report
          </>
        )}
      </Button>

      {/* Report Preview */}
      {analysis && (
        <div className="space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              label="Summary"
              value={analysis.summary ? "Reviewed" : "N/A"}
              icon={<Sparkles className="w-4 h-4" />}
              color="text-primary"
            />
            <StatCard
              label="Experience"
              value={`${analysis.experience?.length || 0} roles`}
              icon={<FileText className="w-4 h-4" />}
              color="text-accent"
            />
            <StatCard
              label="Skills"
              value={`+${analysis.skills?.add?.length || 0} / -${analysis.skills?.remove?.length || 0}`}
              icon={<CheckCircle2 className="w-4 h-4" />}
              color="text-primary"
            />
            <StatCard
              label="Keywords"
              value={`${keywordCoverage}% covered`}
              icon={<AlertCircle className="w-4 h-4" />}
              color={keywordCoverage >= 70 ? "text-accent" : "text-destructive"}
            />
          </div>

          {/* Section summaries */}
          <div className="space-y-3">
            {analysis.summary && (
              <ReportSection title="Professional Summary">
                <p className="text-xs text-muted-foreground mb-1">Assessment:</p>
                <p className="text-sm text-foreground">{analysis.summary.current_assessment}</p>
                <p className="text-xs text-accent mt-2 font-medium">
                  ✓ Improved version included in report ({analysis.summary.key_changes?.length || 0} key changes)
                </p>
              </ReportSection>
            )}

            {analysis.experience && analysis.experience.length > 0 && (
              <ReportSection title="Experience Improvements">
                {analysis.experience.map((exp, i) => (
                  <div key={i} className="text-sm text-foreground mb-2 last:mb-0">
                    <span className="font-medium">{exp.role}</span>
                    <span className="text-muted-foreground text-xs ml-2">
                      — {exp.improved_bullets?.length || 0} bullets rewritten, {exp.missing_keywords_to_add?.length || 0} keywords missing
                    </span>
                  </div>
                ))}
              </ReportSection>
            )}

            {analysis.skills && (
              <ReportSection title="Skills Analysis">
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="text-accent">✓ Keep: {analysis.skills.keep?.length || 0}</span>
                  <span className="text-primary">+ Add: {analysis.skills.add?.length || 0}</span>
                  <span className="text-destructive">− Remove: {analysis.skills.remove?.length || 0}</span>
                </div>
              </ReportSection>
            )}

            {analysis.keywords && (
              <ReportSection title="Keyword Coverage">
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${keywordCoverage >= 70 ? "bg-accent" : keywordCoverage >= 50 ? "bg-warning" : "bg-destructive"}`}
                      style={{ width: `${keywordCoverage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground">{keywordCoverage}%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {analysis.keywords.missing_critical?.length || 0} critical keywords missing
                </p>
              </ReportSection>
            )}

            {analysis.overall_tips && analysis.overall_tips.length > 0 && (
              <ReportSection title="Additional Tips">
                <ul className="space-y-1">
                  {analysis.overall_tips.slice(0, 3).map((tip, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-primary font-bold">{i + 1}.</span>
                      <span className="line-clamp-2">{tip}</span>
                    </li>
                  ))}
                  {analysis.overall_tips.length > 3 && (
                    <li className="text-xs text-primary">+ {analysis.overall_tips.length - 3} more in full report</li>
                  )}
                </ul>
              </ReportSection>
            )}
          </div>

          {/* Export Button */}
          <Button
            onClick={handleExportPDF}
            disabled={isExporting}
            variant="default"
            className="w-full"
            size="lg"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Export Full Report as PDF
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!analysis && !isAnalyzing && (
        <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
          <div className="flex items-start gap-3">
            <BarChart3 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground mb-1">What's in the Report?</p>
              <ul className="text-muted-foreground space-y-1 text-xs">
                <li>• Professional summary — current assessment & tailored rewrite</li>
                <li>• Experience bullets — XYZ formula rewrites with missing keywords</li>
                <li>• Skills optimization — keep, add, and remove recommendations</li>
                <li>• Keyword gap analysis — coverage percentage & critical gaps</li>
                <li>• Overall recommendations & changes summary table</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) => (
  <div className="p-3 bg-muted/50 rounded-lg border border-border text-center">
    <div className={`${color} flex justify-center mb-1`}>{icon}</div>
    <p className="text-sm font-semibold text-foreground">{value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </div>
);

const ReportSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="p-3 bg-card rounded-lg border border-border">
    <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">{title}</p>
    {children}
  </div>
);
