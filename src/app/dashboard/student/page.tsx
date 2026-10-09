import prisma from "@/lib/db";
import { currentUser } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function StudentDash() {
  const u = await currentUser();
  if (!u) redirect("/login");
  const enrs = await prisma.enrollment.findMany({ where: { studentId: (u as any).id }, include: { course: true, progress: true } });
  const certs = await prisma.certificate.findMany({ where: { studentId: (u as any).id } });
  return (
    <div>
      <h1 className="text-2xl font-bold">لوحتي التعليمية</h1>
      {enrs.map((e) => (
        <div key={e.id} className="mt-3 rounded border p-3">
          <b>{e.course.title}</b>
          <p className="text-sm">التقدم: {e.progress.filter((p) => p.completed).length} درس مكتمل</p>
          <a className="text-sm text-blue-800" href={`/learn/${e.course.slug}`}>أكمل التعلم في صفحة مستقلة</a>
        </div>
      ))}
      <h2 className="mt-6 font-bold">شهاداتي ({certs.length})</h2>
      {certs.map((c) => (<p key={c.id} className="text-sm"><a className="text-blue-800" href={`/c/${c.code}`}>{c.code}</a></p>))}
    </div>
  );
}
