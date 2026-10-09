import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { currentUser } from "@/lib/session";

export async function GET() {
  const u = await currentUser();
  if (!u || (u as any).role !== "ADMIN") return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const [users, courses, orders, enrolls] = await Promise.all([
    prisma.user.count(), prisma.course.count(),
    prisma.order.findMany({ where: { status: "PAID" } }),
    prisma.enrollment.count(),
  ]);
  const revenue = orders.reduce((a, o) => a + o.amount, 0);
  const certs = await prisma.certificate.count();
  const completionRate = enrolls ? Math.round((certs / Math.max(1, enrolls)) * 100) : 0;
  return NextResponse.json({ users, courses, enrollments: enrolls, revenue, completionRate });
}
