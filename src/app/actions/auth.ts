"use server";

import { redirect } from "next/navigation";
import type { Role } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { clearSession, redirectForRole, setSession } from "@/lib/auth";

export type AuthFormState = {
  error?: string;
};

const registrationRoles: Role[] = ["USER", "CREATOR"];

function asText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function asRole(value: FormDataEntryValue | null): Role | null {
  return typeof value === "string" && registrationRoles.includes(value as Role)
    ? (value as Role)
    : null;
}

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

export async function logoutUser() {
  await clearSession();
  redirect("/");
}
