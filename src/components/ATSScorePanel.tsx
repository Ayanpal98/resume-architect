import { useState } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp,
  Target,
  Lightbulb,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  ATSCheckResult, 
  ATSCategory,
  getScoreColor,
  getScoreBgColor 
} from "@/lib/atsChecker";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ATSScorePanelProps {
  result: ATSCheckResult;
  onDismiss?: () => void;
}

export const ATSScorePanel = ({ result, onDismiss }: ATSScorePanelProps) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [showAllRecommendations, setShowAllRecommendations] = useState(false);

  const toggleCategory = (name: string) => {
    setExpandedCategories(prev => 
      prev.includes(name) 
        ? prev.filter(n => n !== name)
        : [...prev, name]
    );
  };

  const getStatusIcon = (category: ATSCategory) => {
    const ratio = category.score / category.maxScore;
    if (ratio >= 0.8) return <CheckCircle2 className="w-5 h-5 text-accent" />;
    if (ratio >= 0.5) return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    return <XCircle className="w-5 h-5 text-destructive" />;
  };

  const getStatusLabel = (status: ATSCheckResult["passStatus"]) => {
    switch (status) {
      case "excellent": return "Excellent - ATS Ready!";
      case "good": return "Good - Minor improvements needed";
      case "fair": return "Fair - Some work required";
      case "poor": return "Poor - Significant improvements needed";
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
      {/* Header with score */}
      <div className={`${getScoreBgColor(result.overallScore)} p-6 text-white`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6" />
            <h3 className="text-lg font-display font-bold">ATS Compatibility Score</h3>
          </div>
          {onDismiss && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onDismiss}
              className="text-white/80 hover:text-white hover:bg-white/20"
            >
              Dismiss
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-5xl font-bold">{result.overallScore}</div>
          <div className="flex-1">
            <div className="text-white/90 font-medium mb-2">
              {getStatusLabel(result.passStatus)}
            </div>
            <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-700"
                style={{ width: `${result.overallScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="p-4 space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground px-2 mb-3">
          Score Breakdown
        </h4>
        
        {result.categories.map((category) => (
          <Collapsible 
            key={category.name}
            open={expandedCategories.includes(category.name)}
          >
            <CollapsibleTrigger 
              onClick={() => toggleCategory(category.name)}
              className="w-full"
            >
              <div className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  {getStatusIcon(category)}
                  <span className="font-medium text-foreground">{category.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${getScoreColor(
                    (category.score / category.maxScore) * 100
                  )}`}>
                    {category.score}/{category.maxScore}
                  </span>
                  {expandedCategories.includes(category.name) ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="px-3 pb-3 pt-1">
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  {category.issues.length > 0 ? (
                    category.issues.map((issue, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{issue}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-accent" />
                      <span className="text-accent">All checks passed!</span>
                    </div>
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>

      {/* Recommendations */}
      {result.recommendations.length > 0 && (
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-primary" />
            <h4 className="font-medium text-foreground">Top Recommendations</h4>
          </div>
          
          <div className="space-y-2">
            {(showAllRecommendations 
              ? result.recommendations 
              : result.recommendations.slice(0, 3)
            ).map((rec, idx) => (
              <div 
                key={idx} 
                className="flex items-start gap-2 p-2 bg-primary/5 rounded-lg"
              >
                <TrendingUp className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span className="text-sm text-foreground">{rec}</span>
              </div>
            ))}
          </div>
          
          {result.recommendations.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllRecommendations(!showAllRecommendations)}
              className="w-full mt-2 text-primary"
            >
              {showAllRecommendations ? "Show Less" : `Show ${result.recommendations.length - 3} More`}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
