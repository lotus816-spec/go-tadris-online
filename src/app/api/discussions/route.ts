import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { currentUser } from "@/lib/session";

export async function GET(req: NextRequest) {
  const courseId = new URL(req.url).searchParams.get("courseId") ?? "";
  const list = await prisma.discussion.findMany({ where: { courseId }, orderBy: { createdAt: "asc" }, take: 200, include: { author: { select: { name: true } } } });
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const u = await currentUser();
  if (!u) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { courseId, lessonId, body, parentId } = await req.json();
  const d = await prisma.discussion.create({ data: { courseId, lessonId, body, parentId, authorId: (u as any).id } });
  // إشعار عند الرد على سؤال الطالب
  if (parentId) {
    const parent = await prisma.discussion.findUnique({ where: { id: parentId }, include: { author: true } });
    if (parent && parent.authorId !== (u as any).id && parent.author.email) {
      const { sendMessage } = await import("@/lib/notify");
      await sendMessage("EMAIL", parent.author.email, `ردّ جديد على سؤالك: ${body.slice(0, 200)}`, "رد جديد في النقاش", parent.authorId).catch(() => null);
    }
  }
  return NextResponse.json(d, { status: 201 });
}
