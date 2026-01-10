import { useState } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp,
  Target,
  Lightbulb,
  BarChart3,
  FileCheck,
  Zap,
  Check,
  X,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ATSCheckResult, 
  ATSCategory,
  getScoreColor,
  getScoreBgColor,
  getScoreLabel,
  getPassProbabilityLabel
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

// Keyword coverage analysis data structure
interface KeywordCoverage {
  coreSkillsMatched: string[];
  preferredSkillsMatched: string[];
  missingCriticalKeywords: string[];
}

// Parsing & Structure Clarity checklist
interface ParsingClarity {
  bulletPointsDetected: boolean;
  standardSectionHeadings: boolean;
  consistentFormatting: boolean;
}

// Helper to extract keyword coverage from result
const getKeywordCoverage = (result: ATSCheckResult): KeywordCoverage => {
  // Extract from skills category issues
  const skillsCategory = result.categories.find(c => c.name === "Skills Section");
  const keywordCategory = result.categories.find(c => c.name === "Keyword Optimization");
  
  const coreSkillsMatched: string[] = [];
  const preferredSkillsMatched: string[] = [];
  const missingCriticalKeywords: string[] = [];
  
  // Analyze recommendations and issues for keyword information
  result.recommendations.forEach(rec => {
    if (rec.toLowerCase().includes("action verb") || rec.toLowerCase().includes("keyword")) {
      missingCriticalKeywords.push(rec.split(" - ")[0] || rec.substring(0, 50));
    }
  });
  
  // If skills category passed well, assume core skills matched
  if (skillsCategory && skillsCategory.score / skillsCategory.maxScore >= 0.7) {
    coreSkillsMatched.push("Technical skills present");
    coreSkillsMatched.push("Skill variety detected");
  }
  
  if (keywordCategory && keywordCategory.score / keywordCategory.maxScore >= 0.6) {
    preferredSkillsMatched.push("Action verbs used");
    preferredSkillsMatched.push("Industry keywords detected");
  }
  
  // Extract missing items from issues
  const allIssues = result.categories.flatMap(c => c.issues);
  allIssues.forEach(issue => {
    if (issue.toLowerCase().includes("missing") || issue.toLowerCase().includes("no ")) {
      if (!missingCriticalKeywords.includes(issue)) {
        missingCriticalKeywords.push(issue);
      }
    }
  });
  
  return { coreSkillsMatched, preferredSkillsMatched, missingCriticalKeywords };
};

// Helper to extract parsing clarity from result
const getParsingClarity = (result: ATSCheckResult): ParsingClarity => {
  const formattingCategory = result.categories.find(c => c.name === "Formatting & Compatibility");
  const experienceCategory = result.categories.find(c => c.name === "Work Experience");
  
  const issues = [
    ...(formattingCategory?.issues || []),
    ...(experienceCategory?.issues || [])
  ].map(i => i.toLowerCase());
  
  return {
    bulletPointsDetected: !issues.some(i => i.includes("bullet") && (i.includes("missing") || i.includes("no "))),
    standardSectionHeadings: !issues.some(i => i.includes("section") || i.includes("header")),
    consistentFormatting: !issues.some(i => i.includes("format") || i.includes("inconsistent"))
  };
};

