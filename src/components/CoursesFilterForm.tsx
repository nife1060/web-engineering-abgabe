"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type PriceRange = {
  label: string;
  value: string;
};

type FilterValues = {
  query: string;
  category: string;
  level: string;
  price: string;
  rating: string;
  sort: string;
};

type CoursesFilterFormProps = {
  categoryLabels: string[];
  levels: string[];
  priceRanges: PriceRange[];
  ratingFilters: string[];
  initialFilters: FilterValues;
  resultsCount: number;
  children: ReactNode;
};

const defaultFilters: FilterValues = {
  query: "",
  category: "All",
  level: "All Levels",
  price: "any",
  rating: "Any",
  sort: "popular",
};

export default function CoursesFilterForm({
  categoryLabels,
  levels,
  priceRanges,
  ratingFilters,
  initialFilters,
  resultsCount,
  children,
}: CoursesFilterFormProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterValues>(initialFilters);

  useEffect(() => {
    setFilters(initialFilters);
  }, [
    initialFilters.query,
    initialFilters.category,
    initialFilters.level,
    initialFilters.price,
    initialFilters.rating,
    initialFilters.sort,
  ]);

  const updateFilter = (name: keyof FilterValues, value: string) => {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    router.push("/courses");
  };

  return (
    <form action="/courses" className="flex flex-col lg:flex-row gap-8">
      <aside className="w-full lg:w-64 shrink-0">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-6">
          <div>
            <h3 className="font-bold text-gray-900 mb-3 text-sm">Search</h3>
            <div className="relative">
              <input
                type="text"
                name="query"
                value={filters.query}
                onChange={(event) => updateFilter("query", event.target.value)}
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
                    checked={filters.category === cat}
                    onChange={(event) => updateFilter("category", event.target.value)}
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
                    checked={filters.level === level}
                    onChange={(event) => updateFilter("level", event.target.value)}
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
                    checked={filters.price === price.value}
                    onChange={(event) => updateFilter("price", event.target.value)}
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
              {ratingFilters.map((rating) => (
                <label key={rating} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="rating"
                    value={rating}
                    checked={filters.rating === rating}
                    onChange={(event) => updateFilter("rating", event.target.value)}
                    className="text-purple-600"
                  />
                  <span className="text-sm text-gray-700">{rating === "Any" ? rating : `Rating ${rating}`}</span>
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
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Reset
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-gray-500">{resultsCount} courses found</p>
          <select
            name="sort"
            value={filters.sort}
            onChange={(event) => {
              updateFilter("sort", event.target.value);
              event.currentTarget.form?.requestSubmit();
            }}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="popular">Most Popular</option>
            <option value="highest-rated">Highest Rated</option>
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="title-asc">A-Z</option>
            <option value="title-desc">Z-A</option>
          </select>
        </div>

        {children}
      </div>
    </form>
  );
}
