import prisma from "@/lib/db";

export async function sendMessage(channel: "EMAIL" | "SMS" | "WHATSAPP", to: string, body: string, subject?: string, recipientId?: string) {
  // إرسال فعلي حسب المزوّد، مع تسجيل دائم
  try {
    if (channel === "EMAIL" && process.env.RESEND_API_KEY) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({ from: process.env.MAIL_FROM ?? "no-reply@tadris.dz", to, subject: subject ?? "تدريس", text: body });
    } else if (channel !== "EMAIL" && process.env.TWILIO_ACCOUNT_SID) {
      const twilio = (await import("twilio")).default;
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      await client.messages.create({ from: channel === "WHATSAPP" ? (process.env.TWILIO_WHATSAPP_FROM ?? "whatsapp:+14155238886") : undefined, to: channel === "WHATSAPP" ? `whatsapp:${to}` : to, body });
    }
  } catch (e) {
    await prisma.messageLog.create({ data: { channel, to, body, status: "failed", recipientId } });
    throw e;
  }
  return prisma.messageLog.create({ data: { channel, to, body, status: "sent", recipientId } });
}

export async function renderTemplate(key: string, vars: Record<string, string>) {
  const t = await prisma.messageTemplate.findUnique({ where: { key } });
  if (!t) return null;
  let body = t.body;
  for (const [k, v] of Object.entries(vars)) body = body.replaceAll(`{{${k}}}`, v);
  return { ...t, body };
}
