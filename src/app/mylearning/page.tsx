import Link from "next/link";
import { redirect } from "next/navigation";
import { removeFromWishlist } from "@/app/actions/course-interactions";
import { formatCoursePrice } from "@/lib/course-format";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MyLearningPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const wishlist = await prisma.wishlist.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    include: {
      course: {
        include: {
          modules: {
            include: {
              lessons: {
                select: { id: true },
              },
            },
          },
        },
      },
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">My Learning</h1>
          <p className="text-gray-500 mt-1">Kurse, die du dir fuer spaeter gemerkt hast.</p>
        </div>
        <Link href="/courses" className="bg-purple-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-purple-700 transition text-sm">
          Browse Courses
        </Link>
      </div>

      {wishlist.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <h2 className="font-bold text-gray-900 text-lg mb-2">Du hast noch keine Kurse in My Learning.</h2>
          <p className="text-gray-500 text-sm mb-5">Stoeber in der Kursuebersicht und merke dir interessante Kurse.</p>
          <Link href="/courses" className="bg-purple-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-purple-700 transition text-sm">
            Kurse ansehen
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {wishlist.map(({ course }) => {
            const lessonCount = course.modules.reduce((count, module) => count + module.lessons.length, 0);
            const isPublished = course.status === "PUBLISHED";

            return (
              <div key={course.id} className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition cursor-pointer">
                <Link href={`/courses/${course.id}`} className="absolute inset-0 z-10" aria-label={`${course.title} ansehen`} />
                <div className="h-40 bg-purple-50 overflow-hidden">
                  {course.thumbnailUrl ? (
                    <img src={course.thumbnailUrl} alt={course.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center">
                      <span className="text-white text-sm font-bold tracking-wide">Learnify</span>
                    </div>
                  )}
                </div>
                <div className="relative z-20 p-5 pointer-events-none">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="text-xs text-purple-600 font-semibold uppercase tracking-wide mb-1">
                        {course.categoryName}
                      </p>
                      <h2 className="font-bold text-gray-900 leading-snug group-hover:text-purple-700 transition">{course.title}</h2>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {isPublished ? "Published" : "Draft"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-sm mb-5">
                    <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                      <p className="text-xs text-gray-500">Price</p>
                      <p className="font-semibold text-gray-900 mt-1">
                        {formatCoursePrice(course.pricingModel, course.price, course.subscriptionPrice)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                      <p className="text-xs text-gray-500">Modules</p>
                      <p className="font-semibold text-gray-900 mt-1">{course.modules.length}</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
                      <p className="text-xs text-gray-500">Lessons</p>
                      <p className="font-semibold text-gray-900 mt-1">{lessonCount}</p>
                    </div>
                  </div>

                  <div className="relative z-30 flex gap-3 pointer-events-auto">
                    <Link href={`/courses/${course.id}`} className="flex-1 text-center bg-purple-600 text-white font-semibold py-2.5 rounded-xl hover:bg-purple-700 transition text-sm">
                      Ansehen
                    </Link>
                    <form action={removeFromWishlist.bind(null, course.id)} className="flex-1">
                      <button className="w-full border border-gray-300 text-gray-700 font-semibold py-2.5 rounded-xl hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition text-sm cursor-pointer">
                        Entfernen
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
