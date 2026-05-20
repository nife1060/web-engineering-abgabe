"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function addToWishlist(courseId: string) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  await prisma.wishlist.upsert({
    where: {
      userId_courseId: {
        userId: session.userId,
        courseId,
      },
    },
    update: {},
    create: {
      userId: session.userId,
      courseId,
    },
  });

  revalidatePath(`/courses/${courseId}`);
  revalidatePath("/wishlist");
}

export async function removeFromWishlist(courseId: string) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  await prisma.wishlist.deleteMany({
    where: {
      userId: session.userId,
      courseId,
    },
  });

  revalidatePath(`/courses/${courseId}`);
  revalidatePath("/wishlist");
}

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
