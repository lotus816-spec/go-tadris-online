import prisma from "@/lib/db";
import { newVerifyCode } from "@/lib/security";

/** شروط إصدار الشهادة: إكمال الدروس + نسبة النجاح */
export async function checkCertificateEligibility(studentId: string, courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { chapters: { include: { lessons: true } }, quizs: { include: { attempts: { where: { studentId } } } } },
  });
  if (!course) return { eligible: false, reason: "course-not-found" };
  const lessonIds = course.chapters.flatMap((c) => c.lessons.map((l) => l.id));
  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId, courseId } },
    include: { progress: true },
  });
  if (!enrollment) return { eligible: false, reason: "not-enrolled" };
  const done = enrollment.progress.filter((p) => p.completed).length;
  if (course.requireAllLessons && done < lessonIds.length)
    return { eligible: false, reason: "lessons-incomplete", done, total: lessonIds.length };
  // متوسط درجات الاختبارات
  const scores: number[] = [];
  for (const q of course.quizs) {
    const best = Math.max(0, ...q.attempts.map((a) => a.score));
    if (q.attempts.length) scores.push(best);
  }
  const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 100;
  if (avg < course.passPercent) return { eligible: false, reason: "score-too-low", avg };
  return { eligible: true, avg, done, total: lessonIds.length };
}

export async function issueCertificate(studentId: string, courseId: string) {
  const check = await checkCertificateEligibility(studentId, courseId);
  if (!check.eligible) {
    const e: any = new Error("NOT_ELIGIBLE:" + (check as any).reason);
    e.status = 422;
    throw e;
  }
  const existing = await prisma.certificate.findFirst({ where: { studentId, courseId, status: "ISSUED" } });
  if (existing) return existing;
  return prisma.certificate.create({
    data: { studentId, courseId, code: newVerifyCode("TDRS") },
  });
}
