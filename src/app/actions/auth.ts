"use server";

/**
 * Server Actions für Login und Registrierung (genutzt von `@/components/AuthForms`).
 * Hier und nur hier wird eine Session erstellt bzw. ein neuer Account angelegt.
 */

import { redirect } from "next/navigation";
import type { Role } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { clearSession, redirectForRole, setSession } from "@/lib/auth";

export type AuthFormState = {
  error?: string;
};

// Bei der Registrierung kann man sich nur USER oder CREATOR aussuchen.
// ADMIN-Accounts gibt's nur über direkten DB-Zugriff, und die können sich
// laut Prüfung weiter unten in loginUser sowieso nicht einloggen.
const registrationRoles: Role[] = ["USER", "CREATOR"];

function asText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function asRole(value: FormDataEntryValue | null): Role | null {
  return typeof value === "string" && registrationRoles.includes(value as Role)
    ? (value as Role)
    : null;
}

/**
 * Legt aus dem Registrierungsformular einen neuen Account an und leitet
 * danach zu /login weiter. Man wird nach der Registrierung also nicht
 * automatisch eingeloggt, sondern muss sich noch einmal anmelden.
 * @returns `{ error }`, wenn z.B. die E-Mail schon vergeben ist, sonst Redirect.
 */
export async function registerUser(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = asText(formData.get("name"));
  const email = asText(formData.get("email")).toLowerCase();
  const password = asText(formData.get("password"));
  const role = asRole(formData.get("role"));

  if (!name || !email || !password || !role) {
    return { error: "Bitte fuelle alle Felder aus." };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    return { error: "Diese E-Mail-Adresse ist bereits registriert." };
  }

  await prisma.user.create({
    data: {
      name,
      email,
      // Prototyp: Klartext-Passwort. In Produktion hier bcrypt zum Hashen nutzen.
      password,
      role,
    },
  });

  redirect("/login");
}

/**
 * Checkt die Zugangsdaten, setzt die Session und leitet zur Home-Seite der
 * jeweiligen Rolle weiter (siehe `redirectForRole`). Admins können sich
 * hier absichtlich nicht einloggen, dafür gibt's aktuell keinen Flow.
 * @returns `{ error }` bei falschen Zugangsdaten, sonst Redirect.
 */
export async function loginUser(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = asText(formData.get("email")).toLowerCase();
  const password = asText(formData.get("password"));

  if (!email || !password) {
    return { error: "Bitte gib E-Mail und Passwort ein." };
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || user.password !== password) {
    return { error: "E-Mail oder Passwort ist nicht korrekt." };
  }

  if (user.role === "ADMIN") {
    return { error: "Admin-Zugänge sind deaktiviert." };
  }

  await setSession(user.id, user.role);
  redirectForRole(user.role);
}

/** Logout: löscht die Session und schickt den Nutzer zurück auf die Startseite. */
export async function logoutUser() {
  await clearSession();
  redirect("/");
}
