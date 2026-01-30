import { useState } from "react";
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  TrendingUp,
  Download,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ATSCheckResult, getScoreBgColor } from "@/lib/atsChecker";
import { cn } from "@/lib/utils";

interface ATSScorePreviewProps {
  result: ATSCheckResult;
  onDownload: () => void;
  hasContent: boolean;
}

const getScoreLabel = (score: number): { label: string; color: string } => {
  if (score >= 85) return { label: "Best", color: "text-accent" };
  if (score >= 70) return { label: "Better", color: "text-primary" };
  if (score >= 50) return { label: "Good", color: "text-amber-500" };
  return { label: "Fair", color: "text-destructive" };
};

const getCategoryIcon = (score: number, maxScore: number) => {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 80) return <CheckCircle2 className="w-3.5 h-3.5 text-accent" />;
  if (percentage >= 50) return <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />;
  return <XCircle className="w-3.5 h-3.5 text-destructive" />;
};

export const ATSScorePreview = ({ result, onDownload, hasContent }: ATSScorePreviewProps) => {
  const [expanded, setExpanded] = useState(false);
  const score = result.overallScore;
  const scoreInfo = getScoreLabel(score);

  // Extract category data from the result
  const categories = result.categories.map(cat => ({
    name: cat.name,
    score: Math.round((cat.score / cat.maxScore) * 100),
    weight: `${Math.round(cat.weight * 10)}%`,
    issues: cat.issues,
    passed: cat.passed,
  }));

  // Collect all issues from categories
  const allIssues = result.categories.flatMap(cat => 
    cat.issues.map(issue => ({
      message: issue,
      severity: cat.passed ? "warning" : "error" as "warning" | "error"
    }))
  );

  const criticalIssues = allIssues.filter(i => i.severity === "error");
  const warnings = allIssues.filter(i => i.severity === "warning");

  // Find weak categories for recommendations
  const weakCategories = result.categories
    .filter(cat => (cat.score / cat.maxScore) < 0.7)
    .sort((a, b) => (a.score / a.maxScore) - (b.score / b.maxScore));

  if (!hasContent) {
    return (
      <div className="bg-card rounded-xl border border-border p-4 shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-muted-foreground/30">
              <TrendingUp className="w-5 h-5 text-muted-foreground/50" />
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">ATS Score Preview</p>
              <p className="text-xs text-muted-foreground">Add content to see score</p>
            </div>
          </div>
          <Button variant="hero" onClick={onDownload} disabled>
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-lg overflow-hidden">
      {/* Main Score Bar */}
      <div className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div 
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm",
                getScoreBgColor(score)
              )}
            >
              {score}%
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-foreground text-sm">Hiring Readiness</p>
                <span className={cn("text-xs font-semibold", scoreInfo.color)}>
                  {scoreInfo.label}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Progress 
                  value={score} 
                  className="h-1.5 flex-1" 
                />
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-xs text-primary hover:underline flex items-center gap-0.5"
                >
                  {expanded ? (
                    <>Hide <ChevronUp className="w-3 h-3" /></>
                  ) : (
                    <>Details <ChevronDown className="w-3 h-3" /></>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          <Button variant="hero" onClick={onDownload} className="shrink-0">
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Download</span> PDF
          </Button>
        </div>

        {/* Quick Issues Summary */}
        {(criticalIssues.length > 0 || warnings.length > 0) && !expanded && (
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
            {criticalIssues.length > 0 && (
              <span className="text-xs flex items-center gap-1 text-destructive">
                <XCircle className="w-3 h-3" />
                {criticalIssues.length} critical
              </span>
            )}
            {warnings.length > 0 && (
              <span className="text-xs flex items-center gap-1 text-amber-500">
                <AlertTriangle className="w-3 h-3" />
                {warnings.length} warnings
              </span>
            )}
          </div>
        )}
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-border bg-muted/30 p-4 space-y-4">
          {/* Category Breakdown */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">CATEGORY BREAKDOWN</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.slice(0, 6).map((cat) => (
                <div 
                  key={cat.name} 
                  className="flex items-center gap-2 bg-background rounded-lg px-2.5 py-2 border border-border"
                >
                  {getCategoryIcon(cat.score, 100)}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{cat.name}</p>
                    <p className="text-[10px] text-muted-foreground">{cat.score}% • {cat.weight}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Issues */}
          {(criticalIssues.length > 0 || warnings.length > 0) && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">ISSUES TO ADDRESS</p>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {criticalIssues.slice(0, 3).map((issue, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-start gap-2 text-xs bg-destructive/10 text-destructive px-2.5 py-1.5 rounded-md"
                  >
                    <XCircle className="w-3 h-3 mt-0.5 shrink-0" />
                    <span>{issue.message}</span>
                  </div>
                ))}
                {warnings.slice(0, 2).map((issue, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-start gap-2 text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-1.5 rounded-md"
                  >
                    <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                    <span>{issue.message}</span>
                  </div>
                ))}
                {(criticalIssues.length > 3 || warnings.length > 2) && (
                  <p className="text-[10px] text-muted-foreground pl-5">
                    +{Math.max(0, criticalIssues.length - 3) + Math.max(0, warnings.length - 2)} more issues
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {score < 85 && weakCategories.length > 0 && (
            <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
              <p className="text-xs font-medium text-primary mb-1">
                💡 Quick Wins to Improve Score
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                {weakCategories.slice(0, 4).map((cat, idx) => (
                  <li key={idx}>• Improve {cat.name.toLowerCase()} ({Math.round((cat.score / cat.maxScore) * 100)}%)</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};