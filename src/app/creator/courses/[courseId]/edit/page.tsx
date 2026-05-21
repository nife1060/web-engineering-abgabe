import AccessDenied from "@/components/AccessDenied";
import CourseBuilder, { type CourseDraft } from "@/components/CourseBuilder";
import { requireRole } from "@/lib/auth";
import { ensureDefaultCategories } from "@/lib/categories";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ courseId: string }>;
};

export default async function EditCoursePage({ params }: Props) {
  const session = await requireRole(["CREATOR", "ADMIN"]);

  if (!session) {
    return <AccessDenied />;
  }

  const { courseId } = await params;
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: {
                media: { orderBy: { createdAt: "asc" } },
                questions: {
                  orderBy: { order: "asc" },
                  include: { answers: { orderBy: { order: "asc" } } },
                },
              },
          },
        },
      },
    },
  });

  if (!course || (session.role !== "ADMIN" && course.creatorId !== session.userId)) {
    return <AccessDenied />;
  }

  const categories = await ensureDefaultCategories();
  const initialCourse: CourseDraft = {
    id: course.id,
    title: course.title,
    description: course.description,
    categoryId: course.categoryId ?? "",
    categoryName: course.categoryName,
    customCategoryName: "",
    level: course.level,
    language: course.language,
    pricingModel: course.pricingModel,
    price: course.price,
    subscriptionPrice: course.subscriptionPrice,
    thumbnailUrl: course.thumbnailUrl ?? "",
    promoVideoUrl: course.promoVideoUrl ?? "",
    modules: course.modules.map((module) => ({
      id: module.id,
      title: module.title,
      lessons: module.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        content: lesson.content,
        type: lesson.type,
        videoUrl: lesson.videoUrl ?? "",
        media: lesson.media.map((m) => ({
          id: m.id,
          filename: m.filename,
          url: m.url,
          mimeType: m.mimeType,
          type: m.type as string,
          size: m.size,
        })),
        questions: lesson.questions.map((q) => ({
          id: q.id,
          text: q.text,
          answers: q.answers.map((a) => ({
            id: a.id,
            text: a.text,
            isCorrect: a.isCorrect,
          })),
        })),
      })),
    })),
  };

  return <CourseBuilder categories={categories} initialCourse={initialCourse} />;
}
