"use client";
import { useRef, useEffect, useState } from "react";

/** سبورة بيضاء تفاعلية بسيطة */
export function Whiteboard() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  useEffect(() => {
    const c = ref.current!;
    c.width = c.offsetWidth; c.height = 300;
  }, []);
  return (
    <div className="rounded border p-2" aria-label="سبورة بيضاء">
      <canvas
        ref={ref} className="w-full cursor-crosshair rounded bg-white"
        onMouseDown={() => setDrawing(true)} onMouseUp={() => setDrawing(false)}
        onMouseMove={(e) => {
          if (!drawing) return;
          const c = ref.current!.getContext("2d")!;
          const r = ref.current!.getBoundingClientRect();
          c.fillStyle = "#111"; c.beginPath();
          c.arc(e.clientX - r.left, e.clientY - r.top, 2, 0, 7); c.fill();
        }}
      />
      <button className="mt-2 text-sm text-red-700" onClick={() => ref.current!.getContext("2d")!.clearRect(0, 0, 9999, 9999)}>مسح السبورة</button>
    </div>
  );
}
