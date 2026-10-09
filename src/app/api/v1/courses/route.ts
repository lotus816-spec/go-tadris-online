import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { currentUser } from "@/lib/session";

// REST موثّقة للتكامل الخارجي (مفاتيح API للمعلمين) — تصميم يسمح بـ LTI لاحقاً
export async function GET(req: NextRequest) {
  const key = req.headers.get("x-api-key") ?? "";
  const hash = (await import("crypto")).createHash("sha256").update(key + (process.env.API_KEY_SALT ?? "")).digest("hex");
  const k = await prisma.apiKey.findUnique({ where: { hash } });
  if (!k || k.revokedAt) return NextResponse.json({ error: "BAD_KEY" }, { status: 401 });
  const courses = await prisma.course.findMany({ where: { teacherId: k.ownerId, status: "PUBLISHED" }, select: { slug: true, title: true, description: true } });
  return NextResponse.json({ version: "v1", courses, lti: { enabled: false, note: "LTI مؤجل — البنية تسمح بإضافته عبر launch endpoint" } });
}
