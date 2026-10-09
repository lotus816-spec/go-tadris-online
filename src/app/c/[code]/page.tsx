import prisma from "@/lib/db";

export default async function VerifyCert({ params }: { params: { code: string } }) {
  const cert = await prisma.certificate.findUnique({ where: { code: params.code }, include: { student: true, course: true } });
  return (
    <div className="mx-auto max-w-xl py-10 text-center">
      <h1 className="text-2xl font-bold">التحقق من الشهادة</h1>
      {cert && cert.status === "ISSUED" ? (
        <div className="mt-4 rounded border p-6">
          <p>✅ شهادة صالحة</p>
          <p className="mt-2 font-bold">{cert.student.name} — {cert.course.title}</p>
          <p className="text-sm text-gray-500">الرمز: {cert.code} — صدرت: {cert.issuedAt.toLocaleDateString("ar-DZ")}</p>
        </div>
      ) : (<p className="mt-4 text-red-700">❌ رمز غير صالح أو شهادة ملغاة.</p>)}
    </div>
  );
}
