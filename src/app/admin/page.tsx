import Link from "next/link";

const users = [
  { id: 1, name: "Maria Schmidt", email: "maria@example.com", role: "user", joined: "2025-03-12", courses: 3, status: "active" },
  { id: 2, name: "Tom Kaiser", email: "tom@example.com", role: "creator", joined: "2025-01-05", courses: 4, status: "active" },
  { id: 3, name: "Jana Richter", email: "jana@example.com", role: "user", joined: "2025-04-20", courses: 1, status: "active" },
  { id: 4, name: "Max Admin", email: "admin@example.com", role: "admin", joined: "2024-12-01", courses: 0, status: "active" },
  { id: 5, name: "Lisa Müller", email: "lisa@example.com", role: "creator", joined: "2025-02-14", courses: 2, status: "suspended" },
];

const courses = [
  { title: "Web Development Bootcamp", creator: "Tom Kaiser", students: 580, revenue: "€22,400", status: "published" },
  { title: "React & Next.js Masterclass", creator: "Tom Kaiser", students: 340, revenue: "€14,200", status: "published" },
  { title: "Python for Data Science", creator: "Lisa Müller", students: 210, revenue: "€8,100", status: "under review" },
  { title: "UI/UX Fundamentals", creator: "Lisa Müller", students: 0, revenue: "€0", status: "draft" },
];

const roleColors: Record<string, string> = {
  admin: "bg-red-100 text-red-700",
  creator: "bg-purple-100 text-purple-700",
  user: "bg-blue-100 text-blue-700",
};

const statusColors: Record<string, string> = {
  published: "bg-green-100 text-green-700",
  "under review": "bg-yellow-100 text-yellow-700",
  draft: "bg-gray-100 text-gray-500",
  active: "bg-green-100 text-green-700",
  suspended: "bg-red-100 text-red-700",
};

export default function AdminPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Admin Panel</h1>
          <p className="text-gray-500 mt-1">Manage users, courses, and platform settings.</p>
        </div>
        <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-full">Admin Access</span>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Users", value: "1,284", icon: "👥", delta: "+23 this week" },
          { label: "Published Courses", value: "42", icon: "📚", delta: "3 pending review" },
          { label: "Platform Revenue", value: "€9,664", icon: "💰", delta: "20% platform share" },
          { label: "Active Sessions", value: "214", icon: "🟢", delta: "Right now" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-extrabold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            <div className="text-xs text-blue-600 font-medium mt-1">{stat.delta}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        {["Users", "Courses", "Settings"].map((tab, i) => (
          <button key={tab} className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${i === 0 ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-8">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">User Management</h2>
          <div className="flex gap-3">
            <input type="text" placeholder="Search users..." className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500" />
            <button className="text-sm bg-purple-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-purple-700 transition">
              + Invite User
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3">User</th>
                <th className="text-left px-5 py-3">Role</th>
                <th className="text-left px-5 py-3">Joined</th>
                <th className="text-right px-5 py-3">Courses</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleColors[user.role]}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500">{user.joined}</td>
                  <td className="px-5 py-4 text-right text-sm text-gray-700">{user.courses}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[user.status]}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                      <button className="text-xs text-gray-400 hover:text-gray-600 font-medium">Change Role</button>
                      {user.role !== "admin" && (
                        <button className="text-xs text-red-500 hover:text-red-700 font-medium">
                          {user.status === "active" ? "Suspend" : "Activate"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Courses Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Course Management</h2>
          <Link href="/courses" className="text-sm text-purple-600 hover:text-purple-800 font-medium">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3">Course</th>
                <th className="text-left px-5 py-3">Creator</th>
                <th className="text-right px-5 py-3">Students</th>
                <th className="text-right px-5 py-3">Revenue</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-right px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {courses.map((course) => (
                <tr key={course.title} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-4 text-sm font-semibold text-gray-900">{course.title}</td>
                  <td className="px-5 py-4 text-sm text-gray-500">{course.creator}</td>
                  <td className="px-5 py-4 text-right text-sm text-gray-700">{course.students.toLocaleString()}</td>
                  <td className="px-5 py-4 text-right text-sm font-semibold text-green-600">{course.revenue}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[course.status]}`}>
                      {course.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {course.status === "under review" && (
                        <button className="text-xs text-green-600 hover:text-green-800 font-medium">Approve</button>
                      )}
                      <button className="text-xs text-gray-400 hover:text-gray-600 font-medium">View</button>
                      <button className="text-xs text-red-500 hover:text-red-700 font-medium">Remove</button>
                    </div>
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
