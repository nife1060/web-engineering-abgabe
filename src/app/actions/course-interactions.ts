"use server";

/**
 * Server Actions für die Buttons "mark as complete" / "mark as still
 * working" im Lesson-Player (`@/app/learn/[courseId]/page.tsx`).
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { issueCertificateIfEligible } from "@/lib/certificates";
import { prisma } from "@/lib/prisma";

/** Markiert eine Lektion als abgeschlossen. War es die letzte Lektion vom Kurs, gibt's direkt ein Zertifikat dazu. */
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

  // Der Abschluss der letzten Lektion eines Kurses vergibt ein Zertifikat.
  await issueCertificateIfEligible(session.userId, courseId);

  revalidatePath(`/learn/${courseId}`);
  revalidatePath("/mylearning");
}

/** Das Gegenstück zu markLessonCompleted: setzt die Lektion wieder auf unvollständig zurück. */
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
