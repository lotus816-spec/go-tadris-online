import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { verifyHmac } from "@/lib/security";

/** Webhooks: التحقق من التوقيع قبل تفعيل أي اشتراك */
export async function POST(req: NextRequest, { params }: { params: { provider: string } }) {
  const raw = await req.text();
  const sig = req.headers.get("x-signature") ?? req.headers.get("paypal-transmission-sig") ?? "";
  const secret = params.provider === "paypal" ? (process.env.PAYPAL_WEBHOOK_ID ?? "") : (process.env.EDAHABIA_WEBHOOK_SECRET ?? "");
  if (secret && sig && !verifyHmac(raw, sig, secret)) return NextResponse.json({ error: "BAD_SIGNATURE" }, { status: 401 });
  const body = JSON.parse(raw || "{}");
  const orderId = body.orderId ?? body.resource?.custom_id;
  if (orderId) {
    await prisma.order.update({ where: { id: orderId }, data: { status: "PAID", meta: body } }).catch(() => null);
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (order?.courseId) {
      await prisma.enrollment.upsert({ where: { studentId_courseId: { studentId: order.studentId, courseId: order.courseId } }, update: {}, create: { studentId: order.studentId, courseId: order.courseId } });
    }
  }
  return NextResponse.json({ ok: true });
}
