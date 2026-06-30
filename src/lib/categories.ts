/**
 * Sorgt dafür, dass ein paar Standard-Kategorien immer existieren.
 * Creator können im Course Builder zwar eigene Kategorien anlegen, aber bei
 * einer frischen Datenbank wären Filter und Dropdown sonst erstmal leer.
 */

import { prisma } from "@/lib/prisma";

export const defaultCategories = [
  "Web Development",
  "Design",
  "Business",
  "Marketing",
  "Data Science",
  "Personal Development",
  "Photography",
  "Music",
  "Finance",
  "Health & Fitness",
];

/**
 * Legt die Standardkategorien an, falls sie noch nicht existieren, und gibt
 * danach alle Kategorien alphabetisch sortiert zurück. Kann man bei jedem
 * Request aufrufen, ohne dass was kaputt geht — upsert macht bei bereits
 * vorhandenen Kategorien einfach nichts.
 */
export async function ensureDefaultCategories() {
  await Promise.all(
    defaultCategories.map((name) =>
      prisma.category.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  return prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}
