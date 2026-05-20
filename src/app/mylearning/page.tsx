import Link from "next/link";
import { redirect } from "next/navigation";
import { formatCoursePrice } from "@/lib/course-format";
import { getSession } from "@/lib/auth";
import { Course, mockCourses } from "@/lib/data";
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

function ProgressCourseCard({ course }: { course: Course }) {
  const progress = course.progress ?? 0;

  return (
    <div className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition">
      <div className="relative h-44 bg-gray-200 overflow-hidden">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute top-3 left-3 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">
          {course.level}
        </span>
      </div>
      <div className="p-4">
        <p className="text-xs text-purple-600 font-bold uppercase tracking-wide mb-1">{course.category}</p>
        <h3 className="text-sm font-extrabold text-gray-900 leading-snug line-clamp-2">{course.title}</h3>
        <p className="text-xs text-gray-500 mt-1">{course.instructor}</p>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
            <div className="h-full rounded-full bg-purple-600" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <Link
          href={`/learn/${course.id}`}
          className="mt-4 block w-full rounded-lg border border-purple-600 py-2 text-center text-xs font-bold text-purple-600 hover:bg-purple-50 transition"
        >
          Continue Learning
        </Link>
      </div>
    </div>
  );
}

function RecommendedCourseCard({ course }: { course: Course }) {
  const priceLabel = formatCoursePrice(course.pricingModel ?? "PAID", course.price, course.subscriptionPrice ?? 0);

  return (
    <Link
      href={`/courses/${course.id}`}
      className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition"
    >
      <div className="relative h-44 bg-gray-200 overflow-hidden">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute top-3 left-3 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">
          {course.level}
        </span>
      </div>
      <div className="p-4">
        <p className="text-xs text-purple-600 font-bold uppercase tracking-wide mb-1">{course.category}</p>
        <h3 className="text-sm font-extrabold text-gray-900 leading-snug line-clamp-2 group-hover:text-purple-700 transition">
          {course.title}
        </h3>
        <p className="text-xs text-gray-500 mt-1">{course.instructor}</p>
        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-yellow-400" />
            <span className="text-sm font-extrabold text-gray-900">{course.rating}</span>
            <span className="text-xs text-gray-400">({course.studentsCount.toLocaleString()})</span>
          </div>
          <span className="text-sm font-extrabold text-gray-900">{priceLabel}</span>
        </div>
      </div>
    </Link>
  );
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

  const [wishlist, completedLessons] = await Promise.all([
    prisma.wishlist.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      include: {
        course: {
          include: {
            creator: {
              select: { name: true },
            },
          },
        },
      },
    }),
    prisma.progress.count({
      where: {
        userId: session.userId,
        completed: true,
      },
    }),
  ]);

  const wishlistCount = wishlist.length;
  const continueLearningCourses = mockCourses.filter((course) => course.enrolled).slice(0, 2);
  const myCourses =
    activeCourseStatus === "in-progress"
      ? continueLearningCourses.filter((course) => {
          const progress = course.progress ?? 0;
          return progress > 0 && progress < 100;
        })
      : activeCourseStatus === "completed"
        ? continueLearningCourses.filter((course) => (course.progress ?? 0) >= 100)
        : continueLearningCourses;
  const recommendedCourses = mockCourses.filter((course) => !course.enrolled).slice(0, 3);
  const enrolledCount = continueLearningCourses.length;
  const overallProgress =
    enrolledCount > 0
      ? Math.round(
          continueLearningCourses.reduce((total, course) => total + (course.progress ?? 0), 0) / enrolledCount,
        )
      : 0;
  const lessonsCompleted = completedLessons || 6;

  const stats = [
    { label: "Enrolled Courses", value: enrolledCount },
    { label: "Week", value: "18-25.Mai" },
    { label: "Overall Progress", value: `${overallProgress}%` },
    { label: "Certificates", value: 0 },
  ];

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
              {tab.value === "wishlist" && wishlistCount > 0 ? (
                <span className="ml-1 text-xs opacity-80">({wishlistCount})</span>
              ) : null}
            </Link>
          ))}
        </div>

        {activeTab === "dashboard" ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-white border border-gray-200 rounded-2xl p-6 min-h-44">
                  {stat.label === "Week" ? (
                    <>
                      <p className="text-sm font-bold text-gray-500">{stat.label}</p>
                      <p className="mt-1 text-xl font-extrabold text-gray-900">{stat.value}</p>
                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-green-100 p-3 text-center">
                          <p className="text-xs text-green-700">Site Visits</p>
                          <p className="text-lg font-extrabold text-green-800">8</p>
                        </div>
                        <div className="rounded-lg bg-green-100 p-3 text-center">
                          <p className="text-xs text-green-700">Lessons Completed</p>
                          <p className="text-lg font-extrabold text-green-800">{lessonsCompleted}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-3xl font-extrabold text-gray-900">{stat.value}</p>
                      <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
                    </>
                  )}
                </div>
              ))}
            </div>

            <section className="mb-12">
              <h2 className="text-xl font-extrabold text-gray-900 mb-5">Continue Learning</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {continueLearningCourses.map((course) => (
                  <ProgressCourseCard key={course.id} course={course} />
                ))}
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-xl font-extrabold text-gray-900 mb-5">Recent Activity</h2>
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                {[
                  {
                    title: 'Completed Lesson: "HTML Structure & Tags"',
                    course: "Web Development Bootcamp",
                    time: "2 hours ago",
                    marker: "OK",
                  },
                  {
                    title: 'Started Lesson: "What is React?"',
                    course: "React & Next.js Masterclass",
                    time: "Yesterday",
                    marker: "Play",
                  },
                  {
                    title: "Enrolled in course",
                    course: "React & Next.js Masterclass",
                    time: "2 days ago",
                    marker: "New",
                  },
                ].map((activity) => (
                  <div key={activity.title} className="flex items-center gap-5 border-b border-gray-100 px-6 py-5 last:border-b-0">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-purple-100 text-[10px] font-extrabold text-purple-700">
                      {activity.marker}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-extrabold text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{activity.course}</p>
                    </div>
                    <p className="text-xs text-gray-400">{activity.time}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-gray-900 mb-5">Recommended for You</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {recommendedCourses.map((course) => (
                  <RecommendedCourseCard key={course.id} course={course} />
                ))}
              </div>
            </section>
          </>
        ) : null}

        {activeTab === "my-courses" ? (
          <section>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {myCourseTabs.map((tab) => (
                <Link
                  key={tab.value}
                  href={tab.href}
                  className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
                    activeCourseStatus === tab.value
                      ? "bg-purple-600 text-white"
                      : "text-gray-700 hover:bg-white hover:text-purple-700"
                  }`}
                >
                  {tab.label}
                </Link>
              ))}
            </div>
            {myCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {myCourses.map((course) => (
                  <ProgressCourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
                <h3 className="font-bold text-gray-900 text-lg mb-2">No courses found.</h3>
                <p className="text-gray-500 text-sm">
                  Courses matching this learning status will appear here.
                </p>
              </div>
            )}
          </section>
        ) : null}

        {activeTab === "wishlist" ? (
          <section>
            <div className="mb-5">
              <h2 className="text-xl font-extrabold text-gray-900">Wishlist</h2>
              <p className="text-sm text-gray-500 mt-1">Courses you saved for later.</p>
            </div>
            {wishlist.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {wishlist.map(({ course }) => (
                  <RecommendedCourseCard
                    key={course.id}
                    course={{
                      id: course.id,
                      title: course.title,
                      description: course.description,
                      instructor: course.creator.name,
                      price: course.price,
                      subscriptionPrice: course.subscriptionPrice,
                      pricingModel: course.pricingModel,
                      rating: 4.8,
                      studentsCount: 0,
                      category: course.categoryName,
                      level: course.level as "Beginner" | "Intermediate" | "Advanced",
                      thumbnail:
                        course.thumbnailUrl ||
                        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop",
                      enrolled: false,
                      modules: [],
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
                <h2 className="font-bold text-gray-900 text-lg mb-2">Your wishlist is empty.</h2>
                <p className="text-gray-500 text-sm mb-5">Browse courses and save anything you want to revisit.</p>
                <Link href="/courses" className="inline-flex bg-purple-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-purple-700 transition text-sm">
                  Browse Courses
                </Link>
              </div>
            )}
          </section>
        ) : null}

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
