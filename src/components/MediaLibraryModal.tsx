"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MediaItem, MediaType } from "@/lib/types";
import { getMediaItems, assignMediaToLesson } from "@/lib/data";

interface Props {
  lessonId: string;
  onClose: () => void;
  onAssigned: () => void;
}

const FILE_ICONS: Record<MediaType, string> = {
  video: "🎬",
  pdf: "📄",
  image: "🖼️",
};

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaLibraryModal({ lessonId, onClose, onAssigned }: Props) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    getMediaItems().then(setItems);
  }, []);

  const alreadyAssignedVideo = items.some(
    (i) => i.type === "video" && i.lessonId === lessonId
  );
  const selectedVideoId = [...selected].find(
    (id) => items.find((i) => i.id === id)?.type === "video"
  );

  const isItemDisabled = (item: MediaItem) => {
    if (item.lessonId === lessonId) return true;
    if (
      item.type === "video" &&
      (alreadyAssignedVideo || (selectedVideoId && selectedVideoId !== item.id))
    )
      return true;
    return false;
  };

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAssign = async () => {
    await Promise.all([...selected].map((id) => assignMediaToLesson(id, lessonId)));
    onAssigned();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Add Media to Lesson</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Select files to attach · one video per lesson
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-500 transition flex items-center justify-center text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-sm font-semibold text-gray-500">No media uploaded yet</p>
              <p className="text-xs mt-1 mb-4">Upload files first, then come back to assign them.</p>
              <Link
                href="/dashboard/media"
                className="inline-block text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition"
              >
                Go to Media Library →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {items.map((item) => {
                const disabled = isItemDisabled(item);
                const isSelected = selected.has(item.id);
                const alreadyHere = item.lessonId === lessonId;

                return (
                  <button
                    key={item.id}
                    disabled={disabled}
                    onClick={() => !disabled && toggle(item.id)}
                    className={`relative text-left rounded-xl border-2 overflow-hidden transition ${
                      alreadyHere
                        ? "border-green-400 bg-green-50 opacity-70 cursor-not-allowed"
                        : disabled
                        ? "border-gray-200 opacity-40 cursor-not-allowed"
                        : isSelected
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-purple-300 hover:bg-gray-50"
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="h-24 bg-gray-50 flex items-center justify-center overflow-hidden relative">
                      {item.type === "image" && item.previewUrl ? (
                        <img
                          src={item.previewUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-4xl">{FILE_ICONS[item.type]}</span>
                      )}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="p-2.5">
                      <p className="text-xs font-semibold text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatBytes(item.size)}</p>
                      {alreadyHere && (
                        <p className="text-xs text-green-600 font-medium mt-0.5">Already assigned</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            {selected.size} file{selected.size !== 1 ? "s" : ""} selected
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="border border-gray-300 text-gray-700 font-semibold px-4 py-2 rounded-xl hover:bg-gray-50 transition text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={selected.size === 0}
              className="bg-purple-600 text-white font-semibold px-5 py-2 rounded-xl hover:bg-purple-700 transition text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Attach{selected.size > 0 ? ` (${selected.size})` : ""}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
