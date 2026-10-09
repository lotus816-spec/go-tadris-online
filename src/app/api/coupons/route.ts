import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { currentUser } from "@/lib/session";
import { couponSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const u = await currentUser();
  if (!u || !["ADMIN", "TEACHER"].includes((u as any).role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const body = await req.json();
  const p = couponSchema.safeParse(body);
  if (!p.success) return NextResponse.json({ error: p.error.flatten() }, { status: 400 });
  const c = await prisma.coupon.create({ data: { ...p.data, expiresAt: p.data.expiresAt ? new Date(p.data.expiresAt) : null } });
  return NextResponse.json(c, { status: 201 });
}
