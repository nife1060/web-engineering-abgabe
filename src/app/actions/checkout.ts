"use server";

/** Server Action für den "Enroll"/"Subscribe"-Button auf der Kursdetailseite. */

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { createCheckoutSession } from "@/lib/checkout";

/**
 * Holt sich das Ergebnis von `createCheckoutSession` und leitet dann
 * passend weiter. Bei kostenlosen Kursen oder wenn man schon eingeschrieben
 * ist, wird sofort die Seite neu geladen (revalidatePath), weil es da
 * keine Zahlung gibt, auf die man warten müsste. Bei echten Käufen
 * passiert das erst später über den Stripe-Webhook.
 */
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
