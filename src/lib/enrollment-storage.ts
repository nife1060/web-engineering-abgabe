/**
 * Speichert die Wunschliste im localStorage des Browsers, nicht in der Datenbank.
 *
 * Heißt: Die Wunschliste hängt am Gerät, nicht am Account. Damit mehrere
 * Components mitbekommen wenn sich was ändert, feuern wir ein eigenes Event
 * ("learnhub-wishlist-changed") und nutzen zusätzlich das normale
 * "storage"-Event für Änderungen aus anderen Tabs.
 */

import type { Course } from "@/lib/data";

export const wishlistKey = "learnhub_wishlist";
// "learninghub_wishlist" war mal der Name des Keys in einer älteren Version
// der App. Wurde nie richtig migriert, deshalb prüfen wir hier weiterhin
// beide Keys, damit alte Wunschlisten nicht einfach verloren gehen.
export const wishlistKeys = [wishlistKey, "learninghub_wishlist"];

export type StoredWishlistCourse = {
  course: Course;
  addedAt: string;
};

/**
 * Liest die Wunschliste aus dem localStorage und prüft kurz, ob die Daten plausibel aussehen.
 * @returns `[]`, wenn wir auf dem Server sind, nichts gespeichert ist, oder
 * die Daten kaputt/falsch formatiert sind.
 */
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

/** Schreibt die ganze Wunschliste neu und sagt allen anderen Components per Event Bescheid. */
export function writeStoredWishlistCourses(wishlist: StoredWishlistCourse[]) {
  window.localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
  window.dispatchEvent(new Event("learnhub-wishlist-changed"));
}

/**
 * Entfernt einen Kurs aus der Wunschliste, und zwar aus dem alten und dem neuen Key.
 *
 * Wir checken hier mehrere mögliche Formen eines Eintrags (`string`, `{id}`,
 * `{courseId}`, `{course:{id}}`), weil frühere Versionen der App die Einträge
 * unterschiedlich gespeichert haben. So werden auch alte Wunschlisten noch
 * sauber bereinigt. Lässt sich das JSON gar nicht erst parsen, wird der
 * ganze Key gelöscht statt halb kaputt liegen zu bleiben.
 */
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
