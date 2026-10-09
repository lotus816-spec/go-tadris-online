import type { Metadata } from "next";
import prisma from "@/lib/db";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const t = await prisma.user.findUnique({ where: { slug: params.slug } });
  if (!t) return {};
  return {
    title: `${t.name} | معلم على تدريس`,
    description: t.bio?.slice(0, 160) ?? `دورات ${t.name} على منصة تدريس`,
    alternates: { canonical: `/teachers/${t.slug}` },
    openGraph: { title: t.name, description: t.bio ?? "", type: "profile" },
  };
}

export default async function TeacherPage({ params }: { params: { slug: string } }) {
  const teacher = await prisma.user.findUnique({
    where: { slug: params.slug },
    include: { courses: { where: { status: "PUBLISHED" }, include: { chapters: { include: { lessons: true } } } } },
  });
  if (!teacher) notFound();
  const faqs: { q: string; a: string }[] = Array.isArray((teacher as any).faqJson) ? (teacher as any).faqJson : [
    { q: `من هو ${teacher.name}؟`, a: teacher.bio ?? "معلم على منصة تدريس." },
    { q: "كيف أشترك في دوراته؟", a: "اختر الدورة وادفع بالبطاقة الذهبية أو CCP أو PayPal ثم ابدأ فوراً." },
  ];
  const personLd = { "@context": "https://schema.org", "@type": "Person", name: teacher.name, description: teacher.bio, jobTitle: (teacher as any).title };
  const coursesLd = teacher.courses.map((c: any) => ({
    "@context": "https://schema.org", "@type": "Course",
    name: c.title, description: c.description, provider: { "@type": "Person", name: teacher.name },
  }));
  const faqLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(coursesLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <h1 className="text-3xl font-bold">{teacher.name}</h1>
      <p className="mt-2 text-gray-600">{(teacher as any).title ?? "معلم"} — {teacher.bio}</p>
      <h2 className="mt-8 text-2xl font-bold">الدورات ({teacher.courses.length})</h2>
      <ul className="mt-4 grid gap-4 md:grid-cols-2">
        {teacher.courses.map((c: any) => (
          <li key={c.id} className="rounded border p-4">
            <a href={`/courses/${c.slug}`} className="font-bold text-blue-800">{c.title}</a>
            <p className="text-sm text-gray-600">{c.description.slice(0, 140)}</p>
            <p className="mt-2 text-sm font-semibold">{c.priceDZD.toLocaleString("ar-DZ")} دج</p>
          </li>
        ))}
      </ul>
      <h2 className="mt-8 text-2xl font-bold">أسئلة شائعة</h2>
      {faqs.map((f) => (<details key={f.q} className="mt-2 rounded border p-3"><summary className="font-semibold">{f.q}</summary><p className="mt-2">{f.a}</p></details>))}
    </article>
  );
}
