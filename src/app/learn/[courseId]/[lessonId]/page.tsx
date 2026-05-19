import Link from "next/link";
import { mockCourses } from "@/lib/data";
import { notFound } from "next/navigation";
import LessonMediaSection from "@/components/LessonMediaSection";

export default function LessonPage({ params }: { params: { courseId: string; lessonId: string } }) {
  const course = mockCourses.find((c) => c.id === params.courseId);
  if (!course) return notFound();

  const allLessons = course.modules.flatMap((m) => m.lessons);
  const currentLesson = allLessons.find((l) => l.id === params.lessonId) ?? allLessons[0];
  const currentIndex = allLessons.indexOf(currentLesson);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  const completedCount = allLessons.filter((l) => l.completed).length;
  const progress = Math.round((completedCount / allLessons.length) * 100);

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-900 text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 shrink-0 bg-gray-800 border-r border-gray-700 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <Link href={`/courses/${course.id}`} className="text-purple-400 text-xs hover:text-purple-300 flex items-center gap-1 mb-2">
            ← Back to course
          </Link>
          <h2 className="font-bold text-sm text-white line-clamp-2">{course.title}</h2>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div className="bg-purple-500 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-gray-500 mt-1">{completedCount} / {allLessons.length} lessons</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {course.modules.map((module, mi) => (
            <div key={module.id}>
              <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                {mi + 1}. {module.title}
              </div>
              {module.lessons.map((lesson) => {
                const isActive = lesson.id === currentLesson.id;
                return (
                  <Link
                    key={lesson.id}
                    href={`/learn/${course.id}/${lesson.id}`}
                    className={`flex items-start gap-3 px-4 py-3 text-sm transition ${isActive ? "bg-purple-700/40 border-l-2 border-purple-500" : "hover:bg-gray-700/50 border-l-2 border-transparent"}`}
                  >
                    <div className={`mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${lesson.completed ? "bg-green-500 border-green-500" : isActive ? "border-purple-400" : "border-gray-600"}`}>
                      {lesson.completed && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`leading-snug ${isActive ? "text-white font-semibold" : lesson.completed ? "text-gray-400" : "text-gray-300"}`}>
                        {lesson.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{lesson.duration}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Video Player */}
        <div className="bg-black flex-1 flex items-center justify-center relative max-h-[60%]">
          <div className="w-full h-full flex flex-col items-center justify-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center cursor-pointer hover:bg-white/20 transition">
              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm">{currentLesson.title}</p>
            <div className="absolute bottom-4 left-0 right-0 px-6">
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">0:00</span>
                <div className="flex-1 bg-gray-700 rounded-full h-1.5 cursor-pointer">
                  <div className="bg-purple-500 h-1.5 rounded-full w-0" />
                </div>
                <span className="text-xs text-gray-500">{currentLesson.duration}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lesson Info */}
        <div className="bg-gray-900 border-t border-gray-700 p-6 overflow-y-auto">
          <div className="max-w-3xl">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-xl font-bold text-white mb-1">{currentLesson.title}</h1>
                <p className="text-sm text-gray-400">{course.title}</p>
              </div>
              <button className="shrink-0 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Mark complete
              </button>
            </div>

            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              Welcome to this lesson! In this session, we&apos;ll dive deep into the concepts and
              build your understanding step by step. Follow along with the video and practice
              the exercises below.
            </p>

            <LessonMediaSection lessonId={currentLesson.id} />

            <div className="flex items-center gap-4 mt-6">
              {prevLesson ? (
                <Link href={`/learn/${course.id}/${prevLesson.id}`} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition">
                  ← Previous: {prevLesson.title}
                </Link>
              ) : <span />}
              {nextLesson && (
                <Link href={`/learn/${course.id}/${nextLesson.id}`} className="ml-auto flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition">
                  Next: {nextLesson.title} →
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
