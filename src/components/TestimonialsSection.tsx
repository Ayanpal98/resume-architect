import { Quote } from "lucide-react";

const testimonials = [
  {
    id: "jobseeker",
    role: "Job Seeker",
    quote:
      "ATSFy changed how I think about my resume. Instead of guessing what recruiters see, I now know exactly how my experience maps to the role. The clarity alone made my applications feel sharper — and the response rate followed.",
    name: "Arjun Mehta",
    title: "Senior Product Manager",
    company: "Placed at a SaaS scale-up",
    metric: "More interview callbacks",
  },
  {
    id: "recruiter",
    role: "Recruiter",
    quote:
      "We were drowning in resumes for every open role. ATSFy gave us a structured way to rank candidates by signal, not just tenure. It cut our first-round filtering time noticeably and made the hiring conversation more objective.",
    name: "Priya Desai",
    title: "Head of Talent Acquisition",
    company: "Mid-size technology firm",
    metric: "Faster shortlisting",
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 border-t border-border/60 bg-gradient-to-b from-background to-primary/[0.03]">
      <div className="container mx-auto max-w-6xl">
        <div className="max-w-2xl mb-10 sm:mb-14">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4 flex items-center gap-3">
            <span>— Proof of Value</span>
            <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] tracking-[0.12em] text-muted-foreground/80">
              Illustrative
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium text-foreground leading-tight tracking-tight">
            Trusted by job seekers. <em className="italic font-normal text-primary">Built for recruiters.</em>
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground/70 font-sans mt-4">
            Personas are illustrative and composite — not endorsements by real, named individuals.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="glass-strong rounded-2xl p-6 sm:p-8 flex flex-col justify-between border border-border/60"
            >
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Quote className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-sans">
                    {t.role}
                  </span>
                </div>
                <blockquote className="text-base sm:text-lg text-foreground leading-relaxed font-sans mb-6">
                  “{t.quote}”
                </blockquote>
              </div>
              <div className="flex items-center justify-between border-t border-border/60 pt-6">
                <div>
                  <div className="font-display font-medium text-foreground tracking-tight">{t.name}</div>
                  <div className="text-xs text-muted-foreground font-sans">
                    {t.title}, {t.company}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-lg sm:text-xl font-medium text-accent tracking-tight">
                    {t.metric}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
