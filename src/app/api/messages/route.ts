import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { currentUser } from "@/lib/session";
import { sendMessage } from "@/lib/notify";

export async function POST(req: NextRequest) {
  const u = await currentUser();
  if (!u || !["ADMIN", "TEACHER", "ASSISTANT"].includes((u as any).role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const { channel, to, body, subject, group } = await req.json();
  if (group?.courseId) {
    const enrs = await prisma.enrollment.findMany({ where: { courseId: group.courseId }, include: { student: true } });
    for (const e of enrs) {
      const dest = channel === "EMAIL" ? e.student.email : (e.student.phone ?? "");
      if (dest) await sendMessage(channel, dest, body, subject, e.studentId).catch(() => null);
    }
    return NextResponse.json({ sent: enrs.length });
  }
  const log = await sendMessage(channel, to, body, subject);
  return NextResponse.json(log, { status: 201 });
}

export async function GET() {
  const u = await currentUser();
  if (!u || !["ADMIN", "TEACHER"].includes((u as any).role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const logs = await prisma.messageLog.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return NextResponse.json(logs);
}
