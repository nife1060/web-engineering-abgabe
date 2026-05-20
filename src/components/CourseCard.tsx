import Link from "next/link";
import { Course } from "@/lib/data";
import { formatCoursePrice } from "@/lib/course-format";

interface Props {
  course: Course;
  showProgress?: boolean;
}

const cardClass = "group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200";

export default function CourseCard({ course, showProgress }: Props) {
  const priceLabel = formatCoursePrice(course.pricingModel ?? "PAID", course.price, course.subscriptionPrice ?? 0);
  const inner = (
    <>
      <div className="relative h-44 bg-gray-200 overflow-hidden">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute top-3 left-3 bg-purple-600 text-white text-xs font-semibold px-2 py-1 rounded">
          {course.level}
        </span>
      </div>
      <div className="p-4">
        <p className="text-xs text-purple-600 font-semibold uppercase tracking-wide mb-1">
          {course.category}
        </p>
        <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1 line-clamp-2 group-hover:text-purple-700 transition-colors">
          {course.title}
        </h3>
        <p className="text-xs text-gray-500 mb-3">{course.instructor}</p>

        {showProgress && course.progress !== undefined ? (
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{course.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1">
              <span className="text-yellow-400 text-sm">Star</span>
              <span className="text-sm font-bold text-gray-800">{course.rating}</span>
              <span className="text-xs text-gray-400">({course.studentsCount.toLocaleString()})</span>
            </div>
            <span className="font-bold text-gray-900 text-right">{priceLabel}</span>
          </div>
        )}
      </div>
    </>
  );

  if (showProgress) {
    return (
      <div className={cardClass}>
        {inner}
        <div className="px-4 pb-4">
          <Link
            href={`/learn/${course.id}`}
            className="block text-center text-xs font-semibold text-purple-600 border border-purple-600 rounded-lg py-2 hover:bg-purple-50 transition"
          >
            Continue Learning
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Link href={`/courses/${course.id}`} className={cardClass}>
      {inner}
    </Link>
  );
}
