import { FileText, Shield, Lock, Activity, AlertTriangle, KeyRound, Server, Mail, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Security = () => {
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

      <main className="container mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 border border-border rounded-full text-xs font-medium text-muted-foreground mb-6 uppercase tracking-[0.15em]">
          <Shield className="w-3.5 h-3.5 text-accent" /> Security Posture
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-medium tracking-tight text-foreground mb-4">
          Security & Trust at <em className="italic font-normal text-primary">ATSFy</em>
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg mb-2 max-w-2xl">
          We treat candidate and recruiter data as confidential by default. This page documents our current security controls, SOC 2 readiness posture, and incident response intent.
        </p>
        <p className="text-xs text-muted-foreground mb-12">Last updated: June 2026 · Version 1.0</p>

        <div className="grid sm:grid-cols-2 gap-px bg-border/60 border border-border/60 rounded-2xl overflow-hidden mb-12">
          {[
            { icon: Lock, title: "Encryption", body: "AES-256 at rest. TLS 1.2+ in transit. All data encrypted across storage, backups, and inter-service traffic." },
            { icon: KeyRound, title: "Access Control", body: "Role-based access with least-privilege defaults. Production access is restricted, audited, and tied to individual accounts." },
            { icon: Activity, title: "Access Logging", body: "Every read/write to candidate data is logged with actor, timestamp, and request context. Logs retained for audit." },
            { icon: Server, title: "Infrastructure", body: "Hosted on enterprise-grade cloud (Supabase + Lovable Cloud) with hardened network policies and RLS-enforced data isolation." },
            { icon: AlertTriangle, title: "Incident Response", body: "Documented IR runbook. Customers notified within 72 hours of any confirmed breach, per DPDP and GDPR norms." },
            { icon: Shield, title: "SOC 2 Readiness", body: "Aligned with SOC 2 Type I control families (Security, Availability, Confidentiality). Type II audit planned post-GA." },
          ].map((item) => (
            <div key={item.title} className="bg-background p-6 sm:p-7">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <item.icon className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-display text-lg font-medium text-foreground mb-1.5 tracking-tight">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>

        <section className="mb-10">
          <h2 className="font-display text-2xl font-medium text-foreground mb-3 tracking-tight">Data Handling</h2>
          <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
            <li>• Resume content is processed only to generate the requested report and is automatically deleted within 24 hours.</li>
            <li>• We do not sell, share, or train third-party models on user resume data.</li>
            <li>• AI inference runs through approved providers (Google Gemini) under enterprise data-processing terms; no prompt-level training.</li>
            <li>• Customers may request data export or deletion at any time via the contact below.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="font-display text-2xl font-medium text-foreground mb-3 tracking-tight">Compliance Alignment</h2>
          <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
            <li>• <strong className="text-foreground">SOC 2:</strong> Readiness program in progress. Controls mapped to Trust Service Criteria.</li>
            <li>• <strong className="text-foreground">DPDP Act 2023 (India):</strong> Named grievance officer, 24-hour data minimization, consent-based processing.</li>
            <li>• <strong className="text-foreground">GDPR:</strong> Lawful basis, data subject rights (access, erasure, portability), breach notification within 72 hours.</li>
            <li>• <strong className="text-foreground">ISO 27001 alignment:</strong> Policies modeled on ISO/IEC 27001 Annex A controls.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="font-display text-2xl font-medium text-foreground mb-3 tracking-tight">Vendor & Subprocessors</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Core subprocessors: Supabase (database, auth, storage), Google Cloud (AI inference via Gemini), Lovable (hosting). All under signed DPAs.
          </p>
        </section>

        <section className="rounded-2xl border border-border/60 p-6 sm:p-8 bg-card">
          <h2 className="font-display text-2xl font-medium text-foreground mb-2 tracking-tight">Security Contact</h2>
          <p className="text-sm text-muted-foreground mb-4">
            For security reports, DPA requests, or enterprise due-diligence questionnaires:
          </p>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-primary" />
            <a href="mailto:security.atsfy@gmail.com" className="text-primary font-medium hover:underline">security.atsfy@gmail.com</a>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Response SLA: within 2 business days for security inquiries; within 24 hours for confirmed incidents.
          </p>
        </section>

        <p className="text-xs text-muted-foreground mt-10">
          ATSFy Technologies™ is currently in Beta. This document reflects our current posture and intent; controls evolve as we approach SOC 2 Type II readiness.
        </p>
      </main>
    </div>
  );
};

export default Security;
