"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCoursesPage = pathname.startsWith("/dashboard/courses");
  const isWishlistPage = pathname.startsWith("/dashboard/wishlist");
  const isCertificationsPage = pathname.startsWith("/dashboard/certifications");
  const title = isCoursesPage
    ? "My Courses"
    : isWishlistPage
      ? "Wishlist"
      : isCertificationsPage
        ? "Certifications"
        : "My Learning";

  const navItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "My Courses", href: "/dashboard/courses" },
    { label: "Wishlist", href: "/dashboard/wishlist" },
    { label: "Certifications", href: "/dashboard/certifications" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">{title}</h1>
          <p className="text-gray-500 mt-1">Welcome back! Pick up where you left off.</p>
        </div>
        <Link href="/courses" className="bg-purple-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-purple-700 transition text-sm">
          Browse more courses
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-8">
        {navItems.map((item) => {
          const active = item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith("/dashboard/courses") && item.href === "/dashboard/courses"
              || pathname.startsWith("/dashboard/wishlist") && item.href === "/dashboard/wishlist"
              || pathname.startsWith("/dashboard/certifications") && item.href === "/dashboard/certifications";

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${active ? "bg-purple-600 text-white" : "text-gray-700 hover:bg-gray-50"}`}>
              {item.label}
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}
