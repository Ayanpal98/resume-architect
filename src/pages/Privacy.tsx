import { FileText, ArrowLeft, Mail, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border/60">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-hero rounded-xl flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-lg font-display font-bold text-accent tracking-tight">ATSFY</span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Career Intelligence</span>
            </div>
          </Link>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </div>
      </nav>

      <main className="container mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-border rounded-full text-xs font-medium text-muted-foreground mb-6 uppercase tracking-[0.15em]">
          <Shield className="w-3.5 h-3.5 text-accent" /> Privacy Policy
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-medium tracking-tight text-foreground mb-4">
          Privacy Policy
        </h1>
        <p className="text-xs text-muted-foreground mb-10">Last updated: June 2026 · Effective immediately</p>

        <div className="prose prose-sm max-w-none space-y-8 text-sm text-muted-foreground leading-relaxed">
          <section>
            <h2 className="font-display text-xl font-medium text-foreground mb-2 tracking-tight">1. What we collect</h2>
            <p>Account data (email, name), resume content you upload or build, job descriptions you paste, and usage telemetry needed to run the service.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-medium text-foreground mb-2 tracking-tight">2. How we use it</h2>
            <p>Solely to generate the report or resume you requested. We do not sell your data. We do not use your resume content to train third-party models.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-medium text-foreground mb-2 tracking-tight">3. Data retention</h2>
            <p>Resume content is automatically deleted within 24 hours of report generation. Account metadata is retained for the life of the account and removed on request.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-medium text-foreground mb-2 tracking-tight">4. Your rights (DPDP / GDPR)</h2>
            <p>You may request access, correction, export, or deletion of your data at any time. We respond within 30 days.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-medium text-foreground mb-2 tracking-tight">5. Security</h2>
            <p>AES-256 at rest, TLS 1.2+ in transit, role-based access, audit logging. See our <Link to="/security" className="text-primary hover:underline">Security Posture</Link> page.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-medium text-foreground mb-2 tracking-tight">6. Subprocessors</h2>
            <p>Supabase (database, auth, storage), Google Cloud (Gemini AI inference), Lovable (hosting). All under DPAs.</p>
          </section>

          <section className="rounded-2xl border border-border/60 p-6 bg-card not-prose">
            <h2 className="font-display text-xl font-medium text-foreground mb-2 tracking-tight">7. Grievance Officer & Data Protection Contact</h2>
            <p className="text-sm text-muted-foreground mb-4">
              In accordance with the Digital Personal Data Protection Act, 2023 (India) and applicable global privacy laws, the following individual has been designated as the Grievance Officer / Data Protection Contact for ATSFy Technologies™:
            </p>
            <div className="space-y-1.5 text-sm">
              <p className="text-foreground"><strong>Name:</strong> Grievance Officer, ATSFy Technologies</p>
              <p className="text-foreground"><strong>Role:</strong> Data Protection & Grievance Contact</p>
              <p className="text-foreground flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <strong>Email:</strong>{" "}
                <a href="mailto:grievance.atsfy@gmail.com" className="text-primary font-medium hover:underline">
                  grievance.atsfy@gmail.com
                </a>
              </p>
              <p className="text-foreground"><strong>Response SLA:</strong> Acknowledged within 48 hours; resolved within 30 days as per DPDP Act.</p>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              You may contact the Grievance Officer for any complaints, data subject requests, consent withdrawal, or to report a privacy concern.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-medium text-foreground mb-2 tracking-tight">8. Changes</h2>
            <p>We will update this page when our practices change and notify active users by email for material changes.</p>
          </section>
        </div>

        <p className="text-xs text-muted-foreground mt-12">
          © 2026 ATSFy Technologies. All rights reserved.
        </p>
      </main>
    </div>
  );
};

export default Privacy;
