import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePlan } from "@/hooks/usePlan";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Plus, X } from "lucide-react";
import { toast } from "sonner";

interface Opening { id: string; title: string; description: string; status: string; created_at: string }

const OPENING_LIMIT: Record<number, number | null> = { 0: 0, 1: 1, 2: 5, 3: null };
const SCREEN_LIMIT: Record<number, number> = { 0: 0, 1: 25, 2: 100, 3: 250 };

export const JobOpeningsPanel = ({ onSelect, selectedTitle }: { onSelect: (o: Opening) => void; selectedTitle?: string }) => {
  const { user } = useAuth();
  const { tier } = usePlan();
  const rTier = tier?.recruiter ?? 0;
  const [openings, setOpenings] = useState<Opening[]>([]);
  const [used, setUsed] = useState(0);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!user) return;
    const since = new Date(Date.now() - 31 * 864e5).toISOString();
    const [{ data }, { count }] = await Promise.all([
      supabase.from("job_openings").select("*").order("created_at", { ascending: false }),
      supabase.from("screening_usage").select("id", { count: "exact", head: true }).gte("created_at", since),
    ]);
    setOpenings((data as Opening[]) ?? []);
    setUsed(count ?? 0);
  };
  useEffect(() => { load(); }, [user]);

  const open = openings.filter((o) => o.status === "open");
  const limit = OPENING_LIMIT[rTier];
  const atLimit = limit !== null && open.length >= limit;

  const create = async () => {
    if (!user) return;
    if (!title.trim() || desc.trim().length < 50) { toast.error("Add a title and a job description of at least 50 characters"); return; }
    setSaving(true);
    const { error } = await supabase.from("job_openings").insert({ user_id: user.id, title: title.trim(), description: desc.trim() });
    setSaving(false);
    if (error) {
      toast.error(error.message.includes("job_opening_limit_reached") ? "You've reached your plan's job opening limit. Close one or upgrade." : "Couldn't save the opening. Please try again.");
      return;
    }
    toast.success("Job opening posted");
    setTitle(""); setDesc(""); setAdding(false); load();
  };

  const setStatus = async (o: Opening, status: string) => {
    const { error } = await supabase.from("job_openings").update({ status }).eq("id", o.id);
    if (error) toast.error(error.message.includes("job_opening_limit_reached") ? "Reopening would exceed your plan's limit." : "Couldn't update the opening.");
    load();
  };

  return (
    <div className="mb-8 rounded-2xl border border-border/60 bg-card p-5 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">Job openings</h2>
          <Badge variant="secondary">{open.length} / {limit === null ? "Unlimited" : limit} open</Badge>
          <Badge variant="outline">{used} / {SCREEN_LIMIT[rTier]} screenings this month</Badge>
        </div>
        <Button size="sm" onClick={() => setAdding((v) => !v)} disabled={atLimit && !adding}>
          {adding ? <X className="w-4 h-4 mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
          {adding ? "Cancel" : atLimit ? "Limit reached" : "Post opening"}
        </Button>
      </div>

      {adding && (
        <div className="rounded-xl border border-border/60 bg-muted/30 p-3 space-y-2">
          <Input placeholder="Job title, e.g. Senior Backend Engineer" value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)} />
          <Textarea placeholder="Paste the job description (at least 50 characters)" rows={5} value={desc} maxLength={50000} onChange={(e) => setDesc(e.target.value)} />
          <Button size="sm" onClick={create} disabled={saving}>{saving ? "Saving..." : "Save opening"}</Button>
        </div>
      )}

      {openings.length === 0 ? (
        <p className="text-sm text-muted-foreground">No openings yet. Post one, then screen candidates against it.</p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {openings.map((o) => (
            <div key={o.id} className={`rounded-xl border p-3 ${selectedTitle === o.title ? "border-primary bg-primary/5" : "border-border/60 bg-muted/30"}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-sm text-foreground truncate">{o.title}</span>
                <Badge variant={o.status === "open" ? "default" : "secondary"}>{o.status === "open" ? "Open" : "Closed"}</Badge>
              </div>
              <div className="mt-2 flex gap-2">
                {o.status === "open" && <Button size="sm" variant="outline" onClick={() => onSelect(o)}>Screen candidates</Button>}
                <Button size="sm" variant="ghost" onClick={() => setStatus(o, o.status === "open" ? "closed" : "open")}>
                  {o.status === "open" ? "Close" : "Reopen"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
