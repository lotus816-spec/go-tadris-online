import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { currentUser } from "@/lib/session";

export async function POST(req: NextRequest) {
  const u = await currentUser();
  if (!u) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { assignmentId, content, files } = await req.json();
  const s = await prisma.submission.create({ data: { assignmentId, content, files: files ?? [], studentId: (u as any).id } });
  return NextResponse.json(s, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const u = await currentUser();
  if (!u || !["ADMIN", "TEACHER"].includes((u as any).role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const { id, score, feedback } = await req.json();
  const s = await prisma.submission.update({ where: { id }, data: { score, feedback } });
  return NextResponse.json(s);
}
