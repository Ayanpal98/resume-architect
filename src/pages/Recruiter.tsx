import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { 
  FileText, Upload, Users, Target, CheckCircle2, XCircle, 
  AlertCircle, ArrowUpDown, Search, Briefcase, TrendingUp, 
  ChevronDown, ChevronUp, Sparkles, BarChart3, Building2
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

interface CandidateAnalysis {
  id: string;
  fileName: string;
  name: string;
  email: string;
  phone: string;
  overallScore: number;
  skillsMatch: number;
  experienceMatch: number;
  educationMatch: number;
  matchedSkills: string[];
  missingSkills: string[];
  experience: string;
  education: string;
  strengths: string[];
  concerns: string[];
  recommendation: "highly_recommended" | "recommended" | "consider" | "not_recommended";
}

const Recruiter = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [candidates, setCandidates] = useState<CandidateAnalysis[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [sortBy, setSortBy] = useState<"score" | "name">("score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null);
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
      // For PDF, we'll extract text using pdfjs-dist
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

  const analyzeCandidate = async (file: File, jobDesc: string): Promise<CandidateAnalysis> => {
    const text = await extractTextFromFile(file);
    
    const { data, error } = await supabase.functions.invoke("candidate-screening", {
      body: { resumeText: text, jobDescription: jobDesc },
    });

    if (error) {
      throw new Error(error.message || "Failed to analyze candidate");
    }

    return {
      id: crypto.randomUUID(),
      fileName: file.name,
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

    try {
      const results: CandidateAnalysis[] = [];
      
      for (const file of uploadedFiles) {
        try {
          const analysis = await analyzeCandidate(file, jobDescription);
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
          description: `Successfully analyzed ${results.length} candidate(s).`,
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
  };

  const getRecommendationBadge = (recommendation: CandidateAnalysis["recommendation"]) => {
    switch (recommendation) {
      case "highly_recommended":
        return <Badge className="bg-accent text-accent-foreground">Highly Recommended</Badge>;
      case "recommended":
        return <Badge className="bg-primary text-primary-foreground">Recommended</Badge>;
      case "consider":
        return <Badge variant="secondary">Consider</Badge>;
      case "not_recommended":
        return <Badge variant="destructive">Not Recommended</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-accent";
    if (score >= 60) return "text-primary";
    if (score >= 40) return "text-yellow-500";
    return "text-destructive";
  };

  const sortedCandidates = [...candidates]
    .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.fileName.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "score") {
        return sortOrder === "desc" ? b.overallScore - a.overallScore : a.overallScore - b.overallScore;
      }
      return sortOrder === "desc" ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name);
    });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/welcome" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-hero rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold text-foreground">ResumeATS</span>
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden sm:flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              Recruiter Mode
            </Badge>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
              Candidate Screening Dashboard
            </h1>
            <p className="text-muted-foreground">
              Upload resumes and analyze candidates against your job requirements using AI
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Panel - Job Description & Upload */}
            <div className="lg:col-span-1 space-y-6">
              {/* Job Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-primary" />
                    Job Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Paste the job description here. Include required skills, experience levels, qualifications, and responsibilities..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="min-h-[200px] resize-none"
                  />
                </CardContent>
              </Card>

              {/* Resume Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-primary" />
                    Upload Resumes
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
                        : "Drag & drop resumes here, or click to select"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Supports PDF, DOCX, TXT
                    </p>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">
                        {uploadedFiles.length} file(s) ready
                      </p>
                      <div className="max-h-[200px] overflow-y-auto space-y-2">
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
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Target className="w-4 h-4" />
                        Analyze Candidates
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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      Candidate Rankings
                      {candidates.length > 0 && (
                        <Badge variant="secondary">{candidates.length}</Badge>
                      )}
                    </CardTitle>
                    
                    {candidates.length > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 w-[150px]"
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                          }}
                        >
                          <ArrowUpDown className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {candidates.length === 0 ? (
                    <div className="text-center py-12">
                      <BarChart3 className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        No Candidates Analyzed Yet
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                        Upload resumes and enter a job description to start screening candidates with AI
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sortedCandidates.map((candidate, index) => (
                        <div
                          key={candidate.id}
                          className="border border-border rounded-xl overflow-hidden"
                        >
                          {/* Candidate Header */}
                          <div
                            className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => setExpandedCandidate(
                              expandedCandidate === candidate.id ? null : candidate.id
                            )}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${getScoreColor(candidate.overallScore)} bg-current/10`}>
                                  {candidate.overallScore}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-foreground">
                                      {candidate.name || candidate.fileName}
                                    </h4>
                                    <span className="text-sm text-muted-foreground">
                                      #{index + 1}
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {candidate.email} {candidate.phone && `• ${candidate.phone}`}
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {getRecommendationBadge(candidate.recommendation)}
                                    <Badge variant="outline">
                                      Skills: {candidate.skillsMatch}%
                                    </Badge>
                                    <Badge variant="outline">
                                      Experience: {candidate.experienceMatch}%
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm">
                                {expandedCandidate === candidate.id ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>

                          {/* Expanded Details */}
                          {expandedCandidate === candidate.id && (
                            <div className="border-t border-border p-4 bg-muted/30 space-y-4">
                              {/* Score Breakdown */}
                              <div className="grid sm:grid-cols-3 gap-4">
                                <div>
                                  <p className="text-sm text-muted-foreground mb-1">Skills Match</p>
                                  <Progress value={candidate.skillsMatch} className="h-2" />
                                  <p className="text-sm font-medium mt-1">{candidate.skillsMatch}%</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground mb-1">Experience Match</p>
                                  <Progress value={candidate.experienceMatch} className="h-2" />
                                  <p className="text-sm font-medium mt-1">{candidate.experienceMatch}%</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground mb-1">Education Match</p>
                                  <Progress value={candidate.educationMatch} className="h-2" />
                                  <p className="text-sm font-medium mt-1">{candidate.educationMatch}%</p>
                                </div>
                              </div>

                              {/* Skills */}
                              <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                  <h5 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
                                    <CheckCircle2 className="w-4 h-4 text-accent" />
                                    Matched Skills
                                  </h5>
                                  <div className="flex flex-wrap gap-1">
                                    {candidate.matchedSkills.map((skill, i) => (
                                      <Badge key={i} variant="secondary" className="text-xs">
                                        {skill}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <h5 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
                                    <XCircle className="w-4 h-4 text-destructive" />
                                    Missing Skills
                                  </h5>
                                  <div className="flex flex-wrap gap-1">
                                    {candidate.missingSkills.map((skill, i) => (
                                      <Badge key={i} variant="outline" className="text-xs text-destructive">
                                        {skill}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Strengths & Concerns */}
                              <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                  <h5 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
                                    <TrendingUp className="w-4 h-4 text-accent" />
                                    Strengths
                                  </h5>
                                  <ul className="space-y-1">
                                    {candidate.strengths.map((strength, i) => (
                                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                        <CheckCircle2 className="w-3 h-3 text-accent mt-1 flex-shrink-0" />
                                        {strength}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <h5 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                                    Concerns
                                  </h5>
                                  <ul className="space-y-1">
                                    {candidate.concerns.map((concern, i) => (
                                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                        <AlertCircle className="w-3 h-3 text-yellow-500 mt-1 flex-shrink-0" />
                                        {concern}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
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


export default Recruiter;
