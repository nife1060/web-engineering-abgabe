"use client";

/**
 * Der große Button auf der Kursdetailseite: "Enroll"/"Subscribe" wenn man
 * den Kurs noch nicht hat, sonst ein "Continue learning"-Link (gilt auch
 * für den Creator oder Admins, siehe `isCreatorOrAdmin` in courses/[id]/page.tsx).
 */

import Link from "next/link";
import { useFormStatus } from "react-dom";
import { purchaseCourse } from "@/app/actions/checkout";
import type { Course } from "@/lib/data";

type EnrollmentButtonProps = {
  course: Course;
  label: string;
  enrolledHref: string;
  enrolledLabel: string;
  initiallyEnrolled?: boolean;
};

/** Der Submit-Button: deaktiviert sich selbst und zeigt "Processing…", solange die Form Action noch läuft. */
function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-purple-600 text-white font-bold py-3.5 rounded-xl hover:bg-purple-700 transition mb-3 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? "Processing…" : label}
    </button>
  );
}

export default function EnrollmentButton({
  course,
  label,
  enrolledHref,
  enrolledLabel,
  initiallyEnrolled = false,
}: EnrollmentButtonProps) {
  if (initiallyEnrolled) {
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
    <form action={purchaseCourse}>
      <input type="hidden" name="courseId" value={course.id} />
      <SubmitButton label={label} />
    </form>
  );
}
