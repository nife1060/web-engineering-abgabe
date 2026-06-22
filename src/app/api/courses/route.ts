import { NextResponse } from "next/server";
import type { CourseStatus, LessonType, PricingModel } from "@/generated/prisma/enums";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type AnswerInput = {
  text?: string;
  isCorrect?: boolean;
};

type QuestionInput = {
  text?: string;
  answers?: AnswerInput[];
};

type LessonInput = {
  title?: string;
  content?: string;
  type?: LessonType;
  videoUrl?: string;
  mediaIds?: string[];
  questions?: QuestionInput[];
};

type ModuleInput = {
  title?: string;
  lessons?: LessonInput[];
};

type CourseInput = {
  id?: string;
  title?: string;
  description?: string;
  categoryId?: string;
  categoryName?: string;
  customCategoryName?: string;
  level?: string;
  language?: string;
  pricingModel?: PricingModel;
  price?: number;
  subscriptionPrice?: number;
  thumbnailUrl?: string;
  promoVideoUrl?: string;
  status?: CourseStatus;
  modules?: ModuleInput[];
};

const pricingModels: PricingModel[] = ["PAID", "FREE", "SUBSCRIPTION"];
const statuses: CourseStatus[] = ["DRAFT", "PUBLISHED"];
const lessonTypes: LessonType[] = ["VIDEO", "TEXT", "QUIZ"];

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function asOptionalString(value: unknown) {
  const text = asString(value);
  return text ? text : null;
}

function asPricingModel(value: unknown): PricingModel {
  return typeof value === "string" && pricingModels.includes(value as PricingModel)
    ? (value as PricingModel)
    : "PAID";
}

function asStatus(value: unknown): CourseStatus {
  return typeof value === "string" && statuses.includes(value as CourseStatus)
    ? (value as CourseStatus)
    : "DRAFT";
}

function asLessonType(value: unknown): LessonType {
  return typeof value === "string" && lessonTypes.includes(value as LessonType)
    ? (value as LessonType)
    : "VIDEO";
}

function validatePublish(input: CourseInput) {
  const errors: string[] = [];
  const modules = input.modules ?? [];
  const lessonCount = modules.reduce((count, module) => count + (module.lessons?.length ?? 0), 0);
  const pricingModel = asPricingModel(input.pricingModel);
  const price = Number(input.price ?? 0);

  if (!asString(input.title)) errors.push("Titel fehlt.");
  if (!asString(input.description)) errors.push("Beschreibung fehlt.");
  if (modules.length === 0) errors.push("Mindestens ein Modul ist erforderlich.");
  if (lessonCount === 0) errors.push("Mindestens eine Lektion ist erforderlich.");
  if (pricingModel === "PAID" && (!Number.isFinite(price) || price <= 0)) {
    errors.push("Paid Courses brauchen einen gültigen Preis.");
  }
  if (pricingModel === "SUBSCRIPTION") {
    const subscriptionPrice = Number(input.subscriptionPrice ?? 0);
    if (!Number.isFinite(subscriptionPrice) || subscriptionPrice <= 0) {
      errors.push("Subscription Courses brauchen einen gültigen monatlichen Preis.");
    }
  }

  return errors;
}

export async function POST(request: Request) {
  const session = await requireRole(["CREATOR", "ADMIN"]);

  if (!session) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const input = (await request.json()) as CourseInput;
  const status = asStatus(input.status);

  if (status === "PUBLISHED") {
    const errors = validatePublish(input);
    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
    }
  }

  let courseId = asString(input.id);

  if (courseId) {
    const existing = await prisma.course.findUnique({
      where: { id: courseId },
      select: { creatorId: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (session.role !== "ADMIN" && existing.creatorId !== session.userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
  }

  const customCategoryName = asString(input.customCategoryName);
  const selectedCategoryId = asString(input.categoryId);
  let categoryId: string | null = selectedCategoryId || null;
  let categoryName = asString(input.categoryName, "Uncategorized");

  if (customCategoryName) {
    const category = await prisma.category.upsert({
      where: { name: customCategoryName },
      update: {},
      create: { name: customCategoryName },
      select: { id: true, name: true },
    });
    categoryId = category.id;
    categoryName = category.name;
  } else if (categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { name: true },
    });
    categoryName = category?.name ?? categoryName;
  }

  const pricingModel = asPricingModel(input.pricingModel);
  const price = pricingModel === "PAID" ? Number(input.price ?? 0) : 0;
  const subscriptionPrice = pricingModel === "SUBSCRIPTION" ? Number(input.subscriptionPrice ?? 0) : 0;
  const modules = input.modules ?? [];

  const savedCourse = await prisma.$transaction(async (tx) => {
    const data = {
      title: asString(input.title),
      description: asString(input.description),
      categoryId,
      categoryName,
      level: asString(input.level, "Beginner"),
      language: asString(input.language, "English"),
      pricingModel,
      price: Number.isFinite(price) ? price : 0,
      subscriptionPrice: Number.isFinite(subscriptionPrice) ? subscriptionPrice : 0,
      thumbnailUrl: asOptionalString(input.thumbnailUrl),
      promoVideoUrl: asOptionalString(input.promoVideoUrl),
      status,
    };

    const course = courseId
      ? await tx.course.update({
          where: { id: courseId },
          data,
          select: { id: true },
        })
      : await tx.course.create({
          data: {
            ...data,
            creatorId: session.userId,
          },
          select: { id: true },
        });

    courseId = course.id;

    await tx.module.deleteMany({
      where: { courseId },
    });

    for (const [moduleIndex, module] of modules.entries()) {
      const createdModule = await tx.module.create({
        data: {
          title: asString(module.title, `Module ${moduleIndex + 1}`),
          order: moduleIndex + 1,
          courseId,
        },
        select: { id: true },
      });

      for (const [lessonIndex, lesson] of (module.lessons ?? []).entries()) {
        const createdLesson = await tx.lesson.create({
          data: {
            title: asString(lesson.title, `Lesson ${lessonIndex + 1}`),
            content: asString(lesson.content),
            type: asLessonType(lesson.type),
            videoUrl: asOptionalString(lesson.videoUrl),
            order: lessonIndex + 1,
            moduleId: createdModule.id,
          },
          select: { id: true },
        });

        const mediaIds = Array.isArray(lesson.mediaIds)
          ? lesson.mediaIds.filter((id): id is string => typeof id === "string")
          : [];

        if (mediaIds.length > 0) {
          await tx.media.updateMany({
            where: { id: { in: mediaIds }, uploadedById: session.userId },
            data: { lessonId: createdLesson.id },
          });
        }

        const questions = Array.isArray(lesson.questions) ? lesson.questions : [];
        for (const [qIndex, q] of questions.entries()) {
          const questionText = asString(q.text);
          if (!questionText) continue;

          const createdQuestion = await tx.question.create({
            data: { text: questionText, order: qIndex + 1, lessonId: createdLesson.id },
            select: { id: true },
          });

          const answers = Array.isArray(q.answers) ? q.answers : [];
          for (const [aIndex, a] of answers.entries()) {
            const answerText = asString(a.text);
            if (!answerText) continue;
            await tx.answer.create({
              data: {
                text: answerText,
                isCorrect: a.isCorrect === true,
                order: aIndex + 1,
                questionId: createdQuestion.id,
              },
            });
          }
        }
      }
    }

    return course;
  });

  return NextResponse.json({
    id: savedCourse.id,
    status,
    message: status === "PUBLISHED" ? "Course published." : "Draft saved.",
  });
}
