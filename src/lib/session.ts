import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function session() {
  return getServerSession(authOptions);
}
export async function currentUser() {
  const s = await session();
  return (s?.user as any) ?? null;
}
