import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { currentUser } from "@/lib/session";
import { spinWheel } from "@/lib/wheel";
import { sendMessage } from "@/lib/notify";

export async function POST(req: NextRequest) {
  const u = await currentUser();
  if (!u) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { wheelId } = await req.json();
  try {
    const { prize, spin } = await spinWheel(wheelId, (u as any).id);
    const me = await prisma.user.findUnique({ where: { id: (u as any).id } });
    if (me?.email) await sendMessage("EMAIL", me.email, `ربحت: ${prize.label}`, "نتيجة عجلة الهدايا", me.id).catch(() => null);
    return NextResponse.json({ spin, prize: { label: prize.label, kind: prize.kind, value: prize.value } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: (e as any).status ?? 400 });
  }
}

export async function GET(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("wheelId");
  const wheel = await prisma.giftWheel.findUnique({ where: { id: id ?? "" }, include: { prizes: true } });
  if (!wheel) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  // إظهار الشروط علناً دون كشف الأوزان الدقيقة
  return NextResponse.json({ title: wheel.title, prizes: wheel.prizes.map((p) => ({ label: p.label })), maxSpins: wheel.maxSpins, expiresAt: wheel.expiresAt, trigger: wheel.trigger });
}
