import Link from "next/link";
import { redirect } from "next/navigation";
import MyLearningLocalContent from "@/components/MyLearningLocalContent";
import { getSession } from "@/lib/auth";
import { mockCourses } from "@/lib/data";
import { prisma } from "@/lib/prisma";

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

  const completedLessons = await prisma.progress.count({
      where: {
        userId: session.userId,
        completed: true,
      },
    });

  const continueLearningCourses = mockCourses.filter((course) => course.enrolled).slice(0, 2);
  const recommendedCourses = mockCourses.filter((course) => !course.enrolled).slice(0, 3);
  const lessonsCompleted = completedLessons || 6;

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

        <MyLearningLocalContent
          activeTab={activeTab}
          activeCourseStatus={activeCourseStatus}
          completedLessons={lessonsCompleted}
          baseEnrolledCourses={continueLearningCourses}
          recommendedCourses={recommendedCourses}
        />

        {activeTab === "certifications" ? (
          <section className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
            <h2 className="font-bold text-gray-900 text-lg mb-2">No certificates yet.</h2>
            <p className="text-gray-500 text-sm">Complete a course to earn your first certificate.</p>
          </section>
        ) : null}
      </div>
    </div>
  );
}
