"use client";

import { useEffect, useState } from "react";
import type { Course } from "@/lib/data";
import {
  readStoredWishlistCourses,
  removeCourseFromStoredWishlist,
  writeStoredWishlistCourses,
} from "@/lib/enrollment-storage";

type WishlistButtonProps = {
  course: Course;
  initiallyEnrolled?: boolean;
};

export default function WishlistButton({ course, initiallyEnrolled = false }: WishlistButtonProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const refreshState = () => {
      setIsWishlisted(
        readStoredWishlistCourses().some((wishlistItem) => wishlistItem.course.id === course.id),
      );
    };

    refreshState();
    window.addEventListener("storage", refreshState);
    window.addEventListener("learnhub-wishlist-changed", refreshState);

    return () => {
      window.removeEventListener("storage", refreshState);
      window.removeEventListener("learnhub-wishlist-changed", refreshState);
    };
  }, [course.id]);

  if (initiallyEnrolled) {
    return (
      <button
        type="button"
        disabled
        className="w-full border border-gray-300 text-gray-400 font-semibold py-3 rounded-xl text-sm mb-4 cursor-not-allowed"
      >
        Already bought
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        if (isWishlisted) {
          removeCourseFromStoredWishlist(course.id);
          setIsWishlisted(false);
          return;
        }

        const wishlist = readStoredWishlistCourses();
        const exists = wishlist.some((wishlistItem) => wishlistItem.course.id === course.id);

        if (!exists) {
          writeStoredWishlistCourses([
            {
              course,
              addedAt: new Date().toISOString(),
            },
            ...wishlist,
          ]);
        }

        setIsWishlisted(true);
      }}
      className={`w-full border font-semibold py-3 rounded-xl transition text-sm mb-4 cursor-pointer ${
        isWishlisted
          ? "border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-500"
          : "border-gray-300 text-gray-700 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700"
      }`}
    >
      {isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    </button>
  );
}
