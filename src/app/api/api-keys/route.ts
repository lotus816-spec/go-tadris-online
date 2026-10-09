import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { currentUser } from "@/lib/session";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const u = await currentUser();
  if (!u || !["ADMIN", "TEACHER"].includes((u as any).role)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const { name, scopes } = await req.json();
  const raw = `tdk_${crypto.randomBytes(24).toString("hex")}`;
  const hash = crypto.createHash("sha256").update(raw + (process.env.API_KEY_SALT ?? "")).digest("hex");
  const k = await prisma.apiKey.create({ data: { ownerId: (u as any).id, name, hash, prefix: raw.slice(0, 10), scopes: scopes ?? ["read"] } });
  return NextResponse.json({ ...k, key: raw }, { status: 201 }); // يُعرض مرة واحدة فقط
}
