import { useState } from "react";
import { Seo } from "@/components/Seo";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Palette, ArrowLeft, Loader2, Sparkles, Briefcase, CheckCircle2,
  Layout, GraduationCap, CalendarDays, TrendingUp, Wrench,
} from "lucide-react";
import { ComplianceFooter } from "@/components/ComplianceFooter";

const DOMAINS = [
  "Psychology & Behavioural Research", "Sociology & Social Research", "Economics & Policy",
  "Literature & Languages", "History & Archival Research", "Journalism & Media",
  "Design & Visual Arts", "Marketing & Brand", "Content & Communications",
  "Human Resources & People Ops", "Education & Teaching", "Law & Compliance",
  "Commerce & Accounting", "Business Operations", "Supply Chain & Logistics",
  "Public Health", "Life Sciences Research", "Environment & Sustainability",
  "Hospitality & Travel", "Retail & Customer Experience", "Non-profit & Development",
  "Agriculture & Food", "Sports & Fitness", "Event Management", "Real Estate",
];

const LEVELS = ["Student / Fresher", "0-1 years", "1-3 years", "3-5 years", "5+ years", "Career switcher"];
const WORK_STYLES = ["Remote", "Hybrid", "On-site", "Flexible / any"];
const TOOL_COMFORT = ["Beginner — basic docs and email", "Comfortable — spreadsheets, slides, Canva", "Confident — happy to learn new no-code tools"];

