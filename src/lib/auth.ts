/**
 * Hier ist alles drin, was mit Login und Rollen zu tun hat.
 * Eine Session besteht einfach aus zwei Cookies (userId und role, nicht signiert).
 * Jede Page oder Route, die prüfen muss ob jemand eingeloggt ist, nutzt
 * `getSession()` oder `requireRole()` aus dieser Datei, statt die Cookies
 * selbst auszulesen.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role } from "@/generated/prisma/enums";

export type Session = {
  userId: string;
  role: Role;
};

const userIdCookie = "learninghub_user_id";
const roleCookie = "learninghub_user_role";

// ADMIN fehlt hier absichtlich: Admins können sich aktuell gar nicht
// einloggen (siehe loginUser in app/actions/auth.ts). Wenn also doch mal
// ein ADMIN-Cookie auftaucht, wird die Session trotzdem als ungültig gewertet.
const roles: Role[] = ["CREATOR", "USER"];

/**
 * Liest die Session aus den Cookies aus.
 * @returns Die Session, falls beide Cookies da sind und die Rolle gültig ist, sonst `null`.
 */
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(userIdCookie)?.value;
  const role = cookieStore.get(roleCookie)?.value as Role | undefined;

  if (!userId || !role || !roles.includes(role)) {
    return null;
  }

  return { userId, role };
}

/** Setzt nach erfolgreichem Login die zwei Session-Cookies. */
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

/** Logout: löscht einfach die beiden Session-Cookies wieder. */
export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(userIdCookie);
  cookieStore.delete(roleCookie);
}

/**
 * Sagt für eine Rolle, wohin man nach dem Login weitergeleitet wird.
 * Steht extra hier an einer Stelle, weil wir das sowohl direkt nach dem
 * Login als auch auf der Startseite "/" brauchen.
 */
export function getRoleHomePath(role: Role): string {
  if (role === "CREATOR") return "/dashboard/courses";
  return "/mylearning";
}

/** Leitet direkt zur Home-Route der jeweiligen Rolle weiter, wird am Ende von `loginUser` aufgerufen. */
export function redirectForRole(role: Role): never {
  redirect(getRoleHomePath(role));
}

/**
 * Lädt die Session und checkt, ob die Rolle erlaubt ist.
 * Nutzen wir am Anfang von Pages/Routes, die nur bestimmte Rollen sehen
 * dürfen. Gibt `null` zurück, wenn nicht eingeloggt oder Rolle nicht passt
 * — der Aufrufer muss dann selbst eine "Access denied"-Seite anzeigen.
 */
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
