import Link from "next/link";
import { mockAnalytics } from "@/lib/data";

export default function CreatorDashboardPage() {
  const { totalStudents, totalRevenue, totalCourses, avgRating, monthlySales, courseStats } = mockAnalytics;

  const maxSales = Math.max(...monthlySales.map((m) => m.sales));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Creator Dashboard</h1>
          <p className="text-gray-500 mt-1">Track your courses, revenue, and student engagement.</p>
        </div>
        <Link href="/creator/courses/new" className="bg-purple-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-purple-700 transition text-sm flex items-center gap-2">
          <span>+</span> New Course
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Students", value: totalStudents.toLocaleString(), icon: "👥", delta: "+12% this month" },
          { label: "Total Revenue", value: `€${totalRevenue.toLocaleString()}`, icon: "💰", delta: "+8% this month" },
          { label: "Active Courses", value: totalCourses, icon: "📚", delta: "2 in draft" },
          { label: "Avg. Rating", value: `★ ${avgRating}`, icon: "⭐", delta: "Excellent" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-extrabold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            <div className="text-xs text-green-600 font-medium mt-1">{stat.delta}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-gray-900">Monthly Revenue</h2>
            <span className="text-xs text-gray-400">Last 6 months</span>
          </div>
          <div className="flex items-end gap-3 h-40">
            {monthlySales.map((month) => (
              <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs text-gray-500">€{(month.sales / 1000).toFixed(1)}k</span>
                <div className="w-full bg-purple-100 rounded-t-lg relative" style={{ height: `${(month.sales / maxSales) * 100}%`, minHeight: "8px" }}>
                  <div className="absolute inset-0 bg-purple-600 rounded-t-lg opacity-90" />
                </div>
                <span className="text-xs text-gray-500">{month.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
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
            <Link href="/dashboard/media" className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition group">
              <span className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-lg group-hover:bg-blue-200 transition">📤</span>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">Upload content</p>
                <p className="text-xs text-gray-400">Add videos, PDFs & more</p>
              </div>
            </Link>
            <button className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition group">
              <span className="w-9 h-9 rounded-lg bg-green-100 text-green-600 flex items-center justify-center text-lg group-hover:bg-green-200 transition">💳</span>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">Stripe payouts</p>
                <p className="text-xs text-gray-400">Manage your earnings</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Course Performance Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Course Performance</h2>
          <Link href="/creator/courses" className="text-sm text-purple-600 hover:text-purple-800 font-medium">Manage courses →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="text-left px-6 py-3">Course</th>
                <th className="text-right px-6 py-3">Students</th>
                <th className="text-right px-6 py-3">Revenue</th>
                <th className="text-right px-6 py-3">Rating</th>
                <th className="text-right px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {courseStats.map((course) => (
                <tr key={course.title} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-gray-900">{course.title}</p>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-700">{course.students.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-green-600">€{course.revenue.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-sm text-yellow-500 font-semibold">★ {course.rating}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-xs text-purple-600 hover:text-purple-800 font-semibold">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
