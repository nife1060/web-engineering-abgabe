import Link from "next/link";
import { redirect } from "next/navigation";
import { markLessonCompleted, markLessonStillWorking } from "@/app/actions/course-interactions";
import QuizPlayer from "@/components/QuizPlayer";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessCourse } from "@/lib/enrollments";

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
      // Already an embed URL — use as-is
      if (parsedUrl.pathname.startsWith("/embed/")) {
        return url;
      }
      // watch?v=VIDEO_ID
      const videoId = parsedUrl.searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (parsedUrl.hostname.includes("youtu.be")) {
      // youtu.be/VIDEO_ID
      const videoId = parsedUrl.pathname.slice(1);
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
            include: {
                media: { orderBy: { createdAt: "asc" } },
                questions: {
                  orderBy: { order: "asc" },
                  include: { answers: { orderBy: { order: "asc" } } },
                },
              },
          },
        },
      },
    },
  });

  if (!course) {
    redirect("/courses");
  }

  const hasAccess = await canAccessCourse(session.userId, session.role, course.id, course.creatorId);
  if (!hasAccess) {
    redirect(`/courses/${course.id}?notEnrolled=true`);
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
  const previousLesson = lessons[currentIndex - 1];
  const youtubeEmbedUrl = getYouTubeEmbedUrl(currentLesson.videoUrl);
  const isCurrentLessonCompleted = completedLessonIds.has(currentLesson.id);
  const remainingCount = Math.max(lessons.length - completedCount, 0);
  const courseStatusLabel =
    progressPercent >= 100 ? "Course completed" : completedCount > 0 ? "In progress" : "Not started";

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between mb-6">
          <div>
            <Link href={`/courses/${course.id}`} className="text-sm text-purple-600 font-semibold hover:text-purple-800">
              Back to course
            </Link>
            <h1 className="text-2xl font-extrabold text-gray-900 mt-1">{course.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className={`rounded-full px-3 py-1 ring-1 ${
                progressPercent >= 100
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                  : completedCount > 0
                    ? "bg-purple-50 text-purple-700 ring-purple-200"
                    : "bg-gray-100 text-gray-600 ring-gray-200"
              }`}>
                {courseStatusLabel}
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-gray-600 ring-1 ring-gray-200">
                Lesson {currentIndex + 1} of {lessons.length}
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-gray-600 ring-1 ring-gray-200">
                {remainingCount} open
              </span>
            </div>
          </div>
          <div className="w-full rounded-2xl border border-gray-200 bg-white p-4 lg:w-80">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-bold text-gray-500">{completedCount} of {lessons.length} completed</p>
              <p className="text-sm font-extrabold text-gray-900">{progressPercent}%</p>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className={`h-full rounded-full transition-all ${progressPercent >= 100 ? "bg-emerald-500" : "bg-purple-600"}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          <aside className="bg-white border border-gray-200 rounded-2xl overflow-hidden h-fit">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-xl font-extrabold text-gray-900">Course Content</h2>
              <p className="text-sm font-semibold text-purple-600 mt-1">{progressPercent}% complete</p>
              <p className="text-xs text-gray-500 mt-1">{completedCount} completed, {remainingCount} remaining</p>
            </div>
            <div className="divide-y divide-gray-100">
              {course.modules.map((module, moduleIndex) => (
                <div key={module.id} className="p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-xs font-bold text-gray-500 uppercase">
                      {moduleIndex + 1}. {module.title}
                    </p>
                    <p className="shrink-0 text-[11px] font-bold text-gray-400">
                      {module.lessons.filter((lesson) => completedLessonIds.has(lesson.id)).length}/{module.lessons.length}
                    </p>
                  </div>
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
                          <span className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center ${isCompleted ? "bg-emerald-100 text-emerald-700" : isActive ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-400"}`}>
                            {isCompleted ? "✓" : lesson.order}
                          </span>
                          <span className="min-w-0 flex-1 line-clamp-2">{lesson.title}</span>
                          {isActive ? <span className="text-[10px] font-extrabold text-purple-500">Now</span> : null}
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
                  <div className="w-16 h-16 rounded-full bg-purple-600 mx-auto mb-4 flex items-center justify-center text-2xl font-bold">
                    ?
                  </div>
                  <p className="text-purple-200 text-sm font-semibold">Quiz</p>
                  <p className="text-gray-400 text-xs mt-1">
                    {currentLesson.questions.length === 0
                      ? "Noch keine Fragen vorhanden."
                      : `${currentLesson.questions.length} Frage${currentLesson.questions.length !== 1 ? "n" : ""}`}
                  </p>
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
                  <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full">
                    Completed
                  </span>
                )}
              </div>

              {currentLesson.type === "QUIZ" ? (
                <div className="mb-6">
                  <QuizPlayer
                    questions={currentLesson.questions.map((q) => ({
                      id: q.id,
                      text: q.text,
                      answers: q.answers.map((a) => ({
                        id: a.id,
                        text: a.text,
                        isCorrect: a.isCorrect,
                      })),
                    }))}
                  />
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 text-sm text-gray-700 leading-relaxed min-h-28 mb-6">
                  {currentLesson.content || "No written lesson content yet. The creator can add content in the Course Builder."}
                </div>
              )}

              {currentLesson.media.length > 0 && (
                <div className="mb-6 space-y-4">
                  <h3 className="text-sm font-bold text-gray-900">Anhänge</h3>
                  {currentLesson.media.map((item) => {
                    if (item.type === "IMAGE") {
                      return (
                        <div key={item.id} className="rounded-xl overflow-hidden border border-gray-200">
                          <img src={item.url} alt={item.filename} className="w-full max-h-96 object-contain bg-gray-50" />
                          <p className="text-xs text-gray-500 px-3 py-2">{item.filename}</p>
                        </div>
                      );
                    }
                    if (item.type === "VIDEO") {
                      return (
                        <div key={item.id} className="rounded-xl overflow-hidden border border-gray-200">
                          <video controls className="w-full max-h-96 bg-black" src={item.url}>
                            Dein Browser unterstützt kein HTML5-Video.
                          </video>
                          <p className="text-xs text-gray-500 px-3 py-2">{item.filename}</p>
                        </div>
                      );
                    }
                    if (item.type === "PDF") {
                      return (
                        <div key={item.id} className="rounded-xl border border-gray-200 overflow-hidden">
                          <iframe src={item.url} title={item.filename} className="w-full h-96" />
                          <div className="px-3 py-2 flex items-center justify-between border-t border-gray-100">
                            <p className="text-xs text-gray-500">{item.filename}</p>
                            <a href={item.url} download className="text-xs text-purple-600 font-semibold hover:text-purple-800">
                              Herunterladen
                            </a>
                          </div>
                        </div>
                      );
                    }
                    if (item.type === "AUDIO") {
                      return (
                        <div key={item.id} className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                          <p className="text-xs font-semibold text-gray-700 mb-2">{item.filename}</p>
                          <audio controls className="w-full" src={item.url}>
                            Dein Browser unterstützt kein HTML5-Audio.
                          </audio>
                        </div>
                      );
                    }
                    if (item.type === "TEXT") {
                      return (
                        <div key={item.id} className="rounded-xl border border-gray-200 overflow-hidden">
                          <div className="bg-gray-900 px-4 py-2 flex items-center justify-between">
                            <p className="text-xs text-gray-400 font-mono">{item.filename}</p>
                            <a href={item.url} download className="text-xs text-purple-400 font-semibold hover:text-purple-200">
                              Herunterladen
                            </a>
                          </div>
                          <iframe src={item.url} title={item.filename} className="w-full h-64 bg-gray-900" />
                        </div>
                      );
                    }
                    return (
                      <div key={item.id} className="rounded-xl border border-gray-200 p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="w-10 h-10 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center text-sm font-bold">📄</span>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{item.filename}</p>
                            <p className="text-xs text-gray-400">{item.mimeType}</p>
                          </div>
                        </div>
                        <a href={item.url} download className="text-sm text-purple-600 font-semibold hover:text-purple-800 border border-purple-200 px-4 py-2 rounded-xl hover:bg-purple-50 transition">
                          Herunterladen
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                {previousLesson ? (
                  <Link href={`/learn/${course.id}?lesson=${previousLesson.id}`} className="flex-1 text-center border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition text-sm">
                    Previous Lesson
                  </Link>
                ) : null}
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
