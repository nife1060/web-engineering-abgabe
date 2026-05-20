"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Course } from "@/lib/data";
import {
  readStoredEnrollments,
  removeCourseFromStoredWishlist,
  writeStoredEnrollments,
} from "@/lib/enrollment-storage";

type EnrollmentButtonProps = {
  course: Course;
  label: string;
  learnHref: string;
  enrolledHref: string;
  enrolledLabel: string;
  initiallyEnrolled?: boolean;
};

export default function EnrollmentButton({
  course,
  label,
  learnHref,
  enrolledHref,
  enrolledLabel,
  initiallyEnrolled = false,
}: EnrollmentButtonProps) {
  const [isEnrolled, setIsEnrolled] = useState(initiallyEnrolled);

  useEffect(() => {
    const refreshEnrollment = () => {
      setIsEnrolled(
        initiallyEnrolled ||
          readStoredEnrollments().some((enrollment) => enrollment.course.id === course.id),
      );
    };

    refreshEnrollment();
    window.addEventListener("storage", refreshEnrollment);
    window.addEventListener("learnhub-enrollments-changed", refreshEnrollment);

    return () => {
      window.removeEventListener("storage", refreshEnrollment);
      window.removeEventListener("learnhub-enrollments-changed", refreshEnrollment);
    };
  }, [course.id, initiallyEnrolled]);

  if (isEnrolled) {
    return (
      <Link
        href={enrolledHref}
        className="block w-full text-center bg-purple-600 text-white font-bold py-3.5 rounded-xl hover:bg-purple-700 transition mb-3"
      >
        {enrolledLabel}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        const enrollments = readStoredEnrollments();
        const isAlreadyEnrolled = enrollments.some((enrollment) => enrollment.course.id === course.id);

        if (!isAlreadyEnrolled) {
          writeStoredEnrollments([
            {
              course: {
                ...course,
                enrolled: true,
                progress: 0,
              },
              progress: 0,
              enrolledAt: new Date().toISOString(),
            },
            ...enrollments,
          ]);
        }

        removeCourseFromStoredWishlist(course.id);
        setIsEnrolled(true);
      }}
      className="w-full bg-purple-600 text-white font-bold py-3.5 rounded-xl hover:bg-purple-700 transition mb-3 cursor-pointer"
      data-learn-href={learnHref}
    >
      {label}
    </button>
  );
}
