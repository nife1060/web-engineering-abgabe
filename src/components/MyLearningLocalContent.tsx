"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatCoursePrice } from "@/lib/course-format";
import type { Course } from "@/lib/data";
import {
  readStoredWishlistCourses,
  StoredWishlistCourse,
} from "@/lib/enrollment-storage";

type MyLearningLocalContentProps = {
  activeTab: string;
  activeCourseStatus: string;
  completedLessonIds: string[];
  completedLessonActivity: {
    lessonId: string;
    completedAt: string | null;
  }[];
  enrolledCourses: Course[];
  enrolledAtByCourseId: Record<string, string>;
  recommendedCourses: Course[];
};

const myCourseTabs = [
  { label: "All Courses", value: "all", href: "/mylearning?tab=my-courses" },
  { label: "In Progress", value: "in-progress", href: "/mylearning?tab=my-courses&courseStatus=in-progress" },
  { label: "Completed", value: "completed", href: "/mylearning?tab=my-courses&courseStatus=completed" },
];

function getCourseLearningStats(course: Course) {
  const lessons = course.modules.flatMap((module) => module.lessons);
  const completedLessons = lessons.filter((lesson) => lesson.completed).length;
  const totalLessons = lessons.length;
  const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const remainingLessons = Math.max(totalLessons - completedLessons, 0);
  const status =
    progress >= 100
      ? { label: "Completed", dotClass: "bg-emerald-500", badgeClass: "bg-emerald-50 text-emerald-700 ring-emerald-200" }
      : completedLessons > 0
        ? { label: "In Progress", dotClass: "bg-purple-500", badgeClass: "bg-purple-50 text-purple-700 ring-purple-200" }
        : { label: "Not Started", dotClass: "bg-gray-400", badgeClass: "bg-gray-100 text-gray-600 ring-gray-200" };

  return {
    completedLessons,
    totalLessons,
    progress,
    remainingLessons,
    status,
  };
}

function formatActivityTime(date: Date) {
  const minutesAgo = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));

  if (minutesAgo < 1) return "Just now";
  if (minutesAgo < 60) return `${minutesAgo} minutes ago`;

  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo < 24) return `${hoursAgo} hours ago`;

  const daysAgo = Math.floor(hoursAgo / 24);
  if (daysAgo === 1) return "Yesterday";
  return `${daysAgo} days ago`;
}

function getLessonPlayerHref(course: Course) {
  return `/learn/${course.id}`;
}

