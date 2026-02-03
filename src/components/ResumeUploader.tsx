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
  ScanLine,
  Eye,
  ArrowRight,
  RotateCcw,
  ClipboardPaste,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { parseResumeFile } from "@/lib/aiService";
import { checkATSCompatibility, ATSCheckResult, getScoreBgColor } from "@/lib/atsChecker";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ResumeUploaderProps {
  onComplete?: (data: any, atsResult: ATSCheckResult) => void;
  navigateToAnalysis?: boolean;
}

type UploadStep = "idle" | "uploading" | "extracting" | "ocr" | "preview" | "parsing" | "analyzing" | "complete" | "error";
type InputMode = "upload" | "paste";

// Convert PDF page to image using canvas
const convertPdfPageToImage = async (pdf: any, pageNum: number): Promise<string> => {
  const page = await pdf.getPage(pageNum);
  const scale = 2; // Higher scale for better OCR quality
  const viewport = page.getViewport({ scale });
  
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  
  await page.render({
    canvasContext: context!,
    viewport: viewport,
  }).promise;
  
  return canvas.toDataURL("image/png");
};

// Perform OCR on PDF images using edge function
const performOCR = async (images: string[]): Promise<string> => {
  const { data, error } = await supabase.functions.invoke("ocr-pdf", {
    body: { images },
  });

  if (error) {
    throw new Error(error.message || "OCR failed");
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return data.text;
};

export const ResumeUploader = ({ onComplete, navigateToAnalysis = true }: ResumeUploaderProps) => {
  const navigate = useNavigate();
  const [inputMode, setInputMode] = useState<InputMode>("paste");
  const [step, setStep] = useState<UploadStep>("idle");
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);
  const [atsResult, setAtsResult] = useState<ATSCheckResult | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [pastedText, setPastedText] = useState<string>("");
  const [usedOCR, setUsedOCR] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const extractTextFromFile = async (file: File): Promise<{ text: string; usedOCR: boolean }> => {
    const fileType = file.type;

    if (fileType === "text/plain") {
      return { text: await file.text(), usedOCR: false };
    }

    if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const mammoth = await import("mammoth");
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return { text: result.value, usedOCR: false };
    }

    if (fileType === "application/pdf") {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        
        // Use versioned CDN URL for the worker with proper extension
        const workerUrl = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ 
          data: arrayBuffer,
          useSystemFonts: true,
          standardFontDataUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/standard_fonts/`,
        }).promise;

        // First try text extraction
        let text = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          
          // Improved text extraction - preserve spacing between items
          let lastY: number | null = null;
          const pageLines: string[] = [];
          let currentLine = "";
          
          for (const item of content.items as any[]) {
            if (item.str) {
              // Check if this is a new line based on Y position
              if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
                if (currentLine.trim()) {
                  pageLines.push(currentLine.trim());
                }
                currentLine = item.str;
              } else {
                // Add space between items on the same line
                currentLine += (currentLine && !currentLine.endsWith(" ") ? " " : "") + item.str;
              }
              lastY = item.transform[5];
            }
          }
          
          if (currentLine.trim()) {
            pageLines.push(currentLine.trim());
          }
          
          text += pageLines.join("\n") + "\n\n";
        }
        
        // If we got enough text, return it
        if (text.trim().length >= 50) {
          return { text, usedOCR: false };
        }

        // Text extraction failed - likely a scanned PDF, try OCR
        console.log("Minimal text extracted, attempting OCR...");
        setStep("ocr");
        setProgress(40);
        
        // Convert PDF pages to images
        const images: string[] = [];
        const maxPages = Math.min(pdf.numPages, 10); // Limit to 10 pages for OCR
        
        for (let i = 1; i <= maxPages; i++) {
          const imageData = await convertPdfPageToImage(pdf, i);
          images.push(imageData);
          setProgress(40 + (i / maxPages) * 15);
        }

        // Perform OCR
        const ocrText = await performOCR(images);
        return { text: ocrText, usedOCR: true };
        
      } catch (pdfError) {
        console.error("PDF extraction error:", pdfError);
        throw new Error("Failed to read PDF. The file may be corrupted or password-protected. Please try a different file.");
      }
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
    setCurrentFile(file);

    try {
      // Step 1: Upload/Read file
      setStep("uploading");
      setProgress(10);
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Step 2: Extract text (may trigger OCR automatically)
      setStep("extracting");
      setProgress(30);
      const { text, usedOCR: didUseOCR } = await extractTextFromFile(file);

      if (!text || text.trim().length < 50) {
        throw new Error("Could not extract enough text from the file. Please try a different file format.");
      }

      // Store extracted text and show preview
      setExtractedText(text);
      setUsedOCR(didUseOCR);
      setStep("preview");
      setProgress(45);

    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Failed to process resume");
      setStep("error");
    }
  };

  // Continue from preview to parsing
  const continueFromPreview = async () => {
    try {
      // Step 3: Parse with AI
      setStep("parsing");
      setProgress(50);
      const importedData = await parseResumeFile(extractedText);

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
              fileName: fileName,
            },
          });
        }, 1000);
      } else if (onComplete) {
        onComplete(importedData, atsCheckResult);
      }
    } catch (err) {
      console.error("Parsing error:", err);
      setError(err instanceof Error ? err.message : "Failed to parse resume");
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
    setExtractedText("");
    setPastedText("");
    setUsedOCR(false);
    setCurrentFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle pasted text submission
  const handlePastedTextSubmit = async () => {
    const trimmedText = pastedText.trim();
    
    if (trimmedText.length < 50) {
      setError("Please paste more content. Minimum 50 characters required for analysis.");
      setStep("error");
      return;
    }

    setFileName("Pasted Content");
    setFileSize(`${trimmedText.length.toLocaleString()} characters`);
    setError(null);
    setExtractedText(trimmedText);
    setUsedOCR(false);
    setStep("preview");
    setProgress(45);
  };

  const getStepLabel = (): string => {
    switch (step) {
      case "uploading":
        return "Reading file...";
      case "extracting":
        return "Extracting text content...";
      case "ocr":
        return "Running OCR on scanned pages...";
      case "preview":
        return "Review extracted text";
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

  // Preview state - show extracted text for verification
  if (step === "preview") {
    const wordCount = extractedText.split(/\s+/).filter(Boolean).length;
    const charCount = extractedText.length;
    
    return (
      <div className="relative border-2 border-primary/50 rounded-2xl p-6 bg-primary/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-display font-semibold text-foreground">
                Review Extracted Text
              </h3>
              <p className="text-sm text-muted-foreground">
                {fileName} • {fileSize}
              </p>
            </div>
          </div>
          {usedOCR && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-warning/10 text-warning-foreground rounded-full text-xs font-medium">
              <ScanLine className="w-3 h-3" />
              OCR Used
            </span>
          )}
        </div>

        <div className="bg-background border border-border rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Extracted content preview</span>
            <span>{wordCount.toLocaleString()} words • {charCount.toLocaleString()} characters</span>
          </div>
          <div className="max-h-64 overflow-y-auto">
            <pre className="text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed">
              {extractedText.slice(0, 3000)}
              {extractedText.length > 3000 && (
                <span className="text-muted-foreground">
                  {"\n\n"}... ({(extractedText.length - 3000).toLocaleString()} more characters)
                </span>
              )}
            </pre>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center mb-4">
          {usedOCR 
            ? "Text was extracted using AI vision (OCR). Please verify the content looks correct before proceeding."
            : "Please verify the extracted text looks correct before AI parsing."}
        </p>

        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Try Different File
          </Button>
          <Button variant="hero" onClick={continueFromPreview} className="gap-2">
            Continue to Analysis
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

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
    const isOCRStep = step === "ocr";
    const processingSteps = ["uploading", "extracting", "ocr", "preview", "parsing", "analyzing"];
    const currentStepIndex = processingSteps.indexOf(step);
    
    return (
      <div className="relative border-2 border-primary/50 rounded-2xl p-8 text-center bg-primary/5">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          {isOCRStep ? (
            <ScanLine className="w-8 h-8 text-primary animate-pulse" />
          ) : (
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          )}
        </div>
        <h3 className="text-lg font-display font-semibold text-foreground mb-2">
          {getStepLabel()}
        </h3>
        {isOCRStep && (
          <p className="text-xs text-muted-foreground mb-2">
            Detected scanned document - using AI vision to extract text
          </p>
        )}
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
          {processingSteps.map((s, idx) => (
            <div
              key={s}
              className={`w-2 h-2 rounded-full transition-all ${
                step === s
                  ? "bg-primary w-4"
                  : currentStepIndex > idx
                  ? "bg-accent"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  // Idle state - Upload or Paste prompt
  return (
    <div className="relative border-2 border-border rounded-2xl p-6 bg-background">
      <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as InputMode)} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="paste" className="gap-2">
            <ClipboardPaste className="w-4 h-4" />
            Paste Text
          </TabsTrigger>
          <TabsTrigger value="upload" className="gap-2">
            <Upload className="w-4 h-4" />
            Upload File
          </TabsTrigger>
        </TabsList>

        <TabsContent value="paste" className="mt-0">
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <ClipboardPaste className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-display font-bold text-foreground mb-1">
                Paste Your Resume Content
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Copy the text from your resume (PDF, Word, etc.) and paste it below for instant ATS analysis.
              </p>
            </div>

            <Textarea
              placeholder="Paste your resume content here...

Example:
John Doe
Software Engineer
john.doe@email.com | (555) 123-4567

Professional Summary
Experienced software engineer with 5+ years...

Experience
Senior Developer at Tech Company (2020-Present)
• Led development of..."
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              className="min-h-[250px] font-mono text-sm resize-none"
            />

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {pastedText.length > 0 
                  ? `${pastedText.trim().split(/\s+/).filter(Boolean).length.toLocaleString()} words • ${pastedText.length.toLocaleString()} characters`
                  : "Minimum 50 characters required"
                }
              </span>
              {pastedText.length >= 50 && (
                <span className="text-accent flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Ready to analyze
                </span>
              )}
            </div>

            <Button 
              variant="hero" 
              size="lg" 
              className="w-full"
              disabled={pastedText.trim().length < 50}
              onClick={handlePastedTextSubmit}
            >
              <Target className="w-5 h-5 mr-2" />
              Analyze Resume
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="upload" className="mt-0">
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
              dragActive
                ? "border-primary bg-primary/5 scale-[1.01]"
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

            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Upload className="w-8 h-8 text-primary" />
            </div>

            <h3 className="text-lg font-display font-bold text-foreground mb-2">
              Upload Your Resume
            </h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
              Drag & drop your resume file here, or click to browse.
            </p>

            <Button variant="hero" size="lg" onClick={(e) => e.stopPropagation()}>
              <FileText className="w-5 h-5 mr-2" />
              Choose File
            </Button>

            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
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
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-center gap-2 text-sm text-primary">
          <Target className="w-4 h-4" />
          <span>Instant ATS score analysis</span>
        </div>
      </div>
    </div>
  );
};
