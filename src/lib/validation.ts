import { z } from "zod";

export const courseSchema = z.object({
  title: z.string().min(3).max(120),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().min(10),
  priceDZD: z.number().int().min(0),
  priceUSD: z.number().min(0).optional(),
  categoryId: z.string().optional(),
});

export const quizSubmitSchema = z.object({
  answers: z.record(z.string()),
});

export const couponSchema = z.object({
  code: z.string().min(4).max(32),
  kind: z.enum(["PERCENT", "FIXED", "FREE_COURSE"]),
  value: z.number().min(0),
  courseId: z.string().optional(),
  maxUses: z.number().int().positive().optional(),
  expiresAt: z.string().datetime().optional(),
});

export const wheelSpinSchema = z.object({
  wheelId: z.string(),
});

export const emailSchema = z.string().email().max(254);
export const phoneDZ = z.string().regex(/^(\+213|0)(5|6|7)[0-9]{8}$/, "رقم هاتف جزائري غير صالح");

export function sanitizeHtml(input: string): string {
  // تعقيم أساسي ضد XSS (يُستكمل بـ DOMPurify في الواجهة عند الحاجة)
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/on\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/on\w+\s*=\s*'[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}
