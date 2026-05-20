import Link from "next/link";
import type { CourseStatus, PricingModel } from "@/generated/prisma/enums";
import { formatCoursePrice } from "@/lib/course-format";

type Props = {
  course: {
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
};

export default function CreatorCourseCard({ course }: Props) {
  const lessonCount = course.modules.reduce((count, module) => count + module.lessons.length, 0);
  const isPublished = course.status === "PUBLISHED";

  return (
    <div className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition cursor-pointer">
      <Link href={`/courses/${course.id}`} className="absolute inset-0 z-10" aria-label={`${course.title} ansehen`} />
      <div className="h-40 bg-purple-50 overflow-hidden">
        {course.thumbnailUrl ? (
          <img src={course.thumbnailUrl} alt={course.title} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center">
            <span className="text-white text-sm font-bold tracking-wide">Learnify</span>
          </div>
        )}
      </div>
      <div className="relative z-20 p-5 pointer-events-none">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-xs text-purple-600 font-semibold uppercase tracking-wide mb-1">
              {course.categoryName}
            </p>
            <h2 className="font-bold text-gray-900 leading-snug group-hover:text-purple-700 transition">{course.title || "Untitled course"}</h2>
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isPublished ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
            {isPublished ? "Published" : "Draft"}
          </span>
        </div>

      <div className="grid grid-cols-3 gap-3 text-sm mb-5">
        <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
          <p className="text-xs text-gray-500">Price</p>
          <p className="font-semibold text-gray-900 mt-1">{formatCoursePrice(course.pricingModel, course.price, course.subscriptionPrice)}</p>
        </div>
        <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
          <p className="text-xs text-gray-500">Modules</p>
          <p className="font-semibold text-gray-900 mt-1">{course.modules.length}</p>
        </div>
        <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
          <p className="text-xs text-gray-500">Lessons</p>
          <p className="font-semibold text-gray-900 mt-1">{lessonCount}</p>
        </div>
      </div>

        <div className="relative z-30 flex gap-3 pointer-events-auto">
          <Link href={`/creator/courses/${course.id}/edit`} className="flex-1 text-center bg-purple-600 text-white font-semibold py-2.5 rounded-xl hover:bg-purple-700 transition text-sm">
            Bearbeiten
          </Link>
          <Link href={`/courses/${course.id}`} className="flex-1 text-center border border-gray-300 text-gray-700 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition text-sm">
            Ansehen
          </Link>
        </div>
      </div>
    </div>
  );
}
