import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { currentUser } from "@/lib/session";

export async function POST(req: NextRequest) {
  const u = await currentUser();
  if (!u) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { quizId, answers } = await req.json();
  const quiz = await prisma.quiz.findUnique({ where: { id: quizId }, include: { questions: true, attempts: { where: { studentId: (u as any).id } } } });
  if (!quiz) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  if (quiz.attempts.length >= quiz.maxAttempts) return NextResponse.json({ error: "MAX_ATTEMPTS" }, { status: 409 });
  let qs = [...quiz.questions];
  const correct: Record<string, string> = {};
  // ترتيب عشوائي عند العرض (يثبت عند التصحيح عبر ids)
  let score = 0;
  for (const q of qs) {
    const choices: any[] = Array.isArray(q.choices) ? (q.choices as any[]) : [];
    const right = choices.find((c) => c.isCorrect);
    if (right && answers[q.id] === right.id) score++;
  }
  const pct = qs.length ? (score / qs.length) * 100 : 0;
  const passed = pct >= quiz.passPercent;
  const attempt = await prisma.quizAttempt.create({ data: { quizId, studentId: (u as any).id, score: pct, passed, answers } });
  await prisma.grade.create({ data: { studentId: (u as any).id, courseId: quiz.courseId, quizId, score: pct } });
  return NextResponse.json({ attempt, showAnswers: quiz.showAnswers ? qs : undefined });
}
