"use client";

type SortSelectProps = {
  selectedSort: string;
};

export default function SortSelect({ selectedSort }: SortSelectProps) {
  return (
    <select
      name="sort"
      defaultValue={selectedSort}
      onChange={(event) => event.currentTarget.form?.requestSubmit()}
      className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
    >
      <option value="popular">Most Popular</option>
      <option value="highest-rated">Highest Rated</option>
      <option value="newest">Newest</option>
      <option value="price-low">Price: Low to High</option>
      <option value="price-high">Price: High to Low</option>
    </select>
  );
}
