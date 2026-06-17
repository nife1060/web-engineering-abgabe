import Link from "next/link";
import AccessDenied from "@/components/AccessDenied";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const monthFormatter = new Intl.DateTimeFormat("en-GB", { month: "short" });

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

export default async function DashboardPage() {
  const session = await requireRole(["CREATOR", "ADMIN"]);

  if (!session) {
    return <AccessDenied />;
  }

  const isAdmin = session.role === "ADMIN";
  const creatorScope = isAdmin ? undefined : session.userId;

  const courseWhere = creatorScope ? { creatorId: creatorScope } : {};
  const courseFilter = creatorScope
    ? { course: { creatorId: creatorScope } }
    : {};

  const [courses, totalCourses, publishedCourses, draftCourses, enrollments, paidOrders, completedProgress] =
    await Promise.all([
      prisma.course.findMany({
        where: courseWhere,
        include: {
          _count: { select: { enrollments: { where: { active: true } } } },
          modules: { select: { _count: { select: { lessons: true } } } },
        },
      }),
      prisma.course.count({ where: courseWhere }),
      prisma.course.count({ where: { ...courseWhere, status: "PUBLISHED" } }),
      prisma.course.count({ where: { ...courseWhere, status: "DRAFT" } }),
      prisma.enrollment.findMany({
        where: { active: true, ...courseFilter },
        select: { userId: true, courseId: true },
      }),
      prisma.order.findMany({
        where: { status: "PAID", ...courseFilter },
        select: { amount: true, courseId: true, paidAt: true, createdAt: true },
      }),
      prisma.progress.findMany({
        where: { completed: true, lesson: { module: { course: courseWhere } } },
        select: { userId: true, lesson: { select: { module: { select: { courseId: true } } } } },
      }),
    ]);

  const distinctStudents = new Set(enrollments.map((enrollment) => enrollment.userId)).size;
  const totalRevenue = paidOrders.reduce((sum, order) => sum + order.amount, 0);

  const now = new Date();
  const monthBuckets: { key: string; label: string; sales: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = addMonths(startOfMonth(now), -i);
    monthBuckets.push({
      key: `${monthStart.getFullYear()}-${monthStart.getMonth()}`,
      label: monthFormatter.format(monthStart),
      sales: 0,
    });
  }
  const sixMonthsAgo = addMonths(startOfMonth(now), -5);
  for (const order of paidOrders) {
    const when = order.paidAt ?? order.createdAt;
    if (when < sixMonthsAgo) continue;
    const key = `${when.getFullYear()}-${when.getMonth()}`;
    const bucket = monthBuckets.find((entry) => entry.key === key);
    if (bucket) bucket.sales += order.amount;
  }
  const maxSales = Math.max(1, ...monthBuckets.map((bucket) => bucket.sales));

  const revenuePerCourse = new Map<string, number>();
  for (const order of paidOrders) {
    revenuePerCourse.set(order.courseId, (revenuePerCourse.get(order.courseId) ?? 0) + order.amount);
  }

  const lessonsPerCourse = new Map<string, number>();
  for (const course of courses) {
    lessonsPerCourse.set(course.id, course.modules.reduce((sum, module) => sum + module._count.lessons, 0));
  }
  const studentsPerCourse = new Map<string, Set<string>>();
  for (const enrollment of enrollments) {
    const students = studentsPerCourse.get(enrollment.courseId) ?? new Set<string>();
    students.add(enrollment.userId);
    studentsPerCourse.set(enrollment.courseId, students);
  }
  const completedPerCourseUser = new Map<string, number>();
  for (const entry of completedProgress) {
    const key = `${entry.lesson.module.courseId}:${entry.userId}`;
    completedPerCourseUser.set(key, (completedPerCourseUser.get(key) ?? 0) + 1);
  }
  // Average completion across enrolled students (0% counts in); null when not measurable.
  function avgProgress(courseId: string): number | null {
    const students = studentsPerCourse.get(courseId);
    const totalLessons = lessonsPerCourse.get(courseId) ?? 0;
    if (!students || students.size === 0 || totalLessons === 0) return null;
    let sum = 0;
    for (const userId of students) {
      const completed = completedPerCourseUser.get(`${courseId}:${userId}`) ?? 0;
      sum += Math.min(completed / totalLessons, 1);
    }
    return (sum / students.size) * 100;
  }

  const courseStats = courses
    .map((course) => ({
      id: course.id,
      title: course.title,
      students: course._count.enrollments,
      revenue: revenuePerCourse.get(course.id) ?? 0,
      progress: avgProgress(course.id),
      status: course.status,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            {isAdmin ? "Admin Dashboard" : "Creator Dashboard"}
          </h1>
          <p className="text-gray-500 mt-1">
            {isAdmin
              ? "Platform-wide course, revenue, and engagement overview."
              : "Track your courses, revenue, and student engagement."}
          </p>
        </div>
        <Link href="/creator/courses/new" className="bg-purple-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-purple-700 transition text-sm flex items-center gap-2">
          <span>+</span> New Course
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Total Students",
            value: distinctStudents.toLocaleString(),
            icon: "👥",
            delta: `${enrollments.length.toLocaleString()} active enrollments`,
          },
          {
            label: "Total Revenue",
            value: `EUR ${totalRevenue.toFixed(2)}`,
            icon: "💶",
            delta: `${paidOrders.length} paid orders`,
          },
          {
            label: "Active Courses",
            value: publishedCourses,
            icon: "📚",
            delta: `${draftCourses} in draft`,
          },
          {
            label: "All Courses",
            value: totalCourses,
            icon: "🗂️",
            delta: "Includes drafts",
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="text-2xl mb-2 leading-none">{stat.icon}</div>
            <div className="text-2xl font-extrabold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            <div className="text-xs text-green-600 font-medium mt-1">{stat.delta}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-gray-900">Monthly Revenue</h2>
            <span className="text-xs text-gray-400">Last 6 months</span>
          </div>
          {paidOrders.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-sm text-gray-400">
              No paid orders yet. Once a student buys one of your courses it will show up here.
            </div>
          ) : (
            <div className="flex items-end gap-3 h-40">
              {monthBuckets.map((month) => (
                <div key={month.key} className="flex-1 h-full flex flex-col items-center gap-2">
                  <span className="text-xs text-gray-500">EUR {month.sales.toFixed(0)}</span>
                  <div className="w-full flex-1 flex items-end">
                    <div
                      className="w-full bg-purple-600 rounded-t-lg opacity-90"
                      style={{ height: `${(month.sales / maxSales) * 100}%`, minHeight: "8px" }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{month.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="font-bold text-gray-900 mb-5">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/creator/courses/new" className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition group">
              <span className="w-9 h-9 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-lg group-hover:bg-purple-200 transition">+</span>
              <div>
                <p className="text-sm font-semibold text-gray-900">Create new course</p>
                <p className="text-xs text-gray-400">Start building your content</p>
              </div>
            </Link>
            <Link href="/dashboard/courses" className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition group">
              <span className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-lg font-bold group-hover:bg-blue-200 transition">→</span>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">Manage courses</p>
                <p className="text-xs text-gray-400">Edit content & pricing</p>
              </div>
            </Link>
            <Link href="/dashboard/media" className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition group">
              <span className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-lg font-bold group-hover:bg-blue-200 transition">→</span>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">Media library</p>
                <p className="text-xs text-gray-400">Upload videos & files</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Course Performance</h2>
          <Link href="/dashboard/courses" className="text-sm text-purple-600 hover:text-purple-800 font-medium">My Courses</Link>
        </div>
        <div className="overflow-x-auto">
          {courseStats.length === 0 ? (
            <div className="p-10 text-center text-sm text-gray-400">
              No courses yet. Create your first course to see performance metrics.
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="text-left px-6 py-3">Course</th>
                  <th className="text-left px-6 py-3">Status</th>
                  <th className="text-right px-6 py-3">Students</th>
                  <th className="text-left px-6 py-3">Avg. Progress</th>
                  <th className="text-right px-6 py-3">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {courseStats.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      <Link href={`/courses/${course.id}`} className="hover:text-purple-700 transition">
                        {course.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-bold ${
                          course.status === "PUBLISHED"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {course.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-700">{course.students.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      {course.progress === null ? (
                        <span className="text-sm text-gray-400">—</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden min-w-[80px]">
                            <div className="h-full bg-purple-600 rounded-full" style={{ width: `${course.progress}%` }} />
                          </div>
                          <span className="text-sm text-gray-700 tabular-nums w-10 text-right">{course.progress.toFixed(0)}%</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-green-600">EUR {course.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