export const ATSScorePanel = ({ result, onDismiss }: ATSScorePanelProps) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [showAllRecommendations, setShowAllRecommendations] = useState(false);

  const keywordCoverage = getKeywordCoverage(result);
  const parsingClarity = getParsingClarity(result);

  const toggleCategory = (name: string) => {
    setExpandedCategories(prev => 
      prev.includes(name) 
        ? prev.filter(n => n !== name)
        : [...prev, name]
    );
  };

  const getStatusIcon = (category: ATSCategory) => {
    const ratio = category.score / category.maxScore;
    if (ratio >= 0.7) return <CheckCircle2 className="w-5 h-5 text-accent" />;
    if (ratio >= 0.5) return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    // Use amber/blue for low scores instead of red
    return <AlertCircle className="w-5 h-5 text-blue-500" />;
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
            <h3 className="text-lg font-display font-bold">ATS Pass Probability</h3>
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
          <div className="text-5xl font-bold">{result.overallScore}%</div>
          <div className="flex-1">
            <div className="text-white/90 font-medium mb-2">
              {getPassProbabilityLabel(result.overallScore)}
            </div>
            <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-700"
                style={{ width: `${result.overallScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quick Stats - Updated labels */}
        <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/20">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <BarChart3 className="w-4 h-4 text-white/70" />
            </div>
            <div className="text-xl font-bold">{getScoreLabel(result.overallScore)}</div>
            <div className="text-xs text-white/70">Pass Probability Level</div>
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

      {/* Keyword Coverage Analysis - New Section */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h4 className="font-medium text-foreground">Keyword Coverage Analysis</h4>
        </div>
        
        <div className="space-y-3">
          {/* Core Skills Matched */}
          <div className="bg-accent/10 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-foreground">Core Skills Matched</span>
              <Badge variant="secondary" className="text-xs ml-auto">
                {keywordCoverage.coreSkillsMatched.length}
              </Badge>
            </div>
            {keywordCoverage.coreSkillsMatched.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {keywordCoverage.coreSkillsMatched.map((skill, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs bg-accent/20 text-accent border-accent/30">
                    {skill}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Add more technical skills to improve matching</p>
            )}
          </div>

          {/* Preferred Skills Matched */}
          <div className="bg-primary/10 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Preferred Skills Matched</span>
              <Badge variant="secondary" className="text-xs ml-auto">
                {keywordCoverage.preferredSkillsMatched.length}
              </Badge>
            </div>
            {keywordCoverage.preferredSkillsMatched.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {keywordCoverage.preferredSkillsMatched.map((skill, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs bg-primary/20 text-primary border-primary/30">
                    {skill}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Use more action verbs and industry keywords</p>
            )}
          </div>

          {/* Missing Critical Keywords */}
          <div className="bg-amber-500/10 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-foreground">Missing Critical Keywords</span>
              <Badge variant="secondary" className="text-xs ml-auto">
                {keywordCoverage.missingCriticalKeywords.length}
              </Badge>
            </div>
            {keywordCoverage.missingCriticalKeywords.length > 0 ? (
              <div className="space-y-1">
                {keywordCoverage.missingCriticalKeywords.slice(0, 3).map((keyword, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <X className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                    <span>{keyword}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-accent">Great! No critical keywords missing</p>
            )}
          </div>
        </div>
      </div>

      {/* Parsing & Structure Clarity - New Checklist Section */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <FileCheck className="w-5 h-5 text-primary" />
          <h4 className="font-medium text-foreground">Parsing & Structure Clarity</h4>
        </div>
        
        <div className="space-y-2">
          <div className={`flex items-center gap-3 p-2 rounded-lg ${
            parsingClarity.bulletPointsDetected ? 'bg-accent/10' : 'bg-amber-500/10'
          }`}>
            {parsingClarity.bulletPointsDetected ? (
              <Check className="w-4 h-4 text-accent" />
            ) : (
              <X className="w-4 h-4 text-amber-500" />
            )}
            <span className="text-sm text-foreground">Bullet points detected</span>
          </div>
          
          <div className={`flex items-center gap-3 p-2 rounded-lg ${
            parsingClarity.standardSectionHeadings ? 'bg-accent/10' : 'bg-amber-500/10'
          }`}>
            {parsingClarity.standardSectionHeadings ? (
              <Check className="w-4 h-4 text-accent" />
            ) : (
              <X className="w-4 h-4 text-amber-500" />
            )}
            <span className="text-sm text-foreground">Standard section headings</span>
          </div>
          
          <div className={`flex items-center gap-3 p-2 rounded-lg ${
            parsingClarity.consistentFormatting ? 'bg-accent/10' : 'bg-amber-500/10'
          }`}>
            {parsingClarity.consistentFormatting ? (
              <Check className="w-4 h-4 text-accent" />
            ) : (
              <X className="w-4 h-4 text-amber-500" />
            )}
            <span className="text-sm text-foreground">Consistent formatting</span>
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
                !category.passed ? 'bg-amber-500/5' : ''
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
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
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

      {/* Probability Scale Legend */}
      <div className="border-t border-border p-4 bg-muted/30">
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mb-2">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span> Low (35-49)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> Moderate (50-69)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> High (70-85)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-accent"></span> Excellent (85+)
          </span>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          ATS Pass Probability based on industry-standard criteria including keyword coverage, structure, and formatting best practices.
        </p>
      </div>
    </div>
  );
};