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
  AlertCircle,
  Clock,
  TrendingUp,
  Shield,
  Sparkles,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ATSCheckResult, 
  ATSCategory,
  getScoreColor,
  getScoreBgColor,
  getScoreLabel,
  getPassProbabilityLabel
} from "@/lib/atsChecker";

// Priority recommendation structure
interface PriorityRecommendation {
  text: string;
  impact: 'high' | 'medium' | 'low';
  fixTime: '2 min' | '5 min' | '10 min';
  priority: 'must-fix' | 'strongly-recommend' | 'optional';
}

// Categorize recommendations by priority
const categorizeRecommendations = (recommendations: string[], categories: ATSCategory[]): PriorityRecommendation[] => {
  const prioritized: PriorityRecommendation[] = [];
  
  // Get critical issues from categories (ATS Blockers)
  categories.forEach(cat => {
    if (!cat.passed && cat.weight >= 1.2) {
      cat.issues.forEach(issue => {
        prioritized.push({
          text: issue,
          impact: 'high',
          fixTime: '5 min',
          priority: 'must-fix'
        });
      });
    }
  });
  
  // Categorize recommendations
  recommendations.forEach((rec, idx) => {
    const lowerRec = rec.toLowerCase();
    
    // Must fix (ATS Blockers) - critical formatting/contact issues
    if (lowerRec.includes('contact') || lowerRec.includes('email') || lowerRec.includes('phone') || 
        lowerRec.includes('missing') || lowerRec.includes('format') || lowerRec.includes('parse')) {
      if (!prioritized.some(p => p.text === rec)) {
        prioritized.push({
          text: rec,
          impact: 'high',
          fixTime: lowerRec.includes('contact') || lowerRec.includes('email') ? '2 min' : '5 min',
          priority: 'must-fix'
        });
      }
    }
    // Strongly recommend - skills, keywords, structure
    else if (lowerRec.includes('skill') || lowerRec.includes('keyword') || lowerRec.includes('action') ||
             lowerRec.includes('experience') || lowerRec.includes('quantif')) {
      prioritized.push({
        text: rec,
        impact: 'medium',
        fixTime: '5 min',
        priority: 'strongly-recommend'
      });
    }
    // Optional improvements - nice to have
    else {
      prioritized.push({
        text: rec,
        impact: 'low',
        fixTime: '10 min',
        priority: 'optional'
      });
    }
  });
  
  return prioritized;
};
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

  const prioritizedRecs = categorizeRecommendations(result.recommendations, result.categories);
  const mustFixRecs = prioritizedRecs.filter(r => r.priority === 'must-fix');
  const stronglyRecommendRecs = prioritizedRecs.filter(r => r.priority === 'strongly-recommend');
  const optionalRecs = prioritizedRecs.filter(r => r.priority === 'optional');

  const getImpactBadge = (impact: 'high' | 'medium' | 'low') => {
    switch (impact) {
      case 'high':
        return <Badge className="bg-accent/20 text-accent border-accent/30 text-[10px]">High Impact</Badge>;
      case 'medium':
        return <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30 text-[10px]">Medium Impact</Badge>;
      case 'low':
        return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30 text-[10px]">Low Impact</Badge>;
    }
  };

  // Use 35 as default display score for low readiness
  const displayScore = result.overallScore < 35 ? 35 : result.overallScore;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
      {/* Header with score */}
      <div className={`${getScoreBgColor(displayScore)} p-6 text-white`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6" />
            <h3 className="text-lg font-display font-bold">Your ATS Readiness</h3>
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
          <div className="text-5xl font-bold">{displayScore}%</div>
          <div className="flex-1">
            <div className="text-white/90 font-medium mb-2">
              {getPassProbabilityLabel(displayScore)}
            </div>
            <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-700"
                style={{ width: `${displayScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Encouraging Quick Win Alert */}
        {displayScore < 50 && (
          <div className="mt-4 p-3 bg-white/10 rounded-lg border border-white/20">
            <div className="flex items-start gap-2">
              <User className="w-5 h-5 text-white/90 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-white">Quick wins ahead! Let's boost your score 🚀</p>
                <p className="text-xs text-white/70 mt-1">Adding your contact info, experience, and skills will make a big difference</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats - Updated with new metrics */}
        <div className="grid grid-cols-4 gap-3 mt-6 pt-4 border-t border-white/20">
          <div className="text-center">
            <div className="text-lg font-bold">{getScoreLabel(displayScore)}</div>
            <div className="text-[10px] text-white/70">Readiness</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">{result.starScore || 0}%</div>
            <div className="text-[10px] text-white/70">STAR Score</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">{result.impactScore || 0}%</div>
            <div className="text-[10px] text-white/70">Impact</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">
              {result.categories.filter(c => c.passed).length}/{result.categories.length}
            </div>
            <div className="text-[10px] text-white/70">Checks</div>
          </div>
        </div>

        {/* Industry Match Banner */}
        {result.industryMatch && result.industryMatch.matchPercentage >= 20 && (
          <div className="mt-4 p-3 bg-white/10 rounded-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-white/90" />
                <span className="text-sm font-medium text-white capitalize">
                  {result.industryMatch.industry} Industry Match
                </span>
              </div>
              <Badge className="bg-white/20 text-white border-white/30">
                {result.industryMatch.matchPercentage}%
              </Badge>
            </div>
            {result.industryMatch.matchedKeywords.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {result.industryMatch.matchedKeywords.slice(0, 5).map((kw, idx) => (
                  <span key={idx} className="text-[10px] bg-white/15 px-1.5 py-0.5 rounded text-white/90">
                    {kw}
                  </span>
                ))}
                {result.industryMatch.matchedKeywords.length > 5 && (
                  <span className="text-[10px] text-white/60">
                    +{result.industryMatch.matchedKeywords.length - 5} more
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Keyword Coverage Analysis - New Section */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h4 className="font-medium text-foreground">Skills & Keywords Overview</h4>
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
              <p className="text-xs text-muted-foreground">Add your technical skills to shine brighter ✨</p>
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
              <p className="text-xs text-muted-foreground">Try adding action verbs like "led", "built", "achieved"</p>
            )}
          </div>

          {/* Keywords to Consider */}
          <div className="bg-amber-500/10 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-foreground">Consider Adding</span>
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
              <p className="text-xs text-accent">Fantastic! Your keywords look complete 🎉</p>
            )}
          </div>
        </div>
      </div>

      {/* STAR & Impact Metrics - New Section */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h4 className="font-medium text-foreground">Achievement Quality</h4>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {/* STAR Score */}
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">STAR Method</span>
              <span className={`text-sm font-bold ${(result.starScore || 0) >= 75 ? 'text-accent' : (result.starScore || 0) >= 50 ? 'text-primary' : 'text-muted-foreground'}`}>
                {result.starScore || 0}%
              </span>
            </div>
            <Progress value={result.starScore || 0} className="h-1.5" />
            <p className="text-[10px] text-muted-foreground mt-1.5">
              {(result.starScore || 0) >= 75 ? "Great storytelling structure!" : 
               (result.starScore || 0) >= 50 ? "Good, add more context/results" : 
               "Use Situation → Task → Action → Result"}
            </p>
          </div>

          {/* Impact Score */}
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Impact Metrics</span>
              <span className={`text-sm font-bold ${(result.impactScore || 0) >= 75 ? 'text-accent' : (result.impactScore || 0) >= 50 ? 'text-primary' : 'text-muted-foreground'}`}>
                {result.impactScore || 0}%
              </span>
            </div>
            <Progress value={result.impactScore || 0} className="h-1.5" />
            <p className="text-[10px] text-muted-foreground mt-1.5">
              {(result.impactScore || 0) >= 75 ? "Excellent quantified results!" : 
               (result.impactScore || 0) >= 50 ? "Add more $, %, numbers" : 
               "Quantify: revenue, users, time saved"}
            </p>
          </div>
        </div>

        {/* Quick tips based on scores */}
        {((result.starScore || 0) < 50 || (result.impactScore || 0) < 50) && (
          <div className="mt-3 p-2 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Pro tip:</span>{" "}
                {(result.impactScore || 0) < 50 
                  ? 'Try "Increased revenue by 25%" or "Reduced costs by $50K"'
                  : 'Start bullets with context: "When faced with..." then show your action & result'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Industry Keywords to Add - Only show if industry match exists */}
      {result.industryMatch && result.industryMatch.missingKeywords.length > 0 && (
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-primary" />
            <h4 className="font-medium text-foreground">Boost Your {result.industryMatch.industry.charAt(0).toUpperCase() + result.industryMatch.industry.slice(1)} Score</h4>
          </div>
          
          <p className="text-xs text-muted-foreground mb-3">
            Consider adding these high-value {result.industryMatch.industry} keywords:
          </p>
          
          <div className="flex flex-wrap gap-1.5">
            {result.industryMatch.missingKeywords.slice(0, 8).map((keyword, idx) => (
              <Badge 
                key={idx} 
                variant="outline" 
                className="text-xs bg-primary/5 text-primary/80 border-primary/20 cursor-pointer hover:bg-primary/10"
              >
                + {keyword}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Format & Structure Check */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <FileCheck className="w-5 h-5 text-primary" />
          <h4 className="font-medium text-foreground">Format & Structure Check</h4>
        </div>
        
        <div className="space-y-2">
          <div className={`flex items-center gap-3 p-2 rounded-lg ${
            parsingClarity.bulletPointsDetected ? 'bg-accent/10' : 'bg-muted/50'
          }`}>
            {parsingClarity.bulletPointsDetected ? (
              <Check className="w-4 h-4 text-accent" />
            ) : (
              <AlertCircle className="w-4 h-4 text-muted-foreground" />
            )}
            <span className="text-sm text-foreground">
              {parsingClarity.bulletPointsDetected ? 'Great use of bullet points!' : 'Try adding bullet points for clarity'}
            </span>
          </div>
          
          <div className={`flex items-center gap-3 p-2 rounded-lg ${
            parsingClarity.standardSectionHeadings ? 'bg-accent/10' : 'bg-muted/50'
          }`}>
            {parsingClarity.standardSectionHeadings ? (
              <Check className="w-4 h-4 text-accent" />
            ) : (
              <AlertCircle className="w-4 h-4 text-muted-foreground" />
            )}
            <span className="text-sm text-foreground">
              {parsingClarity.standardSectionHeadings ? 'Clear section headings' : 'Consider standard section headings'}
            </span>
          </div>
          
          <div className={`flex items-center gap-3 p-2 rounded-lg ${
            parsingClarity.consistentFormatting ? 'bg-accent/10' : 'bg-muted/50'
          }`}>
            {parsingClarity.consistentFormatting ? (
              <Check className="w-4 h-4 text-accent" />
            ) : (
              <AlertCircle className="w-4 h-4 text-muted-foreground" />
            )}
            <span className="text-sm text-foreground">
              {parsingClarity.consistentFormatting ? "Nice, consistent formatting!" : "Let's make formatting more consistent"}
            </span>
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between px-2 mb-3">
          <h4 className="text-sm font-medium text-muted-foreground">
            How you're doing in each area
          </h4>
          <Badge variant="outline" className="text-xs">
            Detailed breakdown
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
                      <span className="text-accent">Perfect! Nothing to improve here 🌟</span>
                    </div>
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>

      {/* Improvement Suggestions with Tabs */}
      {prioritizedRecs.length > 0 && (
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-primary" />
            <h4 className="font-medium text-foreground">Your Personalized Action Plan</h4>
          </div>
          
          <Tabs defaultValue="must-fix" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="must-fix" className="text-xs flex items-center gap-1.5 data-[state=active]:bg-red-500/10 data-[state=active]:text-red-600">
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Fix First</span>
                <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1.5">{mustFixRecs.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="strongly-recommend" className="text-xs flex items-center gap-1.5 data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-600">
                <TrendingUp className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">High Impact</span>
                <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1.5">{stronglyRecommendRecs.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="optional" className="text-xs flex items-center gap-1.5 data-[state=active]:bg-blue-500/10 data-[state=active]:text-blue-600">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Nice to Have</span>
                <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1.5">{optionalRecs.length}</Badge>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="must-fix" className="space-y-2">
              {mustFixRecs.length > 0 ? (
                mustFixRecs.slice(0, showAllRecommendations ? undefined : 4).map((rec, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-start gap-3 p-3 bg-red-500/5 border border-red-500/20 rounded-lg"
                  >
                    <div className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                      <Shield className="w-3.5 h-3.5 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{rec.text}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {getImpactBadge(rec.impact)}
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{rec.fixTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-accent" />
                  <p className="text-sm">Awesome! No blockers to worry about 🎉</p>
                </div>
              )}
              {mustFixRecs.length > 4 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllRecommendations(!showAllRecommendations)}
                  className="w-full mt-2 text-red-600"
                >
                  {showAllRecommendations ? "Show Less" : `Show ${mustFixRecs.length - 4} More`}
                </Button>
              )}
            </TabsContent>
            
            <TabsContent value="strongly-recommend" className="space-y-2">
              {stronglyRecommendRecs.length > 0 ? (
                stronglyRecommendRecs.slice(0, showAllRecommendations ? undefined : 4).map((rec, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-start gap-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg"
                  >
                    <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{rec.text}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {getImpactBadge(rec.impact)}
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{rec.fixTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-accent" />
                  <p className="text-sm">You've nailed the high-impact items! 💪</p>
                </div>
              )}
              {stronglyRecommendRecs.length > 4 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllRecommendations(!showAllRecommendations)}
                  className="w-full mt-2 text-amber-600"
                >
                  {showAllRecommendations ? "Show Less" : `Show ${stronglyRecommendRecs.length - 4} More`}
                </Button>
              )}
            </TabsContent>
            
            <TabsContent value="optional" className="space-y-2">
              {optionalRecs.length > 0 ? (
                optionalRecs.slice(0, showAllRecommendations ? undefined : 4).map((rec, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-start gap-3 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg"
                  >
                    <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{rec.text}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {getImpactBadge(rec.impact)}
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{rec.fixTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-accent" />
                  <p className="text-sm">Looking polished! No extras needed ✨</p>
                </div>
              )}
              {optionalRecs.length > 4 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllRecommendations(!showAllRecommendations)}
                  className="w-full mt-2 text-blue-600"
                >
                  {showAllRecommendations ? "Show Less" : `Show ${optionalRecs.length - 4} More`}
                </Button>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Readiness Scale Legend */}
      <div className="border-t border-border p-4 bg-muted/30">
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mb-2">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span> Getting Started
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> Making Progress
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Almost There
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-accent"></span> Interview Ready
          </span>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Your readiness score is based on how well recruiters and ATS systems can understand your resume. Keep improving! 🚀
        </p>
      </div>
    </div>
  );
};