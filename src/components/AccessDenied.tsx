/**
 * Wird gezeigt, wenn die Rollenprüfung (`requireRole`) fehlschlägt, also
 * wenn jemand auf eine Seite will, für die er keine Berechtigung hat.
 * Statt einfach wegzuleiten, zeigen wir lieber eine Meldung, damit klar
 * ist warum man nichts sieht.
 */

import Link from "next/link";

export default function AccessDenied() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md text-center bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
        <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-red-600 font-bold text-xl">!</span>
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900">Access denied</h1>
        <p className="text-gray-500 mt-2 text-sm">
          Dein Account hat keine Berechtigung für diesen Bereich.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/courses" className="bg-purple-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-purple-700 transition text-sm">
            Browse Courses
          </Link>
          <Link href="/login" className="border border-gray-300 text-gray-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-50 transition text-sm">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
