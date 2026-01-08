import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  FileText,
  Target,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Download,
  Edit3,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { ATSCheckResult, checkATSCompatibility, getScoreColor, getScoreBgColor } from "@/lib/atsChecker";
import { ResumeData } from "@/lib/pdfGenerator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface LocationState {
  resumeData: ResumeData;
  atsResult: ATSCheckResult;
  fileName?: string;
}

const ATSAnalysis = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;

  const [resumeData, setResumeData] = useState<ResumeData | null>(state?.resumeData || null);
  const [atsResult, setAtsResult] = useState<ATSCheckResult | null>(state?.atsResult || null);
  const [fileName] = useState(state?.fileName || "Uploaded Resume");
  const [jobDescription, setJobDescription] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [showAllRecommendations, setShowAllRecommendations] = useState(false);

  useEffect(() => {
    if (!resumeData || !atsResult) {
      navigate("/builder");
    }
  }, [resumeData, atsResult, navigate]);

  const toggleCategory = (name: string) => {
    setExpandedCategories((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const handleContinueToBuilder = () => {
    navigate("/builder", { state: { resumeData, atsResult } });
  };

  // Recalculate ATS score when job description changes
  const handleAnalyzeWithJob = () => {
    if (resumeData) {
      const newResult = checkATSCompatibility(resumeData);
      setAtsResult(newResult);
    }
  };

  if (!resumeData || !atsResult) {
    return null;
  }

  const getStatusIcon = (passed: boolean) => {
    return passed ? (
      <CheckCircle2 className="w-5 h-5 text-accent" />
    ) : (
      <XCircle className="w-5 h-5 text-destructive" />
    );
  };

  const getScoreStatus = (score: number) => {
    if (score >= 85) return { label: "Excellent", color: "text-accent" };
    if (score >= 70) return { label: "Good", color: "text-primary" };
    if (score >= 50) return { label: "Fair", color: "text-warning" };
    return { label: "Needs Improvement", color: "text-destructive" };
  };

  const status = getScoreStatus(atsResult.overallScore);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/builder">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Builder
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-display font-bold text-foreground">ATS Analysis</span>
            </div>
          </div>
          <Button variant="hero" size="sm" onClick={handleContinueToBuilder}>
            <Edit3 className="w-4 h-4 mr-2" />
            Edit Resume
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-6xl">
          {/* Score Hero Section */}
          <div className="bg-card rounded-3xl border border-border p-8 mb-8 shadow-lg">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-sm text-muted-foreground mb-4">
                  <FileText className="w-4 h-4" />
                  {fileName}
                </div>
                <h1 className="text-4xl font-display font-bold text-foreground mb-2">
                  Your ATS Score
                </h1>
                <p className="text-muted-foreground mb-6">
                  Based on industry-standard ATS compatibility checks
                </p>
                <div className="flex items-center gap-4 justify-center md:justify-start">
                  <div
                    className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white ${getScoreBgColor(
                      atsResult.overallScore
                    )}`}
                  >
                    {atsResult.overallScore}
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${status.color}`}>
                      {status.label}
                    </div>
                    <p className="text-muted-foreground">
                      {atsResult.overallScore >= 70
                        ? "Good chance to pass ATS filters"
                        : "Improvements needed for better results"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-bold text-foreground">
                    {atsResult.categories.filter((c) => c.passed).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Categories Passed</div>
                </div>
                <div className="bg-muted/50 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-bold text-foreground">
                    {atsResult.categories.length - atsResult.categories.filter((c) => c.passed).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Need Attention</div>
                </div>
                <div className="bg-muted/50 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-bold text-foreground">
                    {atsResult.recommendations.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Recommendations</div>
                </div>
                <div className="bg-muted/50 rounded-2xl p-4 text-center">
                  <div className="text-3xl font-bold text-foreground">
                    {resumeData.skills.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Skills Listed</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Analysis */}
            <div className="lg:col-span-2 space-y-6">
              {/* Category Breakdown */}
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                <h2 className="text-xl font-display font-semibold text-foreground mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Detailed Category Analysis
                </h2>
                <div className="space-y-4">
                  {atsResult.categories.map((category) => (
                    <Collapsible
                      key={category.name}
                      open={expandedCategories.includes(category.name)}
                      onOpenChange={() => toggleCategory(category.name)}
                    >
                      <div
                        className={`rounded-xl border p-4 transition-all ${
                          category.passed
                            ? "border-accent/30 bg-accent/5"
                            : "border-destructive/30 bg-destructive/5"
                        }`}
                      >
                        <CollapsibleTrigger className="w-full">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {getStatusIcon(category.passed)}
                              <div className="text-left">
                                <div className="font-medium text-foreground">
                                  {category.name}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {category.score}/{category.maxScore} points
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="w-32 hidden sm:block">
                                <Progress
                                  value={(category.score / category.maxScore) * 100}
                                  className="h-2"
                                />
                              </div>
                              <Badge
                                variant={category.passed ? "default" : "destructive"}
                                className="text-xs"
                              >
                                {Math.round((category.score / category.maxScore) * 100)}%
                              </Badge>
                              {expandedCategories.includes(category.name) ? (
                                <ChevronUp className="w-5 h-5 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          {category.issues.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-border">
                              <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-warning" />
                                Issues Found
                              </h4>
                              <ul className="space-y-2">
                                {category.issues.map((issue, idx) => (
                                  <li
                                    key={idx}
                                    className="text-sm text-muted-foreground flex items-start gap-2"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2 shrink-0" />
                                    {issue}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  ))}
                </div>
              </div>

              {/* Resume Summary */}
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                <h2 className="text-xl font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Resume Overview
                </h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-foreground mb-2">Personal Info</h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p><span className="text-foreground">Name:</span> {resumeData.personalInfo.fullName || "Not provided"}</p>
                      <p><span className="text-foreground">Email:</span> {resumeData.personalInfo.email || "Not provided"}</p>
                      <p><span className="text-foreground">Phone:</span> {resumeData.personalInfo.phone || "Not provided"}</p>
                      <p><span className="text-foreground">Location:</span> {resumeData.personalInfo.location || "Not provided"}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-2">Content Stats</h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p><span className="text-foreground">Experience:</span> {resumeData.experience.length} positions</p>
                      <p><span className="text-foreground">Education:</span> {resumeData.education.length} entries</p>
                      <p><span className="text-foreground">Skills:</span> {resumeData.skills.length} skills listed</p>
                      <p><span className="text-foreground">Summary:</span> {resumeData.summary ? `${resumeData.summary.split(" ").length} words` : "Not provided"}</p>
                    </div>
                  </div>
                </div>

                {resumeData.skills.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-medium text-foreground mb-3">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {resumeData.skills.slice(0, 15).map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {resumeData.skills.length > 15 && (
                        <Badge variant="outline" className="text-xs">
                          +{resumeData.skills.length - 15} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Job Preferences */}
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                <h2 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Job Preferences
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Target Job Title
                    </label>
                    <Input
                      placeholder="e.g., Software Engineer"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Job Description (Optional)
                    </label>
                    <Textarea
                      placeholder="Paste a job description to analyze keyword match..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      rows={6}
                    />
                  </div>
                  <Button
                    onClick={handleAnalyzeWithJob}
                    className="w-full"
                    variant="outline"
                    disabled={!jobDescription}
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Analyze Match
                  </Button>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-primary/5 rounded-2xl border border-primary/20 p-6">
                <h2 className="text-lg font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Top Recommendations
                </h2>
                <ul className="space-y-3">
                  {(showAllRecommendations
                    ? atsResult.recommendations
                    : atsResult.recommendations.slice(0, 4)
                  ).map((rec, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 text-sm text-muted-foreground"
                    >
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-medium text-primary">
                          {idx + 1}
                        </span>
                      </div>
                      {rec}
                    </li>
                  ))}
                </ul>
                {atsResult.recommendations.length > 4 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-4"
                    onClick={() => setShowAllRecommendations(!showAllRecommendations)}
                  >
                    {showAllRecommendations ? "Show Less" : `Show All (${atsResult.recommendations.length})`}
                  </Button>
                )}
              </div>

              {/* Actions */}
              <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-3">
                <Button variant="hero" className="w-full" onClick={handleContinueToBuilder}>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit & Improve Resume
                </Button>
                <Link to="/builder" className="block">
                  <Button variant="outline" className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    Start Fresh
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ATSAnalysis;
