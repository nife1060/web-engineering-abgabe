/**
 * Die Navigationsleiste oben, wird vom Root-Layout auf jeder Seite eingebunden.
 * Hier wird entschieden welche Links je nach Rolle angezeigt werden — die
 * eigentliche Zugriffsprüfung (`requireRole`/`getSession`) läuft aber auf
 * den einzelnen Seiten selbst, nicht hier.
 */

import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { logoutUser } from "@/app/actions/auth";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getSession } from "@/lib/auth";
import { normalizeLocale } from "@/lib/i18n";

const linkClass = "text-gray-600 hover:text-gray-900 text-sm font-medium px-4";
const mobileLinkClass = "text-gray-700 text-sm font-medium";

export default async function Navbar() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get("learnify-locale")?.value);
  const session = await getSession();
  const role = session?.role;

  // Jeder Link sagt selbst, für welche Rolle(n) er sichtbar sein soll.
  // Wird einmal gefiltert und dann unten sowohl in der Desktop- als auch
  // in der Mobile-Navigation verwendet.
  const links = [
    { href: "/courses", label: "Browse Courses", show: Boolean(role) },
    { href: "/mylearning", label: "My Learning", show: Boolean(role) },
    { href: "/account/orders", label: "My Orders", show: Boolean(role) },
    { href: "/dashboard", label: "Dashboard", show: role === "CREATOR" || role === "ADMIN" },
    { href: "/dashboard/courses", label: "My Courses", show: role === "CREATOR" || role === "ADMIN" },
    { href: "/dashboard/media", label: "Media Library", show: role === "CREATOR" || role === "ADMIN" },
    { href: "/admin", label: "Admin", show: role === "ADMIN" },
  ].filter((link) => link.show);

  return (
    <nav className="no-print bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Learnify logo" width={42} height={42} className="h-10 w-10 object-contain" priority />
            <span className="font-bold text-xl text-gray-900">Learnify</span>
          </Link>

          <div className="hidden md:flex items-center">
            {links.map((link, index) => (
              <div key={link.href} className="flex items-center">
                {index > 0 && <div className="w-px h-4 bg-gray-200" />}
                <Link href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </div>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher initialLocale={locale} />
            {role ? (
              <form action={logoutUser}>
                <button
                  type="submit"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                >
                  Logout
                </button>
              </form>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition"
                >
                  Sign up free
                </Link>
              </>
            )}
          </div>

          <details className="md:hidden relative">
            <summary className="list-none p-2 text-gray-600 cursor-pointer">
              <span className="sr-only">Open menu</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </summary>
            <div className="absolute right-0 top-12 w-56 border border-gray-100 bg-white rounded-xl shadow-lg px-4 py-4 flex flex-col gap-3">
              {links.map((link) => (
                <Link key={link.href} href={link.href} className={mobileLinkClass}>
                  {link.label}
                </Link>
              ))}
              <hr className="border-gray-200" />
              {role ? (
                <form action={logoutUser}>
                  <button type="submit" className="text-gray-700 text-sm font-medium">
                    Logout
                  </button>
                </form>
              ) : (
                <>
                  <Link href="/login" className={mobileLinkClass}>
                    Log in
                  </Link>
                  <Link href="/register" className="text-sm font-medium text-white bg-purple-600 px-4 py-2 rounded-lg text-center">
                    Sign up free
                  </Link>
                </>
              )}
              <div className="pt-2 border-t border-gray-100">
                <LanguageSwitcher initialLocale={locale} />
              </div>
            </div>
          </details>
        </div>
      </div>
    </nav>
  );
}
