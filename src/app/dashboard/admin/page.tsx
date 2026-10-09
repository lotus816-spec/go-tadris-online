export default async function AdminDash() {
  const res = await fetch(`${process.env.APP_URL ?? ""}/api/analytics`, { cache: "no-store" }).then((r) => r.json()).catch(() => null);
  return (
    <div>
      <h1 className="text-2xl font-bold">لوحة المدير</h1>
      <pre className="mt-4 overflow-auto rounded bg-gray-50 p-4 text-sm" dir="ltr">{JSON.stringify(res ?? { hint: "سجّل كمدير لعرض التحليلات" }, null, 2)}</pre>
      <ul className="mt-4 space-y-2 text-sm">
        <li>• تأكيد مدفوعات CCP اليدوية من سجل الطلبات (MANUAL_REVIEW).</li>
        <li>• إدارة الخطط والأسعار من جدول Setting/Plan.</li>
        <li>• سجل المعاملات وتوزيع الأرباح.</li>
      </ul>
    </div>
  );
}
