// ATSFy Technologies — official merchant collection account (UPI / Punjab National Bank)
export const MERCHANT = {
  name: "ATSFY TECHNOLOGIES",
  upiId: "9862510477m@pnb",
  merchantCode: "7372",
  bank: "Punjab National Bank",
  helpdesk: "1800 1800 / 1800 2021",
} as const;

/**
 * Builds a NPCI-compliant UPI deep link / QR payload for a fixed amount.
 * Rendered as a QR for desktop and opened directly in a UPI app on mobile.
 */
export const buildUpiLink = (amount: number, note: string) => {
  const params = new URLSearchParams({
    pa: MERCHANT.upiId,
    pn: MERCHANT.name,
    mc: MERCHANT.merchantCode,
    tn: note,
    am: amount.toFixed(2),
    cu: "INR",
    mode: "02",
  });
  return `upi://pay?${params.toString()}`;
};

/** Human-readable order reference, e.g. ATSFY-8F3K2M. */
export const generateOrderNumber = () => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  bytes.forEach((b) => {
    suffix += alphabet[b % alphabet.length];
  });
  return `ATSFY-${suffix}`;
};

/** UPI reference / UTR numbers are 12 digits. Some banks show a longer RRN. */
export const isValidUtr = (value: string) => /^\d{12}$/.test(value.trim());

export const formatInr = (amount: number) => `₹${amount.toLocaleString("en-IN")}`;
