/**
 * Funktionen, die prüfen ob ein Nutzer einen Kurs sehen darf. Wird an
 * mehreren Stellen gebraucht, z.B. auf der Kursdetailseite und beim
 * Aufrufen einer Lektion.
 */

import { prisma } from "@/lib/prisma";

/**
 * Prüft, ob ein Nutzer gerade Zugriff auf einen Kurs hat (gekauft oder Abo).
 *
 * Reicht nicht, dass irgendwann mal eine Einschreibung angelegt wurde: Sie
 * muss auch noch `active` sein (bei gekündigten Abos ist sie das nicht mehr)
 * und darf, falls sie ein Ablaufdatum hat, noch nicht abgelaufen sein.
 *
 * @returns `false`, wenn keine userId übergeben wurde (also nicht eingeloggt).
 */
export async function hasActiveEnrollment(userId: string | undefined, courseId: string): Promise<boolean> {
  if (!userId) return false;

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });

  if (!enrollment || !enrollment.active) return false;
  if (enrollment.expiresAt && enrollment.expiresAt < new Date()) return false;

  return true;
}

/**
 * Wie hasActiveEnrollment, nur dass hier zusätzlich Admins und der Creator
 * des Kurses immer Zugriff bekommen, auch ohne Einschreibung. Macht Sinn,
 * weil der Creator seinen eigenen Kurs ja anschauen können soll.
 */
export async function canAccessCourse(
  userId: string | undefined,
  role: string | undefined,
  courseId: string,
  creatorId: string,
): Promise<boolean> {
  if (!userId) return false;
  if (role === "ADMIN") return true;
  if (userId === creatorId) return true;
  return hasActiveEnrollment(userId, courseId);
}
