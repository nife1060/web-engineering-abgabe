"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { issueCertificateIfEligible } from "@/lib/certificates";
import { prisma } from "@/lib/prisma";

export async function markLessonCompleted(courseId: string, lessonId: string) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  await prisma.progress.upsert({
    where: {
      userId_lessonId: {
        userId: session.userId,
        lessonId,
      },
    },
    update: {
      completed: true,
      completedAt: new Date(),
    },
    create: {
      userId: session.userId,
      lessonId,
      completed: true,
      completedAt: new Date(),
    },
  });

  // Completing the final lesson of a course earns a certificate.
  await issueCertificateIfEligible(session.userId, courseId);

  revalidatePath(`/learn/${courseId}`);
  revalidatePath("/mylearning");
}

export async function markLessonStillWorking(courseId: string, lessonId: string) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  await prisma.progress.upsert({
    where: {
      userId_lessonId: {
        userId: session.userId,
        lessonId,
      },
    },
    update: {
      completed: false,
      completedAt: null,
    },
    create: {
      userId: session.userId,
      lessonId,
      completed: false,
      completedAt: null,
    },
  });

  revalidatePath(`/learn/${courseId}`);
}
