/**
 * Der Kurskatalog (/courses). Filtern, Sortieren und Suchen passiert
 * komplett server-seitig anhand der URL-Parameter — `CoursesFilterForm`
 * zeigt nur die Steuerelemente an und schickt ein GET an diese Seite zurück.
 */

import CourseCard from "@/components/CourseCard";
import CoursesFilterForm from "@/components/CoursesFilterForm";
import { Course } from "@/lib/data";
import { ensureDefaultCategories } from "@/lib/categories";
import { prisma } from "@/lib/prisma";

const levels = ["All Levels", "Beginner", "Intermediate", "Advanced"];
const priceRanges = [
  { label: "Any price", value: "any" },
  { label: "Free", value: "free" },
  { label: "Under EUR50", value: "under-50" },
  { label: "EUR50 - EUR100", value: "50-100" },
  { label: "Over EUR100", value: "over-100" },
];
const ratingFilters = ["Any", "4.5+", "4.0+", "3.5+"];

export const dynamic = "force-dynamic";

type CoursesSearchParams = {
  query?: string | string[];
  category?: string | string[];
  level?: string | string[];
  price?: string | string[];
  rating?: string | string[];
  sort?: string | string[];
};

function firstValue(value: string | string[] | undefined, fallback = "") {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
}

function coursePriceValue(course: Course) {
  const price = Number(course.price ?? 0);
  return Number.isFinite(price) ? price : 0;
}

function isFreeCourse(course: Course) {
  return course.pricingModel === "FREE" || coursePriceValue(course) === 0;
}

/** Prüft, ob ein Kurs in den gewählten Preisbereich passt. */
function matchesPrice(course: Course, selectedPrice: string) {
  if (selectedPrice === "any") {
    return true;
  }

  if (selectedPrice === "free") {
    return isFreeCourse(course);
  }

  const price = coursePriceValue(course);

  if (selectedPrice === "under-50") {
    return price < 50;
  }

  if (selectedPrice === "50-100") {
    return price >= 50 && price <= 100;
  }

  if (selectedPrice === "over-100") {
    return price > 100;
  }

  return true;
}

/** Sortiert die Kursliste passend zum gewählten Dropdown-Wert. Standardmäßig nach Anzahl Studierenden ("popular"). */
function sortCourses(courses: Course[], selectedSort: string) {
  const sortedCourses = [...courses];

  if (selectedSort === "highest-rated") {
    return sortedCourses.sort((a, b) => b.rating - a.rating);
  }

  if (selectedSort === "newest") {
    return sortedCourses.reverse();
  }

  if (selectedSort === "price-low") {
    return sortedCourses.sort((a, b) => coursePriceValue(a) - coursePriceValue(b));
  }

  if (selectedSort === "price-high") {
    return sortedCourses.sort((a, b) => coursePriceValue(b) - coursePriceValue(a));
  }

  if (selectedSort === "title-asc") {
    return sortedCourses.sort((a, b) => a.title.localeCompare(b.title));
  }

  if (selectedSort === "title-desc") {
    return sortedCourses.sort((a, b) => b.title.localeCompare(a.title));
  }

  return sortedCourses.sort((a, b) => b.studentsCount - a.studentsCount);
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<CoursesSearchParams>;
}) {
  const params = await searchParams;
  const query = firstValue(params.query).trim();
  const selectedCategory = firstValue(params.category, "All");
  const selectedLevel = firstValue(params.level, "All Levels");
  const selectedPrice = firstValue(params.price, "any");
  const selectedRating = firstValue(params.rating, "Any");
  const selectedSort = firstValue(params.sort, "popular");

  const [categories, publishedCourses] = await Promise.all([
    ensureDefaultCategories(),
    prisma.course.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { updatedAt: "desc" },
      include: {
        creator: {
          select: { name: true },
        },
        modules: {
          orderBy: { order: "asc" },
          include: {
            lessons: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    }),
  ]);

  const dbCourses = publishedCourses.map((course) => ({
    id: course.id,
    title: course.title,
    description: course.description,
    instructor: course.creator.name,
    price: course.price ?? 0,
    subscriptionPrice: course.subscriptionPrice ?? 0,
    pricingModel: course.pricingModel ?? "PAID",
    rating: 0,
    studentsCount: 0,
    category: course.categoryName,
    level: course.level as "Beginner" | "Intermediate" | "Advanced",
    thumbnail:
      course.thumbnailUrl ||
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop",
    enrolled: false,
    modules: course.modules.map((module) => ({
      id: module.id,
      title: module.title,
      lessons: module.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        duration: lesson.type === "VIDEO" ? "Video" : lesson.type === "QUIZ" ? "Quiz" : "Text",
        type: lesson.type === "VIDEO" ? ("video" as const) : ("text" as const),
        completed: false,
      })),
    })),
  }));
  const courses = dbCourses;
  const categoryLabels = ["All", ...categories.map((category) => category.name)];
  const minRating = selectedRating === "Any" ? 0 : Number.parseFloat(selectedRating);
  const normalizedQuery = query.toLowerCase();
  const queryTerms = normalizedQuery.split(/\s+/).filter(Boolean);
  // "free" im Suchfeld behandeln wir als Preisfilter, nicht als normalen
  // Suchbegriff. Bei "free react course" wird also nach kostenlosen Kursen
  // gefiltert und nur noch nach "react course" im Text gesucht.
  const searchesForFree = queryTerms.includes("free");
  const textQuery = queryTerms.filter((term) => term !== "free").join(" ");
  const filteredCourses = sortCourses(
    courses.filter((course) => {
      const searchableText = [course.title, course.description, course.instructor, course.category]
        .join(" ")
        .toLowerCase();

      return (
        (!normalizedQuery ||
          ((searchesForFree ? isFreeCourse(course) : true) &&
            (!textQuery || searchableText.includes(textQuery)))) &&
        (selectedCategory === "All" || course.category === selectedCategory) &&
        (selectedLevel === "All Levels" || course.level === selectedLevel) &&
        matchesPrice(course, selectedPrice) &&
        course.rating >= minRating
      );
    }),
    selectedSort,
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Browse Courses</h1>
        <p className="text-gray-500">Discover your next skill from our library of expert-led courses</p>
      </div>

      {/* Der key sorgt dafür, dass das Formular neu gemountet wird, wenn
          sich die URL-Parameter ändern (z.B. Browser-Zurück-Button) — sonst
          würden die Inputs auf einem alten Stand hängen bleiben. */}
      <CoursesFilterForm
        key={[query, selectedCategory, selectedLevel, selectedPrice, selectedRating, selectedSort].join("|")}
        categoryLabels={categoryLabels}
        levels={levels}
        priceRanges={priceRanges}
        ratingFilters={ratingFilters}
        initialFilters={{
          query,
          category: selectedCategory,
          level: selectedLevel,
          price: selectedPrice,
          rating: selectedRating,
          sort: selectedSort,
        }}
        resultsCount={filteredCourses.length}
      >
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
          {filteredCourses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
              <h2 className="text-base font-bold text-gray-900">No courses found</h2>
              <p className="mt-1 text-sm text-gray-500">Try a broader search or reset the filters.</p>
            </div>
          ) : null}
        </>
      </CoursesFilterForm>
    </div>
  );
}
