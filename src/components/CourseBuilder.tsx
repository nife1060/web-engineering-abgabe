"use client";

import { useMemo, useRef, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CourseStatus, LessonType, PricingModel } from "@/generated/prisma/enums";

type CategoryOption = {
  id: string;
  name: string;
};

type MediaItem = {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  type: string;
  size: number;
};

export type AnswerDraft = {
  id: string;
  text: string;
  isCorrect: boolean;
};

export type QuestionDraft = {
  id: string;
  text: string;
  answers: AnswerDraft[];
};

export type LessonDraft = {
  id: string;
  title: string;
  content: string;
  type: LessonType;
  videoUrl: string;
  media: MediaItem[];
  questions: QuestionDraft[];
};

export type ModuleDraft = {
  id: string;
  title: string;
  lessons: LessonDraft[];
};

export type CourseDraft = {
  id?: string;
  title: string;
  description: string;
  categoryId: string;
  categoryName: string;
  customCategoryName: string;
  level: string;
  language: string;
  pricingModel: PricingModel;
  price: number;
  subscriptionPrice: number;
  thumbnailUrl: string;
  promoVideoUrl: string;
  modules: ModuleDraft[];
};

type Props = {
  categories: CategoryOption[];
  initialCourse?: CourseDraft;
};

const steps = ["Basic Info", "Curriculum", "Media", "Pricing", "Review"];
const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500";
const textareaClass = `${inputClass} resize-none`;

function createAnswer(index: number): AnswerDraft {
  return { id: crypto.randomUUID(), text: `Option ${index}`, isCorrect: false };
}

function createQuestion(index: number): QuestionDraft {
  return {
    id: crypto.randomUUID(),
    text: `Frage ${index}`,
    answers: [createAnswer(1), createAnswer(2)],
  };
}

