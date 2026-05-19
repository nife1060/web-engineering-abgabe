"use client";

import { useState, useEffect, useCallback } from "react";
import { MediaItem, MediaType } from "@/lib/types";
import { getMediaItems, deleteMediaItem } from "@/lib/data";
import MediaUpload from "@/components/MediaUpload";

type Filter = "all" | MediaType;

const FILE_ICONS: Record<MediaType, string> = {
  video: "🎬",
  pdf: "📄",
  image: "🖼️",
};

const TYPE_COLORS: Record<MediaType, string> = {
  video: "text-purple-600",
  pdf: "text-red-500",
  image: "text-blue-500",
};

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "video", label: "Videos" },
  { value: "pdf", label: "PDFs" },
  { value: "image", label: "Images" },
];

export default function MediaLibraryPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const load = useCallback(async () => {
    setItems(await getMediaItems());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string) => {
    await deleteMediaItem(id);
    setConfirmDelete(null);
    await load();
  };

  const count = (f: Filter) =>
    f === "all" ? items.length : items.filter((i) => i.type === f).length;

  const filtered = filter === "all" ? items : items.filter((i) => i.type === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Media Library</h1>
          <p className="text-gray-500 mt-1">Upload and manage files for your lessons.</p>
        </div>
      </div>

      {/* Upload card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
        <h2 className="font-bold text-gray-900 mb-4">Upload Files</h2>
        <MediaUpload onUploaded={load} />
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === f.value
                ? "bg-purple-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-600"
            }`}
          >
            {f.label}
            <span
              className={`ml-1.5 text-xs ${
                filter === f.value ? "text-purple-200" : "text-gray-400"
              }`}
            >
              {count(f.value)}
            </span>
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-lg font-semibold text-gray-500">No files here yet</p>
          <p className="text-sm text-gray-400 mt-1">
            {filter === "all"
              ? "Upload your first file above to get started."
              : `No ${filter} files uploaded yet.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow group"
            >
              {/* Thumbnail */}
              <div className="relative h-36 bg-gray-50 flex items-center justify-center overflow-hidden">
                {item.type === "image" && item.previewUrl ? (
                  <img
                    src={item.previewUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-5xl">{FILE_ICONS[item.type]}</span>
                )}
                <button
                  onClick={() => setConfirmDelete(item.id)}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition flex items-center justify-center hover:bg-red-600 leading-none"
                  title="Delete"
                >
                  ×
                </button>
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <span
                    className={`text-xs font-semibold uppercase tracking-wide ${
                      TYPE_COLORS[item.type]
                    }`}
                  >
                    {item.type}
                  </span>
                  <span className="text-xs text-gray-400">{formatBytes(item.size)}</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(item.uploadedAt)}</p>
                {item.lessonId && (
                  <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
                    Assigned to lesson
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-gray-900 text-lg mb-1">Delete file?</h3>
            <p className="text-sm text-gray-500 mb-6">
              {items.find((i) => i.id === confirmDelete)?.name}
              <br />
              <span className="text-xs text-red-400 mt-1 block">
                This action cannot be undone.
              </span>
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 bg-red-500 text-white font-semibold py-2.5 rounded-xl hover:bg-red-600 transition text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
