"use client";
import { useState } from "react";
import Link from "next/link";

const steps = ["Basic Info", "Curriculum", "Media", "Pricing", "Review"];

export default function NewCoursePage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [modules, setModules] = useState([
    { id: 1, title: "Module 1: Getting Started", lessons: [{ id: 1, title: "Introduction", type: "video" }] },
  ]);

  const addModule = () => {
    setModules((prev) => [...prev, { id: Date.now(), title: `Module ${prev.length + 1}: New Module`, lessons: [] }]);
  };

  const addLesson = (moduleId: number) => {
    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId
          ? { ...m, lessons: [...m.lessons, { id: Date.now(), title: "New Lesson", type: "video" }] }
          : m
      )
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/creator" className="text-gray-400 hover:text-gray-600 transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-extrabold text-gray-900">Create New Course</h1>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-0 mb-10">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <button
              onClick={() => setCurrentStep(i)}
              className={`flex items-center gap-2 text-sm font-semibold transition ${i <= currentStep ? "text-purple-600" : "text-gray-400"}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition ${i < currentStep ? "bg-purple-600 text-white" : i === currentStep ? "bg-purple-100 text-purple-700 ring-2 ring-purple-600" : "bg-gray-100 text-gray-400"}`}>
                {i < currentStep ? "✓" : i + 1}
              </div>
              <span className="hidden sm:inline">{step}</span>
            </button>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${i < currentStep ? "bg-purple-600" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8">
        {currentStep === 0 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900">Basic Information</h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Course Title</label>
              <input type="text" placeholder="e.g. Complete Web Development Bootcamp" className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
              <textarea rows={4} placeholder="Describe what students will learn..." className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category</label>
                <select className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option>Web Development</option>
                  <option>Data Science</option>
                  <option>Design</option>
                  <option>Business</option>
                  <option>Marketing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Level</label>
                <select className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Language</label>
              <select className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
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
              <button onClick={addModule} className="text-sm text-purple-600 border border-purple-300 px-4 py-2 rounded-lg hover:bg-purple-50 transition font-semibold">
                + Add Module
              </button>
            </div>
            <div className="space-y-4">
              {modules.map((module, mi) => (
                <div key={module.id} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-3 bg-gray-50 px-4 py-3">
                    <span className="w-6 h-6 rounded bg-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0">{mi + 1}</span>
                    <input
                      defaultValue={module.title}
                      className="flex-1 text-sm font-semibold text-gray-900 bg-transparent focus:outline-none focus:bg-white focus:px-2 focus:py-1 focus:rounded-lg focus:border focus:border-purple-300 transition"
                    />
                    <button className="text-gray-400 hover:text-red-500 transition text-xs">Remove</button>
                  </div>
                  <div className="p-3 space-y-2">
                    {module.lessons.map((lesson, li) => (
                      <div key={lesson.id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg">
                        <span className="text-gray-400">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                        </span>
                        <span className="text-xs text-gray-400">{mi + 1}.{li + 1}</span>
                        <input defaultValue={lesson.title} className="flex-1 text-sm text-gray-700 focus:outline-none" />
                        <select className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-500">
                          <option>Video</option>
                          <option>Text</option>
                          <option>Quiz</option>
                        </select>
                        <button className="text-gray-300 hover:text-red-400 transition text-xs">✕</button>
                      </div>
                    ))}
                    <button onClick={() => addLesson(module.id)} className="w-full py-2 text-xs text-purple-600 hover:text-purple-800 font-medium border border-dashed border-purple-300 rounded-lg hover:bg-purple-50 transition">
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
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:border-purple-400 transition cursor-pointer group">
                <div className="text-4xl mb-3">🖼️</div>
                <p className="text-sm font-semibold text-gray-700 group-hover:text-purple-700">Click to upload thumbnail</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB · Recommended: 1280×720px</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Promo Video</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:border-purple-400 transition cursor-pointer group">
                <div className="text-4xl mb-3">🎬</div>
                <p className="text-sm font-semibold text-gray-700 group-hover:text-purple-700">Upload a promotional video</p>
                <p className="text-xs text-gray-400 mt-1">MP4, MOV up to 500MB · Max 5 minutes</p>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
              <strong>Tip:</strong> You can upload lesson videos individually from the curriculum editor after creating the course.
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
                  { id: "paid", label: "Paid course", desc: "Students pay once to enroll" },
                  { id: "free", label: "Free course", desc: "Available to everyone for free" },
                  { id: "subscription", label: "Subscription only", desc: "Available to Pro subscribers" },
                ].map((opt, i) => (
                  <label key={opt.id} className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition ${i === 0 ? "border-purple-600 bg-purple-50" : "border-gray-200 hover:border-purple-300"}`}>
                    <input type="radio" name="pricing" defaultChecked={i === 0} className="mt-0.5 text-purple-600" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{opt.label}</p>
                      <p className="text-xs text-gray-500">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price (EUR)</label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-gray-400 text-sm">€</span>
                <input type="number" defaultValue="79.99" className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-green-700">
              <strong>Revenue share:</strong> You keep 80% of each sale. LearnHub takes 20% platform fee.
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900">Review & Publish</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Title", value: "My New Course", ok: true },
                { label: "Description", value: "Added ✓", ok: true },
                { label: "Thumbnail", value: "Missing", ok: false },
                { label: "Modules", value: `${modules.length} modules`, ok: true },
                { label: "Total Lessons", value: `${modules.reduce((a, m) => a + m.lessons.length, 0)} lessons`, ok: true },
                { label: "Price", value: "€79.99", ok: true },
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
            <div className="flex gap-3">
              <button className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition text-sm">
                Save as Draft
              </button>
              <button className="flex-1 bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700 transition text-sm">
                Publish Course
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      {currentStep < 4 && (
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Back
          </button>
          <button
            onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            className="px-6 py-2.5 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition text-sm"
          >
            Continue →
          </button>
        </div>
      )}
    </div>
  );
}
