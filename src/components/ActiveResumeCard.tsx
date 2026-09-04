import { Link, useNavigate } from "react-router-dom";
import { FileText, Upload, RefreshCw, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useActiveResume } from "@/hooks/useActiveResume";

const formatDate = (iso?: string | null) => {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return null;
  }
};

export const ActiveResumeCard = () => {
  const navigate = useNavigate();
  const { resume, loading } = useActiveResume();

  return (
    <Card className="border-border/70">
      <CardContent className="p-4 sm:p-5">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Checking your resume...
          </div>
        ) : !resume ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">No resume yet</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Add your resume once — every feature here will use it automatically.
                </div>
              </div>
            </div>
            <Button variant="hero" size="sm" className="gap-1.5 shrink-0" onClick={() => navigate("/builder?upload=true")}>
              <Upload className="w-3.5 h-3.5" /> Upload Your Resume
            </Button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-foreground truncate">{resume.file_name}</span>
                  <Badge variant="outline" className="text-[10px]">Active Resume</Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {resume.ats_score != null ? (
                    <>Readiness {resume.ats_score}% · </>
                  ) : (
                    <>Resume uploaded — <Link to="/ats-analysis" className="text-primary underline underline-offset-2">Analyze your resume</Link> · </>
                  )}
                  {formatDate(resume.updated_at || resume.created_at) ? `Updated ${formatDate(resume.updated_at || resume.created_at)}` : "Saved to your account"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => navigate("/builder")}>
                View <ArrowRight className="w-3.5 h-3.5" />
              </Button>
              <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => navigate("/builder?upload=true")}>
                <RefreshCw className="w-3.5 h-3.5" /> Replace
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
