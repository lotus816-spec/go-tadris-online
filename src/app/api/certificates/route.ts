import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { currentUser } from "@/lib/session";
import { issueCertificate } from "@/lib/certificates";

export async function POST(req: NextRequest) {
  const u = await currentUser();
  if (!u) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { courseId } = await req.json();
  try {
    const cert = await issueCertificate((u as any).id, courseId);
    return NextResponse.json(cert, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 400 });
  }
}
