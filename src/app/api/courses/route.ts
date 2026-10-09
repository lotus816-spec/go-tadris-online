import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { currentUser } from "@/lib/session";
import { requireRole } from "@/lib/permissions";
import { courseSchema, sanitizeHtml } from "@/lib/validation";

export async function GET(req: NextRequest) {
  const courses = await prisma.course.findMany({ where: { status: "PUBLISHED" }, take: 50, include: { teacher: { select: { name: true, slug: true } } } });
  return NextResponse.json(courses);
}

export async function POST(req: NextRequest) {
  const u = await currentUser();
  if (!u) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  requireRole((u as any).role, "courseCreate");
  const body = await req.json();
  const parsed = courseSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  // ترتيب المسارات: تحقق من المتطلبات المسبقة موجودة
  const c = await prisma.course.create({
    data: { ...parsed.data, description: sanitizeHtml(parsed.data.description), teacherId: (u as any).id },
  });
  return NextResponse.json(c, { status: 201 });
}
