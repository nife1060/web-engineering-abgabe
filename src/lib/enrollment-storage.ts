import type { Course } from "@/lib/data";

export const enrolledCoursesKey = "learnhub_enrolled_courses";
export const wishlistKeys = ["learnhub_wishlist", "learninghub_wishlist"];

export type StoredEnrollment = {
  course: Course;
  progress: number;
  enrolledAt: string;
};

export function readStoredEnrollments() {
  if (typeof window === "undefined") return [];

  try {
    const rawEnrollments = window.localStorage.getItem(enrolledCoursesKey);
    if (!rawEnrollments) return [];

    const enrollments = JSON.parse(rawEnrollments);
    if (!Array.isArray(enrollments)) return [];

    return enrollments.filter(
      (enrollment): enrollment is StoredEnrollment =>
        typeof enrollment?.course?.id === "string" &&
        typeof enrollment?.progress === "number" &&
        typeof enrollment?.enrolledAt === "string",
    );
  } catch {
    return [];
  }
}

export function writeStoredEnrollments(enrollments: StoredEnrollment[]) {
  window.localStorage.setItem(enrolledCoursesKey, JSON.stringify(enrollments));
  window.dispatchEvent(new Event("learnhub-enrollments-changed"));
}

export function removeCourseFromStoredWishlist(courseId: string) {
  for (const key of wishlistKeys) {
    try {
      const rawWishlist = window.localStorage.getItem(key);
      if (!rawWishlist) continue;

      const wishlist = JSON.parse(rawWishlist);
      if (!Array.isArray(wishlist)) continue;

      const nextWishlist = wishlist.filter((item) => {
        if (typeof item === "string") return item !== courseId;
        return item?.id !== courseId && item?.courseId !== courseId;
      });

      window.localStorage.setItem(key, JSON.stringify(nextWishlist));
    } catch {
      window.localStorage.removeItem(key);
    }
  }
}
