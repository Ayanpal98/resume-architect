import { useState, useMemo } from "react";
import { Zap, ArrowRight, Check, Copy, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  analyzeActionVerbs, 
  enhanceExperienceDescription,
  getVerbStrengthLabel,
  EnhancementResult,
  POWER_VERBS_BY_CATEGORY 
} from "@/lib/actionVerbsEnhancer";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";

interface ActionVerbsEnhancerProps {
  text: string;
  onApply: (enhancedText: string) => void;
  compact?: boolean;
}

export const ActionVerbsEnhancer = ({ text, onApply, compact = false }: ActionVerbsEnhancerProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedReplacements, setSelectedReplacements] = useState<Record<number, string>>({});

  const result = useMemo(() => {
    return enhanceExperienceDescription(text);
  }, [text]);

  const { label: strengthLabel, color: strengthColor } = getVerbStrengthLabel(result.score);
  const hasWeakVerbs = result.replacements.length > 0;

  const handleApplyEnhancement = () => {
    let finalText = result.originalText;
    
    // Apply selected replacements (or defaults)
    result.replacements.forEach((replacement, index) => {
      const selectedVerb = selectedReplacements[index] || replacement.suggestions[0];
      const isCapitalized = replacement.original[0] === replacement.original[0].toUpperCase();
      let verb = selectedVerb;
      if (isCapitalized) {
        verb = verb.charAt(0).toUpperCase() + verb.slice(1);
      }
      finalText = finalText.replace(new RegExp(`\\b${replacement.original}\\b`, "i"), verb);
    });

    onApply(finalText);
    toast.success(`Enhanced ${result.replacements.length} weak verb${result.replacements.length > 1 ? 's' : ''}`);
  };

  const selectReplacement = (index: number, verb: string) => {
    setSelectedReplacements(prev => ({ ...prev, [index]: verb }));
  };

  if (!text || text.trim().length === 0) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Badge 
          variant={hasWeakVerbs ? "outline" : "secondary"}
          className={`text-xs ${hasWeakVerbs ? 'border-amber-500/50 text-amber-600' : 'text-green-600'}`}
        >
          <Zap className="w-3 h-3 mr-1" />
          {hasWeakVerbs ? `${result.replacements.length} weak verb${result.replacements.length > 1 ? 's' : ''}` : 'Strong verbs ✓'}
        </Badge>
        {hasWeakVerbs && (
          <Button size="sm" variant="ghost" className="h-6 text-xs px-2" onClick={handleApplyEnhancement}>
            Enhance
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Action Verbs Enhancer</h3>
              <p className="text-xs text-muted-foreground">
                {hasWeakVerbs 
                  ? `Found ${result.replacements.length} weak verb${result.replacements.length > 1 ? 's' : ''} to enhance`
                  : 'Your text uses strong action verbs'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className={`text-lg font-bold ${strengthColor}`}>{result.score}%</div>
              <div className={`text-xs ${strengthColor}`}>{strengthLabel}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {hasWeakVerbs && (
        <div className="p-4 space-y-4">
          {/* Quick Apply */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Replace weak verbs with powerful action verbs to improve ATS score.
            </p>
            <Button onClick={handleApplyEnhancement} size="sm" className="gap-2">
              <Zap className="w-4 h-4" />
              Apply All
            </Button>
          </div>

          {/* Replacements List */}
          <Collapsible open={showDetails} onOpenChange={setShowDetails}>
            <CollapsibleTrigger className="flex items-center gap-2 text-sm text-primary hover:underline">
              {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showDetails ? 'Hide details' : 'View suggested replacements'}
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-3 space-y-3">
              {result.replacements.map((replacement, index) => (
                <div key={index} className="p-3 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs bg-red-500/10 text-red-600 border-red-500/30">
                          Weak
                        </Badge>
                        <span className="text-sm font-medium text-foreground line-through decoration-red-500/50">
                          {replacement.original}
                        </span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/30">
                          {replacement.category}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {replacement.suggestions.map((verb, verbIndex) => {
                          const isSelected = selectedReplacements[index] === verb || 
                            (!selectedReplacements[index] && verbIndex === 0);
                          return (
                            <button
                              key={verb}
                              onClick={() => selectReplacement(index, verb)}
                              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                                isSelected 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'bg-background border border-border hover:border-primary hover:text-primary'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                              {verb}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>

          {/* Preview */}
          {showDetails && (
            <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Enhanced Preview</span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{result.enhancedText}</p>
            </div>
          )}
        </div>
      )}

      {/* Success State */}
      {!hasWeakVerbs && (
        <div className="p-4">
          <div className="flex items-center gap-3 text-green-600">
            <Check className="w-5 h-5" />
            <p className="text-sm">Great job! Your text already uses strong, impactful action verbs.</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Inline enhancer for experience cards
export const InlineVerbEnhancer = ({ text, onApply }: { text: string; onApply: (text: string) => void }) => {
  const result = useMemo(() => analyzeActionVerbs(text), [text]);
  
  if (result.replacements.length === 0) return null;

  return (
    <button
      onClick={() => onApply(result.enhancedText)}
      className="inline-flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 hover:underline"
    >
      <Zap className="w-3 h-3" />
      Enhance {result.replacements.length} verb{result.replacements.length > 1 ? 's' : ''}
    </button>
  );
};
