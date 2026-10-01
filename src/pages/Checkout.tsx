import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  Copy,
  FileText,
  Loader2,
  Lock,
  Smartphone,
  ShieldCheck,
} from "lucide-react";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getPlanById, jobSeekerPlans, TRANSPARENCY_LINE } from "@/lib/plans";
import {
  MERCHANT,
  buildUpiLink,
  formatInr,
  generateOrderNumber,
  isValidUtr,
} from "@/lib/payments";

const STEPS = ["Review", "Your details", "Payment"] as const;

type PlacedOrder = {
  orderNumber: string;
  utr: string;
  createdAt: string;
};

const Checkout = () => {
  const [params] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const plan = useMemo(() => getPlanById(params.get("plan")), [params]);

  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("");
  const [utr, setUtr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [order, setOrder] = useState<PlacedOrder | null>(null);

  useEffect(() => {
    if (user?.email && !email) setEmail(user.email);
  }, [user, email]);

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
  const note = `ATSFy ${plan.name}`;
  const upiLink = buildUpiLink(plan.amount, note);

  const copy = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1800);
    } catch {
      toast({ title: "Couldn't copy", description: "Please copy it manually.", variant: "destructive" });
    }
  };

  const confirmPayment = async () => {
    if (!user) {
      toast({ title: "Please sign in", description: "Sign in to record your order.", variant: "destructive" });
      return;
    }
    if (!isValidUtr(utr)) {
      toast({
        title: "Check the reference number",
        description: "Enter the 12-digit UPI reference (UTR) shown in your payment app.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    const orderNumber = generateOrderNumber();
    const { error } = await supabase.from("orders").insert({
      user_id: user.id,
      order_number: orderNumber,
      plan_id: plan.id,
      plan_name: plan.name,
      amount: plan.amount,
      currency: plan.currency,
      full_name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim() || null,
      payment_method: "upi_qr",
      payment_status: "pending_verification",
      utr_number: utr.trim(),
      paid_at: new Date().toISOString(),
    });
    setSubmitting(false);

    if (error) {
      toast({
        title: "Couldn't record your order",
        description: "Please try again in a moment — your payment is safe.",
        variant: "destructive",
      });
      return;
    }

    setOrder({ orderNumber, utr: utr.trim(), createdAt: new Date().toISOString() });
  };

  /* ---------------- Confirmation ---------------- */
  if (order) {
    return (
      <div className="min-h-screen bg-background">
        <Seo
          title={`Order confirmed — ${plan.name} | ATSFy`}
          description={"Your ATSFy order is confirmed."}
          path={"/checkout"}
        />
        <main className="container mx-auto max-w-xl px-4 sm:px-6 py-14 sm:py-20">
          <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8 shadow-sm text-center">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
              <BadgeCheck className="w-7 h-7 text-accent" />
            </div>
            <h1 className="font-display text-2xl font-medium tracking-tight text-foreground mb-2">
              Payment received
            </h1>
            <p className="text-sm text-muted-foreground mb-7 leading-relaxed">
              Thank you, {fullName.trim().split(" ")[0]}. Your {plan.name} access is being activated and the receipt is
              on its way to {email}.
            </p>

            <dl className="text-left rounded-xl border border-border bg-muted/40 divide-y divide-border">
              {[
                ["Order number", order.orderNumber],
                ["Plan", plan.name],
                ["Amount paid", `${formatInr(plan.amount)} ${isRecruiter ? "per month" : "one time"}`],
                ["Paid to", `${MERCHANT.name} · ${MERCHANT.upiId}`],
                ["UPI reference", order.utr],
                ["Date", new Date(order.createdAt).toLocaleString("en-IN")],
              ].map(([k, v]) => (
                <div key={k} className="flex items-start justify-between gap-4 px-4 py-3">
                  <dt className="text-xs text-muted-foreground">{k}</dt>
                  <dd className="text-xs font-medium text-foreground text-right break-all">{v}</dd>
                </div>
              ))}
            </dl>

            <p className="text-xs text-muted-foreground mt-5 leading-relaxed">
              We verify every UPI reference against the ATSFy Technologies merchant account. You'll get an email the
              moment it clears, usually within a few minutes.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-7">
              <Button asChild>
                <Link to={isRecruiter ? "/recruiter" : "/career-intelligence"}>
                  Go to your dashboard<ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button variant="outline" onClick={() => window.print()}>
                Print receipt
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone (optional)</Label>
                    <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="For payment follow-up" />
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
                  Pay {formatInr(plan.amount)} by UPI
                </h1>
                <p className="text-sm text-muted-foreground mb-6">
                  {plan.name} — {isRecruiter ? "monthly" : "one time"}, receipt to {email}.
                </p>

                {/* QR + UPI id */}
                <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-5 sm:gap-6 items-start">
                  <div className="rounded-xl border border-border bg-white p-4 w-fit mx-auto sm:mx-0">
                    <QRCodeSVG value={upiLink} size={168} level="M" includeMargin={false} />
                    <p className="text-[10px] text-center text-neutral-500 mt-2.5 tracking-wide">
                      SCAN &amp; PAY · {formatInr(plan.amount)}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5">Paying</p>
                      <p className="text-sm font-medium text-foreground">{MERCHANT.name}</p>
                      <p className="text-xs text-muted-foreground">{MERCHANT.bank}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs bg-muted/60 border border-border rounded-lg px-3 py-2 text-foreground break-all">
                          {MERCHANT.upiId}
                        </code>
                        <Button variant="outline" size="sm" onClick={() => copy(MERCHANT.upiId, "upi")}>
                          {copied === "upi" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          UPI ID
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs bg-muted/60 border border-border rounded-lg px-3 py-2 text-foreground">
                          {formatInr(plan.amount)}
                        </code>
                        <Button variant="outline" size="sm" onClick={() => copy(String(plan.amount), "amt")}>
                          {copied === "amt" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          Amount
                        </Button>
                      </div>
                    </div>

                    <Button asChild className="w-full sm:hidden">
                      <a href={upiLink}>
                        <Smartphone className="w-4 h-4" />
                        Pay with a UPI app
                      </a>
                    </Button>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Scan with Google Pay, PhonePe, Paytm, BHIM or any bank app. The amount and merchant are already
                      filled in — please don't change them.
                    </p>
                  </div>
                </div>

                {/* UTR confirmation */}
                <div className="mt-7 pt-6 border-t border-border">
                  <h2 className="text-sm font-medium text-foreground mb-1">Confirm your payment</h2>
                  <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                    After paying, enter the 12-digit UPI reference number (UTR / transaction ID) from your payment app.
                    This is how we match your payment to your order.
                  </p>
                  <div className="space-y-1.5 max-w-xs">
                    <Label htmlFor="utr">UPI reference number</Label>
                    <Input
                      id="utr"
                      inputMode="numeric"
                      maxLength={12}
                      value={utr}
                      onChange={(e) => setUtr(e.target.value.replace(/\D/g, ""))}
                      placeholder="123456789012"
                    />
                  </div>

                  <div className="flex flex-wrap gap-3 mt-5">
                    <Button variant="ghost" size="sm" onClick={() => setStep(1)}>Back</Button>
                    <Button onClick={confirmPayment} disabled={submitting || !isValidUtr(utr)}>
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                      {submitting ? "Confirming…" : `I've paid ${formatInr(plan.amount)}`}
                    </Button>
                  </div>
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
              <span className="text-sm text-muted-foreground">Included</span>
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
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Payments go directly to {MERCHANT.name} via UPI. Helpdesk {MERCHANT.helpdesk}.
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
