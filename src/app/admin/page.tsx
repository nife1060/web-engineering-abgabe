/**
 * Das Admin-Panel: zeigt alle Nutzer mit ihrer Rolle.
 *
 * Anmerkung: Aktuell kann man sich als ADMIN gar nicht einloggen
 * (`loginUser` in `@/app/actions/auth.ts` blockt das, und `getSession`
 * akzeptiert sowieso nur CREATOR/USER-Cookies). Diese Seite und der
 * "Admin"-Link in der Navbar sind also momentan praktisch tot, bis es
 * irgendwann mal einen Admin-Login gibt.
 */

import Link from "next/link";
import AccessDenied from "@/components/AccessDenied";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const roleColors: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-700",
  CREATOR: "bg-purple-100 text-purple-700",
  USER: "bg-blue-100 text-blue-700",
};

export default async function AdminPage() {
  const session = await requireRole(["ADMIN"]);

  if (!session) {
    return <AccessDenied />;
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Admin Panel</h1>
          <p className="text-gray-500 mt-1">Manage users and platform access.</p>
        </div>
        <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-full">Admin Access</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Users", value: users.length },
          { label: "Admins", value: users.filter((user) => user.role === "ADMIN").length },
          { label: "Creators", value: users.filter((user) => user.role === "CREATOR").length },
          { label: "Users", value: users.filter((user) => user.role === "USER").length },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="text-2xl font-extrabold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        <button className="px-5 py-2 rounded-lg text-sm font-semibold transition bg-white text-gray-900 shadow-sm">
          Users
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">User Management</h2>
          <Link href="/register" className="text-sm bg-purple-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-purple-700 transition">
            + New User
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3">User</th>
                <th className="text-left px-5 py-3">Role</th>
                <th className="text-left px-5 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {user.name.charAt(0).toUpperCase()}
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
                  <td className="px-5 py-4 text-sm text-gray-500">
                    {user.createdAt.toLocaleDateString("de-DE")}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-5 py-10 text-center text-sm text-gray-500">
                    Noch keine User vorhanden. Lege den ersten Account über Register an.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
