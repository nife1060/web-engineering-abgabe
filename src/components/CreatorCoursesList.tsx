"use client";

import { useMemo, useState } from "react";
import type { CourseStatus, PricingModel } from "@/generated/prisma/enums";
import CreatorCourseCard from "@/components/CreatorCourseCard";

type CourseItem = {
  id: string;
  title: string;
  categoryName: string;
  pricingModel: PricingModel;
  price: number;
  subscriptionPrice: number;
  thumbnailUrl: string | null;
  status: CourseStatus;
  modules: {
    lessons: { id: string }[];
  }[];
};

type Props = {
  courses: CourseItem[];
};

export default function CreatorCoursesList({ courses }: Props) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"ALL" | CourseStatus>("ALL");

  const filteredCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesQuery = normalizedQuery.length === 0 || course.title.toLowerCase().includes(normalizedQuery);
      const matchesStatus = status === "ALL" || course.status === status;

      return matchesQuery && matchesStatus;
    });
  }, [courses, query, status]);

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center">
          <div>
            <label htmlFor="course-search" className="sr-only">Kurs suchen</label>
            <input
              id="course-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Kurs suchen..."
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {[
              ["ALL", "All"],
              ["DRAFT", "Draft"],
              ["PUBLISHED", "Published"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatus(value as "ALL" | CourseStatus)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  status === value ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredCourses.map((course) => (
            <CreatorCourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <h2 className="font-bold text-gray-900 text-lg mb-2">Keine Kurse gefunden</h2>
          <p className="text-gray-500 text-sm">Passe Suche oder Statusfilter an, um andere Kurse zu sehen.</p>
        </div>
      )}
    </>
  );
}
