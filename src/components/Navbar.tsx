"use client";
import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="font-bold text-xl text-gray-900">LearnHub</span>
          </Link>

          <div className="hidden md:flex items-center">
            <Link href="/courses" className="text-gray-600 hover:text-gray-900 text-sm font-medium px-4">
              Browse Courses
            </Link>
            <div className="w-px h-4 bg-gray-200" />
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 text-sm font-medium px-4">
              My Learning
            </Link>
            <div className="w-px h-4 bg-gray-200" />
            <Link href="/creator" className="text-gray-600 hover:text-gray-900 text-sm font-medium px-4">
              Creator Dashboard
            </Link>
            <div className="w-px h-4 bg-gray-200" />
            <Link href="/admin" className="text-gray-600 hover:text-gray-900 text-sm font-medium px-4">
              Admin
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
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
          </div>

          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-3">
          <Link href="/courses" className="text-gray-700 text-sm font-medium">Browse Courses</Link>
          <Link href="/dashboard" className="text-gray-700 text-sm font-medium">My Learning</Link>
          <Link href="/creator" className="text-gray-700 text-sm font-medium">Creator Dashboard</Link>
          <Link href="/admin" className="text-gray-700 text-sm font-medium">Admin</Link>
          <hr className="border-gray-200" />
          <Link href="/login" className="text-gray-700 text-sm font-medium">Log in</Link>
          <Link href="/register" className="text-sm font-medium text-white bg-purple-600 px-4 py-2 rounded-lg text-center">
            Sign up free
          </Link>
        </div>
      )}
    </nav>
  );
}
