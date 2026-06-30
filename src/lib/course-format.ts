/**
 * Kleine Helper-Funktionen rund um Kurspreise und Fortschritt, die an vielen
 * Stellen gebraucht werden (Katalog, Kursdetail, Dashboard, Course Builder,
 * Lesson-Player, Kurs-API). Damit steht die Logik nur einmal hier und wird
 * nicht überall einzeln nachgebaut.
 */

import type { PricingModel } from "@/generated/prisma/enums";

/** Formatiert den Preis eines Kurses für die Anzeige (berücksichtigt FREE und Abo-Preise). */
export function formatCoursePrice(
  pricingModel: PricingModel,
  price: number,
  subscriptionPrice = 0,
) {
  if (pricingModel === "FREE") return "Free";
  if (pricingModel === "SUBSCRIPTION") {
    return `${subscriptionPrice.toFixed(2)} EUR / Month`;
  }
  return `${price.toFixed(2)} EUR`;
}

/** Liefert den passenden Text für den Enroll-/Subscribe-Button eines Kurses. */
export function courseCtaLabel(
  pricingModel: PricingModel,
  price: number,
  subscriptionPrice = 0,
) {
  if (pricingModel === "FREE") return "Start Course for Free";
  if (pricingModel === "SUBSCRIPTION") {
    return `Subscribe now - EUR ${subscriptionPrice.toFixed(2)} / Month`;
  }
  return `Enroll now - EUR ${price.toFixed(2)}`;
}

/**
 * Rechnet aus abgeschlossenen und gesamten Lektionen einen Prozentwert aus.
 * @returns `0`, falls `totalLessons` 0 ist (sonst gäbe es eine Division durch null).
 */
export function calculateProgressPercent(completedLessons: number, totalLessons: number) {
  return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
}

export type CoursePublishCheck = {
  title: string;
  description: string;
  moduleCount: number;
  lessonCount: number;
  pricingModel: PricingModel;
  price: number;
  subscriptionPrice: number;
};

/**
 * Prüft, ob ein Kurs-Entwurf vollständig genug ist, um ihn zu veröffentlichen.
 *
 * Wird zweimal benutzt: im Course Builder direkt im Browser (für sofortiges
 * Feedback) und nochmal in der Kurs-API auf dem Server (die eigentliche
 * Prüfung, weil man die Client-Prüfung ja umgehen könnte). So gelten überall
 * dieselben Regeln.
 *
 * @returns Eine Liste mit Fehlermeldungen für den Nutzer. Leeres Array heißt: alles okay.
 */
export function validateCoursePublish(input: CoursePublishCheck): string[] {
  const errors: string[] = [];

  if (!input.title.trim()) errors.push("Titel fehlt.");
  if (!input.description.trim()) errors.push("Beschreibung fehlt.");
  if (input.moduleCount === 0) errors.push("Mindestens ein Modul ist erforderlich.");
  if (input.lessonCount === 0) errors.push("Mindestens eine Lektion ist erforderlich.");
  if (input.pricingModel === "PAID" && (!Number.isFinite(input.price) || input.price <= 0)) {
    errors.push("Paid Courses brauchen einen gültigen Preis.");
  }
  if (
    input.pricingModel === "SUBSCRIPTION" &&
    (!Number.isFinite(input.subscriptionPrice) || input.subscriptionPrice <= 0)
  ) {
    errors.push("Subscription Courses brauchen einen gültigen monatlichen Preis.");
  }

  return errors;
}
