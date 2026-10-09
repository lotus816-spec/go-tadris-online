import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { currentUser } from "@/lib/session";
import { createZoomMeeting } from "@/lib/zoom";

export async function POST(req: NextRequest) {
  const u = await currentUser();
  if (!u || !["ADMIN", "TEACHER"].includes((u as any).role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const { courseId, title, startsAt, lessonId } = await req.json();
  const { id, joinUrl } = await createZoomMeeting(title, startsAt);
  const s = await prisma.liveSession.create({ data: { courseId, title, startsAt: new Date(startsAt), zoomId: id, joinUrl, lessonId } });
  return NextResponse.json(s, { status: 201 });
}

export async function GET(req: NextRequest) {
  const courseId = new URL(req.url).searchParams.get("courseId");
  const list = await prisma.liveSession.findMany({ where: courseId ? { courseId } : {}, orderBy: { startsAt: "desc" }, take: 50 });
  return NextResponse.json(list);
}
