"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { MediaItem, MediaType } from "@/lib/types";
import { saveMediaItem } from "@/lib/data";

interface UploadEntry {
  id: string;
  name: string;
  progress: number;
  error?: string;
  done?: boolean;
}

interface Props {
  onUploaded?: () => void;
}

function getMediaType(file: File): MediaType {
  if (file.type.startsWith("video/")) return "video";
  if (file.type === "application/pdf") return "pdf";
  return "image";
}

export default function MediaUpload({ onUploaded }: Props) {
  const [dragging, setDragging] = useState(false);
  const [entries, setEntries] = useState<UploadEntry[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const simulateProgress = (entryId: string): Promise<void> =>
    new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 22 + 14;
        if (progress >= 100) {
          clearInterval(interval);
          setEntries((prev) =>
            prev.map((e) => (e.id === entryId ? { ...e, progress: 100 } : e))
          );
          setTimeout(resolve, 250);
        } else {
          setEntries((prev) =>
            prev.map((e) =>
              e.id === entryId ? { ...e, progress: Math.round(progress) } : e
            )
          );
        }
      }, 380);
    });

  const processFile = async (file: File) => {
    const type = getMediaType(file);
    const maxSize = type === "video" ? 500 * 1024 * 1024 : 20 * 1024 * 1024;
    const entryId = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    if (file.size > maxSize) {
      const limit = type === "video" ? "500 MB" : "20 MB";
      setEntries((prev) => [
        ...prev,
        { id: entryId, name: file.name, progress: 0, error: `Exceeds max size of ${limit}` },
      ]);
      setTimeout(
        () => setEntries((prev) => prev.filter((e) => e.id !== entryId)),
        5000
      );
      return;
    }

    setEntries((prev) => [...prev, { id: entryId, name: file.name, progress: 0 }]);

    let previewUrl: string | undefined;
    if (type === "image") {
      previewUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target!.result as string);
        reader.readAsDataURL(file);
      });
    }

    await simulateProgress(entryId);

    const item: MediaItem = {
      id: `media_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      name: file.name,
      type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      previewUrl,
    };

    await saveMediaItem(item);
    setEntries((prev) =>
      prev.map((e) => (e.id === entryId ? { ...e, done: true } : e))
    );

    setTimeout(() => {
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
      onUploaded?.();
    }, 1200);
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(processFile);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = "";
  };

  return (
    <div className="space-y-3">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={() => setDragging(false)}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer transition ${
          dragging
            ? "border-purple-500 bg-purple-50"
            : "border-gray-300 hover:border-purple-400 hover:bg-gray-50"
        }`}
      >
        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-2xl">
          📤
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-900">
            Drop files here or click to browse
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Videos up to 500 MB · PDFs and images up to 20 MB
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".mp4,.mov,.pdf,.jpg,.jpeg,.png,.gif,.webp"
          multiple
          onChange={onChange}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {entries.length > 0 && (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white border border-gray-200 rounded-xl px-4 py-3"
            >
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                  {entry.name}
                </p>
                {entry.error ? (
                  <span className="text-xs text-red-500 font-medium shrink-0 ml-2">
                    {entry.error}
                  </span>
                ) : entry.done ? (
                  <span className="text-xs text-green-600 font-semibold shrink-0 ml-2">
                    Done ✓
                  </span>
                ) : (
                  <span className="text-xs text-gray-500 shrink-0 ml-2">
                    {entry.progress}%
                  </span>
                )}
              </div>
              {!entry.error && (
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      entry.done ? "bg-green-500" : "bg-purple-600"
                    }`}
                    style={{ width: `${entry.progress}%` }}
                  />
                </div>
              )}
              {!entry.error && !entry.done && (
                <p className="text-xs text-gray-400 mt-1">
                  Uploading{entry.progress < 50 ? "…" : entry.progress < 90 ? " almost there…" : " finishing up…"}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
