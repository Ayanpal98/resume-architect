import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Sparkles, AlertTriangle, CheckCircle2, FileText, HelpCircle, Loader2, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Suggestion {
  section: string;
  sourceSpan: string;
  rewrite: string;
  rationale: string;
  clarifyingQuestion?: string | null;
  evidence: { fabricated: boolean; introduced: string[] };
}

interface DeepResult {
  hiringReadiness: number | null;
  depthSignal: string;
  suggestions: Suggestion[];
  gapToNinety: string[];
  meta: { guard: string; totalSuggestions: number; flaggedFabrications: number };
}

const DeepImprovement = () => {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DeepResult | null>(null);
  const [showEvidence, setShowEvidence] = useState<Record<number, boolean>>({});

  const runAnalysis = async () => {
    if (resumeText.trim().length < 100) {
      toast.error("Paste at least a few paragraphs of your real resume.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("deep-improvement", {
        body: { resumeText, jobDescription: jobDescription || undefined },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setResult(data as DeepResult);
      toast.success("Deep analysis complete — every suggestion is evidence-linked.");
    } catch (err: any) {
      toast.error(err?.message || "Could not run deep analysis. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/builder">
              <Button variant="ghost" size="sm" className="px-2">
                <ArrowLeft className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Builder</span>
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-hero rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-sm sm:text-base font-display font-bold">Deep Improvement</span>
              <Badge variant="outline" className="hidden sm:inline-flex text-[10px] uppercase tracking-wider border-primary/30 text-primary">
                Evidence-Linked
              </Badge>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-3 sm:px-6 py-5 sm:py-8 max-w-5xl space-y-4 sm:space-y-6">
        <header className="space-y-2 sm:space-y-3">
          <h1 className="font-display text-xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-tight">
            Standalone <span className="text-gradient">Deep Improvement</span> module
          </h1>
          <p className="text-muted-foreground text-xs sm:text-base max-w-3xl leading-relaxed">
            For candidates with real depth. Every rewrite is anchored to a line in your actual resume.
            A fabrication guard rejects any AI-introduced number, tool or employer that isn't already in your text —
            and asks you a clarifying question instead.
          </p>
        </header>

        <Card>
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Your real resume (paste full text)</label>
              <Textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value.slice(0, 100000))}
                placeholder="Paste your actual resume text here. The deeper and more authentic, the better the read."
                className="min-h-[220px] font-mono text-xs"
              />
              <div className="text-[11px] text-muted-foreground mt-1">
                {resumeText.length.toLocaleString()} / 100,000 characters · stored only for this session
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Target job description (optional, sharpens the read)</label>
              <Textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value.slice(0, 50000))}
                placeholder="Paste the JD you're targeting (optional)."
                className="min-h-[120px] text-xs"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between">
              <div className="text-xs text-muted-foreground flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>No metric invention · no fabricated experience · every suggestion traces back to a line in your resume.</span>
              </div>
              <Button variant="hero" size="lg" onClick={runAnalysis} disabled={loading} className="sm:min-w-[220px]">
                {loading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Running deep read…</>) : (<><Sparkles className="w-4 h-4 mr-2" />Run deep analysis</>)}
              </Button>
            </div>
          </CardContent>
        </Card>

        {result && (
          <section className="space-y-5">
            <div className="grid sm:grid-cols-3 gap-3">
              <Card>
                <CardContent className="p-4">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Hiring Readiness</div>
                  <div className="font-display text-3xl font-bold text-primary mt-1">
                    {result.hiringReadiness ?? "—"}{result.hiringReadiness ? "%" : ""}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Depth Signal</div>
                  <div className="text-sm mt-1 leading-snug">{result.depthSignal || "—"}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Fabrications Blocked</div>
                  <div className="font-display text-3xl font-bold text-accent mt-1 flex items-center gap-2">
                    {result.meta.flaggedFabrications}
                    <ShieldCheck className="w-5 h-5 text-accent" />
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    out of {result.meta.totalSuggestions} suggestions
                  </div>
                </CardContent>
              </Card>
            </div>

            {result.gapToNinety.length > 0 && (
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <h2 className="font-display font-semibold">Gap-to-90% roadmap</h2>
                  </div>
                  <ul className="space-y-1.5 text-sm">
                    {result.gapToNinety.map((g, i) => (
                      <li key={i} className="flex gap-2"><span className="text-primary">→</span><span>{g}</span></li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <div className="space-y-3">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4" /> Evidence-linked suggestions
              </h2>
              {result.suggestions.map((s, i) => (
                <Card key={i} className={s.evidence.fabricated ? "border-destructive/40" : "border-border"}>
                  <CardContent className="p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                        {s.section}
                      </Badge>
                      {s.evidence.fabricated ? (
                        <Badge className="bg-destructive/10 text-destructive border border-destructive/30 text-[10px] uppercase tracking-wider">
                          <AlertTriangle className="w-3 h-3 mr-1" /> Held back — needs your input
                        </Badge>
                      ) : (
                        <Badge className="bg-accent/10 text-accent border border-accent/30 text-[10px] uppercase tracking-wider">
                          <ShieldCheck className="w-3 h-3 mr-1" /> Evidence verified
                        </Badge>
                      )}
                    </div>

                    <div className="text-sm leading-relaxed">
                      <div className="font-medium text-foreground mb-1">Rewrite</div>
                      <div className={s.evidence.fabricated ? "text-destructive" : "text-foreground"}>{s.rewrite}</div>
                    </div>

                    {s.rationale && (
                      <div className="text-xs text-muted-foreground italic">Why: {s.rationale}</div>
                    )}

                    {s.clarifyingQuestion && (
                      <div className="rounded-md bg-muted p-3 text-sm flex items-start gap-2">
                        <HelpCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium text-foreground">Clarifying question</div>
                          <div className="text-muted-foreground">{s.clarifyingQuestion}</div>
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setShowEvidence((p) => ({ ...p, [i]: !p[i] }))}
                      className="text-xs text-primary hover:underline"
                    >
                      {showEvidence[i] ? "Hide" : "Show"} source evidence
                    </button>

                    {showEvidence[i] && (
                      <div className="rounded-md border border-dashed border-border p-3 bg-muted/40 text-xs space-y-2">
                        <div className="flex items-start gap-2">
                          <Quote className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                          <div>
                            <div className="font-medium text-foreground mb-0.5">From your resume</div>
                            <div className="text-muted-foreground whitespace-pre-wrap">{s.sourceSpan}</div>
                          </div>
                        </div>
                        {s.evidence.introduced.length > 0 && (
                          <div className="text-destructive">
                            Introduced (not in source): {s.evidence.introduced.join(", ")}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <p className="text-[11px] text-muted-foreground text-center pt-4">
              ATSFy Technologies™ · Deep Improvement guard: evidence-linked-v1 · Beta · session data auto-deleted within 24h
            </p>
          </section>
        )}
      </main>
    </div>
  );
};

export default DeepImprovement;
