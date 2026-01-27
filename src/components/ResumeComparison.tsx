import { useState } from "react";
import { ResumeData } from "@/lib/pdfGenerator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Sparkles,
  FileText,
  User,
  Briefcase,
  GraduationCap,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ResumeComparisonProps {
  originalData: ResumeData;
  currentData: ResumeData;
  onClose?: () => void;
}

interface ComparisonStat {
  label: string;
  original: number | string;
  current: number | string;
  improved: boolean;
  icon: React.ElementType;
}

export const ResumeComparison = ({
  originalData,
  currentData,
  onClose,
}: ResumeComparisonProps) => {
  const [activeTab, setActiveTab] = useState<"overview" | "details">("overview");

  // Calculate comparison stats
  const getStats = (): ComparisonStat[] => {
    const originalSummaryWords = originalData.summary?.trim().split(/\s+/).filter(Boolean).length || 0;
    const currentSummaryWords = currentData.summary?.trim().split(/\s+/).filter(Boolean).length || 0;

    return [
      {
        label: "Skills Listed",
        original: originalData.skills.length,
        current: currentData.skills.length,
        improved: currentData.skills.length > originalData.skills.length,
        icon: Wrench,
      },
      {
        label: "Experience Entries",
        original: originalData.experience.length,
        current: currentData.experience.length,
        improved: currentData.experience.length >= originalData.experience.length,
        icon: Briefcase,
      },
      {
        label: "Education Entries",
        original: originalData.education.length,
        current: currentData.education.length,
        improved: currentData.education.length >= originalData.education.length,
        icon: GraduationCap,
      },
      {
        label: "Summary Length",
        original: `${originalSummaryWords} words`,
        current: `${currentSummaryWords} words`,
        improved: currentSummaryWords > originalSummaryWords,
        icon: FileText,
      },
      {
        label: "Contact Fields",
        original: Object.values(originalData.personalInfo).filter(Boolean).length,
        current: Object.values(currentData.personalInfo).filter(Boolean).length,
        improved:
          Object.values(currentData.personalInfo).filter(Boolean).length >=
          Object.values(originalData.personalInfo).filter(Boolean).length,
        icon: User,
      },
    ];
  };

  const stats = getStats();
  const improvementCount = stats.filter((s) => s.improved).length;

  // Find new skills added
  const newSkills = currentData.skills.filter(
    (skill) => !originalData.skills.includes(skill)
  );
  const removedSkills = originalData.skills.filter(
    (skill) => !currentData.skills.includes(skill)
  );

  // Check for summary changes
  const summaryChanged = originalData.summary !== currentData.summary;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="text-center pb-3 sm:pb-4 border-b border-border">
        <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 bg-primary/10 rounded-full text-xs sm:text-sm text-primary mb-2 sm:mb-3">
          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
          Resume Comparison
        </div>
        <h2 className="text-lg sm:text-xl font-display font-bold text-foreground">
          Before & After Analysis
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          See how your resume has improved
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <div className="bg-muted/50 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-bold text-foreground">{improvementCount}</div>
          <div className="text-[10px] sm:text-xs text-muted-foreground">Areas Improved</div>
        </div>
        <div className="bg-accent/10 rounded-lg sm:rounded-xl p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-bold text-accent">{newSkills.length}</div>
          <div className="text-[10px] sm:text-xs text-muted-foreground">New Skills Added</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1.5 sm:gap-2 p-1 bg-muted rounded-lg">
        <button
          onClick={() => setActiveTab("overview")}
          className={cn(
            "flex-1 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all",
            activeTab === "overview"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("details")}
          className={cn(
            "flex-1 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all",
            activeTab === "details"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Details
        </button>
      </div>

      {/* Content */}
      <ScrollArea className="h-[300px] sm:h-[400px] pr-2 sm:pr-4">
        {activeTab === "overview" && (
          <div className="space-y-3 sm:space-y-4">
            {/* Stats Comparison */}
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className={cn(
                  "rounded-lg sm:rounded-xl border p-3 sm:p-4 transition-all",
                  stat.improved
                    ? "border-accent/30 bg-accent/5"
                    : "border-border bg-muted/30"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div
                      className={cn(
                        "w-8 h-8 sm:w-10 sm:h-10 rounded-md sm:rounded-lg flex items-center justify-center",
                        stat.improved ? "bg-accent/20" : "bg-muted"
                      )}
                    >
                      <stat.icon
                        className={cn(
                          "w-4 h-4 sm:w-5 sm:h-5",
                          stat.improved ? "text-accent" : "text-muted-foreground"
                        )}
                      />
                    </div>
                    <div>
                      <div className="font-medium text-foreground text-sm sm:text-base">{stat.label}</div>
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                        <span className="text-muted-foreground">{stat.original}</span>
                        <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-muted-foreground" />
                        <span
                          className={cn(
                            "font-medium",
                            stat.improved ? "text-accent" : "text-foreground"
                          )}
                        >
                          {stat.current}
                        </span>
                      </div>
                    </div>
                  </div>
                  {stat.improved ? (
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-accent shrink-0" />
                  ) : (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <span className="text-[10px] sm:text-xs text-muted-foreground">—</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "details" && (
          <div className="space-y-6">
            {/* Skills Changes */}
            {(newSkills.length > 0 || removedSkills.length > 0) && (
              <div className="space-y-3">
                <h3 className="font-medium text-foreground flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-primary" />
                  Skills Changes
                </h3>

                {newSkills.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm text-accent flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Added ({newSkills.length})
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {newSkills.map((skill, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="bg-accent/10 text-accent border-accent/20"
                        >
                          + {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {removedSkills.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      Removed ({removedSkills.length})
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {removedSkills.map((skill, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="text-muted-foreground line-through"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Summary Comparison */}
            {summaryChanged && (
              <div className="space-y-3">
                <h3 className="font-medium text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Summary Changes
                </h3>

                <div className="space-y-3">
                  <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                    <div className="text-xs font-medium text-destructive mb-2">
                      Before
                    </div>
                    <p className="text-sm text-muted-foreground line-through">
                      {originalData.summary || "(No summary)"}
                    </p>
                  </div>

                  <div className="rounded-lg border border-accent/20 bg-accent/5 p-3">
                    <div className="text-xs font-medium text-accent mb-2">After</div>
                    <p className="text-sm text-foreground">
                      {currentData.summary || "(No summary)"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* No Changes Message */}
            {newSkills.length === 0 &&
              removedSkills.length === 0 &&
              !summaryChanged && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">
                    No significant content changes detected yet.
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Use AI suggestions to improve your resume!
                  </p>
                </div>
              )}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {onClose && (
        <div className="pt-4 border-t border-border">
          <Button variant="outline" className="w-full" onClick={onClose}>
            Close Comparison
          </Button>
        </div>
      )}
    </div>
  );
};
