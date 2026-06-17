import Link from "next/link";
import AccessDenied from "@/components/AccessDenied";
import CreatorCoursesList from "@/components/CreatorCoursesList";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CreatorCoursesPage() {
  const session = await requireRole(["CREATOR", "ADMIN"]);

  if (!session) {
    return <AccessDenied />;
  }

  const courses = await prisma.course.findMany({
    where: session.role === "ADMIN" ? undefined : { creatorId: session.userId },
    orderBy: { updatedAt: "desc" },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            select: { id: true },
          },
        },
      },
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">My Courses</h1>
          <p className="text-gray-500 mt-1">
            {session.role === "ADMIN" ? "Alle Kurse der Plattform." : "Deine erstellten Kurse und Entwuerfe."}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/mylearning" className="bg-white border border-gray-300 text-gray-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-50 transition text-sm">
            My Learning
          </Link>
          <Link href="/creator/courses/new" className="bg-purple-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-purple-700 transition text-sm">
            + New Course
          </Link>
        </div>
      </div>

      {courses.length > 0 ? (
        <CreatorCoursesList courses={courses} />
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <h2 className="font-bold text-gray-900 text-lg mb-2">Noch keine Kurse</h2>
          <p className="text-gray-500 text-sm mb-5">Erstelle deinen ersten Kurs im Course Builder.</p>
          <Link href="/creator/courses/new" className="bg-purple-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-purple-700 transition text-sm">
            Kurs erstellen
          </Link>
        </div>
      )}
    </div>
  );
}
