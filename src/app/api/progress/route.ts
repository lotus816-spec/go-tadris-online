import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { currentUser } from "@/lib/session";

export async function POST(req: NextRequest) {
  const u = await currentUser();
  if (!u) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { courseId, lessonId, timeSpentSec } = await req.json();
  const enrollment = await prisma.enrollment.findUnique({ where: { studentId_courseId: { studentId: (u as any).id, courseId } } });
  if (!enrollment) return NextResponse.json({ error: "NOT_ENROLLED" }, { status: 403 });
  // فتح الدرس التالي بعد إكمال السابق (prerequisite chain)
  const lessons = await prisma.lesson.findMany({ where: { chapter: { courseId } }, orderBy: { order: "asc" } });
  const idx = lessons.findIndex((l) => l.id === lessonId);
  if (idx > 0) {
    const prev = await prisma.progress.findUnique({ where: { enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId: lessons[idx - 1].id } } });
    if (!prev?.completed) return NextResponse.json({ error: "PREVIOUS_REQUIRED" }, { status: 422 });
  }
  const p = await prisma.progress.upsert({
    where: { enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId } },
    update: { completed: true, timeSpentSec: { increment: Number(timeSpentSec ?? 0) } },
    create: { enrollmentId: enrollment.id, lessonId, completed: true, timeSpentSec: Number(timeSpentSec ?? 0) },
  });
  // تحقق تلقائي من الشهادة
  const { checkCertificateEligibility } = await import("@/lib/certificates");
  const check = await checkCertificateEligibility((u as any).id, courseId);
  let cert = null;
  if ((check as any).eligible) {
    const { issueCertificate } = await import("@/lib/certificates");
    cert = await issueCertificate((u as any).id, courseId).catch(() => null);
  }
  return NextResponse.json({ progress: p, certificate: cert });
}
