import { prisma } from "@/lib/prisma";

/**
 * A course is "completed" when it has at least one lesson and every lesson has a
 * completed Progress record for the given user.
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
 * Build a human-friendly, printable certificate serial number.
 * Example: LF-2026-K4P9-X7Q2
 */
function generateSerial(): string {
  const year = new Date().getFullYear();
  const random = () =>
    Math.random().toString(36).slice(2, 6).toUpperCase().padEnd(4, "0");
  return `LF-${year}-${random()}-${random()}`;
}

/**
 * Issue a certificate for a user/course if they have finished every lesson and
 * do not already hold one. Safe to call repeatedly (idempotent).
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
    // A concurrent request may have created it first (unique constraint).
    return prisma.certificate.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
  }
}

/**
 * Issue certificates for every fully-completed course the user is enrolled in.
 * Used to backfill certificates for courses that were completed before the
 * feature existed. Returns the user's full, up-to-date certificate list.
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
