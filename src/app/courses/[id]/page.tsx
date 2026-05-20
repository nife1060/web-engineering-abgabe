import Link from "next/link";
import { notFound } from "next/navigation";
import { addToWishlist, removeFromWishlist } from "@/app/actions/course-interactions";
import EnrollmentButton from "@/components/EnrollmentButton";
import { courseCtaLabel, formatCoursePrice } from "@/lib/course-format";
import { getSession } from "@/lib/auth";
import { mockCourses } from "@/lib/data";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export default async function CourseDetailPage({ params }: Props) {
  const { id } = await params;
  const mockCourse = mockCourses.find((course) => course.id === id);
  const session = await getSession();
  const dbCourse = mockCourse
    ? null
    : await prisma.course.findUnique({
        where: { id },
        include: {
          creator: {
            select: { name: true },
          },
          modules: {
            orderBy: { order: "asc" },
            include: {
              lessons: {
                orderBy: { order: "asc" },
              },
            },
          },
        },
      });

  if (dbCourse && dbCourse.status !== "PUBLISHED" && session?.role !== "ADMIN" && session?.userId !== dbCourse.creatorId) {
    return notFound();
  }

  const isWishlisted =
    Boolean(session && dbCourse) &&
    (await prisma.wishlist.findUnique({
      where: {
        userId_courseId: {
          userId: session!.userId,
          courseId: dbCourse!.id,
        },
      },
      select: { id: true },
    })) !== null;

  const course =
    mockCourse ??
    (dbCourse && {
      id: dbCourse.id,
      title: dbCourse.title,
      description: dbCourse.description,
      category: dbCourse.categoryName,
      rating: 4.8,
      studentsCount: 0,
      instructor: dbCourse.creator.name,
      level: dbCourse.level as "Beginner" | "Intermediate" | "Advanced",
      pricingModel: dbCourse.pricingModel,
      price: dbCourse.price,
      subscriptionPrice: dbCourse.subscriptionPrice,
      enrolled: false,
      thumbnail: dbCourse.thumbnailUrl || "",
      modules: dbCourse.modules.map((module) => ({
        id: module.id,
        title: module.title,
        lessons: module.lessons.map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          duration: lesson.type === "VIDEO" ? "Video" : lesson.type === "QUIZ" ? "Quiz" : "Text",
          type: lesson.type === "VIDEO" ? ("video" as const) : ("text" as const),
        })),
      })),
    });

  if (!course) return notFound();

  const pricingModel = course.pricingModel ?? "PAID";
  const subscriptionPrice = course.subscriptionPrice ?? 0;
  const totalLessons = course.modules.reduce((acc, module) => acc + module.lessons.length, 0);
  const priceLabel = formatCoursePrice(pricingModel, course.price, subscriptionPrice);
  const ctaLabel = courseCtaLabel(pricingModel, course.price, subscriptionPrice);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <p className="text-purple-400 text-sm font-semibold uppercase tracking-wide mb-3">
              {course.category}
            </p>
            <h1 className="text-3xl lg:text-4xl font-extrabold mb-4 leading-tight">{course.title}</h1>
            <p className="text-gray-300 text-lg mb-6 leading-relaxed">{course.description}</p>

            <div className="flex flex-wrap gap-4 text-sm text-gray-300 mb-6">
              <span className="flex items-center gap-1.5">
                <span className="text-yellow-400">Star</span>
                <strong className="text-white">{course.rating}</strong>
                <span>({course.studentsCount.toLocaleString()} students)</span>
              </span>
              <span>-</span>
              <span>Instructor: <strong className="text-white">{course.instructor}</strong></span>
              <span>-</span>
              <span className="bg-purple-700/50 border border-purple-600/40 text-purple-300 px-2 py-0.5 rounded text-xs font-semibold">
                {course.level}
              </span>
            </div>

            <div className="flex gap-6 text-sm text-gray-400">
              <span>{course.modules.length} modules</span>
              <span>{totalLessons} lessons</span>
            </div>
          </div>

          <div className="w-full lg:w-80 shrink-0">
            <div className="bg-white text-gray-900 rounded-2xl overflow-hidden shadow-2xl">
              <div className="h-44 overflow-hidden bg-purple-50">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center">
                    <span className="text-white text-sm font-bold tracking-wide">Learnify</span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-baseline gap-3 mb-5">
                  <span className="text-2xl font-extrabold text-gray-900">{priceLabel}</span>
                </div>

                <EnrollmentButton
                  course={course}
                  label={ctaLabel}
                  learnHref={`/learn/${course.id}`}
                  enrolledHref={dbCourse ? `/learn/${course.id}` : `/courses/${course.id}`}
                  enrolledLabel={dbCourse ? "Continue Learning" : "Go to Course"}
                  initiallyEnrolled={course.enrolled}
                />

                <div className="border border-gray-100 rounded-xl p-4 mb-4 bg-gray-50">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Course includes</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xl font-extrabold text-gray-900">{course.modules.length}</p>
                      <p className="text-xs text-gray-500">Total modules</p>
                    </div>
                    <div>
                      <p className="text-xl font-extrabold text-gray-900">{totalLessons}</p>
                      <p className="text-xs text-gray-500">Total lessons</p>
                    </div>
                  </div>
                </div>

                {dbCourse ? (
                  isWishlisted ? (
                    <form action={removeFromWishlist.bind(null, dbCourse.id)}>
                      <button className="w-full border border-purple-300 text-purple-700 font-semibold py-3 rounded-xl hover:bg-purple-50 hover:border-purple-500 transition text-sm mb-4 cursor-pointer">
                        Remove from wishlist
                      </button>
                    </form>
                  ) : (
                    <form action={addToWishlist.bind(null, dbCourse.id)}>
                      <button className="w-full border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700 transition text-sm mb-4 cursor-pointer">
                        Add to wishlist
                      </button>
                    </form>
                  )
                ) : (
                  <button className="w-full border border-gray-300 text-gray-400 font-semibold py-3 rounded-xl text-sm mb-4 cursor-not-allowed">
                    Wishlist for database courses
                  </button>
                )}

                <p className="text-xs text-gray-400 text-center mb-4">30-day money-back guarantee</p>
                <ul className="space-y-2 text-xs text-gray-600">
                  <li className="flex items-center gap-2"><span className="text-green-500">OK</span> Full lifetime access</li>
                  <li className="flex items-center gap-2"><span className="text-green-500">OK</span> Access on mobile & desktop</li>
                  <li className="flex items-center gap-2"><span className="text-green-500">OK</span> Certificate of completion</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-2xl">
          <div className="flex items-end justify-between mb-5">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900">Course Content</h2>
              <p className="text-sm text-gray-500 mt-1">{course.modules.length} modules - {totalLessons} lessons</p>
            </div>
          </div>
          <div className="space-y-3">
            {course.modules.map((module, moduleIndex) => (
              <details key={module.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden group shadow-sm" open={moduleIndex === 0}>
                <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50 transition">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center shrink-0">
                      {moduleIndex + 1}
                    </span>
                    <span className="font-semibold text-gray-900 text-sm">{module.title}</span>
                  </div>
                  <span className="text-xs text-gray-400">{module.lessons.length} lessons</span>
                </summary>
                <ul className="divide-y divide-gray-100 border-t border-gray-100">
                  {module.lessons.map((lesson) => (
                    <li key={lesson.id} className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">{lesson.type === "video" ? "Video" : "Text"}</span>
                        <span className="text-sm text-gray-700">{lesson.title}</span>
                      </div>
                      <span className="text-xs text-gray-400">{lesson.duration}</span>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
