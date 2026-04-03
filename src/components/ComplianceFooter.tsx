import { useMemo } from "react";
import { getComplianceFooterData } from "@/lib/complianceFooter";

/**
 * Mandatory compliance footer block for all web report views.
 * Cannot be skipped or hidden.
 */
export const ComplianceFooter = () => {
  const { reportId, timestamp } = useMemo(() => getComplianceFooterData(), []);

  return (
    <div className="mt-6 rounded-lg overflow-hidden" style={{ backgroundColor: "#F8F8F8" }}>
      <div className="flex">
        <div className="w-1 shrink-0 bg-muted-foreground" />
        <div className="p-4 space-y-1">
          <p className="text-xs font-semibold text-foreground">⚠️ Beta Notice</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            ATSFy Technologies™ is currently in Beta (est. 2026).
          </p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            This report is AI-generated guidance only and must not be used as the sole basis for any employment decision.
          </p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Report ID: {reportId} | Generated: {timestamp}
          </p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Your resume data is automatically deleted within 24 hours.
          </p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            To contest any finding: info.atsfy@gmail.com
          </p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            © 2026 ATSFy Technologies. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};
