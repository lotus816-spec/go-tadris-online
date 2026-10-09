import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "تدريس | منصة الدورات العربية", template: "%s | تدريس" },
  description: "منصة تدريس: دورات مباشرة ومسجلة للمعلمين والمدربين في الجزائر والوطن العربي.",
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <header className="border-b" role="banner">
          <nav className="mx-auto flex max-w-6xl items-center justify-between p-4" aria-label="التنقل الرئيسي">
            <a href="/" className="text-2xl font-bold">تدريس</a>
            <div className="flex gap-4 text-sm">
              <a href="/courses">الدورات</a>
              <a href="/teachers">المعلمون</a>
              <a href="/login">دخول</a>
              <a href="/dashboard">لوحتي</a>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl p-4">{children}</main>
        <footer className="mt-16 border-t p-4 text-center text-sm text-gray-500">تدريس © 2026</footer>
      </body>
    </html>
  );
}
