import prisma from "@/lib/db";
import { currentUser } from "@/lib/session";
import { redirect } from "next/navigation";

async function guard(roles: string[]) {
  const u = await currentUser();
  if (!u) redirect("/login");
  if (!roles.includes((u as any).role)) redirect("/");
  return u;
}

export default async function TeacherDash() {
  const u = await guard(["ADMIN", "TEACHER", "ASSISTANT"]);
  const courses = await prisma.course.findMany({ where: { teacherId: (u as any).id }, include: { _count: { select: { enrollments: true } } } });
  const students = await prisma.enrollment.count({ where: { course: { teacherId: (u as any).id } } });
  return (
    <div>
      <h1 className="text-2xl font-bold">لوحة المعلم</h1>
      <p className="text-sm text-gray-600">الدورات: {courses.length} — الطلاب: {students}</p>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <a className="rounded border p-4" href="/dashboard/teacher/students">إدارة الطلاب (CRM) + تصدير CSV</a>
        <a className="rounded border p-4" href="/dashboard/teacher/messages">الرسائل الجماعية</a>
        <a className="rounded border p-4" href="/dashboard/teacher/reports">التقارير والدرجات</a>
      </div>
      <ul className="mt-6 space-y-2">
        {courses.map((c) => (<li key={c.id} className="rounded border p-3"><b>{c.title}</b> — {c._count.enrollments} طالب — {c.status}</li>))}
      </ul>
    </div>
  );
}
