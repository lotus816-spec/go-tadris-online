import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { aiAnswer, generateQuiz } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const u = await currentUser();
  if (!u) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { mode, question, context, topic, content } = await req.json();
  if (mode === "ask") {
    const a = await aiAnswer("أجب بالعربية اعتماداً على محتوى الدرس فقط، وباختصار.", `السياق: ${(context ?? "").slice(0, 6000)}\nالسؤال: ${question}`);
    return NextResponse.json({ answer: a });
  }
  if (mode === "quiz") {
    const qs = await generateQuiz(topic ?? "عام", content ?? context ?? "");
    return NextResponse.json({ questions: qs });
  }
  // chatbot الأسئلة الشائعة بناءً على محتوى المعلم
  const a = await aiAnswer("أنت مساعد منصة تدريس. أجب عن الأسئلة الشائعة بودّ وبالعربية.", String(question ?? ""));
  return NextResponse.json({ answer: a });
}
