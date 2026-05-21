"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { createCheckoutSession } from "@/lib/checkout";

export async function purchaseCourse(formData: FormData) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const courseId = formData.get("courseId");
  if (typeof courseId !== "string" || !courseId) {
    redirect("/courses");
  }

  const result = await createCheckoutSession(session.userId, courseId as string);

  if (result.kind === "error") {
    redirect(`/courses/${courseId}?error=${encodeURIComponent(result.message)}`);
  }

  if (result.kind === "free" || result.kind === "already-enrolled") {
    revalidatePath(`/courses/${courseId}`);
    revalidatePath("/mylearning");
  }

  redirect(result.redirectTo);
}
