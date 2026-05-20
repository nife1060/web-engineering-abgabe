"use client";

import { useMemo, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CourseStatus, LessonType, PricingModel } from "@/generated/prisma/enums";

type CategoryOption = {
  id: string;
  name: string;
};

export type LessonDraft = {
  id: string;
  title: string;
  content: string;
  type: LessonType;
  videoUrl: string;
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

function createLesson(index: number): LessonDraft {
  return {
    id: crypto.randomUUID(),
    title: `Lesson ${index}`,
    content: "",
    type: "VIDEO",
    videoUrl: "",
  };
}

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

export default function CourseBuilder({ categories, initialCourse }: Props) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [course, setCourse] = useState<CourseDraft>(initialCourse ?? defaultCourse(categories));
  const [editingLessonId, setEditingLessonId] = useState(course.modules[0]?.lessons[0]?.id ?? "");
  const [thumbnailPreview, setThumbnailPreview] = useState(course.thumbnailUrl);
  const [thumbnailFileName, setThumbnailFileName] = useState(course.thumbnailUrl ? course.thumbnailUrl.split("/").pop() ?? "" : "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

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
    if (course.pricingModel === "SUBSCRIPTION" && course.subscriptionPrice > 100) {
      errors.push("Der monatliche Preis darf maximal 100 € betragen.");
    }

    return errors;
  }

  async function saveCourse(status: CourseStatus) {
    setMessage("");
    setError("");

    if (course.pricingModel === "SUBSCRIPTION" && course.subscriptionPrice > 100) {
      setError("Der monatliche Preis darf maximal 100 € betragen.");
      return;
    }

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
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...course,
          categoryName: selectedCategory?.name ?? course.categoryName,
          status,
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
                {index < currentStep ? "OK" : index + 1}
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
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
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
                              <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Lesson content / description</label>
                                <textarea rows={3} value={lesson.content} onChange={(event) => updateLesson(module.id, lesson.id, { content: event.target.value })} className={textareaClass} />
                              </div>
                              <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Optional videoUrl</label>
                                <input value={lesson.videoUrl} onChange={(event) => updateLesson(module.id, lesson.id, { videoUrl: event.target.value })} placeholder="https://..." className={inputClass} />
                              </div>
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
                      max={course.pricingModel === "SUBSCRIPTION" ? 100 : undefined}
                      step="0.01"
                      value={course.pricingModel === "SUBSCRIPTION" ? course.subscriptionPrice : course.price}
                      onChange={(event) =>
                        updateCourse(
                          course.pricingModel === "SUBSCRIPTION"
                            ? { subscriptionPrice: Number(event.target.value) }
                            : { price: Number(event.target.value) },
                        )
                      }
                      className="w-full pl-14 pr-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  {course.pricingModel === "SUBSCRIPTION" && (
                    <>
                      <p className="text-xs text-gray-500 mt-2">
                        Die Zahlung wird monatlich jeweils zum 1. des Monats abgebucht.
                      </p>
                      {course.subscriptionPrice > 100 && (
                        <p className="text-xs text-red-600 font-semibold mt-2">
                          Der monatliche Preis darf maximal 100 € betragen.
                        </p>
                      )}
                    </>
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
                    <span className={item.ok ? "text-green-600" : "text-red-500"}>{item.ok ? "OK" : "X"}</span>
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
