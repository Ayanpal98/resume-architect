import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlan } from "@/hooks/usePlan";
import { jobSeekerPlans, recruiterPlans } from "@/lib/plans";

type Props = {
  audience: "jobseeker" | "recruiter";
  minTier: 1 | 2 | 3;
  feature: string;
  fullPage?: boolean;
  children: ReactNode;
};

const PlanGate = ({ audience, minTier, feature, fullPage, children }: Props) => {
  const { tier, loading } = usePlan();
  if (loading) {
    return (
      <div className={`flex items-center justify-center ${fullPage ? "min-h-screen" : "py-10"}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }
  if (tier[audience] >= minTier) return <>{children}</>;

  const plan = (audience === "jobseeker" ? jobSeekerPlans : recruiterPlans)[minTier - 1];
  const card = (
    <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm text-center max-w-md mx-auto">
      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <Lock className="w-5 h-5 text-primary" />
      </div>
      <h2 className="font-display text-lg font-medium text-foreground mb-1">{feature}</h2>
      <p className="text-sm text-muted-foreground mb-5">
        Included with {plan.name} ({plan.price}) and above. Your access unlocks as soon as your payment is verified.
      </p>
      <div className="flex flex-col sm:flex-row gap-2 justify-center">
        <Button asChild>
          <Link to={`/checkout?plan=${plan.id}`}>Unlock with {plan.name}<ArrowRight className="w-4 h-4" /></Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/pricing">Compare plans</Link>
        </Button>
      </div>
    </div>
  );
  return fullPage ? (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">{card}</div>
  ) : (
    <div className="py-6">{card}</div>
  );
};

export default PlanGate;
