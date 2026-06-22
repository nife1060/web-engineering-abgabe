import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role } from "@/generated/prisma/enums";

export type Session = {
  userId: string;
  role: Role;
};

const userIdCookie = "learninghub_user_id";
const roleCookie = "learninghub_user_role";

const roles: Role[] = ["CREATOR", "USER"];

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(userIdCookie)?.value;
  const role = cookieStore.get(roleCookie)?.value as Role | undefined;

  if (!userId || !role || !roles.includes(role)) {
    return null;
  }

  return { userId, role };
}

export async function setSession(userId: string, role: Role) {
  const cookieStore = await cookies();
  const options = {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
  };

  cookieStore.set(userIdCookie, userId, options);
  cookieStore.set(roleCookie, role, options);
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(userIdCookie);
  cookieStore.delete(roleCookie);
}

export function redirectForRole(role: Role): never {
  if (role === "CREATOR") redirect("/dashboard");
  redirect("/courses");
}

export async function requireRole(allowedRoles: Role[]) {
  const session = await getSession();

  if (!session) {
    return null;
  }

  if (!allowedRoles.includes(session.role)) {
    return null;
  }

  return session;
}
