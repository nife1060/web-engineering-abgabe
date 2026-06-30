/**
 * JSON-Variante vom Checkout: gibt die Redirect-URL einfach als JSON
 * zurück, statt selbst weiterzuleiten. Praktisch für Client-Code, der die
 * URL braucht ohne ein Formular abzuschicken. Der normale Kaufen-Button
 * nutzt stattdessen die `purchaseCourse` Server Action
 * (`@/app/actions/checkout.ts`) — beide rufen am Ende `createCheckoutSession` auf.
 */

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createCheckoutSession } from "@/lib/checkout";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const courseId = typeof (body as { courseId?: unknown })?.courseId === "string"
    ? (body as { courseId: string }).courseId
    : null;

  if (!courseId) {
    return NextResponse.json({ error: "courseId is required" }, { status: 400 });
  }

  const result = await createCheckoutSession(session.userId, courseId);

  if (result.kind === "error") {
    return NextResponse.json({ error: result.message }, { status: 400 });
  }

  if (result.kind === "already-enrolled") {
    return NextResponse.json({ url: result.redirectTo, alreadyEnrolled: true }, { status: 200 });
  }

  return NextResponse.json({ url: result.redirectTo }, { status: 200 });
}
