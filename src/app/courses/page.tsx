import Link from "next/link";
import CourseCard from "@/components/CourseCard";
import SortSelect from "@/components/SortSelect";
import { Course, mockCourses } from "@/lib/data";
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

function matchesPrice(course: Course, selectedPrice: string) {
  if (selectedPrice === "any") {
    return true;
  }

  if ((course.pricingModel ?? "PAID") === "FREE" || course.price === 0) {
    return selectedPrice === "free";
  }

  if (selectedPrice === "under-50") {
    return course.price < 50;
  }

  if (selectedPrice === "50-100") {
    return course.price >= 50 && course.price <= 100;
  }

  if (selectedPrice === "over-100") {
    return course.price > 100;
  }

  return true;
}

function sortCourses(courses: Course[], selectedSort: string) {
  const sortedCourses = [...courses];

  if (selectedSort === "highest-rated") {
    return sortedCourses.sort((a, b) => b.rating - a.rating);
  }

  if (selectedSort === "newest") {
    return sortedCourses.reverse();
  }

  if (selectedSort === "price-low") {
    return sortedCourses.sort((a, b) => a.price - b.price);
  }

  if (selectedSort === "price-high") {
    return sortedCourses.sort((a, b) => b.price - a.price);
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
    price: course.price,
    subscriptionPrice: course.subscriptionPrice,
    pricingModel: course.pricingModel,
    rating: 4.8,
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
  const courses = [...dbCourses, ...mockCourses];
  const categoryLabels = ["All", ...categories.map((category) => category.name)];
  const minRating = selectedRating === "Any" ? 0 : Number.parseFloat(selectedRating);
  const normalizedQuery = query.toLowerCase();
  const filteredCourses = sortCourses(
    courses.filter((course) => {
      const searchableText = [course.title, course.description, course.instructor, course.category]
        .join(" ")
        .toLowerCase();

      return (
        (!normalizedQuery || searchableText.includes(normalizedQuery)) &&
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

      <form action="/courses" className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-64 shrink-0">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-3 text-sm">Search</h3>
              <div className="relative">
                <input
                  type="text"
                  name="query"
                  defaultValue={query}
                  placeholder="Search courses..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <svg className="absolute left-3 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-3 text-sm">Category</h3>
              <div className="space-y-2">
                {categoryLabels.map((cat) => (
                  <label key={cat} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      value={cat}
                      defaultChecked={selectedCategory === cat}
                      className="text-purple-600"
                    />
                    <span className="text-sm text-gray-700">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-3 text-sm">Level</h3>
              <div className="space-y-2">
                {levels.map((level) => (
                  <label key={level} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="level"
                      value={level}
                      defaultChecked={selectedLevel === level}
                      className="text-purple-600"
                    />
                    <span className="text-sm text-gray-700">{level}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-3 text-sm">Price Range</h3>
              <div className="space-y-2">
                {priceRanges.map((price) => (
                  <label key={price.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="price"
                      value={price.value}
                      defaultChecked={selectedPrice === price.value}
                      className="text-purple-600"
                    />
                    <span className="text-sm text-gray-700">{price.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-3 text-sm">Min. Rating</h3>
              <div className="space-y-2">
                {ratingFilters.map((r) => (
                  <label key={r} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="rating"
                      value={r}
                      defaultChecked={selectedRating === r}
                      className="text-purple-600"
                    />
                    <span className="text-sm text-gray-700">{r === "Any" ? r : `Rating ${r}`}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition"
              >
                Apply
              </button>
              <Link
                href="/courses"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Reset
              </Link>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-gray-500">{filteredCourses.length} courses found</p>
            <SortSelect selectedSort={selectedSort} />
          </div>

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
        </div>
      </form>
    </div>
  );
}
