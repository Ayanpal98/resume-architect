import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Zap, Check } from "lucide-react";

interface Exp { title: string; description: string }
interface Item {
  index: number;
  original: string;
  weakVerb: string;
  category: string;
  suggestions: string[];
  rewrite: string;
}

interface Props {
  experience: Exp[];
  targetRole?: string;
  onApplyExperience: (index: number, description: string) => void;
}

const splitBullets = (d: string) =>
  d.split(/\n+/).map((l) => l.replace(/^[\s•\-*]+/, "").trim()).filter(Boolean);

const ActionVerbEnhancer = ({ experience, targetRole, onApplyExperience }: Props) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Item[] | null>(null);
  const [applied, setApplied] = useState<Set<number>>(new Set());

  // Flat list of bullets with their source role/line position
  const flat = useMemo(() => {
    const out: { exp: number; line: number; text: string }[] = [];
    experience.forEach((e, ei) => splitBullets(e.description || "").forEach((t, li) => out.push({ exp: ei, line: li, text: t })));
    return out.slice(0, 40);
  }, [experience]);

  const run = async () => {
    if (flat.length === 0) {
      toast({ title: "Add experience bullets first", description: "Write a few bullet points in Experience, then scan again." });
      return;
    }
    setLoading(true);
    setApplied(new Set());
    const { data, error } = await supabase.functions.invoke("action-verb-enhancer", {
      body: { bullets: flat.map((f) => f.text), targetRole },
    });
    setLoading(false);
    if (error || data?.error) {
      const locked = data?.error === "upgrade_required" || (error as any)?.context?.status === 402;
      toast({
        title: locked ? "Included with Premium Professional" : "Couldn't scan your bullets",
        description: locked ? "Upgrade to the ₹1,499 plan to use the Action Verb Enhancer." : "Please try again in a moment.",
        variant: "destructive",
      });
      return;
    }
    setItems(data.items || []);
  };

  const apply = (it: Item, text: string) => {
    const src = flat[it.index];
    if (!src) return;
    const lines = splitBullets(experience[src.exp].description || "");
    lines[src.line] = text;
    onApplyExperience(src.exp, lines.map((l) => `• ${l}`).join("\n"));
    setApplied((s) => new Set(s).add(it.index));
  };

  const weak = items?.filter((i) => i.weakVerb) ?? [];

  return (
    <div className="space-y-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 font-semibold"><Zap className="h-4 w-4 text-primary" /> Action Verb Enhancer</h3>
          <p className="text-sm text-muted-foreground">Spots weak openers in your experience bullets and suggests stronger, honest replacements.</p>
        </div>
        <Button onClick={run} disabled={loading} size="sm">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
          {items ? "Scan again" : "Scan my bullets"}
        </Button>
      </div>

      {items && weak.length === 0 && (
        <p className="rounded-xl border border-border/60 bg-muted/30 p-3 text-sm">Every bullet already opens with a strong verb. Nice work.</p>
      )}

      {weak.map((it) => (
        <div key={it.index} className="space-y-2 rounded-xl border border-border/60 bg-muted/30 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{it.category}</Badge>
            <span className="text-xs text-muted-foreground">Weak opener: “{it.weakVerb}”</span>
          </div>
          <p className="text-sm text-muted-foreground line-through decoration-muted-foreground/50">{it.original}</p>
          <p className="text-sm font-medium">{it.rewrite}</p>
          <div className="flex flex-wrap items-center gap-2">
            {it.suggestions.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}
            <Button size="sm" variant={applied.has(it.index) ? "outline" : "default"} className="ml-auto"
              disabled={applied.has(it.index)} onClick={() => apply(it, it.rewrite)}>
              {applied.has(it.index) ? <><Check className="mr-1 h-3 w-3" /> Applied</> : "Apply rewrite"}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActionVerbEnhancer;
