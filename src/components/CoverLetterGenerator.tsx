import { useState } from "react";
import { 
  FileText, 
  Loader2, 
  Copy, 
  Download, 
  RefreshCw,
  Building2,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { generateCoverLetter } from "@/lib/aiService";
import { toast } from "sonner";

interface CoverLetterGeneratorProps {
  resumeData: any;
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
}

export const CoverLetterGenerator = ({ 
  resumeData, 
  jobDescription,
  onJobDescriptionChange 
}: CoverLetterGeneratorProps) => {
  const [companyName, setCompanyName] = useState("");
  const [tone, setTone] = useState("professional");
  const [coverLetter, setCoverLetter] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!jobDescription.trim()) {
      toast.error("Please enter a job description first");
      return;
    }

    setIsLoading(true);
    try {
      const result = await generateCoverLetter(
        resumeData,
        jobDescription,
        companyName || undefined,
        tone
      );
      setCoverLetter(result);
      toast.success("Cover letter generated!");
    } catch (error) {
      console.error("Generation error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate cover letter");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    toast.success("Copied to clipboard!");
  };

  const handleDownload = () => {
    const blob = new Blob([coverLetter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cover-letter-${companyName || "document"}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Cover letter downloaded!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">Cover Letter Generator</h2>
        <p className="text-muted-foreground">Create a tailored cover letter based on your resume and the job description.</p>
      </div>

      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Company Name
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="e.g., Google, Microsoft"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Tone
            </label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                <SelectItem value="confident">Confident</SelectItem>
                <SelectItem value="conversational">Conversational</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Job Description *
          </label>
          <Textarea
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(e) => onJobDescriptionChange(e.target.value)}
            rows={6}
            className="resize-none"
          />
        </div>

        <Button 
          onClick={handleGenerate} 
          disabled={isLoading || !jobDescription.trim()}
          className="w-full"
          variant="hero"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Cover Letter
            </>
          )}
        </Button>
      </div>

      {coverLetter && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-foreground">Generated Cover Letter</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={handleGenerate} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Regenerate
              </Button>
            </div>
          </div>
          
          <div className="bg-muted/50 rounded-xl p-6 border border-border">
            <pre className="whitespace-pre-wrap font-sans text-sm text-foreground leading-relaxed">
              {coverLetter}
            </pre>
          </div>
        </div>
      )}

      {!coverLetter && !isLoading && (
        <div className="bg-primary/5 rounded-xl p-6 border border-primary/20 text-center">
          <FileText className="w-12 h-12 text-primary/50 mx-auto mb-3" />
          <h3 className="font-medium text-foreground mb-1">No cover letter yet</h3>
          <p className="text-sm text-muted-foreground">
            Enter a job description and click generate to create a tailored cover letter
          </p>
        </div>
      )}
    </div>
  );
};
