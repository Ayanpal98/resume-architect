import { useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
  FileText, Upload, Users, Target, CheckCircle2, XCircle, 
  AlertCircle, ArrowUpDown, Search, Briefcase, TrendingUp, 
  ChevronDown, ChevronUp, Sparkles, BarChart3, Building2,
  Download, Filter, Star, ThumbsUp, ThumbsDown, Clock,
  GraduationCap, Award, MessageSquare, DollarSign, Trash2,
  Eye, UserCheck, UserX, Minus, FileOutput, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useDropzone } from "react-dropzone";
import * as mammoth from "mammoth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

interface EducationDetails {
  degree: string;
  field: string;
  institution: string;
  certifications: string[];
}

interface StrengthItem {
  point: string;
  evidence: string;
}

interface ConcernItem {
  point: string;
  severity: "low" | "medium" | "high";
  mitigation: string;
}

interface FitScore {
  technical: number;
  cultural: number;
  growth: number;
}

interface CompetitiveAnalysis {
  percentile: string;
  standoutFactors: string[];
  improvementAreas: string[];
}

interface CandidateAnalysis {
  id: string;
  fileName: string;
  extractedText?: string;
  docxUrl?: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  currentRole: string;
  totalExperience: string;
  overallScore: number;
  technicalSkillsScore: number;
  experienceScore: number;
  educationScore: number;
  softSkillsScore: number;
  atsScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  partialSkills: string[];
  experienceSummary: string;
  educationDetails: EducationDetails;
  strengths: StrengthItem[];
  concerns: ConcernItem[];
  keyAchievements: string[];
  interviewQuestions: string[];
  salaryRange: string;
  recommendation: "highly_recommended" | "recommended" | "consider" | "not_recommended";
  recommendationReason: string;
  fitScore: FitScore;
  competitiveAnalysis: CompetitiveAnalysis;
  status: "pending" | "shortlisted" | "rejected";
}

