import type { Role } from "@prisma/client";

/** صلاحيات دقيقة لكل دور */
export const PERMS = {
  courseCreate: ["ADMIN", "TEACHER"] as Role[],
  courseEditOwn: ["ADMIN", "TEACHER", "ASSISTANT"] as Role[],
  studentView: ["ADMIN", "TEACHER", "ASSISTANT"] as Role[],
  gradeEdit: ["ADMIN", "TEACHER"] as Role[],
  certIssue: ["ADMIN", "TEACHER"] as Role[],
  settingsEdit: ["ADMIN"] as Role[],
  payoutView: ["ADMIN", "TEACHER"] as Role[],
} satisfies Record<string, Role[]>;

export function can(role: Role, perm: keyof typeof PERMS) {
  return (PERMS[perm] as Role[]).includes(role);
}

export function requireRole(role: Role | undefined, perm: keyof typeof PERMS) {
  if (!role || !can(role, perm)) {
    const e: any = new Error("FORBIDDEN");
    e.status = 403;
    throw e;
  }
}
