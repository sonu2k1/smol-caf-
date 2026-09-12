/**
 * ☕ Direct Device UPI Payment Engine for smol café
 * Payee VPA: sanidhyadwivedi2004@okicici
 * Payee Phone: +91 9305084332
 */

export interface UpiPaymentParams {
  amountPaise: number;
  orderNo?: string;
  transactionRef?: string;
  note?: string;
}

export function getUpiConfig() {
  return {
    vpa: process.env.NEXT_PUBLIC_UPI_ID || "sanidhyadwivedi2004@okicici",
    name: process.env.NEXT_PUBLIC_UPI_NAME || "smol café",
    phone: process.env.NEXT_PUBLIC_UPI_NUMBER || "+91 9305084332",
  };
}

/**
 * Builds standard UPI intent URI (upi://pay?pa=...&pn=...&am=...&cu=INR&tn=...&tr=...)
 */
export function buildUpiUri(params: UpiPaymentParams): string {
  const config = getUpiConfig();
  const amountRupees = (params.amountPaise / 100).toFixed(2);
  const note = params.note || (params.orderNo ? `smol cafe Order ${params.orderNo}` : "smol cafe payment");
  const tr = params.transactionRef || params.orderNo || `SMOL-${Date.now()}`;

  const queryParams = new URLSearchParams({
    pa: config.vpa,
    pn: config.name,
    am: amountRupees,
    cu: "INR",
    tn: note,
    tr: tr,
  });

  return `upi://pay?${queryParams.toString()}`;
}

/**
 * Triggers the native mobile UPI intent app chooser popup.
 * Opens all installed UPI apps on Android/iOS (Google Pay, PhonePe, Paytm, BHIM, CRED).
 */
export function launchUpiAppChooser(params: UpiPaymentParams): boolean {
  if (typeof window === "undefined") return false;

  const upiUri = buildUpiUri(params);
  window.location.href = upiUri;
  return true;
}
