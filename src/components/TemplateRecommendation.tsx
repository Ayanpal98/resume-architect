import { useState, useEffect } from "react";
import { Check, Sparkles, ChevronDown, ChevronUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ResumeData } from "@/lib/pdfGenerator";
import { recommendTemplates, TemplateRecommendation as Recommendation } from "@/lib/templateRecommender";

interface TemplateRecommendationProps {
  resumeData: ResumeData;
  selectedTemplate: string;
  onSelectTemplate: (templateId: string) => void;
}

const MatchScoreBadge = ({ score }: { score: number }) => {
  if (score > 30) {
    return (
      <Badge variant="default" className="bg-accent text-accent-foreground text-xs">
        <Zap className="w-3 h-3 mr-1" />
        Best Match
      </Badge>
    );
  }
  if (score > 15) {
    return (
      <Badge variant="secondary" className="text-xs">
        Good Match
      </Badge>
    );
  }
  if (score > 5) {
    return (
      <Badge variant="outline" className="text-xs">
        Moderate
      </Badge>
    );
  }
  return null;
};

const industryIcons: Record<string, string> = {
  tech: "💻",
  finance: "📊",
  healthcare: "🏥",
};

const previewColors: Record<string, string> = {
  classic: "from-slate-800 to-slate-700",
  modern: "from-blue-700 to-indigo-700",
  professional: "from-gray-900 to-gray-800",
  tech: "from-cyan-700 to-teal-800",
  finance: "from-emerald-800 to-green-900",
  healthcare: "from-sky-700 to-blue-800",
};

export const TemplateRecommendation = ({
  resumeData,
  selectedTemplate,
  onSelectTemplate,
}: TemplateRecommendationProps) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const recs = recommendTemplates(resumeData);
    setRecommendations(recs);
  }, [resumeData]);

  if (recommendations.length === 0) {
    return null;
  }

  const topRecommendations = showAll ? recommendations : recommendations.slice(0, 3);
  const hasIndustryMatch = recommendations[0]?.matchScore > 10;

  return (
    <div className="space-y-4">
      {hasIndustryMatch && (
        <div className="flex items-center gap-2 text-sm text-accent">
          <Sparkles className="w-4 h-4" />
          <span className="font-medium">AI-powered template suggestions based on your resume</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {topRecommendations.map((rec, index) => {
          const isSelected = selectedTemplate === rec.template.id;
          const isTopPick = index === 0 && rec.matchScore > 10;

          return (
            <button
              key={rec.template.id}
              onClick={() => onSelectTemplate(rec.template.id)}
              className={cn(
                "relative group rounded-xl border-2 p-3 transition-all duration-200 text-left",
                isSelected
                  ? "border-primary shadow-lg ring-2 ring-primary/20"
                  : "border-border hover:border-primary/50",
                isTopPick && !isSelected && "border-accent/50 bg-accent/5"
              )}
            >
              {isTopPick && (
                <div className="absolute -top-2 left-3 px-2 py-0.5 bg-accent text-accent-foreground text-[10px] font-semibold rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Recommended
                </div>
              )}

              {/* Mini Preview */}
              <div
                className={cn(
                  "w-full aspect-[4/3] rounded-lg bg-gradient-to-br mb-3 relative overflow-hidden",
                  previewColors[rec.template.id] || previewColors.classic
                )}
              >
                {/* Mock content */}
                <div className="absolute inset-2 flex flex-col gap-1">
                  <div className="h-2 bg-white/40 rounded w-2/3"></div>
                  <div className="h-1 bg-white/25 rounded w-1/2"></div>
                  <div className="h-0.5 my-1 bg-white/30"></div>
                  <div className="h-1 bg-white/20 rounded w-full"></div>
                  <div className="h-1 bg-white/20 rounded w-4/5"></div>
                </div>

                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-md">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {rec.template.industry && industryIcons[rec.template.industry] && (
                    <span className="text-sm">{industryIcons[rec.template.industry]}</span>
                  )}
                  <h3 className="font-semibold text-foreground text-sm">{rec.template.name}</h3>
                  <MatchScoreBadge score={rec.matchScore} />
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2">{rec.reason}</p>

                {rec.matchedKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {rec.matchedKeywords.slice(0, 3).map((keyword) => (
                      <span
                        key={keyword}
                        className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded"
                      >
                        {keyword}
                      </span>
                    ))}
                    {rec.matchedKeywords.length > 3 && (
                      <span className="text-[9px] text-muted-foreground">
                        +{rec.matchedKeywords.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {recommendations.length > 3 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAll(!showAll)}
          className="w-full text-muted-foreground"
        >
          {showAll ? (
            <>
              <ChevronUp className="w-4 h-4 mr-2" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-2" />
              Show All {recommendations.length} Templates
            </>
          )}
        </Button>
      )}
    </div>
  );
};
