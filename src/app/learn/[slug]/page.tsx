import prisma from "@/lib/db";
import { AskAI } from "@/components/AskAI";

export default async function LearnPage({ params }: { params: { slug: string } }) {
  const course = await prisma.course.findUnique({ where: { slug: params.slug }, include: { chapters: { include: { lessons: { orderBy: { order: "asc" } } } } } });
  if (!course) return <p>الدورة غير موجودة.</p>;
  const first = course.chapters[0]?.lessons[0];
  return (
    <div>
      <h1 className="text-2xl font-bold">{course.title} — صفحة تعلم مستقلة</h1>
      {first ? (
        <article className="mt-4 rounded border p-4">
          <h2 className="font-bold">{first.title}</h2>
          {first.videoUrl && <video src={first.videoUrl} controls className="mt-2 w-full rounded" />}
          <div className="mt-2 text-sm" dangerouslySetInnerHTML={{ __html: first.content ?? "" }} />
          <AskAI context={first.content ?? course.description} />
        </article>
      ) : <p>لا دروس بعد.</p>}
    </div>
  );
}
