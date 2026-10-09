import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { currentUser } from "@/lib/session";

export async function GET(req: NextRequest) {
  const courseId = new URL(req.url).searchParams.get("courseId") ?? "";
  const u = await currentUser();
  if (!u || !["ADMIN", "TEACHER", "ASSISTANT"].includes((u as any).role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const enrs = await prisma.enrollment.findMany({ where: { courseId }, include: { student: { select: { name: true, email: true } }, progress: true } });
  const report = enrs.map((e) => ({
    student: e.student.name, email: e.student.email,
    completed: e.progress.filter((p) => p.completed).length,
    timeSec: e.progress.reduce((a, p) => a + p.timeSpentSec, 0),
  }));
  return NextResponse.json(report);
}
