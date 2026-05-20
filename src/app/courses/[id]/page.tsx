import Link from "next/link";
import { mockCourses } from "@/lib/data";
import { notFound } from "next/navigation";

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = mockCourses.find((c) => c.id === id);
  if (!course) return notFound();

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const firstLessonId = course.modules[0]?.lessons[0]?.id;
  const courseTabs = ["Overview", "Content", "Reviews", "Certificates"];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Course Task Bar */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
        <nav aria-label="Course sections" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto">
          <div className="flex min-w-max gap-1">
            {courseTabs.map((tab) => (
              <a
                key={tab}
                href={`#${tab.toLowerCase()}`}
                className="px-4 py-3 text-sm font-semibold text-gray-600 border-b-2 border-transparent hover:text-purple-700 hover:border-purple-300 transition"
              >
                {tab}
              </a>
            ))}
          </div>
        </nav>
      </div>

      {/* Course Hero */}
      <div id="overview" className="bg-gray-900 text-white scroll-mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <p className="text-purple-400 text-sm font-semibold uppercase tracking-wide mb-3">
              {course.category}
            </p>
            <h1 className="text-3xl lg:text-4xl font-extrabold mb-4 leading-tight">{course.title}</h1>
            <p className="text-gray-300 text-lg mb-6 leading-relaxed">{course.description}</p>

            <div className="flex flex-wrap gap-4 text-sm text-gray-300 mb-6">
              <span className="flex items-center gap-1.5">
                <span className="text-yellow-400">★</span>
                <strong className="text-white">{course.rating}</strong>
                <span>({course.studentsCount.toLocaleString()} students)</span>
              </span>
              <span>•</span>
              <span>Instructor: <strong className="text-white">{course.instructor}</strong></span>
              <span>•</span>
              <span className="bg-purple-700/50 border border-purple-600/40 text-purple-300 px-2 py-0.5 rounded text-xs font-semibold">
                {course.level}
              </span>
            </div>

            <div className="flex gap-6 text-sm text-gray-400">
              <span>{course.modules.length} modules</span>
              <span>{totalLessons} lessons</span>
            </div>
          </div>

          {/* Purchase Card */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="bg-white text-gray-900 rounded-2xl overflow-hidden shadow-2xl">
              <div className="h-44 overflow-hidden">
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-6">
                <div className="flex items-baseline gap-3 mb-5">
                  <span className="text-3xl font-extrabold text-gray-900">€{course.price}</span>
                  <span className="text-sm text-gray-400 line-through">€{(course.price * 1.5).toFixed(2)}</span>
                  <span className="text-green-600 text-sm font-bold">-33%</span>
                </div>

                {course.enrolled ? (
                  <Link
                    href={`/learn/${course.id}/${firstLessonId}`}
                    className="block w-full text-center bg-purple-600 text-white font-bold py-3.5 rounded-xl hover:bg-purple-700 transition mb-3"
                  >
                    Continue Learning
                  </Link>
                ) : (
                  <>
                    <Link
                      href={`/checkout/${course.id}`}
                      className="block w-full text-center bg-purple-600 text-white font-bold py-3.5 rounded-xl hover:bg-purple-700 transition mb-3"
                    >
                      Enroll now — €{course.price}
                    </Link>
                    <button className="w-full border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition text-sm mb-4">
                      Add to wishlist
                    </button>
                  </>
                )}

                <p className="text-xs text-gray-400 text-center mb-4">30-day money-back guarantee</p>
                <ul className="space-y-2 text-xs text-gray-600">
                  <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Full lifetime access</li>
                  <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Access on mobile & desktop</li>
                  <li className="flex items-center gap-2"><span className="text-green-500">✓</span> Certificate of completion</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <div id="content" className="max-w-2xl scroll-mt-32">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Course Content</h2>
          <div className="space-y-3">
            {course.modules.map((module, mi) => (
              <details key={module.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden group" open={mi === 0}>
                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 text-xs font-bold flex items-center justify-center shrink-0">
                      {mi + 1}
                    </span>
                    <span className="font-semibold text-gray-900 text-sm">{module.title}</span>
                  </div>
                  <span className="text-xs text-gray-400">{module.lessons.length} lessons</span>
                </summary>
                <ul className="divide-y divide-gray-100 border-t border-gray-100">
                  {module.lessons.map((lesson) => (
                    <li key={lesson.id} className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400">
                          {lesson.type === "video" ? (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </span>
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

        <section id="reviews" className="max-w-2xl scroll-mt-32">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Reviews</h2>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl font-extrabold text-gray-900">{course.rating}</span>
              <span className="text-sm font-semibold text-yellow-500">out of 5</span>
            </div>
            <p className="text-sm text-gray-600">
              Rated by learners across {course.studentsCount.toLocaleString()} enrolled students.
            </p>
          </div>
        </section>

        <section id="certificates" className="max-w-2xl scroll-mt-32">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Certificates</h2>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-sm text-gray-600">
              Complete all lessons to receive a certificate of completion for this course.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