function createLesson(index: number): LessonDraft {
  return {
    id: crypto.randomUUID(),
    title: `Lesson ${index}`,
    content: "",
    type: "VIDEO",
    videoUrl: "",
    media: [],
    questions: [],
  };
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const MEDIA_TYPE_COLORS: Record<string, string> = {
  IMAGE: "bg-blue-100 text-blue-700",
  VIDEO: "bg-purple-100 text-purple-700",
  PDF: "bg-red-100 text-red-700",
  AUDIO: "bg-green-100 text-green-700",
  TEXT: "bg-yellow-100 text-yellow-700",
  OTHER: "bg-gray-100 text-gray-500",
};

function createModule(index: number): ModuleDraft {
  return {
    id: crypto.randomUUID(),
    title: `Module ${index}: New Module`,
    lessons: [createLesson(1)],
  };
}

function defaultCourse(categories: CategoryOption[]): CourseDraft {
  const firstCategory = categories[0];

  return {
    title: "",
    description: "",
    categoryId: firstCategory?.id ?? "",
    categoryName: firstCategory?.name ?? "Web Development",
    customCategoryName: "",
    level: "Beginner",
    language: "English",
    pricingModel: "PAID",
    price: 79.99,
    subscriptionPrice: 25,
    thumbnailUrl: "",
    promoVideoUrl: "",
    modules: [createModule(1)],
  };
}

function formatMoney(value: number) {
  return `${value.toFixed(2).replace(".", ",")} EUR`;
}

function priceInputValue(value: number) {
  return Number.isFinite(value) ? String(value) : "";
}

function parsePriceInput(value: string) {
  const price = Number(value);
  return Number.isFinite(price) ? price : 0;
}

export default function CourseBuilder({ categories, initialCourse }: Props) {
  const router = useRouter();
  const initialDraft = initialCourse ?? defaultCourse(categories);
  const [currentStep, setCurrentStep] = useState(0);
  const [course, setCourse] = useState<CourseDraft>(initialDraft);
  const [priceInput, setPriceInput] = useState(() => priceInputValue(initialDraft.price));
  const [subscriptionPriceInput, setSubscriptionPriceInput] = useState(() =>
    priceInputValue(initialDraft.subscriptionPrice),
  );
  const [editingLessonId, setEditingLessonId] = useState(course.modules[0]?.lessons[0]?.id ?? "");
  const [thumbnailPreview, setThumbnailPreview] = useState(course.thumbnailUrl);
  const [thumbnailFileName, setThumbnailFileName] = useState(course.thumbnailUrl ? course.thumbnailUrl.split("/").pop() ?? "" : "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Media-Picker state
  const [pickerLessonId, setPickerLessonId] = useState<string | null>(null);
  const [libraryItems, setLibraryItems] = useState<MediaItem[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [uploadingForLessonId, setUploadingForLessonId] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState<Record<string, string>>({});
  const lessonFileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const lessonCount = useMemo(
    () => course.modules.reduce((count, module) => count + module.lessons.length, 0),
    [course.modules],
  );

  const effectivePrice =
    course.pricingModel === "PAID"
      ? Number(course.price) || 0
      : course.pricingModel === "SUBSCRIPTION"
        ? Number(course.subscriptionPrice) || 0
        : 0;
  const platformFee = effectivePrice * 0.2;
  const creatorRevenue = effectivePrice * 0.8;

  function updateCourse(patch: Partial<CourseDraft>) {
    setCourse((prev) => ({ ...prev, ...patch }));
  }

  function addModule() {
    setCourse((prev) => ({
      ...prev,
      modules: [...prev.modules, createModule(prev.modules.length + 1)],
    }));
  }

  function updateModule(moduleId: string, patch: Partial<ModuleDraft>) {
    setCourse((prev) => ({
      ...prev,
      modules: prev.modules.map((module) => (module.id === moduleId ? { ...module, ...patch } : module)),
    }));
  }

  function removeModule(moduleId: string) {
    if (!window.confirm("Do you really want to delete this module?")) return;

    setCourse((prev) => ({
      ...prev,
      modules: prev.modules.filter((module) => module.id !== moduleId),
    }));
  }

  function addLesson(moduleId: string) {
    setCourse((prev) => ({
      ...prev,
      modules: prev.modules.map((module) => {
        if (module.id !== moduleId) return module;

        const lesson = createLesson(module.lessons.length + 1);
        setEditingLessonId(lesson.id);

        return {
          ...module,
          lessons: [...module.lessons, lesson],
        };
      }),
    }));
  }

  function updateLesson(moduleId: string, lessonId: string, patch: Partial<LessonDraft>) {
    setCourse((prev) => ({
      ...prev,
      modules: prev.modules.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              lessons: module.lessons.map((lesson) => (lesson.id === lessonId ? { ...lesson, ...patch } : lesson)),
            }
          : module,
      ),
    }));
  }

  function removeLesson(moduleId: string, lessonId: string) {
    if (!window.confirm("Do you really want to delete this lesson?")) return;

    setCourse((prev) => ({
      ...prev,
      modules: prev.modules.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              lessons: module.lessons.filter((lesson) => lesson.id !== lessonId),
            }
          : module,
      ),
    }));
  }

  function updateLessonQuestions(
    moduleId: string,
    lessonId: string,
    updater: (qs: QuestionDraft[]) => QuestionDraft[],
  ) {
    setCourse((prev) => ({
      ...prev,
      modules: prev.modules.map((mod) =>
        mod.id !== moduleId
          ? mod
          : {
              ...mod,
              lessons: mod.lessons.map((lesson) =>
                lesson.id !== lessonId ? lesson : { ...lesson, questions: updater(lesson.questions) },
              ),
            },
      ),
    }));
  }

  function addQuestion(moduleId: string, lessonId: string) {
    updateLessonQuestions(moduleId, lessonId, (qs) => [...qs, createQuestion(qs.length + 1)]);
  }

  function removeQuestion(moduleId: string, lessonId: string, questionId: string) {
    updateLessonQuestions(moduleId, lessonId, (qs) => qs.filter((q) => q.id !== questionId));
  }

  function updateQuestionText(moduleId: string, lessonId: string, questionId: string, text: string) {
    updateLessonQuestions(moduleId, lessonId, (qs) =>
      qs.map((q) => (q.id === questionId ? { ...q, text } : q)),
    );
  }

  function addAnswer(moduleId: string, lessonId: string, questionId: string) {
    updateLessonQuestions(moduleId, lessonId, (qs) =>
      qs.map((q) =>
        q.id !== questionId ? q : { ...q, answers: [...q.answers, createAnswer(q.answers.length + 1)] },
      ),
    );
  }

  function removeAnswer(moduleId: string, lessonId: string, questionId: string, answerId: string) {
    updateLessonQuestions(moduleId, lessonId, (qs) =>
      qs.map((q) =>
        q.id !== questionId ? q : { ...q, answers: q.answers.filter((a) => a.id !== answerId) },
      ),
    );
  }

  function updateAnswerText(
    moduleId: string,
    lessonId: string,
    questionId: string,
    answerId: string,
    text: string,
  ) {
    updateLessonQuestions(moduleId, lessonId, (qs) =>
      qs.map((q) =>
        q.id !== questionId
          ? q
          : { ...q, answers: q.answers.map((a) => (a.id === answerId ? { ...a, text } : a)) },
      ),
    );
  }

  function toggleCorrectAnswer(moduleId: string, lessonId: string, questionId: string, answerId: string) {
    updateLessonQuestions(moduleId, lessonId, (qs) =>
      qs.map((q) =>
        q.id !== questionId
          ? q
          : { ...q, answers: q.answers.map((a) => (a.id === answerId ? { ...a, isCorrect: !a.isCorrect } : a)) },
      ),
    );
  }

  async function openLibraryPicker(lessonId: string) {
    if (pickerLessonId === lessonId) {
      setPickerLessonId(null);
      return;
    }
    setPickerLessonId(lessonId);
    setLibraryLoading(true);
    try {
      const res = await fetch("/api/media");
      const data = (await res.json()) as MediaItem[];
      setLibraryItems(Array.isArray(data) ? data : []);
    } catch {
      setLibraryItems([]);
    } finally {
      setLibraryLoading(false);
    }
  }

  function attachMediaToLesson(moduleId: string, lessonId: string, item: MediaItem) {
    setCourse((prev) => ({
      ...prev,
      modules: prev.modules.map((mod) =>
        mod.id === moduleId
          ? {
              ...mod,
              lessons: mod.lessons.map((lesson) =>
                lesson.id === lessonId && !lesson.media.some((m) => m.id === item.id)
                  ? { ...lesson, media: [...lesson.media, item] }
                  : lesson,
              ),
            }
          : mod,
      ),
    }));
  }

  function removeMediaFromLesson(moduleId: string, lessonId: string, mediaId: string) {
    setCourse((prev) => ({
      ...prev,
      modules: prev.modules.map((mod) =>
        mod.id === moduleId
          ? {
              ...mod,
              lessons: mod.lessons.map((lesson) =>
                lesson.id === lessonId
                  ? { ...lesson, media: lesson.media.filter((m) => m.id !== mediaId) }
                  : lesson,
              ),
            }
          : mod,
      ),
    }));
  }

  async function handleLessonMediaUpload(moduleId: string, lessonId: string, file: File) {
    setMediaError((prev) => ({ ...prev, [lessonId]: "" }));
    setUploadingForLessonId(lessonId);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/media/upload", { method: "POST", body: formData });
      const data = (await res.json()) as MediaItem & { error?: string };

      if (!res.ok) {
        setMediaError((prev) => ({ ...prev, [lessonId]: data.error ?? "Upload fehlgeschlagen." }));
        return;
      }

      attachMediaToLesson(moduleId, lessonId, data);
    } catch {
      setMediaError((prev) => ({ ...prev, [lessonId]: "Upload fehlgeschlagen." }));
    } finally {
      setUploadingForLessonId(null);
      const ref = lessonFileRefs.current[lessonId];
      if (ref) ref.value = "";
    }
  }

  async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/uploads", {
      method: "POST",
      body: formData,
    });

    const result = (await response.json()) as { url?: string; error?: string };

    if (!response.ok || !result.url) {
      throw new Error(result.error ?? "Upload failed.");
    }

    return result.url;
  }

  async function handleThumbnailChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setThumbnailFileName(file.name);
    setThumbnailPreview(URL.createObjectURL(file));

    try {
      const url = await uploadFile(file);
      updateCourse({ thumbnailUrl: url });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Thumbnail upload failed.");
    }
  }

  function validatePublish() {
    const errors: string[] = [];

    if (!course.title.trim()) errors.push("Titel fehlt.");
    if (!course.description.trim()) errors.push("Beschreibung fehlt.");
    if (course.modules.length === 0) errors.push("Mindestens ein Modul ist erforderlich.");
    if (lessonCount === 0) errors.push("Mindestens eine Lektion ist erforderlich.");
    if (course.pricingModel === "PAID" && (!Number.isFinite(course.price) || course.price <= 0)) {
      errors.push("Paid Courses brauchen einen gueltigen Preis.");
    }
    if (course.pricingModel === "SUBSCRIPTION" && (!Number.isFinite(course.subscriptionPrice) || course.subscriptionPrice <= 0)) {
      errors.push("Subscription Courses brauchen einen gueltigen monatlichen Preis.");
    }
    return errors;
  }

  async function saveCourse(status: CourseStatus) {
    setMessage("");
    setError("");

    if (status === "PUBLISHED") {
      const validationErrors = validatePublish();
      if (validationErrors.length > 0) {
        setError(validationErrors.join(" "));
        return;
      }
    }

    setSaving(true);

    try {
      const selectedCategory = categories.find((category) => category.id === course.categoryId);
      const normalizedCourse = {
        ...course,
        price: course.pricingModel === "PAID" ? parsePriceInput(priceInput) : 0,
        subscriptionPrice:
          course.pricingModel === "SUBSCRIPTION" ? parsePriceInput(subscriptionPriceInput) : 0,
      };
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...normalizedCourse,
          categoryName: selectedCategory?.name ?? normalizedCourse.categoryName,
          status,
          modules: normalizedCourse.modules.map((mod) => ({
            ...mod,
            lessons: mod.lessons.map((lesson) => ({
              ...lesson,
              mediaIds: lesson.media.map((m) => m.id),
              questions: lesson.questions.map((q) => ({
                text: q.text,
                answers: q.answers.map((a) => ({ text: a.text, isCorrect: a.isCorrect })),
              })),
            })),
          })),
        }),
      });

      const result = (await response.json()) as { id?: string; message?: string; error?: string };

      if (!response.ok) {
        throw new Error(result.error ?? "Course could not be saved.");
      }

      setMessage(result.message ?? "Course saved.");
      setCourse((prev) => ({ ...prev, id: result.id ?? prev.id }));
      setTimeout(() => router.push("/dashboard/courses"), 700);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Course could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-extrabold text-gray-900">
          {course.id ? "Edit Course" : "Create New Course"}
        </h1>
      </div>

      <div className="flex items-center gap-0 mb-10">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <button
              type="button"
              onClick={() => setCurrentStep(index)}
              className={`flex items-center gap-2 text-sm font-semibold transition ${index <= currentStep ? "text-purple-600" : "text-gray-400"}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition ${index < currentStep ? "bg-purple-600 text-white" : index === currentStep ? "bg-purple-100 text-purple-700 ring-2 ring-purple-600" : "bg-gray-100 text-gray-400"}`}>
                {index < currentStep ? "✓" : index + 1}
              </div>
              <span className="hidden sm:inline">{step}</span>
            </button>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${index < currentStep ? "bg-purple-600" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-8">
        {message && (
          <p className="mb-5 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {message}
          </p>
        )}
        {error && (
          <p className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </p>
        )}

        {currentStep === 0 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900">Basic Information</h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Course Title</label>
              <input
                type="text"
                value={course.title}
                onChange={(event) => updateCourse({ title: event.target.value })}
                placeholder="e.g. Complete Web Development Bootcamp"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
              <textarea
                rows={4}
                value={course.description}
                onChange={(event) => updateCourse({ description: event.target.value })}
                placeholder="Describe what students will learn..."
                className={textareaClass}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
                <select
                  value={course.customCategoryName ? "custom" : course.categoryId}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (value === "custom") {
                      updateCourse({ customCategoryName: "", categoryId: "", categoryName: "" });
                      return;
                    }
                    const category = categories.find((item) => item.id === value);
                    updateCourse({
                      categoryId: value,
                      categoryName: category?.name ?? "",
                      customCategoryName: "",
                    });
                  }}
                  className={inputClass}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                  <option value="custom">Eigene Kategorie erstellen</option>
                </select>
                {(course.customCategoryName || !course.categoryId) && (
                  <input
                    type="text"
                    value={course.customCategoryName}
                    onChange={(event) => updateCourse({ customCategoryName: event.target.value })}
                    placeholder="Neue Kategorie"
                    className={`${inputClass} mt-3`}
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Level</label>
                <select value={course.level} onChange={(event) => updateCourse({ level: event.target.value })} className={inputClass}>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Language</label>
              <select value={course.language} onChange={(event) => updateCourse({ language: event.target.value })} className={inputClass}>
                <option>English</option>
                <option>German</option>
                <option>Spanish</option>
              </select>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Curriculum Builder</h2>
              <button type="button" onClick={addModule} className="text-sm text-purple-600 border border-purple-300 px-4 py-2 rounded-lg hover:bg-purple-50 transition font-semibold">
                + Add Module
              </button>
            </div>
            <div className="space-y-4">
              {course.modules.map((module, moduleIndex) => (
                <div key={module.id} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-3 bg-gray-50 px-4 py-3">
                    <span className="w-6 h-6 rounded bg-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0">{moduleIndex + 1}</span>
                    <input
                      value={module.title}
                      onChange={(event) => updateModule(module.id, { title: event.target.value })}
                      className="flex-1 text-sm font-semibold text-gray-900 bg-transparent focus:outline-none focus:bg-white focus:px-2 focus:py-1 focus:rounded-lg focus:border focus:border-purple-300 transition"
                    />
                    <button type="button" onClick={() => removeModule(module.id)} className="text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition text-xs font-semibold">
                      Remove
                    </button>
                  </div>
                  <div className="p-3 space-y-2">
                    {module.lessons.map((lesson, lessonIndex) => {
                      const isEditing = editingLessonId === lesson.id;

                      return (
                        <div key={lesson.id} className="p-3 bg-white border border-gray-100 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-400">{moduleIndex + 1}.{lessonIndex + 1}</span>
                            <input
                              value={lesson.title}
                              onChange={(event) => updateLesson(module.id, lesson.id, { title: event.target.value })}
                              className="flex-1 text-sm text-gray-700 focus:outline-none"
                            />
                            <select
                              value={lesson.type}
                              onChange={(event) => updateLesson(module.id, lesson.id, { type: event.target.value as LessonType })}
                              className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-500"
                            >
                              <option value="VIDEO">Video</option>
                              <option value="TEXT">Text</option>
                              <option value="QUIZ">Quiz</option>
                            </select>
                            <button type="button" onClick={() => setEditingLessonId(isEditing ? "" : lesson.id)} className="text-xs text-purple-600 hover:text-purple-800 font-semibold">
                              Edit
                            </button>
                            <button type="button" onClick={() => removeLesson(module.id, lesson.id)} className="text-red-400 hover:text-red-700 hover:bg-red-50 rounded px-2 py-1 transition text-xs font-bold">
                              X
                            </button>
                          </div>

                          {isEditing && (
                            <div className="mt-4 border-t border-gray-100 pt-4 space-y-4">
                              {/* Title + type — always visible */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Lesson title</label>
                                  <input value={lesson.title} onChange={(event) => updateLesson(module.id, lesson.id, { title: event.target.value })} className={inputClass} />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Lesson type</label>
                                  <select value={lesson.type} onChange={(event) => updateLesson(module.id, lesson.id, { type: event.target.value as LessonType })} className={inputClass}>
                                    <option value="VIDEO">Video</option>
                                    <option value="TEXT">Text</option>
                                    <option value="QUIZ">Quiz</option>
                                  </select>
                                </div>
                              </div>

                              {/* VIDEO fields */}
                              {lesson.type === "VIDEO" && (
                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Lesson content / description</label>
                                    <textarea rows={3} value={lesson.content} onChange={(event) => updateLesson(module.id, lesson.id, { content: event.target.value })} className={textareaClass} />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Video-URL (optional)</label>
                                    <input value={lesson.videoUrl} onChange={(event) => updateLesson(module.id, lesson.id, { videoUrl: event.target.value })} placeholder="https://youtube.com/..." className={inputClass} />
                                  </div>
                                </div>
                              )}

                              {/* TEXT fields */}
                              {lesson.type === "TEXT" && (
                                <div>
                                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Inhalt</label>
                                  <textarea rows={6} value={lesson.content} onChange={(event) => updateLesson(module.id, lesson.id, { content: event.target.value })} placeholder="Schreibe den vollständigen Lektionsinhalt hier..." className={textareaClass} />
                                </div>
                              )}

                              {/* QUIZ builder */}
                              {lesson.type === "QUIZ" && (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <p className="text-xs font-semibold text-gray-500">
                                      Quiz-Fragen ({lesson.questions.length})
                                    </p>
                                    <button
                                      type="button"
                                      onClick={() => addQuestion(module.id, lesson.id)}
                                      className="text-xs font-semibold text-purple-600 border border-purple-300 px-3 py-1.5 rounded-lg hover:bg-purple-50 transition"
                                    >
                                      + Frage hinzufügen
                                    </button>
                                  </div>

                                  {lesson.questions.length === 0 && (
                                    <p className="text-xs text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-xl">
                                      Noch keine Fragen. Füge die erste Frage hinzu.
                                    </p>
                                  )}

                                  {lesson.questions.map((question, qIndex) => (
                                    <div key={question.id} className="border border-gray-200 rounded-xl p-4 space-y-3">
                                      <div className="flex items-center gap-2">
                                        <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                                          {qIndex + 1}
                                        </span>
                                        <input
                                          value={question.text}
                                          onChange={(e) => updateQuestionText(module.id, lesson.id, question.id, e.target.value)}
                                          placeholder="Fragetext eingeben…"
                                          className="flex-1 text-sm text-gray-900 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => removeQuestion(module.id, lesson.id, question.id)}
                                          className="text-red-400 hover:text-red-600 text-xs font-bold px-2 shrink-0"
                                        >
                                          ×
                                        </button>
                                      </div>

                                      <div className="space-y-2 pl-7">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                                          Antworten — markiere die richtige
                                        </p>
                                        {question.answers.map((answer) => (
                                          <div key={answer.id} className="flex items-center gap-2">
                                            <input
                                              type="checkbox"
                                              checked={answer.isCorrect}
                                              onChange={() => toggleCorrectAnswer(module.id, lesson.id, question.id, answer.id)}
                                              className="shrink-0 accent-purple-600"
                                            />
                                            <input
                                              value={answer.text}
                                              onChange={(e) => updateAnswerText(module.id, lesson.id, question.id, answer.id, e.target.value)}
                                              placeholder="Antworttext…"
                                              className={`flex-1 px-3 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 ${answer.isCorrect ? "border-green-300 bg-green-50" : "border-gray-200"}`}
                                            />
                                            {question.answers.length > 2 && (
                                              <button
                                                type="button"
                                                onClick={() => removeAnswer(module.id, lesson.id, question.id, answer.id)}
                                                className="text-red-400 hover:text-red-600 text-xs font-bold shrink-0"
                                              >
                                                ×
                                              </button>
                                            )}
                                          </div>
                                        ))}
                                        {question.answers.length < 4 && (
                                          <button
                                            type="button"
                                            onClick={() => addAnswer(module.id, lesson.id, question.id)}
                                            className="text-xs text-purple-600 font-semibold hover:text-purple-800 transition"
                                          >
                                            + Antwort hinzufügen
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Media section — VIDEO and TEXT only */}
                              {lesson.type !== "QUIZ" && (
                                <div className="border-t border-gray-100 pt-4">
                                  <p className="text-xs font-semibold text-gray-500 mb-3">Medien-Anhänge</p>

                                  {lesson.media.length > 0 && (
                                    <div className="mb-3 space-y-2">
                                      {lesson.media.map((item) => (
                                        <div key={item.id} className="flex items-center gap-3 px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl">
                                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${MEDIA_TYPE_COLORS[item.type] ?? MEDIA_TYPE_COLORS.OTHER}`}>
                                            {item.type}
                                          </span>
                                          <span className="flex-1 text-xs text-gray-700 truncate">{item.filename}</span>
                                          <span className="text-[10px] text-gray-400 shrink-0">{formatFileSize(item.size)}</span>
                                          <button
                                            type="button"
                                            onClick={() => removeMediaFromLesson(module.id, lesson.id, item.id)}
                                            className="text-red-400 hover:text-red-600 text-xs font-bold shrink-0"
                                          >
                                            ×
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {mediaError[lesson.id] && (
                                    <p className="text-xs text-red-600 mb-2 font-medium">{mediaError[lesson.id]}</p>
                                  )}

                                  <div className="flex flex-wrap gap-2">
                                    <label className={`text-xs font-semibold px-3 py-1.5 border rounded-lg transition cursor-pointer ${uploadingForLessonId === lesson.id ? "border-gray-200 text-gray-400" : "border-purple-300 text-purple-600 hover:bg-purple-50"}`}>
                                      {uploadingForLessonId === lesson.id ? (
                                        <span className="flex items-center gap-1">
                                          <span className="w-3 h-3 rounded-full border border-purple-400 border-t-transparent animate-spin inline-block" />
                                          Lädt hoch…
                                        </span>
                                      ) : (
                                        "Datei hochladen"
                                      )}
                                      <input
                                        type="file"
                                        className="sr-only"
                                        disabled={uploadingForLessonId === lesson.id}
                                        ref={(el) => { lessonFileRefs.current[lesson.id] = el; }}
                                        accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,application/pdf,audio/mpeg,audio/wav,audio/ogg,text/plain,text/markdown,text/javascript,text/typescript,text/x-python,text/x-sh"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) handleLessonMediaUpload(module.id, lesson.id, file);
                                        }}
                                      />
                                    </label>

                                    <button
                                      type="button"
                                      onClick={() => openLibraryPicker(lesson.id)}
                                      className="text-xs font-semibold px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition"
                                    >
                                      {pickerLessonId === lesson.id ? "Bibliothek schließen" : "Aus Bibliothek wählen"}
                                    </button>
                                  </div>

                                  {pickerLessonId === lesson.id && (
                                    <div className="mt-3 border border-gray-200 rounded-xl overflow-hidden">
                                      <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                                        <p className="text-xs font-semibold text-gray-600">Deine Medienbibliothek</p>
                                      </div>
                                      {libraryLoading ? (
                                        <div className="flex items-center justify-center py-6">
                                          <div className="w-5 h-5 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
                                        </div>
                                      ) : libraryItems.length === 0 ? (
                                        <p className="text-xs text-gray-400 text-center py-6">Keine Mediendateien in deiner Bibliothek.</p>
                                      ) : (
                                        <div className="max-h-52 overflow-y-auto divide-y divide-gray-100">
                                          {libraryItems.map((item) => {
                                            const alreadyAttached = lesson.media.some((m) => m.id === item.id);
                                            return (
                                              <button
                                                key={item.id}
                                                type="button"
                                                disabled={alreadyAttached}
                                                onClick={() => attachMediaToLesson(module.id, lesson.id, item)}
                                                className={`w-full flex items-center gap-3 px-3 py-2 text-left transition ${alreadyAttached ? "opacity-40 cursor-default" : "hover:bg-purple-50"}`}
                                              >
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${MEDIA_TYPE_COLORS[item.type] ?? MEDIA_TYPE_COLORS.OTHER}`}>
                                                  {item.type}
                                                </span>
                                                <span className="flex-1 text-xs text-gray-700 truncate">{item.filename}</span>
                                                <span className="text-[10px] text-gray-400 shrink-0">{formatFileSize(item.size)}</span>
                                                {alreadyAttached && <span className="text-[10px] text-green-600 font-bold shrink-0">✓</span>}
                                              </button>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <button type="button" onClick={() => addLesson(module.id)} className="w-full py-2 text-xs text-purple-600 hover:text-purple-800 font-medium border border-dashed border-purple-300 rounded-lg hover:bg-purple-50 transition">
                      + Add Lesson
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900">Media & Content</h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Course Thumbnail</label>
              <label className="block border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition cursor-pointer group">
                {thumbnailPreview ? (
                  <img src={thumbnailPreview} alt="Course thumbnail preview" className="mx-auto mb-4 h-40 w-full max-w-md rounded-xl object-cover border border-gray-100" />
                ) : (
                  <div className="mx-auto mb-3 h-12 w-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">IMG</div>
                )}
                <p className="text-sm font-semibold text-gray-700 group-hover:text-purple-700">Click to upload thumbnail</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP. Recommended: 1280x720px</p>
                {thumbnailFileName && <p className="text-xs text-purple-600 mt-2 font-semibold">{thumbnailFileName}</p>}
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleThumbnailChange} className="sr-only" />
              </label>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
              <strong>Tip:</strong> Thumbnails are stored locally in public/uploads for this prototype.
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900">Pricing</h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Pricing Model</label>
              <div className="space-y-3">
                {[
                  { id: "PAID", label: "Paid course", desc: "Students pay once to enroll" },
                  { id: "FREE", label: "Free course", desc: "Available to everyone for free" },
                  { id: "SUBSCRIPTION", label: "Subscription only", desc: "Students pay a monthly subscription price set by the creator." },
                ].map((option) => (
                  <label key={option.id} className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition ${course.pricingModel === option.id ? "border-purple-600 bg-purple-50" : "border-gray-200 hover:border-purple-300"}`}>
                    <input
                      type="radio"
                      name="pricing"
                      value={option.id}
                      checked={course.pricingModel === option.id}
                      onChange={() => updateCourse({ pricingModel: option.id as PricingModel })}
                      className="mt-0.5 text-purple-600"
                    />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{option.label}</p>
                      <p className="text-xs text-gray-500">{option.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {course.pricingModel === "FREE" ? (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-sm font-semibold text-gray-900">Dieser Kurs ist kostenlos.</p>
                  <p className="text-xs text-gray-500 mt-1">Es wird kein Preis gespeichert.</p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    {course.pricingModel === "SUBSCRIPTION" ? "Monthly price (EUR)" : "Price (EUR)"}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-gray-400 text-sm">EUR</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={course.pricingModel === "SUBSCRIPTION" ? subscriptionPriceInput : priceInput}
                      onChange={(event) => {
                        const value = event.target.value;
                        if (course.pricingModel === "SUBSCRIPTION") {
                          setSubscriptionPriceInput(value);
                          updateCourse({ subscriptionPrice: value === "" ? 0 : parsePriceInput(value) });
                          return;
                        }

                        setPriceInput(value);
                        updateCourse({ price: value === "" ? 0 : parsePriceInput(value) });
                      }}
                      className="w-full pl-14 pr-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  {course.pricingModel === "SUBSCRIPTION" && (
                    <p className="text-xs text-gray-500 mt-2">
                      Die Zahlung wird monatlich jeweils zum 1. des Monats abgebucht.
                    </p>
                  )}
                </div>
              )}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">Plattformgebuehr 20%</span>
                    <span className="font-semibold text-gray-900">{formatMoney(platformFee)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-500">
                      {course.pricingModel === "SUBSCRIPTION" ? "Deine monatliche Einnahme 80%" : "Deine Einnahme 80%"}
                    </span>
                    <span className="font-semibold text-purple-700">{formatMoney(creatorRevenue)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900">Review & Publish</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Title", value: course.title || "Missing", ok: Boolean(course.title.trim()) },
                { label: "Description", value: course.description ? "Added" : "Missing", ok: Boolean(course.description.trim()) },
                { label: "Thumbnail", value: course.thumbnailUrl ? "Added" : "Missing", ok: Boolean(course.thumbnailUrl) },
                { label: "Modules", value: `${course.modules.length} modules`, ok: course.modules.length > 0 },
                { label: "Total Lessons", value: `${lessonCount} lessons`, ok: lessonCount > 0 },
                {
                  label: "Price",
                  value:
                    course.pricingModel === "PAID"
                      ? formatMoney(course.price)
                      : course.pricingModel === "SUBSCRIPTION"
                        ? `${formatMoney(course.subscriptionPrice)} / Month`
                        : "Free",
                  ok:
                    course.pricingModel === "FREE" ||
                    (course.pricingModel === "PAID" && course.price > 0) ||
                    (course.pricingModel === "SUBSCRIPTION" && course.subscriptionPrice > 0),
                },
                { label: "Status", value: "Ready for review", ok: validatePublish().length === 0 },
              ].map((item) => (
                <div key={item.label} className={`p-4 rounded-xl border ${item.ok ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                  <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                  <div className="flex items-center gap-2">
                    <span className={item.ok ? "text-green-600" : "text-red-500"}>{item.ok ? "✓" : "✗"}</span>
                    <p className="text-sm font-semibold text-gray-900">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={() => saveCourse("DRAFT")}
                className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition text-sm disabled:opacity-50"
              >
                Save as Draft
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => saveCourse("PUBLISHED")}
                className="flex-1 bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700 transition text-sm disabled:bg-purple-300"
              >
                Publish Course
              </button>
            </div>
          </div>
        )}
      </div>

      {currentStep < 4 && (
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            className="px-6 py-2.5 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition text-sm"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}
