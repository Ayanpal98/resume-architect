import { useState, useCallback, useMemo } from "react";
import { Seo } from "@/components/Seo";
import jsPDF from "jspdf";
import { addComplianceFooterBlock } from "@/lib/complianceFooter";
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
import { GhostScreeningPreview } from "@/components/GhostScreeningPreview";

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

const normalizePercentage = (value: unknown, fallback = 50) => {
  const numeric = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(numeric)) return fallback;
  if (numeric >= 0 && numeric <= 10) return Math.round(numeric * 10);

  return Math.max(0, Math.min(100, Math.round(numeric)));
};

const normalizeFitScore = (fitScore?: Partial<FitScore> | null): FitScore => ({
  technical: normalizePercentage(fitScore?.technical, 50),
  cultural: normalizePercentage(fitScore?.cultural, 50),
  growth: normalizePercentage(fitScore?.growth, 50),
});

const computeHiringConfidence = (c: { overallScore: number; fitScore: FitScore; technicalSkillsScore: number; experienceScore: number }) => {
  const fit = normalizeFitScore(c.fitScore);
  const raw = (c.overallScore * 0.35) + (fit.technical * 0.25) + (c.experienceScore * 0.2) + (fit.cultural * 0.1) + (fit.growth * 0.1);
  return Math.max(0, Math.min(100, Math.round(raw)));
};

const getConfidenceLabel = (score: number) => {
  if (score >= 85) return { label: "Very High", desc: "Strong hire signal — candidate exceeds most role requirements with minimal risk.", color: "text-green-600" };
  if (score >= 70) return { label: "High", desc: "Candidate is well-suited for the role. Proceed with confidence to final evaluation rounds.", color: "text-blue-600" };
  if (score >= 55) return { label: "Moderate", desc: "Candidate meets core requirements but has gaps. Targeted interview probing recommended.", color: "text-amber-600" };
  if (score >= 40) return { label: "Low", desc: "Significant gaps identified. Consider only if talent pool is limited or role requirements are flexible.", color: "text-orange-600" };
  return { label: "Very Low", desc: "Candidate does not meet minimum hiring criteria for this role.", color: "text-red-600" };
};

