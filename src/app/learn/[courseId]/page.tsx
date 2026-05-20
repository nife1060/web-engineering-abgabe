import Link from "next/link";
import { redirect } from "next/navigation";
import { markLessonCompleted, markLessonStillWorking } from "@/app/actions/course-interactions";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ lesson?: string }>;
};

export const dynamic = "force-dynamic";

function getYouTubeEmbedUrl(url: string | null) {
  if (!url) return null;

  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname.includes("youtube.com")) {
      const videoId = parsedUrl.searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
    if (parsedUrl.hostname.includes("youtu.be")) {
      const videoId = parsedUrl.pathname.replace("/", "");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
  } catch {
    return null;
  }

  return null;
}

export default async function LearnCoursePage({ params, searchParams }: Props) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const { courseId } = await params;
  const { lesson: selectedLessonId } = await searchParams;
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
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

  if (!course) {
    redirect("/courses");
  }

  const lessons = course.modules.flatMap((module) =>
    module.lessons.map((lesson) => ({
      ...lesson,
      moduleTitle: module.title,
    })),
  );
  const currentLesson = lessons.find((lesson) => lesson.id === selectedLessonId) ?? lessons[0];

  if (!currentLesson) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">No lessons yet</h1>
          <p className="text-gray-500 text-sm mb-5">This course does not have learning content yet.</p>
          <Link href={`/courses/${course.id}`} className="bg-purple-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-purple-700 transition text-sm">
            Back to course
          </Link>
        </div>
      </div>
    );
  }

  const progress = await prisma.progress.findMany({
    where: {
      userId: session.userId,
      lessonId: { in: lessons.map((lesson) => lesson.id) },
      completed: true,
    },
    select: { lessonId: true },
  });
  const completedLessonIds = new Set(progress.map((item) => item.lessonId));
  const completedCount = completedLessonIds.size;
  const progressPercent = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;
  const currentIndex = lessons.findIndex((lesson) => lesson.id === currentLesson.id);
  const nextLesson = lessons[currentIndex + 1];
  const youtubeEmbedUrl = getYouTubeEmbedUrl(currentLesson.videoUrl);
  const isCurrentLessonCompleted = completedLessonIds.has(currentLesson.id);

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href={`/courses/${course.id}`} className="text-sm text-purple-600 font-semibold hover:text-purple-800">
              Back to course
            </Link>
            <h1 className="text-2xl font-extrabold text-gray-900 mt-1">{course.title}</h1>
          </div>
          <div className="text-right min-w-40">
            <p className="text-xs text-gray-500 mb-1">{completedCount} of {lessons.length} completed</p>
            <div className="w-40 bg-gray-200 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          <aside className="bg-white border border-gray-200 rounded-2xl overflow-hidden h-fit">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-xl font-extrabold text-gray-900">Course Content</h2>
              <p className="text-sm font-semibold text-purple-600 mt-1">{progressPercent}% complete</p>
            </div>
            <div className="divide-y divide-gray-100">
              {course.modules.map((module, moduleIndex) => (
                <div key={module.id} className="p-4">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-3">
                    {moduleIndex + 1}. {module.title}
                  </p>
                  <div className="space-y-2">
                    {module.lessons.map((lesson) => {
                      const isActive = lesson.id === currentLesson.id;
                      const isCompleted = completedLessonIds.has(lesson.id);

                      return (
                        <Link
                          key={lesson.id}
                          href={`/learn/${course.id}?lesson=${lesson.id}`}
                          className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${isActive ? "bg-purple-50 text-purple-700 ring-1 ring-purple-100" : "hover:bg-gray-50 text-gray-700"}`}
                        >
                          <span className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center ${isCompleted ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                            {isCompleted ? "✓" : lesson.order}
                          </span>
                          <span className="line-clamp-2">{lesson.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <div className="bg-gray-900 text-white min-h-64 flex items-center justify-center p-8">
              {currentLesson.type === "VIDEO" ? (
                <div className="w-full">
                  {youtubeEmbedUrl ? (
                    <iframe
                      src={youtubeEmbedUrl}
                      title={currentLesson.title}
                      className="aspect-video w-full rounded-xl border border-white/10"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : currentLesson.videoUrl ? (
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-purple-600 mx-auto mb-4 flex items-center justify-center text-sm font-bold">
                        Play
                      </div>
                      <p className="text-purple-200 text-sm break-all mb-4">{currentLesson.videoUrl}</p>
                      <a
                        href={currentLesson.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex bg-white text-purple-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-purple-50 transition text-sm"
                      >
                        Video öffnen
                      </a>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-purple-600 mx-auto mb-4 flex items-center justify-center text-sm font-bold">
                        Video
                      </div>
                      <p className="text-gray-300 text-sm">Für diese Video-Lektion wurde noch keine Video-URL hinterlegt.</p>
                    </div>
                  )}
                </div>
              ) : currentLesson.type === "QUIZ" ? (
                <div className="text-center">
                  <p className="text-purple-200 text-sm font-semibold">QUIZ</p>
                  <p className="text-gray-300 text-sm mt-2">Quiz placeholder for this lesson.</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-purple-200 text-sm font-semibold">{currentLesson.type}</p>
                  <p className="text-gray-300 text-sm mt-2">Content lesson</p>
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-xs text-purple-600 font-semibold uppercase tracking-wide mb-1">
                    {currentLesson.moduleTitle}
                  </p>
                  <h2 className="text-2xl font-extrabold text-gray-900">{currentLesson.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">Lesson-Type: {currentLesson.type}</p>
                </div>
                {isCurrentLessonCompleted && (
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full">
                    Completed
                  </span>
                )}
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 text-sm text-gray-700 leading-relaxed min-h-28 mb-6">
                {currentLesson.content || "No written lesson content yet. The creator can add content in the Course Builder."}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <form
                  action={(isCurrentLessonCompleted ? markLessonStillWorking : markLessonCompleted).bind(null, course.id, currentLesson.id)}
                  className="flex-1"
                >
                  <button className="w-full bg-purple-600 text-white font-semibold py-3 rounded-xl hover:bg-purple-700 transition text-sm">
                    {isCurrentLessonCompleted ? "Mark as still working" : "Mark as complete"}
                  </button>
                </form>
                {nextLesson ? (
                  <Link href={`/learn/${course.id}?lesson=${nextLesson.id}`} className="flex-1 text-center border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition text-sm">
                    Next Lesson
                  </Link>
                ) : (
                  <Link href={`/courses/${course.id}`} className="flex-1 text-center border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition text-sm">
                    Finish Course
                  </Link>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
