import crypto from "crypto";

/** تحقق من توقيع Webhook قبل تفعيل أي اشتراك/طلب */
export function verifyHmac(rawBody: string, signature: string, secret: string): boolean {
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

export function newVerifyCode(prefix = "TDR"): string {
  return `${prefix}-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
}

export function csrfToken(): string {
  return crypto.randomBytes(32).toString("hex");
}