const PortfolioStudio = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [form, setForm] = useState({
    background: "",
    domain: "",
    strengths: "",
    experienceLevel: "",
    location: "",
    workStyle: "",
    toolsComfort: "",
    goal: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const generate = async () => {
    if (!form.background.trim() || !form.domain) {
      toast.error("Add your background and pick a domain to continue.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("portfolio-studio", {
        body: { profile: form },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data.result);
      toast.success("Your portfolio blueprint is ready.");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Could not generate your blueprint. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const arr = (v: any): any[] => (Array.isArray(v) ? v : []);

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Portfolio Studio — Portfolios for Non-Technical Careers | ATSFy"
        description="Build a market-aligned portfolio without code and see the job specifications hiring in your domain, with a 30-day plan."
        path="/portfolio-studio"
      />

      <nav className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link to="/builder" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-primary" />
            <span className="font-display font-semibold">Portfolio Studio</span>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-5xl">
        <header className="mb-8">
          <Badge variant="secondary" className="mb-3">For non-technical backgrounds</Badge>
          <h1 className="text-2xl sm:text-4xl font-display font-bold mb-3">
            A portfolio the market actually asks for — no code required.
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Tell us your background and the domain you research or care about. You get a portfolio blueprint
            built on free no-code tools, projects worth showing, and the real job specifications hiring in that field.
          </p>
        </header>

        <Card className="mb-8">
          <CardContent className="p-5 sm:p-6 grid gap-5">
            <div className="grid gap-2">
              <label className="text-sm font-medium">What have you studied or worked on so far?</label>
              <Textarea
                rows={3}
                placeholder="e.g. BA Psychology graduate, ran a college research survey on study habits, part-time content writing"
                value={form.background}
                onChange={(e) => set("background", e.target.value)}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Domain of interest / research</label>
                <Select value={form.domain} onValueChange={(v) => set("domain", v)}>
                  <SelectTrigger><SelectValue placeholder="Choose a domain" /></SelectTrigger>
                  <SelectContent className="max-h-72">
                    {DOMAINS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Experience level</label>
                <Select value={form.experienceLevel} onValueChange={(v) => set("experienceLevel", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {LEVELS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Preferred location</label>
                <Input placeholder="e.g. Bengaluru, India" value={form.location} onChange={(e) => set("location", e.target.value)} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Work style</label>
                <Select value={form.workStyle} onValueChange={(v) => set("workStyle", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {WORK_STYLES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <label className="text-sm font-medium">Comfort with digital tools</label>
                <Select value={form.toolsComfort} onValueChange={(v) => set("toolsComfort", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {TOOL_COMFORT.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Natural strengths</label>
                <Input placeholder="e.g. interviewing people, writing, organising events" value={form.strengths} onChange={(e) => set("strengths", e.target.value)} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">What do you want next?</label>
                <Input placeholder="e.g. first full-time role in user research" value={form.goal} onChange={(e) => set("goal", e.target.value)} />
              </div>
            </div>

            <Button onClick={generate} disabled={loading} size="lg" className="w-full sm:w-auto justify-self-start">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Building your blueprint…</> : <><Sparkles className="w-4 h-4 mr-2" /> Build my portfolio plan</>}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <div className="space-y-6 animate-fade-up">
            {result.positioning_statement && (
              <Card className="border-primary/30">
                <CardContent className="p-5 sm:p-6">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">How to position yourself</p>
                  <p className="text-lg font-display">{result.positioning_statement}</p>
                </CardContent>
              </Card>
            )}

            {result.market_snapshot && (
              <Card>
                <CardContent className="p-5 sm:p-6">
                  <h2 className="font-display font-semibold text-xl mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" /> Market snapshot
                  </h2>
                  <p className="text-muted-foreground mb-4">{result.market_snapshot.demand_summary}</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-2">In demand right now</p>
                      <div className="flex flex-wrap gap-2">
                        {arr(result.market_snapshot.in_demand_capabilities).map((c: string, i: number) => (
                          <Badge key={i} variant="secondary">{c}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Hiring signals</p>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {arr(result.market_snapshot.hiring_signals).map((s: string, i: number) => <li key={i}>• {s}</li>)}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {result.portfolio_blueprint && (
              <Card>
                <CardContent className="p-5 sm:p-6">
                  <h2 className="font-display font-semibold text-xl mb-3 flex items-center gap-2">
                    <Layout className="w-5 h-5 text-primary" /> Portfolio blueprint
                  </h2>
                  <p className="text-muted-foreground mb-4">{result.portfolio_blueprint.format_recommendation}</p>
                  <div className="grid sm:grid-cols-2 gap-3 mb-5">
                    {arr(result.portfolio_blueprint.no_code_tools).map((t: any, i: number) => (
                      <div key={i} className="rounded-lg border border-border p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm flex items-center gap-2"><Wrench className="w-4 h-4 text-primary" />{t.tool}</span>
                          {t.cost && <Badge variant="outline">{t.cost}</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{t.why}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    {arr(result.portfolio_blueprint.sections).map((s: any, i: number) => (
                      <div key={i} className="rounded-lg bg-muted/40 p-3">
                        <p className="font-medium text-sm">{s.section}</p>
                        <p className="text-sm text-muted-foreground">{s.purpose}</p>
                        <p className="text-sm mt-1">{s.what_to_put_here}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {arr(result.portfolio_projects).length > 0 && (
              <div>
                <h2 className="font-display font-semibold text-xl mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" /> Projects worth showing
                </h2>
                <div className="grid gap-4">
                  {arr(result.portfolio_projects).map((p: any, i: number) => (
                    <Card key={i}>
                      <CardContent className="p-5">
                        <div className="flex flex-wrap items-center gap-2 justify-between mb-2">
                          <h3 className="font-semibold">{p.title}</h3>
                          {p.time_estimate && <Badge variant="outline">{p.time_estimate}</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{p.why_it_impresses}</p>
                        {p.what_you_will_produce && (
                          <p className="text-sm mb-3"><span className="font-medium">You will produce: </span>{p.what_you_will_produce}</p>
                        )}
                        <ol className="space-y-1 text-sm mb-3 list-decimal list-inside text-muted-foreground">
                          {arr(p.steps).map((s: string, j: number) => <li key={j}>{s}</li>)}
                        </ol>
                        <div className="flex flex-wrap gap-2">
                          {arr(p.no_code_tools).map((t: string, j: number) => <Badge key={j} variant="secondary">{t}</Badge>)}
                          {arr(p.skills_demonstrated).map((t: string, j: number) => <Badge key={`s${j}`} variant="outline">{t}</Badge>)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {arr(result.job_specifications).length > 0 && (
              <div>
                <h2 className="font-display font-semibold text-xl mb-3 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" /> Job specifications in your domain
                </h2>
                <div className="grid gap-4">
                  {arr(result.job_specifications).map((j: any, i: number) => (
                    <Card key={i}>
                      <CardContent className="p-5">
                        <div className="flex flex-wrap items-center gap-2 justify-between mb-2">
                          <h3 className="font-semibold">{j.job_title}</h3>
                          <div className="flex gap-2">
                            {j.readiness && <Badge>{j.readiness}</Badge>}
                            {j.typical_experience && <Badge variant="outline">{j.typical_experience}</Badge>}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{j.what_you_would_do}</p>
                        <div className="grid sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium mb-1">Must have</p>
                            <ul className="text-muted-foreground space-y-1">
                              {arr(j.must_have_requirements).map((r: string, k: number) => <li key={k}>• {r}</li>)}
                            </ul>
                          </div>
                          <div>
                            <p className="font-medium mb-1">Nice to have</p>
                            <ul className="text-muted-foreground space-y-1">
                              {arr(j.nice_to_have).map((r: string, k: number) => <li key={k}>• {r}</li>)}
                            </ul>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {arr(j.tools_used).map((t: string, k: number) => <Badge key={k} variant="secondary">{t}</Badge>)}
                        </div>
                        {j.salary_range_inr && (
                          <p className="text-sm mt-3"><span className="font-medium">Indicative pay: </span>{j.salary_range_inr}</p>
                        )}
                        {j.entry_path && <p className="text-sm mt-1"><span className="font-medium">How to break in: </span>{j.entry_path}</p>}
                        {j.match_reason && <p className="text-sm mt-1 text-muted-foreground">{j.match_reason}</p>}
                        {arr(j.typical_titles).length > 0 && (
                          <p className="text-xs text-muted-foreground mt-3">Search these titles: {arr(j.typical_titles).join(" · ")}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Role details and pay ranges are AI-generated market estimates — verify against live postings before applying.
                </p>
              </div>
            )}

            {arr(result.skills_to_learn).length > 0 && (
              <Card>
                <CardContent className="p-5 sm:p-6">
                  <h2 className="font-display font-semibold text-xl mb-3 flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-primary" /> Skills to pick up
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {arr(result.skills_to_learn).map((s: any, i: number) => (
                      <div key={i} className="rounded-lg border border-border p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{s.skill}</span>
                          {s.time_to_learn && <Badge variant="outline">{s.time_to_learn}</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{s.why}</p>
                        {s.free_resource && <p className="text-sm mt-1">{s.free_resource}</p>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {arr(result.thirty_day_plan).length > 0 && (
              <Card>
                <CardContent className="p-5 sm:p-6">
                  <h2 className="font-display font-semibold text-xl mb-4 flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-primary" /> Your first 30 days
                  </h2>
                  <div className="space-y-4">
                    {arr(result.thirty_day_plan).map((w: any, i: number) => (
                      <div key={i} className="border-l-2 border-primary/40 pl-4">
                        <p className="font-medium">{w.week} — {w.focus}</p>
                        <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                          {arr(w.actions).map((a: string, k: number) => <li key={k}>• {a}</li>)}
                        </ul>
                        {w.outcome && <p className="text-sm mt-1"><span className="font-medium">Outcome: </span>{w.outcome}</p>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {arr(result.proof_of_work_checklist).length > 0 && (
              <Card>
                <CardContent className="p-5 sm:p-6">
                  <h2 className="font-display font-semibold text-xl mb-3">Before you apply</h2>
                  <ul className="space-y-2">
                    {arr(result.proof_of_work_checklist).map((c: string, i: number) => (
                      <li key={i} className="flex gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> {c}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>

      <ComplianceFooter />
    </div>
  );
};

export default PortfolioStudio;
