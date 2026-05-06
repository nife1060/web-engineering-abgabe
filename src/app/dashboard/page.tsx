import Link from "next/link";
import CourseCard from "@/components/CourseCard";
import { mockCourses } from "@/lib/data";

const enrolledCourses = mockCourses.filter((c) => c.enrolled);

export default function DashboardPage() {
  const totalLessons = enrolledCourses.reduce((acc, c) =>
    acc + c.modules.reduce((a, m) => a + m.lessons.length, 0), 0
  );
  const completedLessons = enrolledCourses.reduce((acc, c) =>
    acc + c.modules.reduce((a, m) => a + m.lessons.filter((l) => l.completed).length, 0), 0
  );
  const overallProgress = Math.round((completedLessons / totalLessons) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">My Learning</h1>
          <p className="text-gray-500 mt-1">Welcome back! Pick up where you left off.</p>
        </div>
        <Link href="/courses" className="bg-purple-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-purple-700 transition text-sm">
          Browse more courses
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Enrolled Courses", value: enrolledCourses.length, icon: "📚" },
          { label: "Lessons Completed", value: completedLessons, icon: "✅" },
          { label: "Overall Progress", value: `${overallProgress}%`, icon: "📊" },
          { label: "Certificates", value: 0, icon: "🏆" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-extrabold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Continue Learning */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-5">Continue Learning</h2>
        {enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {enrolledCourses.map((course) => (
              <CourseCard key={course.id} course={course} showProgress />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl">
            <div className="text-5xl mb-4">📚</div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">No courses yet</h3>
            <p className="text-gray-500 text-sm mb-5">Start learning by enrolling in a course</p>
            <Link href="/courses" className="bg-purple-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-purple-700 transition text-sm">
              Browse courses
            </Link>
          </div>
        )}
      </section>

      {/* Recent Activity */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-5">Recent Activity</h2>
        <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100">
          {[
            { action: "Completed lesson", lesson: "HTML Structure & Tags", course: "Web Development Bootcamp", time: "2 hours ago", icon: "✅" },
            { action: "Started lesson", lesson: "What is React?", course: "React & Next.js Masterclass", time: "Yesterday", icon: "▶️" },
            { action: "Enrolled in course", lesson: "", course: "React & Next.js Masterclass", time: "2 days ago", icon: "🎓" },
          ].map((activity, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <span className="text-xl shrink-0">{activity.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {activity.action}{activity.lesson ? `: "${activity.lesson}"` : ""}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{activity.course}</p>
              </div>
              <span className="text-xs text-gray-400 shrink-0">{activity.time}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Recommended */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-5">Recommended for You</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {mockCourses.filter((c) => !c.enrolled).slice(0, 3).map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>
    </div>
  );
}
