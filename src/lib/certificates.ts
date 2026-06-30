/**
 * Hier wird geprüft, ob ein Kurs fertig ist, und Zertifikate werden vergeben.
 * Genutzt vom Lesson-Player (Zertifikat direkt nach der letzten Lektion)
 * und von "My Learning" (falls ein Kurs schon vorher fertig war, bevor es
 * Zertifikate überhaupt gab).
 */

import { prisma } from "@/lib/prisma";

/**
 * Ein Kurs zählt als "abgeschlossen", wenn er mindestens eine Lektion hat
 * und der Nutzer für jede einzelne Lektion einen Progress-Eintrag mit
 * completed = true hat.
 */
export async function getCourseCompletion(userId: string, courseId: string) {
  const lessons = await prisma.lesson.findMany({
    where: { module: { courseId } },
    select: { id: true },
  });

  const totalLessons = lessons.length;

  if (totalLessons === 0) {
    return { totalLessons: 0, completedLessons: 0, isCompleted: false };
  }

  const completedLessons = await prisma.progress.count({
    where: {
      userId,
      completed: true,
      lessonId: { in: lessons.map((lesson) => lesson.id) },
    },
  });

  return {
    totalLessons,
    completedLessons,
    isCompleted: completedLessons >= totalLessons,
  };
}

/**
 * Baut eine Seriennummer fürs Zertifikat, z.B. LF-2026-K4P9-X7Q2.
 */
function generateSerial(): string {
  const year = new Date().getFullYear();
  const random = () =>
    Math.random().toString(36).slice(2, 6).toUpperCase().padEnd(4, "0");
  return `LF-${year}-${random()}-${random()}`;
}

/**
 * Vergibt ein Zertifikat, wenn der Kurs fertig ist und es noch keins gibt.
 * Kann man mehrfach aufrufen, ohne dass doppelte Zertifikate entstehen.
 */
export async function issueCertificateIfEligible(userId: string, courseId: string) {
  const existing = await prisma.certificate.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });

  if (existing) {
    return existing;
  }

  const { isCompleted } = await getCourseCompletion(userId, courseId);

  if (!isCompleted) {
    return null;
  }

  try {
    return await prisma.certificate.create({
      data: { userId, courseId, serial: generateSerial() },
    });
  } catch {
    // Kann sein, dass eine andere Anfrage gleichzeitig schon eins angelegt hat (Unique Constraint).
    return prisma.certificate.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
  }
}

/**
 * Geht alle Kurse des Nutzers durch und vergibt Zertifikate nach, falls
 * welche fehlen. Gibt am Ende die komplette, aktuelle Zertifikatsliste zurück.
 */
export async function syncCertificatesForUser(userId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId, active: true },
    select: { courseId: true },
  });

  for (const { courseId } of enrollments) {
    await issueCertificateIfEligible(userId, courseId);
  }

  return prisma.certificate.findMany({
    where: { userId },
    orderBy: { issuedAt: "desc" },
    include: {
      course: {
        include: { creator: { select: { name: true } } },
      },
    },
  });
}
