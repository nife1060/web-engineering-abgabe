import CourseCard from "@/components/CourseCard";
import { mockCourses } from "@/lib/data";

const categories = ["All", "Web Development", "Frontend", "Backend", "Data Science", "Design"];
const levels = ["All Levels", "Beginner", "Intermediate", "Advanced"];

export default function CoursesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Browse Courses</h1>
        <p className="text-gray-500">Discover your next skill from our library of expert-led courses</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-3 text-sm">Search</h3>
              <div className="relative">
                <input
                  type="text"
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
                {categories.map((cat, i) => (
                  <label key={cat} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="category" defaultChecked={i === 0} className="text-purple-600" />
                    <span className="text-sm text-gray-700">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-3 text-sm">Level</h3>
              <div className="space-y-2">
                {levels.map((level, i) => (
                  <label key={level} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="level" defaultChecked={i === 0} className="text-purple-600" />
                    <span className="text-sm text-gray-700">{level}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-3 text-sm">Price Range</h3>
              <div className="space-y-2">
                {["Any price", "Free", "Under €50", "€50 – €100", "Over €100"].map((p, i) => (
                  <label key={p} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="price" defaultChecked={i === 0} className="text-purple-600" />
                    <span className="text-sm text-gray-700">{p}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-3 text-sm">Min. Rating</h3>
              <div className="space-y-2">
                {["Any", "4.5+", "4.0+", "3.5+"].map((r, i) => (
                  <label key={r} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="rating" defaultChecked={i === 0} className="text-purple-600" />
                    <span className="text-sm text-gray-700">{r === "Any" ? r : `★ ${r}`}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Course Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-gray-500">{mockCourses.length} courses found</p>
            <select className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option>Most Popular</option>
              <option>Highest Rated</option>
              <option>Newest</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {mockCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
