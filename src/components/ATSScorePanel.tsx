import { useState } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp,
  Target,
  Lightbulb,
  TrendingUp,
  BarChart3,
  FileText,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ATSCheckResult, 
  ATSCategory,
  getScoreColor,
  getScoreBgColor,
  getScoreLabel
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
      case "poor": return "Needs significant improvements";
    }
  };

  const getCategoryPercentage = (category: ATSCategory) => {
    return Math.round((category.score / category.maxScore) * 100);
  };

  // Sort categories by weight for display priority
  const sortedCategories = [...result.categories].sort((a, b) => b.weight - a.weight);

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

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/20">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <BarChart3 className="w-4 h-4 text-white/70" />
            </div>
            <div className="text-xl font-bold">{result.keywordDensity}%</div>
            <div className="text-xs text-white/70">Keyword Density</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <FileText className="w-4 h-4 text-white/70" />
            </div>
            <div className="text-xl font-bold">{result.readabilityScore}</div>
            <div className="text-xs text-white/70">Readability</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="w-4 h-4 text-white/70" />
            </div>
            <div className="text-xl font-bold">
              {result.categories.filter(c => c.passed).length}/{result.categories.length}
            </div>
            <div className="text-xs text-white/70">Checks Passed</div>
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between px-2 mb-3">
          <h4 className="text-sm font-medium text-muted-foreground">
            Score Breakdown (by importance)
          </h4>
          <Badge variant="outline" className="text-xs">
            Weighted scoring
          </Badge>
        </div>
        
        {sortedCategories.map((category) => (
          <Collapsible 
            key={category.name}
            open={expandedCategories.includes(category.name)}
          >
            <CollapsibleTrigger 
              onClick={() => toggleCategory(category.name)}
              className="w-full"
            >
              <div className={`flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer ${
                !category.passed ? 'bg-destructive/5' : ''
              }`}>
                <div className="flex items-center gap-3">
                  {getStatusIcon(category)}
                  <div className="text-left">
                    <span className="font-medium text-foreground">{category.name}</span>
                    {category.weight > 1.2 && (
                      <Badge variant="secondary" className="ml-2 text-[10px] py-0 px-1">
                        High Priority
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-20 hidden sm:block">
                    <Progress 
                      value={getCategoryPercentage(category)} 
                      className="h-1.5"
                    />
                  </div>
                  <span className={`text-sm font-medium min-w-[3rem] text-right ${getScoreColor(
                    getCategoryPercentage(category)
                  )}`}>
                    {getCategoryPercentage(category)}%
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
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2 pb-2 border-b border-border">
                    <span>Score: {category.score}/{category.maxScore} points</span>
                    <span>Weight: {category.weight}x</span>
                  </div>
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
            <h4 className="font-medium text-foreground">Priority Recommendations</h4>
            <Badge variant="secondary" className="text-xs">
              By impact
            </Badge>
          </div>
          
          <div className="space-y-2">
            {(showAllRecommendations 
              ? result.recommendations 
              : result.recommendations.slice(0, 4)
            ).map((rec, idx) => (
              <div 
                key={idx} 
                className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg"
              >
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-medium text-primary">{idx + 1}</span>
                </div>
                <span className="text-sm text-foreground">{rec}</span>
              </div>
            ))}
          </div>
          
          {result.recommendations.length > 4 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAllRecommendations(!showAllRecommendations)}
              className="w-full mt-2 text-primary"
            >
              {showAllRecommendations ? "Show Less" : `Show ${result.recommendations.length - 4} More`}
            </Button>
          )}
        </div>
      )}

      {/* Industry Standards Note */}
      <div className="border-t border-border p-4 bg-muted/30">
        <p className="text-xs text-muted-foreground text-center">
          Scoring based on industry-standard ATS criteria including keyword optimization, 
          action verbs, quantifiable achievements, and formatting best practices.
        </p>
      </div>
    </div>
  );
};
