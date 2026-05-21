import type { Course } from "@/lib/data";

export const wishlistKey = "learnhub_wishlist";
export const wishlistKeys = [wishlistKey, "learninghub_wishlist"];

export type StoredWishlistCourse = {
  course: Course;
  addedAt: string;
};

export function readStoredWishlistCourses() {
  if (typeof window === "undefined") return [];

  try {
    const rawWishlist = window.localStorage.getItem(wishlistKey);
    if (!rawWishlist) return [];

    const wishlist = JSON.parse(rawWishlist);
    if (!Array.isArray(wishlist)) return [];

    return wishlist.filter(
      (item): item is StoredWishlistCourse =>
        typeof item?.course?.id === "string" && typeof item?.addedAt === "string",
    );
  } catch {
    return [];
  }
}

export function writeStoredWishlistCourses(wishlist: StoredWishlistCourse[]) {
  window.localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
  window.dispatchEvent(new Event("learnhub-wishlist-changed"));
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
        return item?.id !== courseId && item?.courseId !== courseId && item?.course?.id !== courseId;
      });

      window.localStorage.setItem(key, JSON.stringify(nextWishlist));
    } catch {
      window.localStorage.removeItem(key);
    }
  }

  window.dispatchEvent(new Event("learnhub-wishlist-changed"));
}
