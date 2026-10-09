import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const c = await prisma.course.findUnique({ where: { slug: params.slug } });
  if (!c) return {};
  return { title: c.title, description: c.description.slice(0, 160), alternates: { canonical: `/courses/${c.slug}` } };
}

export default async function CoursePage({ params }: { params: { slug: string } }) {
  const course = await prisma.course.findUnique({
    where: { slug: params.slug },
    include: { teacher: true, chapters: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" } } } } },
  });
  if (!course || course.status === "ARCHIVED") notFound();
  const ld = {
    "@context": "https://schema.org", "@type": "Course", name: course.title, description: course.description,
    provider: { "@type": "Person", name: (course as any).teacher?.name },
    offers: { "@type": "Offer", price: course.priceDZD, priceCurrency: "DZD" },
    hasCourseInstance: (course.chapters ?? []).flatMap((ch: any) => (ch.lessons ?? []).map((l: any) => ({ "@type": "CourseInstance", courseMode: l.type, courseWorkload: l.title }))),
  };
  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <h1 className="text-3xl font-bold">{course.title}</h1>
      <p className="mt-1 text-sm">المعلم: <a className="text-blue-800" href={`/teachers/${(course as any).teacher?.slug}`}>{(course as any).teacher?.name}</a></p>
      <p className="mt-4">{course.description}</p>
      {(course.chapters ?? []).map((ch: any, ci: number) => (
        <section key={ch.id} className="mt-6">
          <h2 className="text-xl font-bold">الفصل {ci + 1}: {ch.title}</h2>
          <ol className="mt-2 space-y-2">
            {(ch.lessons ?? []).filter((l: any) => l.status === "PUBLISHED" || l.isFree).map((l: any) => (
              <li key={l.id} className="rounded border p-3">
                <a href={`/learn/${course.slug}/${l.id}`}>{l.title}</a>
                <span className="mr-2 text-xs text-gray-500">{l.type} {l.isFree ? "• مجاني" : ""}</span>
              </li>
            ))}
          </ol>
        </section>
      ))}
      <form action={`/api/orders`} method="post" className="mt-8 rounded border p-4">
        <p className="font-bold">اشترك الآن: {course.priceDZD.toLocaleString("ar-DZ")} دج</p>
        <p className="text-xs text-gray-500">الدفع: بطاقة ذهبية / CCP / PayPal — الكوبونات مقبولة.</p>
      </form>
      <div className="mt-6"><a className="rounded bg-blue-700 px-4 py-2 text-white" href={`/learn/${course.slug}`}>افتح الدرس في صفحة مستقلة</a></div>
    </article>
  );
}
