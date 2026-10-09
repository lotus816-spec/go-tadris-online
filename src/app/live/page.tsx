import { Whiteboard } from "@/components/Whiteboard";

export default function LiveRoom({ searchParams }: { searchParams: { join?: string; title?: string } }) {
  return (
    <div>
      <h1 className="text-2xl font-bold">غرفة الدرس المباشر: {searchParams.title ?? ""}</h1>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded border p-2">
          <p className="mb-2 text-sm font-bold">نافذة المعلم (كاميرا/شاشة/Zoom)</p>
          {searchParams.join ? <a className="rounded bg-blue-700 px-4 py-2 text-white" href={searchParams.join}>انضم عبر Zoom</a> : <p className="text-sm">لا رابط بعد.</p>}
          <div className="mt-2 flex gap-2 text-sm">
            <button className="rounded border px-3 py-1">🎥 كاميرا</button>
            <button className="rounded border px-3 py-1">🎤 ميكروفون</button>
            <button className="rounded border px-3 py-1">🖥 مشاركة الشاشة</button>
            <button className="rounded border px-3 py-1">✋ رفع اليد</button>
          </div>
        </div>
        <div className="rounded border p-2">
          <p className="mb-2 text-sm font-bold">نافذة الطلاب + السبورة</p>
          <Whiteboard />
        </div>
      </div>
      <p className="mt-3 text-xs text-gray-500">التسجيل يُحفظ تلقائياً ويُربط بالدورة عبر recordUrl.</p>
    </div>
  );
}
