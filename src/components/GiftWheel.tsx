"use client";
import { useState } from "react";

export function GiftWheel({ wheelId }: { wheelId: string }) {
  const [res, setRes] = useState<any>(null);
  const [spinning, setSpinning] = useState(false);
  return (
    <div className="rounded border p-4 text-center" role="group" aria-label="عجلة الهدايا">
      <h3 className="font-bold">🎡 عجلة الهدايا</h3>
      <p className="text-xs text-gray-500">الدوران مرة واحدة لكل طالب. النتيجة تُحسب على الخادم فقط.</p>
      <button
        className="mt-3 rounded-full bg-amber-500 px-8 py-3 font-bold text-white disabled:opacity-50"
        disabled={spinning}
        onClick={async () => {
          setSpinning(true);
          const r = await fetch("/api/wheel", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ wheelId }) });
          setRes(await r.json()); setSpinning(false);
        }}
      >{spinning ? "يدور..." : "أدر العجلة"}</button>
      {res && <p className="mt-3 font-bold">{res.prize ? `ربحت: ${res.prize.label}` : res.error}</p>}
    </div>
  );
}
