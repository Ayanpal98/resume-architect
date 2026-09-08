import { Link } from "react-router-dom";
import { ArrowLeft, FileText, ShieldCheck, Receipt, RefreshCcw } from "lucide-react";
import { Seo } from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { PricingSection } from "@/components/PricingSection";
import { TRANSPARENCY_LINE } from "@/lib/plans";

const FAQ = [
  {
    q: "Is there a subscription for job seekers?",
    a: "No. Every job seeker plan is a one-time purchase for a single report bundle. Nothing renews automatically.",
  },
  {
    q: "What exactly do I get?",
    a: "The features listed on each plan card are live in the product today. You keep the exported PDFs after the report is generated.",
  },
  {
    q: "Can I upgrade later?",
    a: "Yes. You can buy a higher tier at any time — each purchase stands on its own, so you are never locked in.",
  },
  {
    q: "Do recruiter plans renew?",
    a: "Recruiter plans are monthly subscriptions with the screening volume shown on the card. You can cancel anytime.",
  },
];

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Seo
        title={"Pricing — ATSFy Premium Reports"}
        description={"ATSFy premium report pricing: ₹999 Starter, ₹1,499 Professional, ₹2,599 Elite. One-time purchases, no subscriptions for job seekers."}
        path={"/pricing"}
      />

      <header className="border-b border-border/60">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-hero rounded-xl flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-lg font-display font-bold text-accent tracking-tight">ATSFY</span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-sans">Hiring Intelligence</span>
            </div>
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </Button>
        </div>
      </header>

      <main>
        <section className="px-4 sm:px-6 pt-10 sm:pt-16 pb-2">
          <div className="container mx-auto max-w-6xl">
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-foreground max-w-3xl leading-tight">
              Premium reports, priced per report.
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg mt-4 max-w-2xl font-sans">
              {TRANSPARENCY_LINE}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              {[
                { icon: <Receipt className="w-4 h-4" />, title: "One-time payment", body: "Pay once per report bundle. Nothing renews on its own." },
                { icon: <RefreshCcw className="w-4 h-4" />, title: "7-day money back", body: "Not useful? Ask for a refund within 7 days of purchase." },
                { icon: <ShieldCheck className="w-4 h-4" />, title: "Your data, deleted", body: "Uploaded documents follow our 24-hour deletion policy." },
              ].map((c) => (
                <div key={c.title} className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                    {c.icon}
                  </div>
                  <p className="font-medium text-foreground text-sm">{c.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <PricingSection />

        <section className="px-4 sm:px-6 py-12 sm:py-20 border-t border-border/60">
          <div className="container mx-auto max-w-3xl">
            <h2 className="font-display text-2xl sm:text-3xl font-medium tracking-tight text-foreground mb-6">
              Questions before you buy
            </h2>
            <div className="space-y-3">
              {FAQ.map((f) => (
                <div key={f.q} className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
                  <p className="font-medium text-foreground text-sm">{f.q}</p>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-6">
              See our <Link to="/privacy" className="text-primary hover:underline">Privacy</Link> and{" "}
              <Link to="/security" className="text-primary hover:underline">Security</Link> pages for how your data is handled.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Pricing;
