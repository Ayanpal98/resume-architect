import { useEffect, useState } from "react";
import { FileText, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Stats {
  resumes_optimized: number;
  candidate_screenings: number;
}

const AnimatedNumber = ({ value }: { value: number }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === 0) return;
    const duration = 1500;
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), value);
      setDisplay(current);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return <span>{display.toLocaleString()}</span>;
};

export const LiveStatsCounter = () => {
  const [stats, setStats] = useState<Stats>({ resumes_optimized: 0, candidate_screenings: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase
        .from("platform_stats")
        .select("resumes_optimized, candidate_screenings")
        .eq("id", "global")
        .single();
      if (data) setStats(data);
    };
    fetchStats();

    const channel = supabase
      .channel("platform-stats-realtime")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "platform_stats" },
        (payload) => {
          const { resumes_optimized, candidate_screenings } = payload.new as Stats;
          setStats({ resumes_optimized, candidate_screenings });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12">
      <div className="flex items-center gap-3 px-6 py-4 bg-card rounded-2xl border border-border shadow-sm">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-display font-bold text-foreground">
            <AnimatedNumber value={stats.resumes_optimized} />
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground">Resumes Optimized</div>
        </div>
        <div className="ml-2 w-2 h-2 rounded-full bg-accent animate-pulse" title="Live" />
      </div>
      <div className="flex items-center gap-3 px-6 py-4 bg-card rounded-2xl border border-border shadow-sm">
        <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
          <Users className="w-5 h-5 text-accent" />
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-display font-bold text-foreground">
            <AnimatedNumber value={stats.candidate_screenings} />
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground">Candidates Screened</div>
        </div>
        <div className="ml-2 w-2 h-2 rounded-full bg-accent animate-pulse" title="Live" />
      </div>
    </div>
  );
};
