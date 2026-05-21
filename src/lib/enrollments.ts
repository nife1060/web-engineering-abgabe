import { prisma } from "@/lib/prisma";

export async function hasActiveEnrollment(userId: string | undefined, courseId: string): Promise<boolean> {
  if (!userId) return false;

  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });

  if (!enrollment || !enrollment.active) return false;
  if (enrollment.expiresAt && enrollment.expiresAt < new Date()) return false;

  return true;
}

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
