import { useState, useRef } from "react";
import { Upload, FileText, Loader2, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { parseResumeFile } from "@/lib/aiService";
import { toast } from "sonner";

interface ResumeImportProps {
  onImport: (data: any) => void;
}

export const ResumeImport = ({ onImport }: ResumeImportProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractTextFromFile = async (file: File): Promise<string> => {
    const fileType = file.type;

    // Handle text files
    if (fileType === "text/plain") {
      return await file.text();
    }

    // Handle DOCX files using mammoth
    if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const mammoth = await import("mammoth");
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    }

    // Handle PDF files
    if (fileType === "application/pdf") {
      const pdfjsLib = await import("pdfjs-dist");
      
      // Set worker source
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item: any) => item.str)
          .join(" ");
        text += pageText + "\n";
      }
      return text;
    }

    throw new Error("Unsupported file type. Please upload PDF, DOCX, or TXT files.");
  };

  const handleFile = async (file: File) => {
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a PDF, DOCX, or TXT file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setIsLoading(true);
    setFileName(file.name);

    try {
      const text = await extractTextFromFile(file);
      
      if (!text || text.trim().length < 50) {
        throw new Error("Could not extract enough text from the file");
      }

      const parsedData = await parseResumeFile(text);
      
      // Add IDs to experience and education items
      if (parsedData.experience) {
        parsedData.experience = parsedData.experience.map((exp: any) => ({
          ...exp,
          id: crypto.randomUUID(),
        }));
      }
      if (parsedData.education) {
        parsedData.education = parsedData.education.map((edu: any) => ({
          ...edu,
          id: crypto.randomUUID(),
        }));
      }

      onImport(parsedData);
      toast.success("Resume imported successfully!");
      setFileName("");
    } catch (error) {
      console.error("Import error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to import resume");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div
      className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
        dragActive
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50 hover:bg-muted/50"
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt"
        onChange={handleChange}
        className="hidden"
      />

      {isLoading ? (
        <div className="space-y-3">
          <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
          <p className="text-foreground font-medium">Processing {fileName}...</p>
          <p className="text-sm text-muted-foreground">Extracting and parsing your resume</p>
        </div>
      ) : (
        <>
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-display font-semibold text-foreground mb-2">
            Import Your Resume
          </h3>
          <p className="text-muted-foreground mb-4">
            Drag & drop your resume or click to browse
          </p>
          <Button onClick={() => fileInputRef.current?.click()} variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Choose File
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            Supports PDF, DOCX, and TXT files (max 5MB)
          </p>
        </>
      )}
    </div>
  );
};
