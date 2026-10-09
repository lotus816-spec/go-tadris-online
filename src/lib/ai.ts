/** استدعاءات الذكاء الاصطناعي من الخادم فقط */
export async function aiAnswer(system: string, user: string): Promise<string> {
  const provider = process.env.AI_PROVIDER ?? "anthropic";
  if (provider === "openai" && process.env.OPENAI_API_KEY) {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const r = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
    });
    return r.choices[0]?.message?.content ?? "";
  }
  if (process.env.ANTHROPIC_API_KEY) {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const r = await client.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1024,
      system,
      messages: [{ role: "user", content: user }],
    });
    return (r.content[0] as any)?.text ?? "";
  }
  // زر Ask AI المجاني: endpoint مجاني عبر متغيرات البيئة
  if (process.env.AI_FREE_ENDPOINT) {
    const res = await fetch(process.env.AI_FREE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(process.env.AI_FREE_API_KEY ? { Authorization: `Bearer ${process.env.AI_FREE_API_KEY}` } : {}) },
      body: JSON.stringify({ system, prompt: user }),
    });
    const j = await res.json().catch(() => ({}));
    return String((j as any).text ?? (j as any).answer ?? "");
  }
  return "مفاتيح الذكاء الاصطناعي غير مضبوطة بعد. أضف ANTHROPIC_API_KEY أو OPENAI_API_KEY أو AI_FREE_ENDPOINT.";
}

export async function generateQuiz(topic: string, content: string, n = 5) {
  const sys = "أنت مولّد اختبارات. أخرج JSON فقط: [{question,choices:[{text,isCorrect}]}].";
  const out = await aiAnswer(sys, `الموضوع: ${topic}\nالمحتوى: ${content.slice(0, 6000)}\nعدد الأسئلة: ${n}`);
  try {
    const m = out.match(/\[[\s\S]*\]/);
    return JSON.parse(m ? m[0] : out);
  } catch {
    return [{ question: "تعذّر التوليد — عدّل يدوياً", choices: [{ text: "أ", isCorrect: true }] }];
  }
}
