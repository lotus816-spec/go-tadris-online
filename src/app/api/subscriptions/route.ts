import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { currentUser } from "@/lib/session";
import { subscriptionDuePolicy } from "@/lib/payments";

export async function POST(req: NextRequest) {
  const u = await currentUser();
  if (!u || !["ADMIN", "TEACHER"].includes((u as any).role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const { planId, provider } = await req.json();
  const policy = subscriptionDuePolicy(provider);
  const endsAt = new Date(Date.now() + 30 * 864e5);
  const sub = await prisma.subscription.create({ data: { teacherId: (u as any).id, planId, provider, status: provider === "PAYPAL" ? "ACTIVE" : "PAST_DUE", endsAt } });
  return NextResponse.json({ sub, policy, note: "التجديد اليدوي (ذهبية/CCP): تذكير قبل 7 أيام + مهلة 7 أيام." }, { status: 201 });
}

export async function GET() {
  const u = await currentUser();
  if (!u) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const subs = await prisma.subscription.findMany({ where: { teacherId: (u as any).id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(subs);
}
