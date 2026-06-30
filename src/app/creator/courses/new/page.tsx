/** /creator/courses/new — zeigt einfach den `CourseBuilder` ohne `initialCourse`, also im "Neu erstellen"-Modus. */

import AccessDenied from "@/components/AccessDenied";
import CourseBuilder from "@/components/CourseBuilder";
import { ensureDefaultCategories } from "@/lib/categories";
import { requireRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function NewCoursePage() {
  const session = await requireRole(["CREATOR", "ADMIN"]);

  if (!session) {
    return <AccessDenied />;
  }

  const categories = await ensureDefaultCategories();

  return <CourseBuilder categories={categories} />;
}
