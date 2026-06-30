/**
 * Diese Route gibt's nur noch wegen alter Links. Lektionen werden
 * mittlerweile über `/learn/[courseId]?lesson=...` ausgewählt (siehe
 * `@/app/learn/[courseId]/page.tsx`), nicht mehr über ein eigenes
 * `[lessonId]`-Segment. Falls noch wer eine alte URL aufruft, landet er
 * hier wenigstens beim Kurs statt bei einem 404.
 */

import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ courseId: string; lessonId: string }>;
};

export default async function LessonRedirectPage({ params }: Props) {
  const { courseId } = await params;

  redirect(`/learn/${courseId}`);
}
