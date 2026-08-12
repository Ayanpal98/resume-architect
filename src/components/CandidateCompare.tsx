import { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Copy, CheckCircle2, XCircle, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface CompareCandidate {
  id: string;
  name: string;
  fileName: string;
  currentRole: string;
  totalExperience: string;
  location: string;
  overallScore: number;
  technicalSkillsScore: number;
  experienceScore: number;
  educationScore: number;
  softSkillsScore: number;
  atsScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  salaryRange: string;
  recommendationReason: string;
}

interface CandidateCompareProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidates: CompareCandidate[];
  jobTitle?: string;
  computeConfidence: (c: CompareCandidate & any) => number;
}

const rowLabels: { key: keyof CompareCandidate; label: string }[] = [
  { key: "overallScore", label: "Overall match" },
  { key: "technicalSkillsScore", label: "Technical skills" },
  { key: "experienceScore", label: "Experience" },
  { key: "educationScore", label: "Education" },
  { key: "softSkillsScore", label: "Soft skills" },
  { key: "atsScore", label: "Resume quality" },
];

export const CandidateCompare = ({
  open,
  onOpenChange,
  candidates,
  jobTitle,
  computeConfidence,
}: CandidateCompareProps) => {
  const { toast } = useToast();

  const scored = useMemo(
    () =>
      candidates.map((c) => ({ ...c, confidence: computeConfidence(c) })),
    [candidates, computeConfidence]
  );

  const topPick = useMemo(
    () => [...scored].sort((a, b) => b.confidence - a.confidence)[0],
    [scored]
  );

  // Skills required across the shortlist = union of matched + missing skills.
  const skillUniverse = useMemo(() => {
    const set = new Set<string>();
    candidates.forEach((c) => {
      (c.matchedSkills || []).forEach((s) => set.add(s));
      (c.missingSkills || []).forEach((s) => set.add(s));
    });
    return Array.from(set).slice(0, 18);
  }, [candidates]);

  const bestFor = (key: keyof CompareCandidate) =>
    Math.max(...scored.map((c) => Number(c[key]) || 0));

  const copySummary = async () => {
    const lines = [
      `Candidate comparison${jobTitle ? ` — ${jobTitle}` : ""}`,
      "",
      ...scored.map(
        (c, i) =>
          `${i + 1}. ${c.name || c.fileName} — Confidence ${c.confidence}% | Match ${c.overallScore}% | ${c.totalExperience || "n/a"} | ${c.currentRole || "n/a"}\n   Missing: ${(c.missingSkills || []).slice(0, 5).join(", ") || "none"}`
      ),
      "",
      topPick
        ? `Top pick: ${topPick.name || topPick.fileName} (${topPick.confidence}% confidence).`
        : "",
      "Prepared with ATSFy Technologies™",
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      toast({ title: "Summary copied", description: "Paste it straight into your hiring manager update." });
    } catch {
      toast({ title: "Copy failed", description: "Your browser blocked clipboard access.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0">
        <DialogHeader className="p-5 pb-3 border-b border-border">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Trophy className="w-5 h-5 text-primary" />
            Side-by-side comparison
            {jobTitle && <span className="text-sm font-normal text-muted-foreground">· {jobTitle}</span>}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="p-5 space-y-5">
            {topPick && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                <p className="text-xs uppercase tracking-wider text-primary font-semibold mb-1">
                  Recommended top pick
                </p>
                <p className="text-sm text-foreground">
                  <span className="font-semibold">{topPick.name || topPick.fileName}</span> leads this
                  shortlist with {topPick.confidence}% hiring confidence
                  {topPick.currentRole ? ` as ${topPick.currentRole}` : ""}
                  {topPick.totalExperience ? ` (${topPick.totalExperience})` : ""}.
                </p>
              </div>
            )}

            {/* Score matrix */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse min-w-[520px]">
                <thead>
                  <tr>
                    <th className="text-left p-2 w-40 text-xs uppercase tracking-wider text-muted-foreground font-medium">
                      Metric
                    </th>
                    {scored.map((c) => (
                      <th key={c.id} className="p-2 text-left align-bottom">
                        <div className="font-semibold text-foreground truncate max-w-[10rem]">
                          {c.name || c.fileName}
                        </div>
                        <div className="text-xs text-muted-foreground truncate max-w-[10rem]">
                          {c.totalExperience || "—"}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border">
                    <td className="p-2 text-muted-foreground">Hiring confidence</td>
                    {scored.map((c) => {
                      const best = Math.max(...scored.map((x) => x.confidence));
                      return (
                        <td key={c.id} className="p-2">
                          <span
                            className={`font-semibold ${
                              c.confidence === best ? "text-primary" : "text-foreground"
                            }`}
                          >
                            {c.confidence}%
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                  {rowLabels.map((row) => {
                    const best = bestFor(row.key);
                    return (
                      <tr key={row.key as string} className="border-t border-border">
                        <td className="p-2 text-muted-foreground">{row.label}</td>
                        {scored.map((c) => {
                          const v = Number(c[row.key]) || 0;
                          return (
                            <td key={c.id} className="p-2">
                              <span className={v === best ? "font-semibold text-primary" : "text-foreground"}>
                                {v}%
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                  <tr className="border-t border-border">
                    <td className="p-2 text-muted-foreground">Expected salary</td>
                    {scored.map((c) => (
                      <td key={c.id} className="p-2 text-foreground">{c.salaryRange || "—"}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Skill coverage grid */}
            {skillUniverse.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
                  Skill coverage
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse min-w-[520px]">
                    <thead>
                      <tr>
                        <th className="text-left p-2 w-40" />
                        {scored.map((c) => (
                          <th key={c.id} className="p-2 text-left text-xs text-muted-foreground truncate max-w-[10rem]">
                            {c.name || c.fileName}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {skillUniverse.map((skill) => (
                        <tr key={skill} className="border-t border-border">
                          <td className="p-2 text-foreground">{skill}</td>
                          {scored.map((c) => {
                            const has = (c.matchedSkills || []).includes(skill);
                            const missing = (c.missingSkills || []).includes(skill);
                            return (
                              <td key={c.id} className="p-2">
                                {has ? (
                                  <CheckCircle2 className="w-4 h-4 text-accent" />
                                ) : missing ? (
                                  <XCircle className="w-4 h-4 text-destructive/70" />
                                ) : (
                                  <Minus className="w-4 h-4 text-muted-foreground/50" />
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Why each */}
            <div className="grid gap-3 sm:grid-cols-2">
              {scored.map((c) => (
                <div key={c.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground text-sm truncate">
                      {c.name || c.fileName}
                    </span>
                    <Badge variant="outline" className="text-[10px]">{c.confidence}%</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-4">
                    {c.recommendationReason || "No summary available."}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>

        <div className="flex items-center justify-between gap-3 border-t border-border p-4">
          <p className="text-xs text-muted-foreground">
            Comparison is decision support only — final hiring judgement stays with your team.
          </p>
          <Button size="sm" onClick={copySummary}>
            <Copy className="w-4 h-4 mr-2" />
            Copy summary
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
