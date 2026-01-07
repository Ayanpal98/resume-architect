import { useState } from "react";
import { 
  Target, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  TrendingUp,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Wrench,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { analyzeJobMatch, JobMatchAnalysis } from "@/lib/aiService";
import { toast } from "sonner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface JobMatchPanelProps {
  resumeData: any;
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-accent";
  if (score >= 60) return "text-yellow-500";
  if (score >= 40) return "text-orange-500";
  return "text-destructive";
};

const getScoreBgColor = (score: number) => {
  if (score >= 80) return "bg-accent";
  if (score >= 60) return "bg-yellow-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-destructive";
};

export const JobMatchPanel = ({ 
  resumeData, 
  jobDescription,
  onJobDescriptionChange 
}: JobMatchPanelProps) => {
  const [analysis, setAnalysis] = useState<JobMatchAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(["skills", "experience"]);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please enter a job description first");
      return;
    }

    setIsLoading(true);
    try {
      const result = await analyzeJobMatch(resumeData, jobDescription);
      setAnalysis(result);
      toast.success(`Job match: ${result.overallMatch}%`);
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to analyze job match");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">Job Match Analysis</h2>
        <p className="text-muted-foreground">See how well your resume matches a specific job description.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Job Description *
          </label>
          <Textarea
            placeholder="Paste the job description here to analyze how well your resume matches..."
            value={jobDescription}
            onChange={(e) => onJobDescriptionChange(e.target.value)}
            rows={6}
            className="resize-none"
          />
        </div>

        <Button 
          onClick={handleAnalyze} 
          disabled={isLoading || !jobDescription.trim()}
          className="w-full"
          variant="hero"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" />
              Analyze Match
            </>
          )}
        </Button>
      </div>

      {analysis && (
        <div className="space-y-4">
          {/* Overall Score */}
          <div className={`${getScoreBgColor(analysis.overallMatch)} rounded-2xl p-6 text-white`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                <span className="font-medium">Overall Match Score</span>
              </div>
              <div className="text-4xl font-bold">{analysis.overallMatch}%</div>
            </div>
            <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-700"
                style={{ width: `${analysis.overallMatch}%` }}
              />
            </div>
            <p className="mt-4 text-white/90 text-sm">{analysis.summary}</p>
          </div>

          {/* Skills Match */}
          <Collapsible open={expandedSections.includes("skills")}>
            <CollapsibleTrigger 
              onClick={() => toggleSection("skills")}
              className="w-full"
            >
              <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Wrench className="w-5 h-5 text-primary" />
                  <span className="font-medium text-foreground">Skills Match</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-bold ${getScoreColor(analysis.skillsMatch.score)}`}>
                    {analysis.skillsMatch.score}%
                  </span>
                  {expandedSections.includes("skills") ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 p-4 bg-muted/30 rounded-xl space-y-4">
                {analysis.skillsMatch.matched.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-accent" />
                      <span className="text-sm font-medium text-foreground">Matched Skills</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {analysis.skillsMatch.matched.map((skill, idx) => (
                        <span key={idx} className="px-2 py-1 bg-accent/20 text-accent text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {analysis.skillsMatch.missing.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="w-4 h-4 text-destructive" />
                      <span className="text-sm font-medium text-foreground">Missing Skills</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {analysis.skillsMatch.missing.map((skill, idx) => (
                        <span key={idx} className="px-2 py-1 bg-destructive/20 text-destructive text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {analysis.skillsMatch.suggestions.length > 0 && (
                  <div className="pt-2 border-t border-border">
                    {analysis.skillsMatch.suggestions.map((sug, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{sug}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Experience Match */}
          <Collapsible open={expandedSections.includes("experience")}>
            <CollapsibleTrigger 
              onClick={() => toggleSection("experience")}
              className="w-full"
            >
              <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-primary" />
                  <span className="font-medium text-foreground">Experience Match</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-bold ${getScoreColor(analysis.experienceMatch.score)}`}>
                    {analysis.experienceMatch.score}%
                  </span>
                  {expandedSections.includes("experience") ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 p-4 bg-muted/30 rounded-xl space-y-4">
                {analysis.experienceMatch.strengths.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-accent" />
                      <span className="text-sm font-medium text-foreground">Strengths</span>
                    </div>
                    <ul className="space-y-1">
                      {analysis.experienceMatch.strengths.map((strength, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground pl-6">• {strength}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {analysis.experienceMatch.gaps.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium text-foreground">Gaps</span>
                    </div>
                    <ul className="space-y-1">
                      {analysis.experienceMatch.gaps.map((gap, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground pl-6">• {gap}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Keywords */}
          <Collapsible open={expandedSections.includes("keywords")}>
            <CollapsibleTrigger 
              onClick={() => toggleSection("keywords")}
              className="w-full"
            >
              <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5 text-primary" />
                  <span className="font-medium text-foreground">Keyword Analysis</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-bold ${getScoreColor(analysis.keywordAnalysis.density)}`}>
                    {analysis.keywordAnalysis.density}%
                  </span>
                  {expandedSections.includes("keywords") ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 p-4 bg-muted/30 rounded-xl space-y-4">
                {analysis.keywordAnalysis.found.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-accent" />
                      <span className="text-sm font-medium text-foreground">Keywords Found</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {analysis.keywordAnalysis.found.map((kw, idx) => (
                        <span key={idx} className="px-2 py-1 bg-accent/20 text-accent text-xs rounded-full">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {analysis.keywordAnalysis.missing.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="w-4 h-4 text-destructive" />
                      <span className="text-sm font-medium text-foreground">Missing Keywords</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {analysis.keywordAnalysis.missing.map((kw, idx) => (
                        <span key={idx} className="px-2 py-1 bg-destructive/20 text-destructive text-xs rounded-full">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Recommendations */}
          {analysis.recommendations.length > 0 && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">Top Recommendations</span>
              </div>
              <ul className="space-y-2">
                {analysis.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {!analysis && !isLoading && (
        <div className="bg-primary/5 rounded-xl p-6 border border-primary/20 text-center">
          <Target className="w-12 h-12 text-primary/50 mx-auto mb-3" />
          <h3 className="font-medium text-foreground mb-1">No analysis yet</h3>
          <p className="text-sm text-muted-foreground">
            Paste a job description and click analyze to see how well your resume matches
          </p>
        </div>
      )}
    </div>
  );
};
