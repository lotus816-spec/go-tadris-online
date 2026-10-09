import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { currentUser } from "@/lib/session";
import { createCharge, platformFee } from "@/lib/payments";

export async function POST(req: NextRequest) {
  const u = await currentUser();
  if (!u) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { courseId, provider, couponCode, currency } = await req.json();
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  let amount = currency === "USD" && course.priceUSD ? course.priceUSD : course.priceDZD;
  let cur = currency === "USD" ? "USD" : "DZD";
  if (couponCode) {
    const c = await prisma.coupon.findUnique({ where: { code: couponCode } });
    if (c && (!c.expiresAt || c.expiresAt > new Date()) && (!c.maxUses || c.used < c.maxUses) && (!c.courseId || c.courseId === courseId)) {
      if (c.kind === "PERCENT") amount = amount * (1 - c.value / 100);
      else if (c.kind === "FIXED") amount = Math.max(0, amount - c.value);
      else if (c.kind === "FREE_COURSE") amount = 0;
      await prisma.coupon.update({ where: { id: c.id }, data: { used: { increment: 1 } } });
    }
  }
  const order = await prisma.order.create({ data: { studentId: (u as any).id, courseId, amount, currency: cur, provider, status: amount === 0 ? "PAID" : "PENDING" } });
  if (amount === 0) {
    await prisma.enrollment.upsert({ where: { studentId_courseId: { studentId: (u as any).id, courseId } }, update: {}, create: { studentId: (u as any).id, courseId } });
    return NextResponse.json({ order, free: true });
  }
  const charge = await createCharge({ amount, currency: cur as any, provider, orderId: order.id, returnUrl: `${process.env.APP_URL}/pay/return` });
  if (charge.manual) await prisma.order.update({ where: { id: order.id }, data: { status: "MANUAL_REVIEW" } });
  // سجل توزيع الأرباح
  const fee = platformFee(amount);
  await prisma.transaction.create({ data: { teacherId: course.teacherId, courseId, gross: amount, fee, net: amount - fee } });
  return NextResponse.json({ order, charge });
}