const getFinalHiringDecision = (c: CandidateAnalysis) => {
  const hcScore = computeHiringConfidence(c);
  const rec = c.recommendation;

  if (hcScore >= 75 && (rec === "highly_recommended" || rec === "recommended")) {
    return {
      decision: "HIRE" as const,
      icon: "✅",
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-200",
      pdfColor: "#0ea573",
      pdfBg: "#f0fdf4",
      justification: `Candidate demonstrates strong alignment with role requirements (Confidence: ${hcScore}%). Technical competencies, experience depth, and cultural indicators collectively support a positive hiring decision. Recommended to proceed with offer stage.`,
    };
  }

  if (hcScore >= 45 && (rec !== "not_recommended")) {
    return {
      decision: "HOLD" as const,
      icon: "⏸️",
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
      pdfColor: "#b7791f",
      pdfBg: "#fffaf0",
      justification: `Candidate shows potential but has identifiable gaps (Confidence: ${hcScore}%). Recommend additional evaluation rounds to assess fit in areas of concern before making a final commitment. Consider targeted skill assessments or panel interviews.`,
    };
  }

  return {
    decision: "REJECT" as const,
    icon: "❌",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    pdfColor: "#c53030",
    pdfBg: "#fff5f5",
    justification: `Candidate does not meet the minimum threshold for this role (Confidence: ${hcScore}%). Critical gaps in required competencies and/or experience make this candidate unsuitable for the position at this time. Recommend archiving for potential future roles if applicable.`,
  };
};

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
      const pdfWorker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker.default;
      
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

    // Increment candidate screening counter
    supabase.functions.invoke("bump-stat", { body: { stat_name: "candidate_screenings" } });

    return {
      id: crypto.randomUUID(),
      fileName: file.name,
      status: "pending",
      extractedText: text,
      ...data.analysis,
      fitScore: normalizeFitScore(data.analysis?.fitScore),
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
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    const ml = 15, mr = 15, cw = pw - ml - mr, bm = 20;
    let y = 15;
    let pn = 1;

    const C = {
      primary: "#1e3a5f", accent: "#0ea573", destructive: "#c53030",
      warning: "#b7791f", dark: "#1a202c", muted: "#718096",
      light: "#edf2f7", bg: "#f7fafc", white: "#ffffff",
      cardBg: "#ffffff", sectionBg: "#f0f4f8", headerBg: "#1e3a5f",
      divider: "#cbd5e0", subtleBg: "#fafbfc",
    };

    const checkPage = (n: number) => { if (y + n > ph - bm) { footer(); doc.addPage(); y = 15; } };

    const footer = () => {
      doc.setDrawColor(C.divider); doc.setLineWidth(0.3); doc.line(ml, ph - 14, pw - mr, ph - 14);
      doc.setFontSize(7); doc.setFont("helvetica", "normal"); doc.setTextColor(C.muted);
      doc.text(`ATSFy Technologies\u2122 \u2014 Candidate Screening Report`, ml, ph - 9);
      doc.text(`Page ${pn}`, pw / 2, ph - 9, { align: "center" });
      doc.text(new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), pw - mr, ph - 9, { align: "right" });
      pn++;
    };

    const wrap = (text: string, x: number, maxW: number, lh = 4) => {
      doc.splitTextToSize(text, maxW).forEach((line: string) => { checkPage(lh); doc.text(line, x, y); y += lh; });
    };

    const sectionHeader = (title: string, icon?: string) => {
      checkPage(14); y += 5;
      doc.setFillColor(C.sectionBg); doc.roundedRect(ml, y - 4, cw, 9, 2, 2, "F");
      doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(C.primary);
      doc.text(icon ? `${icon}  ${title}` : title, ml + 4, y + 2);
      y += 9;
    };


    const scoreBar = (x: number, barY: number, w: number, score: number, label: string) => {
      const barH = 4;
      doc.setFillColor(C.light); doc.roundedRect(x, barY, w, barH, 1.5, 1.5, "F");
      const fillW = (score / 100) * w;
      const col = score >= 80 ? C.accent : score >= 60 ? C.warning : C.destructive;
      doc.setFillColor(col); doc.roundedRect(x, barY, Math.max(fillW, 3), barH, 1.5, 1.5, "F");
      doc.setFontSize(6.5); doc.setFont("helvetica", "normal"); doc.setTextColor(C.muted);
      doc.text(label, x, barY - 1.5);
      doc.setFont("helvetica", "bold"); doc.setTextColor(col);
      doc.text(`${score}%`, x + w + 2, barY + 3);
    };

    const bulletItem = (text: string, color: string, indent = 2) => {
      checkPage(5);
      doc.setFillColor(color); doc.circle(ml + indent + 1, y - 1, 0.8, "F");
      doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(C.dark);
      const lines = doc.splitTextToSize(text, cw - indent - 6);
      lines.forEach((line: string, li: number) => {
        checkPage(3.5);
        doc.text(line, ml + indent + 4, y);
        y += 3.5;
        if (li === 0 && lines.length > 1) { /* continued lines already handled */ }
      });
    };

    // ===== COVER PAGE =====
    doc.setFillColor(C.headerBg); doc.rect(0, 0, pw, 50, "F");
    // Accent bar
    doc.setFillColor(C.accent); doc.rect(0, 50, pw, 2, "F");
    doc.setFontSize(24); doc.setFont("helvetica", "bold"); doc.setTextColor(C.white);
    doc.text("Candidate Screening Report", pw / 2, 22, { align: "center" });
    doc.setFontSize(11); doc.setFont("helvetica", "normal"); doc.setTextColor("#a0b4cc");
    doc.text(jobTitle ? `Position: ${jobTitle}` : "AI-Powered Candidate Analysis", pw / 2, 33, { align: "center" });
    doc.setFontSize(8); doc.setTextColor("#7a94b0");
    doc.text(`Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, pw / 2, 42, { align: "center" });
    y = 60;

    // Executive Summary Box
    doc.setFillColor(C.cardBg); doc.setDrawColor(C.divider);
    doc.roundedRect(ml, y, cw, 32, 3, 3, "FD");
    doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(C.primary);
    doc.text("Executive Summary", ml + 5, y + 7);
    doc.setDrawColor(C.accent); doc.setLineWidth(0.5); doc.line(ml + 5, y + 9, ml + 55, y + 9);

    // Stats grid (2x2)
    const statX1 = ml + 8, statX2 = ml + cw / 2 + 5;
    doc.setFontSize(18); doc.setFont("helvetica", "bold"); doc.setTextColor(C.primary);
    doc.text(`${filteredCandidates.length}`, statX1, y + 18);
    doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(C.muted);
    doc.text("Candidates Analyzed", statX1, y + 22);

    doc.setFontSize(18); doc.setFont("helvetica", "bold"); doc.setTextColor(C.accent);
    doc.text(`${stats.avgScore}%`, statX2, y + 18);
    doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(C.muted);
    doc.text("Average Score", statX2, y + 22);

    doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(C.dark);
    doc.text(`Shortlisted: ${stats.shortlisted}   |   Rejected: ${stats.rejected}   |   Highly Recommended: ${stats.highlyRecommended}   |   Recommended: ${stats.recommended}`, ml + 5, y + 29);
    y += 38;

    // ===== RANKING TABLE =====
    sectionHeader("CANDIDATE RANKING OVERVIEW");
    checkPage(12);
    const colWidths = [8, 48, 18, 34, 28, 34];
    const headers = ["#", "Candidate", "Score", "Recommendation", "Status", "Experience"];

    // Table header
    doc.setFillColor(C.primary); doc.rect(ml, y, cw, 8, "F");
    doc.setFontSize(7); doc.setFont("helvetica", "bold"); doc.setTextColor(C.white);
    let tx = ml;
    headers.forEach((h, i) => { doc.text(h, tx + 2, y + 5.5); tx += colWidths[i]; });
    y += 8;

    // Table rows
    filteredCandidates.forEach((c, i) => {
      checkPage(8);
      doc.setFillColor(i % 2 === 0 ? C.subtleBg : C.white); doc.rect(ml, y, cw, 7, "F");
      doc.setDrawColor(C.light); doc.line(ml, y + 7, pw - mr, y + 7);

      tx = ml;
      doc.setFontSize(7.5); doc.setFont("helvetica", "normal"); doc.setTextColor(C.dark);
      doc.text(`${i + 1}`, tx + 2, y + 5); tx += colWidths[0];
      doc.setFont("helvetica", "bold");
      doc.text(c.name.substring(0, 25), tx + 2, y + 5); tx += colWidths[1];

      const sc = c.overallScore >= 80 ? C.accent : c.overallScore >= 60 ? C.warning : C.destructive;
      doc.setTextColor(sc); doc.setFont("helvetica", "bold");
      doc.text(`${c.overallScore}%`, tx + 2, y + 5); tx += colWidths[2];

      doc.setFont("helvetica", "normal"); doc.setTextColor(C.dark);
      doc.text(c.recommendation.replace(/_/g, " "), tx + 2, y + 5); tx += colWidths[3];

      const stColor = c.status === "shortlisted" ? C.accent : c.status === "rejected" ? C.destructive : C.muted;
      doc.setTextColor(stColor); doc.setFont("helvetica", "bold");
      doc.text(c.status.toUpperCase(), tx + 2, y + 5); tx += colWidths[4];

      doc.setFont("helvetica", "normal"); doc.setTextColor(C.dark);
      doc.text(c.totalExperience || "N/A", tx + 2, y + 5);
      y += 7;
    });
    y += 5;

    // ===== DETAILED PROFILES =====
    filteredCandidates.forEach((c, idx) => {
      footer(); doc.addPage(); y = 15;

      // Candidate header band
      doc.setFillColor(C.primary); doc.roundedRect(ml, y, cw, 14, 3, 3, "F");
      doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.setTextColor(C.white);
      doc.text(`${idx + 1}. ${c.name}`, ml + 5, y + 6);
      doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor("#a0b4cc");
      doc.text(`${c.currentRole || "N/A"}  \u2022  ${c.totalExperience || "N/A"} experience`, ml + 5, y + 11);

      // Score badge
      const scoreColor = c.overallScore >= 80 ? C.accent : c.overallScore >= 60 ? C.warning : C.destructive;
      const badgeX = pw - mr - 20;
      doc.setFillColor(scoreColor); doc.roundedRect(badgeX, y + 2, 16, 10, 2, 2, "F");
      doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(C.white);
      doc.text(`${c.overallScore}%`, badgeX + 8, y + 9, { align: "center" });
      y += 18;

      // Contact info card
      checkPage(16);
      doc.setFillColor(C.cardBg); doc.setDrawColor(C.divider);
      doc.roundedRect(ml, y, cw, 14, 2, 2, "FD");
      doc.setFontSize(7.5); doc.setFont("helvetica", "normal"); doc.setTextColor(C.dark);
      const contactParts = [c.email, c.phone, c.location].filter(Boolean).join("   \u2022   ");
      doc.text(contactParts || "No contact info available", ml + 4, y + 5.5);
      doc.setTextColor(C.muted); doc.setFontSize(7);
      doc.text(`Source: ${c.fileName}`, ml + 4, y + 10.5);
      y += 18;

      // Score breakdown with visual bars
      sectionHeader("SCORE BREAKDOWN");
      checkPage(40);
      const barAreaW = cw - 30;
      const scores = [
        { label: "Technical Skills", score: c.technicalSkillsScore },
        { label: "Experience Match", score: c.experienceScore },
        { label: "Education", score: c.educationScore },
        { label: "Soft Skills", score: c.softSkillsScore },
        { label: "ATS Compatibility", score: c.atsScore },
      ];
      scores.forEach((s) => {
        checkPage(9);
        scoreBar(ml + 24, y, barAreaW, s.score, s.label);
        y += 8;
      });
      y += 3;

      // Fit Assessment
      if (c.fitScore) {
        sectionHeader("FIT ASSESSMENT");
        const fitItems = [
          { label: "Technical Fit", score: c.fitScore.technical, desc: "Measures alignment of technical skills, tools, and domain expertise with role requirements." },
          { label: "Cultural Fit", score: c.fitScore.cultural, desc: "Evaluates alignment with team dynamics, communication style, and organizational values." },
          { label: "Growth Potential", score: c.fitScore.growth, desc: "Assesses learning agility, career trajectory, and potential to grow within the role." },
        ];
        fitItems.forEach((f) => {
          checkPage(18);
          const pct = normalizePercentage(f.score);
          const fitColor = pct >= 80 ? C.accent : pct >= 60 ? C.warning : C.destructive;
          
          // Score header line
          doc.setFontSize(8.5); doc.setFont("helvetica", "bold"); doc.setTextColor(C.dark);
          doc.text(f.label, ml + 2, y);
          doc.setTextColor(fitColor); doc.setFont("helvetica", "bold");
          doc.text(`${pct}%`, ml + cw - 12, y);
          y += 3;
          
          // Progress bar
          const barW = cw - 4;
          doc.setFillColor(C.light); doc.roundedRect(ml + 2, y, barW, 3.5, 1.5, 1.5, "F");
          doc.setFillColor(fitColor); doc.roundedRect(ml + 2, y, Math.max((pct / 100) * barW, 3), 3.5, 1.5, 1.5, "F");
          y += 5.5;
          
          // Explanation
          doc.setFontSize(7); doc.setFont("helvetica", "italic"); doc.setTextColor(C.muted);
          const descLines = doc.splitTextToSize(f.desc, cw - 8);
          descLines.forEach((line: string) => { checkPage(3.5); doc.text(line, ml + 4, y); y += 3.5; });
          y += 2;
        });
        y += 2;

        // Hiring Confidence Score
        checkPage(28);
        const hcScore = computeHiringConfidence(c);
        const hcInfo = getConfidenceLabel(hcScore);
        const hcColor = hcScore >= 85 ? C.accent : hcScore >= 70 ? C.primary : hcScore >= 55 ? C.warning : C.destructive;
        
        doc.setFillColor("#F0F4FF"); doc.setDrawColor(hcColor); doc.setLineWidth(1);
        doc.roundedRect(ml, y, cw, 24, 3, 3, "FD");
        doc.setFillColor(hcColor); doc.rect(ml, y, 4, 24, "F");
        
        doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(C.dark);
        doc.text("HIRING CONFIDENCE SCORE", ml + 8, y + 6);
        
        // Score circle
        const circleX = pw - mr - 18;
        doc.setFillColor(hcColor); doc.circle(circleX, y + 12, 8, "F");
        doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(C.white);
        doc.text(`${hcScore}%`, circleX, y + 13, { align: "center" });
        
        doc.setFontSize(8.5); doc.setFont("helvetica", "bold"); doc.setTextColor(hcColor);
        doc.text(hcInfo.label, ml + 8, y + 12);
        
        doc.setFontSize(7); doc.setFont("helvetica", "normal"); doc.setTextColor(C.muted);
        const hcDescLines = doc.splitTextToSize(hcInfo.desc, cw - 40);
        hcDescLines.forEach((line: string, i: number) => {
          doc.text(line, ml + 8, y + 17 + (i * 3.5));
        });
        y += 28;
      }

      // Recommendation
      checkPage(14);
      const recColor = c.recommendation === "highly_recommended" ? C.accent : c.recommendation === "recommended" ? C.primary : c.recommendation === "consider" ? C.warning : C.destructive;
      doc.setFillColor(C.cardBg); doc.setDrawColor(recColor); doc.setLineWidth(0.8);
      const recH = c.recommendationReason ? 16 : 10;
      doc.roundedRect(ml, y, cw, recH, 2, 2, "FD");
      // Left accent bar
      doc.setFillColor(recColor); doc.rect(ml, y, 3, recH, "F");
      doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(recColor);
      doc.text(`RECOMMENDATION: ${c.recommendation.replace(/_/g, " ").toUpperCase()}`, ml + 7, y + 5.5);
      if (c.recommendationReason) {
        doc.setFontSize(7.5); doc.setFont("helvetica", "normal"); doc.setTextColor(C.dark);
        const reasonLines = doc.splitTextToSize(c.recommendationReason, cw - 14);
        doc.text(reasonLines[0] || "", ml + 7, y + 11);
        if (reasonLines[1]) doc.text(reasonLines[1], ml + 7, y + 14.5);
      }
      y += recH + 4;

      // Skills section — two columns
      sectionHeader("SKILLS ANALYSIS");
      checkPage(14);
      const halfW = (cw - 4) / 2;

      // Matched skills (left)
      doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); doc.setTextColor(C.accent);
      doc.text("\u2713 MATCHED SKILLS", ml, y); 
      // Missing skills (right)
      doc.setTextColor(C.destructive);
      doc.text("\u2717 MISSING SKILLS", ml + halfW + 4, y);
      y += 4;

      const savedY = y;
      doc.setFontSize(7.5); doc.setFont("helvetica", "normal"); doc.setTextColor(C.dark);
      if (c.matchedSkills.length > 0) {
        c.matchedSkills.forEach(skill => {
          checkPage(3.5);
          doc.setTextColor(C.dark);
          doc.text(`\u2022  ${skill}`, ml + 2, y);
          y += 3.5;
        });
      } else {
        doc.setTextColor(C.muted); doc.text("None identified", ml + 2, y); y += 3.5;
      }
      const leftEndY = y;

      y = savedY;
      if (c.missingSkills.length > 0) {
        c.missingSkills.forEach(skill => {
          checkPage(3.5);
          doc.setTextColor(C.dark);
          doc.text(`\u2022  ${skill}`, ml + halfW + 6, y);
          y += 3.5;
        });
      } else {
        doc.setTextColor(C.muted); doc.text("None identified", ml + halfW + 6, y); y += 3.5;
      }
      y = Math.max(y, leftEndY) + 2;

      if (c.partialSkills && c.partialSkills.length > 0) {
        checkPage(8);
        doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); doc.setTextColor(C.warning);
        doc.text("\u25CB PARTIAL / DEVELOPING SKILLS", ml, y); y += 4;
        doc.setFont("helvetica", "normal"); doc.setTextColor(C.dark);
        wrap(c.partialSkills.join("  \u2022  "), ml + 2, cw - 4, 3.5);
        y += 2;
      }

      // Experience Summary
      if (c.experienceSummary) {
        sectionHeader("EXPERIENCE SUMMARY");
        doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(C.dark);
        wrap(c.experienceSummary, ml + 2, cw - 4, 3.8);
        y += 2;
      }

      // Education
      if (c.educationDetails) {
        sectionHeader("EDUCATION & CERTIFICATIONS");
        doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(C.dark);
        const eduLine = [c.educationDetails.degree, c.educationDetails.field, c.educationDetails.institution].filter(Boolean).join(" \u2014 ");
        if (eduLine) { wrap(eduLine, ml + 2, cw - 4, 3.8); }
        if (c.educationDetails.certifications?.length > 0) {
          y += 1;
          doc.setFont("helvetica", "bold"); doc.setTextColor(C.primary);
          doc.text("Certifications:", ml + 2, y); y += 3.5;
          doc.setFont("helvetica", "normal"); doc.setTextColor(C.dark);
          c.educationDetails.certifications.forEach(cert => {
            checkPage(4);
            doc.text(`\u2022  ${cert}`, ml + 4, y); y += 3.5;
          });
        }
        y += 2;
      }

      // Key Achievements
      if (c.keyAchievements?.length > 0) {
        sectionHeader("KEY ACHIEVEMENTS");
        c.keyAchievements.forEach(a => {
          bulletItem(a, C.accent, 2);
        });
        y += 2;
      }

      // Strengths
      if (c.strengths?.length > 0) {
        sectionHeader("STRENGTHS");
        c.strengths.forEach(s => {
          checkPage(10);
          doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(C.dark);
          bulletItem(s.point, C.accent, 2);
          if (s.evidence) {
            doc.setFontSize(7.5); doc.setFont("helvetica", "italic"); doc.setTextColor(C.muted);
            wrap(`Evidence: ${s.evidence}`, ml + 8, cw - 12, 3.5);
          }
        });
        y += 2;
      }

      // Concerns
      if (c.concerns?.length > 0) {
        sectionHeader("CONCERNS & RED FLAGS");
        c.concerns.forEach(con => {
          checkPage(10);
          const sevBg = con.severity === "high" ? "#fff5f5" : con.severity === "medium" ? "#fffaf0" : C.subtleBg;
          const sevColor = con.severity === "high" ? C.destructive : con.severity === "medium" ? C.warning : C.muted;
          doc.setFillColor(sevBg); doc.roundedRect(ml + 2, y - 2, cw - 4, 4, 1, 1, "F");
          doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); doc.setTextColor(sevColor);
          const sevLabel = `[${con.severity.toUpperCase()}]`;
          doc.text(sevLabel, ml + 4, y + 0.5);
          doc.setFont("helvetica", "normal"); doc.setTextColor(C.dark);
          const sevLabelW = doc.getTextWidth(sevLabel + " ");
          const conLines = doc.splitTextToSize(con.point, cw - sevLabelW - 10);
          doc.text(conLines[0] || "", ml + 4 + sevLabelW, y + 0.5);
          y += 4;
          if (conLines.length > 1) {
            conLines.slice(1).forEach((line: string) => { checkPage(3.5); doc.text(line, ml + 4 + sevLabelW, y); y += 3.5; });
          }
          if (con.mitigation) {
            doc.setFont("helvetica", "italic"); doc.setTextColor(C.muted); doc.setFontSize(7);
            wrap(`Mitigation: ${con.mitigation}`, ml + 8, cw - 12, 3.5);
          }
          y += 1;
        });
        y += 2;
      }

      // Competitive Analysis
      if (c.competitiveAnalysis) {
        sectionHeader("COMPETITIVE ANALYSIS");
        checkPage(8);
        doc.setFillColor(C.sectionBg); doc.roundedRect(ml, y, cw, 8, 2, 2, "F");
        doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(C.primary);
        doc.text(`Candidate Percentile: ${c.competitiveAnalysis.percentile}`, ml + 4, y + 5.5);
        y += 12;
        if (c.competitiveAnalysis.standoutFactors?.length > 0) {
          doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); doc.setTextColor(C.accent);
          doc.text("Standout Factors:", ml + 2, y); y += 4;
          c.competitiveAnalysis.standoutFactors.forEach(f => { bulletItem(f, C.accent, 4); });
          y += 2;
        }
        if (c.competitiveAnalysis.improvementAreas?.length > 0) {
          doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); doc.setTextColor(C.warning);
          doc.text("Areas to Probe:", ml + 2, y); y += 4;
          c.competitiveAnalysis.improvementAreas.forEach(a => { bulletItem(a, C.warning, 4); });
          y += 2;
        }
      }

      // Salary
      if (c.salaryRange) {
        checkPage(12);
        doc.setFillColor(C.sectionBg); doc.roundedRect(ml, y, cw, 10, 2, 2, "F");
        doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(C.muted);
        doc.text("EXPECTED SALARY RANGE", ml + 4, y + 4);
        doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(C.dark);
        doc.text(c.salaryRange, ml + 55, y + 4);
        y += 14;
      }

      // Interview Questions
      if (c.interviewQuestions?.length > 0) {
        sectionHeader("SUGGESTED INTERVIEW QUESTIONS");
        c.interviewQuestions.forEach((q, qi) => {
          checkPage(6);
          doc.setFontSize(7.5); doc.setFont("helvetica", "bold"); doc.setTextColor(C.primary);
          doc.text(`Q${qi + 1}.`, ml + 2, y);
          doc.setFont("helvetica", "normal"); doc.setTextColor(C.dark);
          const qLines = doc.splitTextToSize(q, cw - 14);
          qLines.forEach((line: string, li: number) => {
            checkPage(3.5);
            doc.text(line, ml + 10, y);
            y += 3.8;
          });
          y += 1;
        });
        y += 2;
      }

      // ===== FINAL HIRING DECISION =====
      const decision = getFinalHiringDecision(c);
      checkPage(34);
      y += 4;

      // Decision block
      doc.setFillColor(decision.pdfBg); doc.setDrawColor(decision.pdfColor); doc.setLineWidth(1.2);
      doc.roundedRect(ml, y, cw, 30, 3, 3, "FD");
      doc.setFillColor(decision.pdfColor); doc.rect(ml, y, 4, 30, "F");

      doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(C.dark);
      doc.text("FINAL HIRING DECISION", ml + 8, y + 7);

      // Decision badge
      const decBadgeX = pw - mr - 30;
      doc.setFillColor(decision.pdfColor); doc.roundedRect(decBadgeX, y + 2, 26, 8, 2, 2, "F");
      doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(C.white);
      doc.text(decision.decision, decBadgeX + 13, y + 7.5, { align: "center" });

      // Justification
      doc.setFontSize(7.5); doc.setFont("helvetica", "normal"); doc.setTextColor(C.dark);
      const justLines = doc.splitTextToSize(decision.justification, cw - 16);
      justLines.forEach((line: string, i: number) => {
        doc.text(line, ml + 8, y + 14 + (i * 3.5));
      });
      y += 34;

      // Status bar at bottom
      checkPage(12);
      const statusColor = c.status === "shortlisted" ? C.accent : c.status === "rejected" ? C.destructive : C.muted;
      doc.setDrawColor(statusColor); doc.setLineWidth(0.6);
      doc.setFillColor(C.cardBg); doc.roundedRect(ml, y, cw, 8, 2, 2, "FD");
      doc.setFillColor(statusColor); doc.rect(ml, y, 3, 8, "F");
      doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(statusColor);
      doc.text(`CURRENT STATUS: ${c.status.toUpperCase()}`, ml + 7, y + 5.5);
      y += 12;
    });

    // Compliance footer block (mandatory, on final page)
    addComplianceFooterBlock(doc, ml, mr, checkPage, () => y, (v) => { y = v; });

    footer();
    const dateStr = new Date().toISOString().split("T")[0];
    doc.save(`candidate-screening-report-${dateStr}.pdf`);

    toast({
      title: "Report Downloaded",
      description: `Exported ${filteredCandidates.length} candidate(s) to PDF.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo title={"Recruiter Screening Dashboard — ATSFy"} description={"Bulk candidate screening for hiring teams — parse resumes, score fit, and export ranked reports in minutes."} path={"/recruiter"} />
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
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={convertAllToDocx}
                            disabled={convertingFiles.size > 0}
                            className="text-xs"
                          >
                            <FileOutput className="w-3 h-3 mr-1" />
                            Convert All
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setUploadedFiles([]);
                              setConvertedFiles(new Map());
                            }}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="max-h-[200px] overflow-y-auto space-y-2">
                        {uploadedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-muted rounded-lg gap-2"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                              <div className="flex flex-col min-w-0">
                                <span className="text-sm truncate">{file.name}</span>
                                {convertedFiles.has(index) && (
                                  <span className="text-[10px] text-accent">✓ DOCX ready</span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {convertingFiles.has(index) ? (
                                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                              ) : convertedFiles.has(index) ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => downloadDocx(index)}
                                  className="h-6 w-6 p-0 text-accent hover:text-accent"
                                  title="Download DOCX"
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => convertToDocx(file, index)}
                                  className="h-6 w-6 p-0"
                                  title="Convert to DOCX"
                                >
                                  <FileOutput className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(index)}
                                className="h-6 w-6 p-0"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </div>
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
                    <GhostScreeningPreview />
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
                  {(() => {
                    const fitScore = normalizeFitScore(candidate.fitScore);

                    return (
                      <div className="grid sm:grid-cols-3 gap-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Technical Fit</span>
                            <span className={getScoreColor(fitScore.technical)}>{fitScore.technical}%</span>
                          </div>
                          <Progress value={fitScore.technical} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Cultural Fit</span>
                            <span className={getScoreColor(fitScore.cultural)}>{fitScore.cultural}%</span>
                          </div>
                          <Progress value={fitScore.cultural} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Growth Potential</span>
                            <span className={getScoreColor(fitScore.growth)}>{fitScore.growth}%</span>
                          </div>
                          <Progress value={fitScore.growth} className="h-2" />
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <Separator />

                {/* Hiring Confidence Score */}
                {(() => {
                  const hcScore = computeHiringConfidence(candidate);
                  const hcInfo = getConfidenceLabel(hcScore);
                  return (
                    <div className="p-4 rounded-lg border-2 bg-gradient-to-r from-primary/5 to-accent/5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-primary" />
                          <h5 className="font-semibold text-foreground">Hiring Confidence Score</h5>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-2xl font-extrabold ${hcInfo.color}`}>{hcScore}%</span>
                          <Badge variant={hcScore >= 70 ? "default" : "secondary"} className="text-xs">{hcInfo.label}</Badge>
                        </div>
                      </div>
                      <Progress value={hcScore} className="h-3 mb-2" />
                      <p className="text-xs text-muted-foreground">{hcInfo.desc}</p>
                    </div>
                  );
                })()}

                <Separator />

                {/* Final Hiring Decision */}
                {(() => {
                  const decision = getFinalHiringDecision(candidate);
                  return (
                    <div className={`p-5 rounded-xl border-2 ${decision.border} ${decision.bg}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{decision.icon}</span>
                          <h5 className="font-bold text-foreground text-base">Final Hiring Decision</h5>
                        </div>
                        <Badge className={`text-sm px-3 py-1 font-bold ${
                          decision.decision === "HIRE" ? "bg-green-600 text-white" :
                          decision.decision === "HOLD" ? "bg-amber-500 text-white" :
                          "bg-red-600 text-white"
                        }`}>
                          {decision.decision}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{decision.justification}</p>
                    </div>
                  );
                })()}

                <Separator />

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
