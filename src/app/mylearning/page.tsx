import Link from "next/link";
import { redirect } from "next/navigation";
import CertificationsSection, {
  type CertificateInProgressCourse,
  type EarnedCertificate,
} from "@/components/CertificationsSection";
import MyLearningLocalContent from "@/components/MyLearningLocalContent";
import { getSession } from "@/lib/auth";
import { syncCertificatesForUser } from "@/lib/certificates";
import type { Course } from "@/lib/data";
import { mockCourses } from "@/lib/data";
import { prisma } from "@/lib/prisma";

const FALLBACK_THUMBNAIL =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop";

export const dynamic = "force-dynamic";

const tabs = [
  { label: "Dashboard", value: "dashboard", href: "/mylearning" },
  { label: "My Courses", value: "my-courses", href: "/mylearning?tab=my-courses" },
  { label: "Wishlist", value: "wishlist", href: "/mylearning?tab=wishlist" },
  { label: "Certifications", value: "certifications", href: "/mylearning?tab=certifications" },
];
const myCourseTabs = [
  { label: "All Courses", value: "all", href: "/mylearning?tab=my-courses" },
  { label: "In Progress", value: "in-progress", href: "/mylearning?tab=my-courses&courseStatus=in-progress" },
  { label: "Completed", value: "completed", href: "/mylearning?tab=my-courses&courseStatus=completed" },
];

type MyLearningSearchParams = {
  tab?: string | string[];
  courseStatus?: string | string[];
};

function firstValue(value: string | string[] | undefined, fallback = "") {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
}

export default async function MyLearningPage({
  searchParams,
}: {
  searchParams: Promise<MyLearningSearchParams>;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const params = await searchParams;
  const requestedTab = firstValue(params.tab, "dashboard");
  const activeTab = tabs.some((tab) => tab.value === requestedTab) ? requestedTab : "dashboard";
  const requestedCourseStatus = firstValue(params.courseStatus, "all");
  const activeCourseStatus = myCourseTabs.some((tab) => tab.value === requestedCourseStatus)
    ? requestedCourseStatus
    : "all";

  const [completedProgress, enrollments, publishedCourses] = await Promise.all([
    prisma.progress.findMany({
      where: {
        userId: session.userId,
        completed: true,
      },
      select: {
        lessonId: true,
        completedAt: true,
      },
    }),
    prisma.enrollment.findMany({
      where: {
        userId: session.userId,
        active: true,
      },
      orderBy: { createdAt: "desc" },
      include: {
        course: {
          include: {
            creator: { select: { name: true } },
            modules: {
              orderBy: { order: "asc" },
              include: {
                lessons: {
                  orderBy: { order: "asc" },
                },
              },
            },
          },
        },
      },
    }),
    prisma.course.findMany({
      where: { status: "PUBLISHED" },
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
    }),
  ]);
  const completedLessonIds = completedProgress.map((progress) => progress.lessonId);

  const mapDbCourseToCourse = (course: (typeof publishedCourses)[number]): Course => ({
    id: course.id,
    title: course.title,
    description: course.description,
    instructor: course.creator.name,
    price: course.price,
    subscriptionPrice: course.subscriptionPrice,
    pricingModel: course.pricingModel,
    rating: 0,
    studentsCount: 0,
    category: course.categoryName,
    level: course.level as "Beginner" | "Intermediate" | "Advanced",
    thumbnail:
      course.thumbnailUrl ||
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop",
    enrolled: false,
    modules: course.modules.map((module) => ({
      id: module.id,
      title: module.title,
      lessons: module.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        duration: lesson.type === "VIDEO" ? "Video" : lesson.type === "QUIZ" ? "Quiz" : "Text",
        type: lesson.type === "VIDEO" ? ("video" as const) : ("text" as const),
        completed: false,
      })),
    })),
  });

  const dbCourses = publishedCourses.map(mapDbCourseToCourse);
  const availableCourses = [...dbCourses, ...mockCourses];
  const enrolledCourses: Course[] = enrollments.map((enrollment) => ({
    ...mapDbCourseToCourse(enrollment.course),
    enrolled: true,
  }));
  const enrolledIds = new Set(enrolledCourses.map((course) => course.id));
  const enrolledLatestAt = new Map(
    enrollments.map((enrollment) => [enrollment.courseId, enrollment.createdAt.toISOString()]),
  );
  const recommendedCourses = availableCourses
    .filter((course) => !enrolledIds.has(course.id))
    .slice(0, 6);

  // Backfill/issue certificates for fully-completed courses and load the list.
  const certificates = await syncCertificatesForUser(session.userId);
  const certificateIdByCourseId: Record<string, string> = Object.fromEntries(
    certificates.map((certificate) => [certificate.courseId, certificate.id]),
  );

  const completedLessonIdSet = new Set(completedLessonIds);
  const earnedCertificates: EarnedCertificate[] = certificates.map((certificate) => ({
    id: certificate.id,
    serial: certificate.serial,
    courseTitle: certificate.course.title,
    instructor: certificate.course.creator.name,
    issuedAt: certificate.issuedAt.toISOString(),
    thumbnail: certificate.course.thumbnailUrl || FALLBACK_THUMBNAIL,
  }));
  const certificateInProgressCourses: CertificateInProgressCourse[] = enrolledCourses
    .map((course) => {
      const lessons = course.modules.flatMap((module) => module.lessons);
      const totalLessons = lessons.length;
      const completedLessons = lessons.filter((lesson) => completedLessonIdSet.has(lesson.id)).length;
      const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      return { id: course.id, title: course.title, thumbnail: course.thumbnail, progress, completedLessons, totalLessons };
    })
    .filter((course) => course.completedLessons > 0 && course.progress < 100);

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              {activeTab === "my-courses" ? "My Courses" : "My Learning"}
            </h1>
            <p className="text-gray-500 mt-1">
              {activeTab === "my-courses" ? "Track your active courses and review completed courses." : "Welcome back!"}
            </p>
          </div>
          <Link
            href="/courses"
            className="inline-flex w-fit items-center justify-center rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-purple-700 transition"
          >
            Browse more courses
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-8">
          {tabs.map((tab) => (
            <Link
              key={tab.value}
              href={tab.href}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
                activeTab === tab.value
                  ? "bg-purple-600 text-white"
                  : "text-gray-700 hover:bg-white hover:text-purple-700"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {activeTab === "certifications" ? (
          <CertificationsSection
            certificates={earnedCertificates}
            inProgressCourses={certificateInProgressCourses}
          />
        ) : (
          <MyLearningLocalContent
            activeTab={activeTab}
            activeCourseStatus={activeCourseStatus}
            completedLessonIds={completedLessonIds}
            completedLessonActivity={completedProgress.map((progress) => ({
              lessonId: progress.lessonId,
              completedAt: progress.completedAt?.toISOString() ?? null,
            }))}
            enrolledCourses={enrolledCourses}
            enrolledAtByCourseId={Object.fromEntries(enrolledLatestAt)}
            recommendedCourses={recommendedCourses}
            certificateIdByCourseId={certificateIdByCourseId}
          />
        )}
      </div>
    </div>
  );
}
