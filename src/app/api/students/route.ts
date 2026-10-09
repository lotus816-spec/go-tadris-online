import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { currentUser } from "@/lib/session";

export async function GET(req: NextRequest) {
  const u = await currentUser();
  if (!u || !["ADMIN", "TEACHER", "ASSISTANT"].includes((u as any).role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const q = new URL(req.url).searchParams;
  const format = q.get("format");
  const status = q.get("status");
  const tag = q.get("tag");
  const students = await prisma.user.findMany({
    where: { role: "STUDENT", ...(status ? { status: status as any } : {}), ...(tag ? { studentTags: { some: { tag: { name: tag } } } } : {}) },
    include: { enrollments: { include: { course: { select: { title: true } } } }, studentTags: { include: { tag: true } } },
    take: 500,
  });
  if (format === "csv") {
    const rows = ["name,email,phone,status,courses", ...students.map((s) => `"${s.name}","${s.email}","${s.phone ?? ""}","${s.status}","${s.enrollments.map((e) => e.course.title).join("|")}"`)];
    return new NextResponse(rows.join("\n"), { headers: { "Content-Type": "text/csv; charset=utf-8" } });
  }
  return NextResponse.json(students);
}
