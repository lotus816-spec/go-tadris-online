"use client";
import { useState } from "react";

export function AskAI({ context }: { context: string }) {
  const [q, setQ] = useState("");
  const [a, setA] = useState("");
  const [loading, setLoading] = useState(false);
  return (
    <section aria-label="اسأل الذكاء الاصطناعي" className="mt-6 rounded border p-4">
      <h3 className="font-bold">اسأل الذكاء الاصطناعي عن هذا الدرس</h3>
      <div className="mt-2 flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="اكتب سؤالك..." className="flex-1 rounded border p-2" aria-label="سؤالك" />
        <button
          className="rounded bg-blue-700 px-4 py-2 text-white"
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            const r = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "ask", question: q, context }) });
            const j = await r.json();
            setA(j.answer ?? ""); setLoading(false);
          }}
        >Ask AI</button>
      </div>
      {a && <p className="mt-3 whitespace-pre-wrap rounded bg-gray-50 p-3 text-sm">{a}</p>}
    </section>
  );
}