function ProgressCourseCard({ course }: { course: Course }) {
  const stats = getCourseLearningStats(course);
  const progress = course.progress ?? stats.progress;
  const lessonHref = getLessonPlayerHref(course);

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
        <span className={`absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold ring-1 ${stats.status.badgeClass}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${stats.status.dotClass}`} />
          {stats.status.label}
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
            <div
              className={`h-full rounded-full transition-all ${progress >= 100 ? "bg-emerald-500" : "bg-purple-600"}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg bg-gray-50 px-3 py-2">
              <p className="font-extrabold text-gray-900">{stats.completedLessons}/{stats.totalLessons}</p>
              <p className="text-gray-500">Lessons done</p>
            </div>
            <div className="rounded-lg bg-gray-50 px-3 py-2">
              <p className="font-extrabold text-gray-900">{stats.remainingLessons}</p>
              <p className="text-gray-500">Remaining</p>
            </div>
          </div>
        </div>

        <Link
          href={lessonHref}
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

export default function MyLearningLocalContent({
  activeTab,
  activeCourseStatus,
  completedLessonIds,
  completedLessonActivity,
  enrolledCourses,
  enrolledAtByCourseId,
  recommendedCourses,
}: MyLearningLocalContentProps) {
  const [storedWishlist, setStoredWishlist] = useState<StoredWishlistCourse[]>([]);

  useEffect(() => {
    const refreshWishlist = () => setStoredWishlist(readStoredWishlistCourses());

    refreshWishlist();
    window.addEventListener("storage", refreshWishlist);
    window.addEventListener("learnhub-wishlist-changed", refreshWishlist);

    return () => {
      window.removeEventListener("storage", refreshWishlist);
      window.removeEventListener("learnhub-wishlist-changed", refreshWishlist);
    };
  }, []);

  const hydratedEnrolledCourses = useMemo(() => {
    const completedLessonIdSet = new Set(completedLessonIds);

    return enrolledCourses.map((course) => {
      const lessons = course.modules.flatMap((module) => module.lessons);
      const completedCount = lessons.filter((lesson) => completedLessonIdSet.has(lesson.id)).length;
      const progress = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

      return {
        ...course,
        modules: course.modules.map((module) => ({
          ...module,
          lessons: module.lessons.map((lesson) => ({
            ...lesson,
            completed: completedLessonIdSet.has(lesson.id),
          })),
        })),
        progress,
      };
    });
  }, [enrolledCourses, completedLessonIds]);

  const myCourses =
    activeCourseStatus === "in-progress"
      ? hydratedEnrolledCourses.filter((course) => (course.progress ?? 0) < 100)
      : activeCourseStatus === "completed"
        ? hydratedEnrolledCourses.filter((course) => (course.progress ?? 0) >= 100)
        : hydratedEnrolledCourses;
  const enrolledCount = hydratedEnrolledCourses.length;
  const totalLessonCount = hydratedEnrolledCourses.reduce(
    (total, course) => total + course.modules.reduce((sum, module) => sum + module.lessons.length, 0),
    0,
  );
  const enrolledCompletedLessonCount = hydratedEnrolledCourses.reduce(
    (total, course) =>
      total +
      course.modules.reduce(
        (sum, module) => sum + module.lessons.filter((lesson) => lesson.completed).length,
        0,
      ),
    0,
  );
  const completedCourseCount = hydratedEnrolledCourses.filter((course) => (course.progress ?? 0) >= 100).length;
  const inProgressCourseCount = hydratedEnrolledCourses.filter((course) => {
    const progress = course.progress ?? 0;
    return progress > 0 && progress < 100;
  }).length;
  const overallProgress =
    totalLessonCount > 0
      ? Math.round((enrolledCompletedLessonCount / totalLessonCount) * 100)
      : 0;
  const enrolledIdSet = new Set(hydratedEnrolledCourses.map((course) => course.id));
  const recommendedCourseList = recommendedCourses.filter((course) => !enrolledIdSet.has(course.id));
  const wishlistCourses = storedWishlist
    .map((wishlistItem) => wishlistItem.course)
    .filter((course) => !enrolledIdSet.has(course.id));

  type HydratedCourse = (typeof hydratedEnrolledCourses)[number];
  const latestEnrollment = hydratedEnrolledCourses
    .map((course) => {
      const enrolledAt = enrolledAtByCourseId[course.id];
      return enrolledAt ? { course, enrolledAt } : null;
    })
    .filter((entry): entry is { course: HydratedCourse; enrolledAt: string } => entry !== null)
    .sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime())[0];

  const completionActivities = hydratedEnrolledCourses
    .map((course) => {
      const lessonIds = new Set(course.modules.flatMap((module) => module.lessons.map((lesson) => lesson.id)));
      const completedLessonsInCourse = completedLessonActivity.filter((progress) => lessonIds.has(progress.lessonId));

      if (completedLessonsInCourse.length === 0) {
        return null;
      }

      const latestCompletedAt = completedLessonsInCourse
        .map((progress) => progress.completedAt)
        .filter((completedAt): completedAt is string => completedAt !== null)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];

      return {
        title: `Completed ${completedLessonsInCourse.length} ${
          completedLessonsInCourse.length === 1 ? "lesson" : "lessons"
        }`,
        course: course.title,
        time: latestCompletedAt ? formatActivityTime(new Date(latestCompletedAt)) : "Recently",
        marker: "OK",
      };
    })
    .filter((activity) => activity !== null);
  const recentActivities = [
    ...completionActivities,
    latestEnrollment
      ? {
          title: "Enrolled in course",
          course: latestEnrollment.course.title,
          time: formatActivityTime(new Date(latestEnrollment.enrolledAt)),
          marker: "New",
        }
      : null,
  ].filter((activity) => activity !== null);

  if (activeTab === "my-courses") {
    return (
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
            <p className="text-gray-500 text-sm">Courses matching this learning status will appear here.</p>
          </div>
        )}
      </section>
    );
  }

  if (activeTab === "wishlist") {
    return (
      <section>
        <div className="mb-5">
          <h2 className="text-xl font-extrabold text-gray-900">Wishlist</h2>
          <p className="text-sm text-gray-500 mt-1">Courses you saved for later.</p>
        </div>
        {wishlistCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {wishlistCourses.map((course) => (
              <RecommendedCourseCard key={course.id} course={course} />
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
    );
  }

  if (activeTab !== "dashboard") {
    return null;
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Enrolled Courses", value: enrolledCount, detail: `${inProgressCourseCount} active` },
          { label: "Lessons Completed", value: enrolledCompletedLessonCount, detail: `${totalLessonCount} total lessons` },
          { label: "Overall Progress", value: `${overallProgress}%`, detail: "Across all courses" },
          { label: "Completed Courses", value: completedCourseCount, detail: "Ready for review" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-2xl p-6 min-h-40">
            <p className="text-3xl font-extrabold text-gray-900">{stat.value}</p>
            <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
            <p className="mt-5 text-xs font-semibold text-purple-600">{stat.detail}</p>
          </div>
        ))}
      </div>

      {hydratedEnrolledCourses.length > 0 ? (
        <section className="mb-12">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">Continue Learning</h2>
              <p className="text-sm text-gray-500 mt-1">
                {enrolledCompletedLessonCount} completed lessons, {Math.max(totalLessonCount - enrolledCompletedLessonCount, 0)} still open.
              </p>
            </div>
            <div className="w-full sm:w-72">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Total course progress</span>
                <span>{overallProgress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div className="h-full rounded-full bg-purple-600" style={{ width: `${overallProgress}%` }} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {hydratedEnrolledCourses.map((course) => (
              <ProgressCourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      ) : (
        <section className="mb-12">
          <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
            <h2 className="font-bold text-gray-900 text-lg mb-2">No enrolled courses yet.</h2>
            <p className="text-gray-500 text-sm mb-5">Browse our catalog and pick your first course.</p>
            <Link
              href="/courses"
              className="inline-flex bg-purple-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-purple-700 transition text-sm"
            >
              Browse Courses
            </Link>
          </div>
        </section>
      )}

      {recentActivities.length > 0 ? (
        <section className="mb-12">
          <h2 className="text-xl font-extrabold text-gray-900 mb-5">Recent Activity</h2>
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            {recentActivities.map((activity) => (
              <div key={`${activity.title}-${activity.course}`} className="flex items-center gap-5 border-b border-gray-100 px-6 py-5 last:border-b-0">
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
      ) : null}

      <section>
        <h2 className="text-xl font-extrabold text-gray-900 mb-5">Recommended for You</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {recommendedCourseList.map((course) => (
            <RecommendedCourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>
    </>
  );
}
