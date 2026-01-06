import { useState } from "react";
import { Sparkles, Loader2, Lightbulb, X, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getAISuggestion } from "@/lib/aiService";
import { toast } from "sonner";

interface AISuggestionPanelProps {
  type: "summary" | "experience" | "skills" | "keywords";
  content: any;
  onApply: (suggestion: string) => void;
  jobDescription?: string;
}

export const AISuggestionPanel = ({ type, content, onApply, jobDescription }: AISuggestionPanelProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    setSuggestion("");

    try {
      const result = await getAISuggestion(type, content, jobDescription);
      setSuggestion(result);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate suggestion");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(suggestion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    onApply(suggestion);
    setSuggestion("");
    toast.success("Suggestion applied!");
  };

  const labels = {
    summary: "Generate Professional Summary",
    experience: "Improve Description",
    skills: "Suggest Skills",
    keywords: "Extract Keywords",
  };

  return (
    <div className="bg-primary/5 rounded-xl border border-primary/20 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="font-medium text-foreground text-sm">AI Assistant</span>
      </div>

      {!suggestion ? (
        <Button
          onClick={handleGenerate}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Lightbulb className="w-4 h-4 mr-2" />
              {labels[type]}
            </>
          )}
        </Button>
      ) : (
        <div className="space-y-3">
          <div className="relative">
            <Textarea
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              rows={4}
              className="resize-none pr-10 text-sm"
            />
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 p-1.5 hover:bg-muted rounded-md transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-accent" />
              ) : (
                <Copy className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleApply} size="sm" className="flex-1">
              Apply Suggestion
            </Button>
            <Button onClick={() => setSuggestion("")} variant="ghost" size="sm">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
