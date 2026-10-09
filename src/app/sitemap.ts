import type { MetadataRoute } from "next";
import prisma from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.APP_URL ?? "http://localhost:3000";
  const [teachers, courses] = await Promise.all([
    prisma.user.findMany({ where: { slug: { not: null } }, select: { slug: true, updatedAt: true } }),
    prisma.course.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
  ]);
  return [
    { url: base, lastModified: new Date() },
    ...teachers.map((t) => ({ url: `${base}/teachers/${t.slug}`, lastModified: t.updatedAt })),
    ...courses.map((c) => ({ url: `${base}/courses/${c.slug}`, lastModified: c.updatedAt })),
  ];
}
