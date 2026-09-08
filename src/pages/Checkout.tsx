import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, CreditCard, FileText, Lock, Info } from "lucide-react";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { getPlanById, jobSeekerPlans, TRANSPARENCY_LINE } from "@/lib/plans";

const STEPS = ["Review", "Your details", "Payment"] as const;

const Checkout = () => {
  const [params] = useSearchParams();
  const { user } = useAuth();
  const plan = useMemo(() => getPlanById(params.get("plan")), [params]);

  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");

  if (!plan) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Seo title={"Checkout — ATSFy"} description={"Complete your ATSFy premium report purchase."} path={"/checkout"} />
        <div className="text-center max-w-md">
          <h1 className="font-display text-2xl font-medium text-foreground mb-2">Choose a plan first</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Pick the report bundle you want and we'll bring you straight back here.
          </p>
          <Button asChild>
            <Link to="/pricing">View pricing<ArrowRight className="w-4 h-4" /></Link>
          </Button>
        </div>
      </div>
    );
  }

  const isRecruiter = plan.audience === "recruiter";
  const detailsValid = fullName.trim().length > 1 && /\S+@\S+\.\S+/.test(email);

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title={`Checkout — ${plan.name} | ATSFy`}
        description={`Complete your purchase of the ATSFy ${plan.name} report bundle at ${plan.price}.`}
        path={"/checkout"}
      />

      <header className="border-b border-border/60">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-hero rounded-xl flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-display font-bold text-accent tracking-tight">ATSFY</span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="w-3.5 h-3.5" />
            Secure checkout
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12">
        <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2">
          <Link to="/pricing"><ArrowLeft className="w-4 h-4" />Back to pricing</Link>
        </Button>

        {/* Steps */}
        <ol className="flex items-center gap-3 sm:gap-5 mb-8">
          {STEPS.map((label, i) => (
            <li key={label} className="flex items-center gap-2 sm:gap-3">
              <span
                className={`w-6 h-6 rounded-full text-[11px] font-medium flex items-center justify-center ${
                  i < step
                    ? "bg-accent text-accent-foreground"
                    : i === step
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {i < step ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
              </span>
              <span className={`text-xs sm:text-sm ${i === step ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                {label}
              </span>
              {i < STEPS.length - 1 && <span className="hidden sm:block w-8 h-px bg-border" />}
            </li>
          ))}
        </ol>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 lg:gap-8 items-start">
          {/* Left: step content */}
          <div className="rounded-2xl border border-border/60 bg-card p-5 sm:p-7 shadow-sm">
            {step === 0 && (
              <>
                <h1 className="font-display text-xl sm:text-2xl font-medium tracking-tight text-foreground mb-1">
                  Review what's included
                </h1>
                <p className="text-sm text-muted-foreground mb-5">
                  {isRecruiter
                    ? "Monthly screening plan. Cancel anytime."
                    : "A one-time purchase. No subscription, no auto-renewal."}
                </p>
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-accent" />
                      <span className="leading-snug">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full sm:w-auto" onClick={() => setStep(1)}>
                  Continue<ArrowRight className="w-4 h-4" />
                </Button>
              </>
            )}

            {step === 1 && (
              <>
                <h1 className="font-display text-xl sm:text-2xl font-medium tracking-tight text-foreground mb-1">
                  Your details
                </h1>
                <p className="text-sm text-muted-foreground mb-5">
                  We use these only for your receipt and to deliver the report.
                </p>
                <div className="space-y-4 max-w-md">
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName">Full name</Label>
                    <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ayan Pal" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email for receipt</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 mt-6">
                  <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
                  <Button disabled={!detailsValid} onClick={() => setStep(2)}>
                    Continue to payment<ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h1 className="font-display text-xl sm:text-2xl font-medium tracking-tight text-foreground mb-1">
                  Payment
                </h1>
                <p className="text-sm text-muted-foreground mb-5">
                  {plan.name} — {plan.price} {isRecruiter ? "per month" : "one time"}, billed to {email}.
                </p>

                <div className="rounded-xl border border-border bg-muted/40 p-4 sm:p-5 mb-5">
                  <div className="flex items-start gap-3">
                    <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Card payments aren't switched on yet</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Everything up to this point is ready. Once the payment provider is connected, this button will
                        open a secure card and UPI checkout — nothing is charged today.
                      </p>
                    </div>
                  </div>
                </div>

                <Button className="w-full sm:w-auto" disabled>
                  <CreditCard className="w-4 h-4" />
                  Pay {plan.price}
                </Button>
                <div className="mt-4">
                  <Button variant="ghost" size="sm" onClick={() => setStep(1)}>Back</Button>
                </div>
              </>
            )}
          </div>

          {/* Right: order summary */}
          <aside className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6 shadow-sm lg:sticky lg:top-8">
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3">Order summary</p>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-display text-lg font-medium text-foreground">{plan.name}</p>
                <p className="text-xs text-muted-foreground">
                  {isRecruiter ? "Monthly screening plan" : "One-time report bundle"}
                </p>
              </div>
              {plan.badge && (
                <Badge variant="secondary" className="text-[10px] uppercase tracking-[0.12em]">{plan.badge}</Badge>
              )}
            </div>

            <div className="border-t border-border my-4" />

            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="text-sm text-foreground">{plan.price}</span>
            </div>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-sm text-muted-foreground">Taxes</span>
              <span className="text-sm text-muted-foreground">Shown at payment</span>
            </div>

            <div className="border-t border-border my-4" />

            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium text-foreground">Total due today</span>
              <span className="font-display text-2xl font-medium text-foreground">
                {plan.price}
                <span className="text-xs text-muted-foreground font-sans ml-1">{plan.period}</span>
              </span>
            </div>

            <p className="text-xs text-muted-foreground mt-4 leading-relaxed">{TRANSPARENCY_LINE}</p>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              {isRecruiter
                ? "Cancel anytime. 7-day money-back guarantee."
                : "No auto-renewal. 7-day money-back guarantee on all paid reports."}
            </p>

            {!isRecruiter && (
              <div className="mt-5 pt-4 border-t border-border">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Change plan</p>
                <div className="flex flex-col gap-1.5">
                  {jobSeekerPlans
                    .filter((p) => p.id !== plan.id)
                    .map((p) => (
                      <Link
                        key={p.id}
                        to={`/checkout?plan=${p.id}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {p.name} — {p.price}
                      </Link>
                    ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
