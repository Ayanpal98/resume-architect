import { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export const WaitlistSection = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedName.length < 2) {
      toast.error("Please enter your full name.");
      return;
    }
    if (!EMAIL_RE.test(trimmedEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("waitlist_signups").insert({
      name: trimmedName,
      email: trimmedEmail,
      resume_upload_consent: consent,
    });
    setLoading(false);

    if (error) {
      if (error.code === "23505") {
        setDone(true);
        toast.success("You're already on the list — we'll be in touch.");
        return;
      }
      toast.error("Something went wrong. Please try again.");
      return;
    }

    setDone(true);
    toast.success("You're on the list. Early access details are on the way.");
  };

  return (
    <section id="waitlist" className="py-16 sm:py-24 px-4 sm:px-6 border-t border-border/60">
      <div className="container mx-auto max-w-5xl">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">— Early access</div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium text-foreground mb-4 leading-tight tracking-tight">
              Get the intelligence <em className="italic font-normal text-primary">before everyone else.</em>
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg font-sans leading-relaxed">
              Join the ATSFy waitlist for priority onboarding, early report credits, and first access to new intelligence modules.
            </p>
            <div className="flex items-center gap-2 mt-6 text-xs text-muted-foreground font-sans">
              <ShieldCheck className="w-4 h-4 text-accent" />
              No spam. Your data is never sold, and you can opt out anytime.
            </div>
          </div>

          <div className="glass-strong rounded-2xl p-6 sm:p-8">
            {done ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-display text-2xl font-medium text-foreground mb-2 tracking-tight">You're on the list</h3>
                <p className="text-sm text-muted-foreground font-sans">
                  We'll email you as soon as your early access slot opens.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="waitlist-name">Full name</Label>
                  <Input
                    id="waitlist-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Priya Sharma"
                    autoComplete="name"
                    maxLength={120}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="waitlist-email">Work email</Label>
                  <Input
                    id="waitlist-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    autoComplete="email"
                    maxLength={254}
                    required
                  />
                </div>
                <div className="flex items-start gap-3 rounded-xl border border-border bg-background/50 p-4">
                  <Checkbox
                    id="waitlist-consent"
                    checked={consent}
                    onCheckedChange={(v) => setConsent(v === true)}
                    className="mt-0.5"
                  />
                  <Label htmlFor="waitlist-consent" className="text-xs sm:text-sm font-normal leading-relaxed text-muted-foreground cursor-pointer">
                    I allow ATSFy to review a resume I upload so my early access report can be prepared in advance.
                  </Label>
                </div>
                <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Joining…
                    </>
                  ) : (
                    <>
                      Join the waitlist
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
                <p className="text-[11px] text-muted-foreground font-sans text-center">
                  By joining you agree to our privacy practices. Resume review only happens with your permission.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
