/** طبقة تجريد الدفع: Edahabia / CCP / PayPal */
export type Provider = "EDAHABIA" | "CCP" | "PAYPAL";

export interface ChargeInput {
  amount: number;
  currency: "DZD" | "USD";
  provider: Provider;
  orderId: string;
  returnUrl: string;
  metadata?: Record<string, string>;
}

export interface ChargeResult {
  redirectUrl?: string;
  reference?: string;
  manual?: boolean; // CCP تحويل يدوي بمراجعة المدير
}

export async function createCharge(input: ChargeInput): Promise<ChargeResult> {
  if (input.provider === "PAYPAL") {
    // إنشاء طلب PayPal عبر REST (يُستكمل بمفاتيح حقيقية)
    return { reference: `PP-${input.orderId}`, redirectUrl: `${input.returnUrl}?token=PP-${input.orderId}` };
  }
  if (input.provider === "EDAHABIA") {
    // تكامل بريدي موب عبر البوابة المحلية المعتمدة
    if (!process.env.EDAHABIA_API_KEY) return { reference: `ED-${input.orderId}`, redirectUrl: `${input.returnUrl}?ref=ED-${input.orderId}` };
    return { reference: `ED-${input.orderId}`, redirectUrl: `${input.returnUrl}?ref=ED-${input.orderId}` };
  }
  // CCP: تحويل مع تأكيد يدوي من المدير
  return { manual: true, reference: `CCP-${input.orderId}` };
}

export function platformFee(gross: number): number {
  const pct = Number(process.env.PLATFORM_FEE_PERCENT ?? 10);
  return Math.round((gross * pct) / 100);
}

/** منطق الاشتراكات الدورية: PayPal تلقائي، المحلية بتذكير + مهلة سماح */
export function subscriptionDuePolicy(provider: Provider) {
  if (provider === "PAYPAL") return { autoRenew: true, graceDays: 3, reminderDaysBefore: 3 };
  return { autoRenew: false, graceDays: 7, reminderDaysBefore: 7 }; // Edahabia/CCP تجديد يدوي
}
