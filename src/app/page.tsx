export default function Home() {
  const faq = [
    { q: "ما هي منصة تدريس؟", a: "منصة عربية تمكّن المعلمين من بيع الدورات المباشرة والمسجلة مع تقييم وشهادات ودفع." },
    { q: "كيف أدفع من الجزائر؟", a: "بالبطاقة الذهبية Edahabia، بريدي موب، أو CCP مع تأكيد يدوي، ومن الخارج عبر PayPal." },
    { q: "هل توجد شهادات؟", a: "نعم، شهادة إتمام برمز تحقق فريد عند إكمال الدروس وتحقيق نسبة النجاح." },
  ];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="py-16 text-center">
        <h1 className="text-4xl font-bold">علّم. درّب. ابنِ دخلك من معرفتك.</h1>
        <p className="mx-auto mt-4 max-w-2xl text-gray-600">دورات مباشرة ومسجلة، اختبارات وواجبات، شهادات موثقة، دفع جزائري وعالمي، وأدوات ذكاء اصطناعي.</p>
        <div className="mt-6 flex justify-center gap-3">
          <a href="/courses" className="rounded bg-blue-700 px-6 py-3 text-white">تصفح الدورات</a>
          <a href="/register" className="rounded border px-6 py-3">ابدأ كمعلم</a>
        </div>
      </section>
      <section aria-label="أسئلة شائعة" className="mx-auto max-w-3xl">
        <h2 className="mb-4 text-2xl font-bold">أسئلة شائعة</h2>
        {faq.map((f) => (
          <details key={f.q} className="mb-2 rounded border p-3"><summary className="font-semibold">{f.q}</summary><p className="mt-2">{f.a}</p></details>
        ))}
      </section>
    </div>
  );
}
