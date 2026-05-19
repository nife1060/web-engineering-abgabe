import Link from "next/link";
import CourseCard from "@/components/CourseCard";
import { mockCourses } from "@/lib/data";

const enrolledCourses = mockCourses.filter((course) => course.enrolled);

export default async function DashboardCoursesPage({ searchParams }: { searchParams?: any }) {
  const params = await searchParams;
  const courseTabParam = params.coursetab;
  const courseTab = Array.isArray(courseTabParam) ? courseTabParam[0] : courseTabParam || "all";

  const tabClassName = (isActive: boolean) =>
    `px-3 py-2 rounded-lg text-sm font-semibold transition ${isActive ? "bg-purple-600 text-white" : "text-gray-700 hover:bg-gray-50"}`;

  let filteredCourses = enrolledCourses;
  if (courseTab === "inprogress") {
    filteredCourses = enrolledCourses.filter((course) =>
      typeof course.progress === "number" ? course.progress > 0 && course.progress < 100 : true
    );
  } else if (courseTab === "completed") {
    filteredCourses = enrolledCourses.filter((course) =>
      typeof course.progress === "number" ? course.progress === 100 : false
    );
  }

  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-6">
        {[
          { key: "all", label: "All Courses" },
          { key: "inprogress", label: "In Progress" },
          { key: "completed", label: "Completed" },
        ].map((item) => (
          <Link
            key={item.key}
            href={`/dashboard/courses?coursetab=${item.key}`}
            className={tabClassName(courseTab === item.key)}
            aria-current={courseTab === item.key ? "page" : undefined}>
            {item.label}
          </Link>
        ))}
      </div>

      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} showProgress />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-2xl">
          <div className="text-lg font-semibold text-gray-700">No courses found</div>
          <p className="text-sm text-gray-500 mt-2">Try a different filter or enroll in more courses.</p>
        </div>
      )}
    </section>
  );
}
