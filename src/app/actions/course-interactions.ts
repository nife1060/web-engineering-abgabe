"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
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

  revalidatePath(`/learn/${courseId}`);
}
