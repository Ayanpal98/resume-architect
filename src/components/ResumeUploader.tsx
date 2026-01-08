import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  FileText,
  Loader2,
  CheckCircle2,
  Target,
  File,
  X,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { parseResumeFile } from "@/lib/aiService";
import { checkATSCompatibility, ATSCheckResult, getScoreBgColor } from "@/lib/atsChecker";
import { toast } from "sonner";

interface ResumeUploaderProps {
  onComplete?: (data: any, atsResult: ATSCheckResult) => void;
  navigateToAnalysis?: boolean;
}

type UploadStep = "idle" | "uploading" | "extracting" | "parsing" | "analyzing" | "complete" | "error";

export const ResumeUploader = ({ onComplete, navigateToAnalysis = true }: ResumeUploaderProps) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<UploadStep>("idle");
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);
  const [atsResult, setAtsResult] = useState<ATSCheckResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    const fileType = file.type;

    if (fileType === "text/plain") {
      return await file.text();
    }

    if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const mammoth = await import("mammoth");
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    }

    if (fileType === "application/pdf") {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item: any) => item.str).join(" ");
        text += pageText + "\n";
      }
      return text;
    }

    throw new Error("Unsupported file type. Please upload PDF, DOCX, or TXT files.");
  };

  const processFile = async (file: File) => {
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (!validTypes.includes(file.type)) {
      setError("Please upload a PDF, DOCX, or TXT file");
      setStep("error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      setStep("error");
      return;
    }

    setFileName(file.name);
    setFileSize(formatFileSize(file.size));
    setError(null);

    try {
      // Step 1: Upload/Read file
      setStep("uploading");
      setProgress(10);
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Step 2: Extract text
      setStep("extracting");
      setProgress(30);
      const text = await extractTextFromFile(file);

      if (!text || text.trim().length < 50) {
        throw new Error("Could not extract enough text from the file");
      }

      // Step 3: Parse with AI
      setStep("parsing");
      setProgress(50);
      const importedData = await parseResumeFile(text);

      // Add IDs to experience and education items
      if (importedData.experience) {
        importedData.experience = importedData.experience.map((exp: any) => ({
          ...exp,
          id: crypto.randomUUID(),
        }));
      }
      if (importedData.education) {
        importedData.education = importedData.education.map((edu: any) => ({
          ...edu,
          id: crypto.randomUUID(),
        }));
      }

      setProgress(75);

      // Step 4: Analyze ATS
      setStep("analyzing");
      const atsCheckResult = checkATSCompatibility({
        personalInfo: importedData.personalInfo || {},
        summary: importedData.summary || "",
        experience: importedData.experience || [],
        education: importedData.education || [],
        skills: importedData.skills || [],
      });

      setProgress(100);
      setParsedData(importedData);
      setAtsResult(atsCheckResult);
      setStep("complete");

      toast.success(`Resume analyzed! ATS Score: ${atsCheckResult.overallScore}/100`);

      // Navigate or callback
      if (navigateToAnalysis) {
        setTimeout(() => {
          navigate("/ats-analysis", {
            state: {
              resumeData: importedData,
              atsResult: atsCheckResult,
              fileName: file.name,
            },
          });
        }, 1000);
      } else if (onComplete) {
        onComplete(importedData, atsCheckResult);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Failed to process resume");
      setStep("error");
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleReset = () => {
    setStep("idle");
    setProgress(0);
    setFileName("");
    setFileSize("");
    setError(null);
    setParsedData(null);
    setAtsResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getStepLabel = (): string => {
    switch (step) {
      case "uploading":
        return "Reading file...";
      case "extracting":
        return "Extracting text content...";
      case "parsing":
        return "AI is parsing your resume...";
      case "analyzing":
        return "Running ATS analysis...";
      case "complete":
        return "Analysis complete!";
      default:
        return "";
    }
  };

  // Error state
  if (step === "error") {
    return (
      <div className="relative border-2 border-destructive/50 rounded-2xl p-8 text-center bg-destructive/5">
        <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <h3 className="text-lg font-display font-semibold text-foreground mb-2">
          Upload Failed
        </h3>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={handleReset} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  // Complete state
  if (step === "complete" && atsResult) {
    return (
      <div className="relative border-2 border-accent/50 rounded-2xl p-8 text-center bg-accent/5">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white ${getScoreBgColor(
              atsResult.overallScore
            )}`}
          >
            {atsResult.overallScore}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-5 h-5 text-accent" />
              <span className="font-semibold text-foreground">Analysis Complete</span>
            </div>
            <p className="text-sm text-muted-foreground">{fileName}</p>
            <p className="text-xs text-muted-foreground">{fileSize}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {atsResult.categories.slice(0, 3).map((cat) => (
            <div key={cat.name} className="bg-background rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-foreground">
                {Math.round((cat.score / cat.maxScore) * 100)}%
              </div>
              <div className="text-xs text-muted-foreground">{cat.name}</div>
            </div>
          ))}
        </div>

        {navigateToAnalysis ? (
          <p className="text-sm text-primary">Redirecting to detailed analysis...</p>
        ) : (
          <div className="flex gap-3 justify-center">
            <Button variant="hero" onClick={() => onComplete?.(parsedData, atsResult)}>
              <Target className="w-4 h-4 mr-2" />
              Apply to Resume
            </Button>
            <Button variant="outline" onClick={handleReset}>
              Upload Different File
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Processing state
  if (step !== "idle") {
    return (
      <div className="relative border-2 border-primary/50 rounded-2xl p-8 text-center bg-primary/5">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
        <h3 className="text-lg font-display font-semibold text-foreground mb-2">
          {getStepLabel()}
        </h3>
        <div className="flex items-center gap-3 justify-center mb-4">
          <File className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{fileName}</span>
        </div>
        <div className="max-w-xs mx-auto">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">{progress}% complete</p>
        </div>

        {/* Processing steps indicator */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {["uploading", "extracting", "parsing", "analyzing"].map((s, idx) => (
            <div
              key={s}
              className={`w-2 h-2 rounded-full transition-all ${
                step === s
                  ? "bg-primary w-4"
                  : ["uploading", "extracting", "parsing", "analyzing"].indexOf(step) > idx
                  ? "bg-accent"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  // Idle state - Upload prompt
  return (
    <div
      className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
        dragActive
          ? "border-primary bg-primary/5 scale-[1.02]"
          : "border-border hover:border-primary/50 hover:bg-muted/50"
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt"
        onChange={handleChange}
        className="hidden"
      />

      <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
        <Upload className="w-10 h-10 text-primary" />
      </div>

      <h3 className="text-xl font-display font-bold text-foreground mb-2">
        Upload Your Resume
      </h3>
      <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
        Drag & drop your resume file here, or click to browse. We'll analyze it with our ATS
        checker.
      </p>

      <Button variant="hero" size="lg" onClick={(e) => e.stopPropagation()}>
        <FileText className="w-5 h-5 mr-2" />
        Choose File
      </Button>

      <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <File className="w-3 h-3" />
          PDF
        </span>
        <span className="flex items-center gap-1">
          <File className="w-3 h-3" />
          DOCX
        </span>
        <span className="flex items-center gap-1">
          <File className="w-3 h-3" />
          TXT
        </span>
        <span>Max 5MB</span>
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full text-sm text-primary">
          <Target className="w-4 h-4" />
          <span>Instant ATS score analysis on upload</span>
        </div>
      </div>
    </div>
  );
};
