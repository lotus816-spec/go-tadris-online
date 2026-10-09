import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@tadris.dz" },
    update: {},
    create: { email: "admin@tadris.dz", name: "مدير المنصة", role: "ADMIN", passwordHash: await bcrypt.hash("Admin123!", 10) },
  });
  const teacher = await prisma.user.upsert({
    where: { email: "teacher@tadris.dz" },
    update: {},
    create: {
      email: "teacher@tadris.dz", name: "أستاذ أحمد", role: "TEACHER", slug: "ahmed-ustadh",
      title: "أستاذ رياضيات", bio: "أستاذ بخبرة 10 سنوات.", passwordHash: await bcrypt.hash("Teacher123!", 10),
      faqJson: [{ q: "ما تخصصك؟", a: "رياضيات الطور الثانوي." }],
    },
  });
  await prisma.plan.upsert({ where: { id: "trial" }, update: {}, create: { id: "trial", name: "تجريبية", priceDZD: 0, features: { courses: 1 } } });
  await prisma.plan.upsert({ where: { id: "pro" }, update: {}, create: { id: "pro", name: "احترافية", priceDZD: 2900, priceUSD: 19, features: { courses: "unlimited" } } });
  for (const [key, body] of [
    ["welcome", "مرحباً {{name}} في تدريس!"],
    ["lesson_reminder", "تذكير: درسك {{title}} على {{date}}"],
    ["assignment_due", "تنبيه: واجب {{title}} يستحق في {{date}}"],
    ["course_done", "مبارك {{name}}! أكملت {{course}} وشهادتك جاهزة."],
  ] as const) {
    await prisma.messageTemplate.upsert({ where: { key }, update: {}, create: { key, channel: "EMAIL", subject: key, body } });
  }
  console.log({ admin: admin.email, teacher: teacher.email });
}
main().finally(() => prisma.$disconnect());
