import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function middleware() {
  return NextResponse.next();
}
export const config = { matcher: ["/dashboard/:path*", "/api/orders/:path*", "/api/certificates/:path*"] };
