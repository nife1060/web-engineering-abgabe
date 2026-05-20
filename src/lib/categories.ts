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