const Recruiter = () => {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [requiredExperience, setRequiredExperience] = useState("");
  const [requiredEducation, setRequiredEducation] = useState("");
  const [candidates, setCandidates] = useState<CandidateAnalysis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalyzingIndex, setCurrentAnalyzingIndex] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [sortBy, setSortBy] = useState<"score" | "name" | "experience">("score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "shortlisted" | "rejected" | "pending">("all");
  const [filterRecommendation, setFilterRecommendation] = useState<"all" | "highly_recommended" | "recommended" | "consider" | "not_recommended">("all");
  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [convertingFiles, setConvertingFiles] = useState<Set<number>>(new Set());
  const [convertedFiles, setConvertedFiles] = useState<Map<number, { url: string; fileName: string }>>(new Map());
  const { toast } = useToast();

  const extractTextFromFile = async (file: File): Promise<string> => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (extension === 'txt') {
      return await file.text();
    } else if (extension === 'docx') {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } else if (extension === 'pdf') {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        text += textContent.items.map((item: any) => item.str).join(' ') + '\n';
      }
      
      return text;
    }
    
    throw new Error(`Unsupported file type: ${extension}`);
  };

  const convertToDocx = async (file: File, index: number) => {
    setConvertingFiles(prev => new Set(prev).add(index));
    
    try {
      const text = await extractTextFromFile(file);
      
      const { data, error } = await supabase.functions.invoke("convert-to-docx", {
        body: { text, fileName: file.name },
      });

      if (error) throw new Error(error.message);

      // Convert base64 to blob URL
      const binaryString = atob(data.docxBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const url = URL.createObjectURL(blob);

      setConvertedFiles(prev => new Map(prev).set(index, { url, fileName: data.fileName }));
      
      toast({
        title: "Conversion Complete",
        description: `${file.name} converted to DOCX successfully.`,
      });
    } catch (error) {
      console.error("Conversion error:", error);
      toast({
        title: "Conversion Failed",
        description: `Could not convert ${file.name} to DOCX.`,
        variant: "destructive",
      });
    } finally {
      setConvertingFiles(prev => {
        const next = new Set(prev);
        next.delete(index);
        return next;
      });
    }
  };

  const downloadDocx = (index: number) => {
    const converted = convertedFiles.get(index);
    if (converted) {
      const a = document.createElement("a");
      a.href = converted.url;
      a.download = converted.fileName;
      a.click();
    }
  };

  const convertAllToDocx = async () => {
    for (let i = 0; i < uploadedFiles.length; i++) {
      if (!convertedFiles.has(i)) {
        await convertToDocx(uploadedFiles[i], i);
      }
    }
  };

  const analyzeCandidate = async (file: File): Promise<CandidateAnalysis> => {
    const text = await extractTextFromFile(file);
    
    const { data, error } = await supabase.functions.invoke("candidate-screening", {
      body: { 
        resumeText: text, 
        jobDescription,
        jobTitle,
        requiredExperience,
        requiredEducation
      },
    });

    if (error) {
      throw new Error(error.message || "Failed to analyze candidate");
    }

    return {
      id: crypto.randomUUID(),
      fileName: file.name,
      status: "pending",
      extractedText: text,
      ...data.analysis,
    };
  };

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Job Description Required",
        description: "Please enter a job description to analyze candidates against.",
        variant: "destructive",
      });
      return;
    }

    if (uploadedFiles.length === 0) {
      toast({
        title: "No Resumes Uploaded",
        description: "Please upload at least one resume to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setCandidates([]);
    setCurrentAnalyzingIndex(0);

    try {
      const results: CandidateAnalysis[] = [];
      
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        setCurrentAnalyzingIndex(i + 1);
        
        try {
          const analysis = await analyzeCandidate(file);
          results.push(analysis);
          setCandidates([...results]);
        } catch (error) {
          console.error(`Error analyzing ${file.name}:`, error);
          toast({
            title: `Error analyzing ${file.name}`,
            description: "This resume could not be processed.",
            variant: "destructive",
          });
        }
      }

      if (results.length > 0) {
        toast({
          title: "Analysis Complete",
          description: `Successfully analyzed ${results.length} of ${uploadedFiles.length} candidate(s).`,
        });
      }
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "An error occurred while analyzing candidates.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      setCurrentAnalyzingIndex(0);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    multiple: true,
  });

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setConvertedFiles(prev => {
      const next = new Map(prev);
      next.delete(index);
      return next;
    });
  };

  const updateCandidateStatus = (id: string, status: CandidateAnalysis["status"]) => {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  const getRecommendationBadge = (recommendation: CandidateAnalysis["recommendation"]) => {
    switch (recommendation) {
      case "highly_recommended":
        return <Badge className="bg-accent text-accent-foreground"><Star className="w-3 h-3 mr-1" />Highly Recommended</Badge>;
      case "recommended":
        return <Badge className="bg-primary text-primary-foreground"><ThumbsUp className="w-3 h-3 mr-1" />Recommended</Badge>;
      case "consider":
        return <Badge variant="secondary"><Minus className="w-3 h-3 mr-1" />Consider</Badge>;
      case "not_recommended":
        return <Badge variant="destructive"><ThumbsDown className="w-3 h-3 mr-1" />Not Recommended</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-accent";
    if (score >= 80) return "text-primary";
    if (score >= 70) return "text-blue-500";
    if (score >= 60) return "text-yellow-500";
    return "text-destructive";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Exceptional";
    if (score >= 80) return "Strong";
    if (score >= 70) return "Good";
    if (score >= 60) return "Fair";
    return "Weak";
  };

  const filteredCandidates = useMemo(() => {
    return candidates
      .filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             c.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             c.currentRole?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === "all" || c.status === filterStatus;
        const matchesRecommendation = filterRecommendation === "all" || c.recommendation === filterRecommendation;
        return matchesSearch && matchesStatus && matchesRecommendation;
      })
      .sort((a, b) => {
        if (sortBy === "score") {
          return sortOrder === "desc" ? b.overallScore - a.overallScore : a.overallScore - b.overallScore;
        }
        if (sortBy === "experience") {
          const aExp = parseInt(a.totalExperience) || 0;
          const bExp = parseInt(b.totalExperience) || 0;
          return sortOrder === "desc" ? bExp - aExp : aExp - bExp;
        }
        return sortOrder === "desc" ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name);
      });
  }, [candidates, searchTerm, filterStatus, filterRecommendation, sortBy, sortOrder]);

  const stats = useMemo(() => ({
    total: candidates.length,
    shortlisted: candidates.filter(c => c.status === "shortlisted").length,
    rejected: candidates.filter(c => c.status === "rejected").length,
    avgScore: candidates.length > 0 
      ? Math.round(candidates.reduce((sum, c) => sum + c.overallScore, 0) / candidates.length)
      : 0,
    highlyRecommended: candidates.filter(c => c.recommendation === "highly_recommended").length,
    recommended: candidates.filter(c => c.recommendation === "recommended").length,
  }), [candidates]);

  const generateReport = () => {
    const reportData = filteredCandidates.map((c, index) => ({
      Rank: index + 1,
      Name: c.name,
      Email: c.email,
      Phone: c.phone,
      CurrentRole: c.currentRole,
      Experience: c.totalExperience,
      OverallScore: c.overallScore,
      TechnicalScore: c.technicalSkillsScore,
      ExperienceScore: c.experienceScore,
      EducationScore: c.educationScore,
      Recommendation: c.recommendation.replace("_", " ").toUpperCase(),
      Status: c.status.toUpperCase(),
      MatchedSkills: c.matchedSkills.join("; "),
      MissingSkills: c.missingSkills.join("; "),
      Strengths: c.strengths.map(s => s.point).join("; "),
      Concerns: c.concerns.map(c => c.point).join("; "),
    }));

    const headers = Object.keys(reportData[0] || {});
    const csvContent = [
      headers.join(","),
      ...reportData.map(row => headers.map(h => `"${(row as any)[h] || ''}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `candidate-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Report Downloaded",
      description: `Exported ${filteredCandidates.length} candidate(s) to CSV.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/welcome" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-hero rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold text-foreground">ATSFy</span>
          </Link>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="hidden sm:flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              Recruiter Dashboard
            </Badge>
            {candidates.length > 0 && (
              <Button variant="outline" size="sm" onClick={generateReport}>
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
              AI-Powered Candidate Screening
            </h1>
            <p className="text-muted-foreground">
              Industry-standard evaluation using SHRM-aligned criteria for objective candidate assessment
            </p>
          </div>

          {/* Stats Bar */}
          {candidates.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
              <Card className="p-4">
                <div className="text-2xl font-bold text-foreground">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Total Analyzed</div>
              </Card>
              <Card className="p-4">
                <div className="text-2xl font-bold text-accent">{stats.highlyRecommended}</div>
                <div className="text-sm text-muted-foreground">Highly Recommended</div>
              </Card>
              <Card className="p-4">
                <div className="text-2xl font-bold text-primary">{stats.recommended}</div>
                <div className="text-sm text-muted-foreground">Recommended</div>
              </Card>
              <Card className="p-4">
                <div className="text-2xl font-bold text-accent">{stats.shortlisted}</div>
                <div className="text-sm text-muted-foreground">Shortlisted</div>
              </Card>
              <Card className="p-4">
                <div className="text-2xl font-bold text-destructive">{stats.rejected}</div>
                <div className="text-sm text-muted-foreground">Rejected</div>
              </Card>
              <Card className="p-4">
                <div className={`text-2xl font-bold ${getScoreColor(stats.avgScore)}`}>{stats.avgScore}%</div>
                <div className="text-sm text-muted-foreground">Avg Score</div>
              </Card>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Panel - Job Configuration */}
            <div className="lg:col-span-1 space-y-6">
              {/* Job Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-primary" />
                    Job Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Job Title
                    </label>
                    <Input
                      placeholder="e.g., Senior Software Engineer"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Required Experience
                    </label>
                    <Select value={requiredExperience} onValueChange={setRequiredExperience}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                        <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                        <SelectItem value="senior">Senior (6-10 years)</SelectItem>
                        <SelectItem value="lead">Lead/Principal (10+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Required Education
                    </label>
                    <Select value={requiredEducation} onValueChange={setRequiredEducation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select education level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="highschool">High School Diploma</SelectItem>
                        <SelectItem value="associate">Associate's Degree</SelectItem>
                        <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                        <SelectItem value="master">Master's Degree</SelectItem>
                        <SelectItem value="phd">Ph.D. or Doctorate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">
                      Job Description *
                    </label>
                    <Textarea
                      placeholder="Paste the complete job description including responsibilities, requirements, qualifications, and preferred skills..."
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      className="min-h-[180px] resize-none"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Resume Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-primary" />
                    Upload Resumes
                    {uploadedFiles.length > 0 && (
                      <Badge variant="secondary">{uploadedFiles.length}</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                      isDragActive
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      {isDragActive
                        ? "Drop the files here..."
                        : "Drag & drop resumes or click to select"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, DOCX, TXT • Bulk upload supported
                    </p>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">
                          {uploadedFiles.length} file(s) ready
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setUploadedFiles([])}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="max-h-[150px] overflow-y-auto space-y-2">
                        {uploadedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-muted rounded-lg"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                              <span className="text-sm truncate">{file.name}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="h-6 w-6 p-0"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    variant="hero"
                    className="w-full"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || uploadedFiles.length === 0 || !jobDescription.trim()}
                  >
                    {isAnalyzing ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-spin" />
                        Analyzing {currentAnalyzingIndex}/{uploadedFiles.length}...
                      </>
                    ) : (
                      <>
                        <Target className="w-4 h-4" />
                        Screen {uploadedFiles.length > 1 ? `${uploadedFiles.length} Candidates` : "Candidate"}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Results */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        Candidate Rankings
                      </CardTitle>
                      
                      {candidates.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              placeholder="Search..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-9 w-[140px]"
                            />
                          </div>
                          <Select value={filterRecommendation} onValueChange={(v: any) => setFilterRecommendation(v)}>
                            <SelectTrigger className="w-[130px]">
                              <Filter className="w-4 h-4 mr-1" />
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All</SelectItem>
                              <SelectItem value="highly_recommended">Highly Rec.</SelectItem>
                              <SelectItem value="recommended">Recommended</SelectItem>
                              <SelectItem value="consider">Consider</SelectItem>
                              <SelectItem value="not_recommended">Not Rec.</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                          >
                            <ArrowUpDown className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {candidates.length === 0 && !isAnalyzing ? (
                    <div className="text-center py-16">
                      <BarChart3 className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        No Candidates Analyzed Yet
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                        Upload resumes and configure job requirements to start AI-powered screening
                      </p>
                    </div>
                  ) : isAnalyzing && candidates.length === 0 ? (
                    <div className="text-center py-16">
                      <Sparkles className="w-16 h-16 text-primary animate-pulse mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        Analyzing Candidates...
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Processing resume {currentAnalyzingIndex} of {uploadedFiles.length}
                      </p>
                      <Progress value={(currentAnalyzingIndex / uploadedFiles.length) * 100} className="mt-4 max-w-xs mx-auto" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredCandidates.map((candidate, index) => (
                        <CandidateCard
                          key={candidate.id}
                          candidate={candidate}
                          rank={index + 1}
                          isExpanded={expandedCandidate === candidate.id}
                          onToggle={() => setExpandedCandidate(
                            expandedCandidate === candidate.id ? null : candidate.id
                          )}
                          onUpdateStatus={updateCandidateStatus}
                          getScoreColor={getScoreColor}
                          getScoreLabel={getScoreLabel}
                          getRecommendationBadge={getRecommendationBadge}
                          activeTab={activeTab}
                          setActiveTab={setActiveTab}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

interface CandidateCardProps {
  candidate: CandidateAnalysis;
  rank: number;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdateStatus: (id: string, status: CandidateAnalysis["status"]) => void;
  getScoreColor: (score: number) => string;
  getScoreLabel: (score: number) => string;
  getRecommendationBadge: (rec: CandidateAnalysis["recommendation"]) => JSX.Element;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const CandidateCard = ({
  candidate,
  rank,
  isExpanded,
  onToggle,
  onUpdateStatus,
  getScoreColor,
  getScoreLabel,
  getRecommendationBadge,
  activeTab,
  setActiveTab,
}: CandidateCardProps) => {
  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${
      candidate.status === "shortlisted" ? "border-accent bg-accent/5" :
      candidate.status === "rejected" ? "border-destructive/50 bg-destructive/5" :
      "border-border"
    }`}>
      {/* Header */}
      <div
        className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center ${getScoreColor(candidate.overallScore)} bg-current/10`}>
              <span className="text-xl font-bold">{candidate.overallScore}</span>
              <span className="text-[10px] opacity-70">#{rank}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h4 className="font-semibold text-foreground truncate">
                  {candidate.name || candidate.fileName}
                </h4>
                {getRecommendationBadge(candidate.recommendation)}
                {candidate.status === "shortlisted" && (
                  <Badge className="bg-accent/20 text-accent border-accent/30">
                    <UserCheck className="w-3 h-3 mr-1" />Shortlisted
                  </Badge>
                )}
                {candidate.status === "rejected" && (
                  <Badge variant="outline" className="text-destructive border-destructive/30">
                    <UserX className="w-3 h-3 mr-1" />Rejected
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-2 truncate">
                {candidate.currentRole && <span>{candidate.currentRole}</span>}
                {candidate.totalExperience && <span> • {candidate.totalExperience}</span>}
                {candidate.location && <span> • {candidate.location}</span>}
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  Technical: {candidate.technicalSkillsScore}%
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Experience: {candidate.experienceScore}%
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Education: {candidate.educationScore}%
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={candidate.status === "shortlisted" ? "default" : "outline"}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onUpdateStatus(candidate.id, candidate.status === "shortlisted" ? "pending" : "shortlisted");
              }}
              className="h-8"
            >
              <ThumbsUp className="w-4 h-4" />
            </Button>
            <Button
              variant={candidate.status === "rejected" ? "destructive" : "outline"}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onUpdateStatus(candidate.id, candidate.status === "rejected" ? "pending" : "rejected");
              }}
              className="h-8"
            >
              <ThumbsDown className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-border bg-muted/30">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
              <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                <Eye className="w-4 h-4 mr-1" />Overview
              </TabsTrigger>
              <TabsTrigger value="skills" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                <Target className="w-4 h-4 mr-1" />Skills
              </TabsTrigger>
              <TabsTrigger value="assessment" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                <BarChart3 className="w-4 h-4 mr-1" />Assessment
              </TabsTrigger>
              <TabsTrigger value="interview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                <MessageSquare className="w-4 h-4 mr-1" />Interview
              </TabsTrigger>
            </TabsList>

            <div className="p-4">
              <TabsContent value="overview" className="mt-0 space-y-4">
                {/* Contact & Basic Info */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-foreground">Contact Information</h5>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>{candidate.email || "Email not provided"}</p>
                      <p>{candidate.phone || "Phone not provided"}</p>
                      <p>{candidate.location || "Location not provided"}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-foreground">Experience Summary</h5>
                    <p className="text-sm text-muted-foreground">{candidate.experienceSummary}</p>
                  </div>
                </div>

                <Separator />

                {/* Score Breakdown */}
                <div>
                  <h5 className="text-sm font-medium text-foreground mb-3">Score Breakdown</h5>
                  <div className="grid sm:grid-cols-5 gap-3">
                    {[
                      { label: "Technical Skills", score: candidate.technicalSkillsScore, weight: "30%" },
                      { label: "Experience", score: candidate.experienceScore, weight: "25%" },
                      { label: "Education", score: candidate.educationScore, weight: "15%" },
                      { label: "Soft Skills", score: candidate.softSkillsScore, weight: "15%" },
                      { label: "ATS Score", score: candidate.atsScore, weight: "10%" },
                    ].map((item) => (
                      <div key={item.label} className="text-center">
                        <div className={`text-2xl font-bold ${getScoreColor(item.score)}`}>{item.score}</div>
                        <div className="text-xs text-muted-foreground">{item.label}</div>
                        <div className="text-[10px] text-muted-foreground/70">({item.weight})</div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Fit Score */}
                <div>
                  <h5 className="text-sm font-medium text-foreground mb-3">Fit Analysis</h5>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Technical Fit</span>
                        <span className={getScoreColor(candidate.fitScore.technical)}>{candidate.fitScore.technical}%</span>
                      </div>
                      <Progress value={candidate.fitScore.technical} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Cultural Fit</span>
                        <span className={getScoreColor(candidate.fitScore.cultural)}>{candidate.fitScore.cultural}%</span>
                      </div>
                      <Progress value={candidate.fitScore.cultural} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Growth Potential</span>
                        <span className={getScoreColor(candidate.fitScore.growth)}>{candidate.fitScore.growth}%</span>
                      </div>
                      <Progress value={candidate.fitScore.growth} className="h-2" />
                    </div>
                  </div>
                </div>

                {/* Recommendation */}
                <div className="p-4 rounded-lg bg-card border">
                  <div className="flex items-start gap-3">
                    <Award className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <h5 className="font-medium text-foreground mb-1">Recommendation</h5>
                      <p className="text-sm text-muted-foreground">{candidate.recommendationReason}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="skills" className="mt-0 space-y-4">
                {/* Matched Skills */}
                <div>
                  <h5 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent" />
                    Matched Skills ({candidate.matchedSkills.length})
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {candidate.matchedSkills.map((skill, i) => (
                      <Badge key={i} className="bg-accent/10 text-accent border-accent/30">
                        {skill}
                      </Badge>
                    ))}
                    {candidate.matchedSkills.length === 0 && (
                      <p className="text-sm text-muted-foreground">No matching skills identified</p>
                    )}
                  </div>
                </div>

                {/* Partial Skills */}
                {candidate.partialSkills && candidate.partialSkills.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                      Partial Matches ({candidate.partialSkills.length})
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {candidate.partialSkills.map((skill, i) => (
                        <Badge key={i} variant="secondary" className="border-yellow-500/30">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Skills */}
                <div>
                  <h5 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-destructive" />
                    Missing Skills ({candidate.missingSkills.length})
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {candidate.missingSkills.map((skill, i) => (
                      <Badge key={i} variant="outline" className="text-destructive border-destructive/30">
                        {skill}
                      </Badge>
                    ))}
                    {candidate.missingSkills.length === 0 && (
                      <p className="text-sm text-muted-foreground">All required skills matched!</p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Education */}
                <div>
                  <h5 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-primary" />
                    Education & Certifications
                  </h5>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p><strong>Degree:</strong> {candidate.educationDetails.degree || "Not specified"} in {candidate.educationDetails.field || "N/A"}</p>
                    <p><strong>Institution:</strong> {candidate.educationDetails.institution || "Not specified"}</p>
                    {candidate.educationDetails.certifications && candidate.educationDetails.certifications.length > 0 && (
                      <div>
                        <strong>Certifications:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {candidate.educationDetails.certifications.map((cert, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">{cert}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="assessment" className="mt-0 space-y-4">
                {/* Strengths */}
                <div>
                  <h5 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-accent" />
                    Key Strengths
                  </h5>
                  <div className="space-y-2">
                    {candidate.strengths.map((s, i) => (
                      <div key={i} className="p-3 bg-accent/5 border border-accent/20 rounded-lg">
                        <p className="text-sm font-medium text-foreground">{s.point}</p>
                        {s.evidence && <p className="text-xs text-muted-foreground mt-1">{s.evidence}</p>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Concerns */}
                <div>
                  <h5 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    Concerns & Red Flags
                  </h5>
                  <div className="space-y-2">
                    {candidate.concerns.map((c, i) => (
                      <div key={i} className={`p-3 rounded-lg border ${
                        c.severity === "high" ? "bg-destructive/5 border-destructive/20" :
                        c.severity === "medium" ? "bg-yellow-500/5 border-yellow-500/20" :
                        "bg-muted border-border"
                      }`}>
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-foreground">{c.point}</p>
                          <Badge variant="outline" className={`text-xs ${
                            c.severity === "high" ? "text-destructive" :
                            c.severity === "medium" ? "text-yellow-600" :
                            "text-muted-foreground"
                          }`}>
                            {c.severity}
                          </Badge>
                        </div>
                        {c.mitigation && <p className="text-xs text-muted-foreground mt-1">💡 {c.mitigation}</p>}
                      </div>
                    ))}
                    {candidate.concerns.length === 0 && (
                      <p className="text-sm text-muted-foreground">No significant concerns identified</p>
                    )}
                  </div>
                </div>

                {/* Key Achievements */}
                {candidate.keyAchievements && candidate.keyAchievements.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <Award className="w-4 h-4 text-primary" />
                      Key Achievements
                    </h5>
                    <ul className="space-y-1">
                      {candidate.keyAchievements.map((a, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <CheckCircle2 className="w-3 h-3 text-accent mt-1 flex-shrink-0" />
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Competitive Analysis */}
                {candidate.competitiveAnalysis && (
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <h5 className="text-sm font-medium text-foreground mb-2">Competitive Position</h5>
                    <p className="text-sm text-muted-foreground mb-2">
                      This candidate ranks in the <strong>{candidate.competitiveAnalysis.percentile}</strong> of typical applicants for this role.
                    </p>
                    {candidate.competitiveAnalysis.standoutFactors.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        <strong>Standout:</strong> {candidate.competitiveAnalysis.standoutFactors.join(", ")}
                      </p>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="interview" className="mt-0 space-y-4">
                {/* Suggested Interview Questions */}
                <div>
                  <h5 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    Suggested Interview Questions
                  </h5>
                  <div className="space-y-2">
                    {candidate.interviewQuestions.map((q, i) => (
                      <div key={i} className="p-3 bg-card border rounded-lg">
                        <p className="text-sm text-foreground">
                          <span className="font-medium text-primary mr-2">Q{i + 1}:</span>
                          {q}
                        </p>
                      </div>
                    ))}
                    {candidate.interviewQuestions.length === 0 && (
                      <p className="text-sm text-muted-foreground">No specific questions generated</p>
                    )}
                  </div>
                </div>

                {/* Salary Expectations */}
                {candidate.salaryRange && (
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-primary" />
                      <h5 className="text-sm font-medium text-foreground">Market Salary Range</h5>
                    </div>
                    <p className="text-sm text-muted-foreground">{candidate.salaryRange}</p>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default Recruiter;
