"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatCoursePrice } from "@/lib/course-format";
import type { Course } from "@/lib/data";
import {
  readStoredEnrollments,
  readStoredWishlistCourses,
  StoredEnrollment,
  StoredWishlistCourse,
} from "@/lib/enrollment-storage";

type MyLearningLocalContentProps = {
  activeTab: string;
  activeCourseStatus: string;
  completedLessons: number;
  completedLessonIds: string[];
  completedLessonActivity: {
    lessonId: string;
    completedAt: string | null;
  }[];
  baseEnrolledCourses: Course[];
  availableCourses: Course[];
  recommendedCourses: Course[];
};

const myCourseTabs = [
  { label: "All Courses", value: "all", href: "/mylearning?tab=my-courses" },
  { label: "In Progress", value: "in-progress", href: "/mylearning?tab=my-courses&courseStatus=in-progress" },
  { label: "Completed", value: "completed", href: "/mylearning?tab=my-courses&courseStatus=completed" },
];

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
  const progress = course.progress ?? 0;
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
            <div className="h-full rounded-full bg-purple-600" style={{ width: `${progress}%` }} />
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
  completedLessons,
  completedLessonIds,
  completedLessonActivity,
  baseEnrolledCourses,
  availableCourses,
  recommendedCourses,
}: MyLearningLocalContentProps) {
  const [storedEnrollments, setStoredEnrollments] = useState<StoredEnrollment[]>([]);
  const [storedWishlist, setStoredWishlist] = useState<StoredWishlistCourse[]>([]);

  useEffect(() => {
    const refreshEnrollments = () => setStoredEnrollments(readStoredEnrollments());
    const refreshWishlist = () => setStoredWishlist(readStoredWishlistCourses());

    refreshEnrollments();
    refreshWishlist();
    window.addEventListener("storage", refreshEnrollments);
    window.addEventListener("learnhub-enrollments-changed", refreshEnrollments);
    window.addEventListener("storage", refreshWishlist);
    window.addEventListener("learnhub-wishlist-changed", refreshWishlist);

    return () => {
      window.removeEventListener("storage", refreshEnrollments);
      window.removeEventListener("learnhub-enrollments-changed", refreshEnrollments);
      window.removeEventListener("storage", refreshWishlist);
      window.removeEventListener("learnhub-wishlist-changed", refreshWishlist);
    };
  }, []);

  const enrolledCourses = useMemo(() => {
    const courses = new Map<string, Course>();
    const availableCourseById = new Map(availableCourses.map((course) => [course.id, course]));
    const completedLessonIdSet = new Set(completedLessonIds);
    const sortedStoredEnrollments = [...storedEnrollments].sort(
      (a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime(),
    );
    const syncProgress = (course: Course) => {
      const lessons = course.modules.flatMap((module) => module.lessons);
      const completedCount = lessons.filter((lesson) => completedLessonIdSet.has(lesson.id) || lesson.completed).length;
      const syncedProgress = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : course.progress ?? 0;

      return {
        ...course,
        modules: course.modules.map((module) => ({
          ...module,
          lessons: module.lessons.map((lesson) => ({
            ...lesson,
            completed: completedLessonIdSet.has(lesson.id) || lesson.completed,
          })),
        })),
        progress: lessons.length > 0 ? syncedProgress : course.progress ?? 0,
      };
    };

    for (const enrollment of sortedStoredEnrollments) {
      const currentCourse = availableCourseById.get(enrollment.course.id) ?? enrollment.course;

      courses.set(enrollment.course.id, syncProgress({
        ...currentCourse,
        enrolled: true,
        progress: enrollment.progress,
      }));
    }

    for (const course of baseEnrolledCourses) {
      if (!courses.has(course.id)) {
        courses.set(course.id, syncProgress(course));
      }
    }

    return Array.from(courses.values());
  }, [availableCourses, baseEnrolledCourses, completedLessonIds, storedEnrollments]);

  const myCourses =
    activeCourseStatus === "in-progress"
      ? enrolledCourses.filter((course) => (course.progress ?? 0) < 100)
      : activeCourseStatus === "completed"
        ? enrolledCourses.filter((course) => (course.progress ?? 0) >= 100)
        : enrolledCourses;
  const continueLearningCourses = enrolledCourses;
  const enrolledCount = enrolledCourses.length;
  const overallProgress =
    enrolledCount > 0
      ? Math.round(enrolledCourses.reduce((total, course) => total + (course.progress ?? 0), 0) / enrolledCount)
      : 0;
  const recommendedCourseList = recommendedCourses.filter(
    (course) => !enrolledCourses.some((enrolledCourse) => enrolledCourse.id === course.id),
  );
  const wishlistCourses = storedWishlist
    .map((wishlistItem) => wishlistItem.course)
    .filter((course) => !enrolledCourses.some((enrolledCourse) => enrolledCourse.id === course.id));
  const latestEnrollment = storedEnrollments[0];
  const completionActivities = enrolledCourses
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
    {
      title: 'Completed Lesson: "HTML Structure & Tags"',
      course: "Web Development Bootcamp",
      time: "2 hours ago",
      marker: "OK",
    },
    {
      title: 'Started Lesson: "What is React?"',
      course: "React & Next.js Masterclass",
      time: "Yesterday",
      marker: "Play",
    },
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
          { label: "Enrolled Courses", value: enrolledCount },
          { label: "Week", value: "May 18-25" },
          { label: "Overall Progress", value: `${overallProgress}%` },
          { label: "Certificates", value: 0 },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-2xl p-6 min-h-44">
            {stat.label === "Week" ? (
              <>
                <p className="text-sm font-bold text-gray-500">{stat.label}</p>
                <p className="mt-1 text-xl font-extrabold text-gray-900">{stat.value}</p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-green-100 p-3 text-center">
                    <p className="text-xs text-green-700">Site Visits</p>
                    <p className="text-lg font-extrabold text-green-800">8</p>
                  </div>
                  <div className="rounded-lg bg-green-100 p-3 text-center">
                    <p className="text-xs text-green-700">Lessons Completed</p>
                    <p className="text-lg font-extrabold text-green-800">{completedLessons}</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className="text-3xl font-extrabold text-gray-900">{stat.value}</p>
                <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
              </>
            )}
          </div>
        ))}
      </div>

      <section className="mb-12">
        <h2 className="text-xl font-extrabold text-gray-900 mb-5">Continue Learning</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {continueLearningCourses.map((course) => (
            <ProgressCourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-extrabold text-gray-900 mb-5">Recent Activity</h2>
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {recentActivities.map((activity) => (
            <div key={activity.title} className="flex items-center gap-5 border-b border-gray-100 px-6 py-5 last:border-b-0">
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
