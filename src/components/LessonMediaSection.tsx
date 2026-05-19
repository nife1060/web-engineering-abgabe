"use client";

import { useState, useEffect, useCallback } from "react";
import { MediaItem } from "@/lib/types";
import { getMediaForLesson } from "@/lib/data";
import MediaLibraryModal from "@/components/MediaLibraryModal";

interface Props {
  lessonId: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function LessonMediaSection({ lessonId }: Props) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [showModal, setShowModal] = useState(false);

  const load = useCallback(async () => {
    setMedia(await getMediaForLesson(lessonId));
  }, [lessonId]);

  useEffect(() => {
    load();
  }, [load]);

  const video = media.find((m) => m.type === "video");
  const pdfs = media.filter((m) => m.type === "pdf");
  const images = media.filter((m) => m.type === "image");

  return (
    <>
      <div className="mt-6 pt-5 border-t border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Lesson Materials
          </h2>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg transition"
          >
            <span>+</span> Add Media
          </button>
        </div>

        {media.length === 0 ? (
          <p className="text-sm text-gray-500 italic">
            No media attached to this lesson yet.
          </p>
        ) : (
          <div className="space-y-5">
            {/* Video player */}
            {video && (
              <div className="rounded-xl overflow-hidden border border-gray-700 bg-black">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                  <span className="text-xs font-medium text-gray-300 truncate">
                    🎬 {video.name}
                  </span>
                  <span className="text-xs text-gray-500 shrink-0 ml-2">Mock Player</span>
                </div>
                <div className="h-28 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center cursor-pointer hover:bg-white/20 transition">
                    <svg
                      className="w-5 h-5 text-white ml-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div className="px-4 pb-3">
                  <div className="bg-gray-700 rounded-full h-1.5">
                    <div className="bg-purple-500 h-1.5 rounded-full w-0" />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0:00</span>
                    <span>{formatBytes(video.size)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* PDF attachments */}
            {pdfs.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Attachments
                </p>
                <div className="space-y-2">
                  {pdfs.map((pdf) => (
                    <a
                      key={pdf.id}
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="flex items-center gap-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl px-4 py-3 transition group"
                    >
                      <span className="text-xl shrink-0">📄</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{pdf.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {formatBytes(pdf.size)} · PDF
                        </p>
                      </div>
                      <span className="text-xs text-purple-400 group-hover:text-purple-300 shrink-0">
                        Download ↓
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Images */}
            {images.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Images
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {images.map((img) => (
                    <div
                      key={img.id}
                      className="rounded-xl overflow-hidden border border-gray-700 bg-gray-800 aspect-video"
                    >
                      {img.previewUrl ? (
                        <img
                          src={img.previewUrl}
                          alt={img.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          🖼️
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <MediaLibraryModal
          lessonId={lessonId}
          onClose={() => setShowModal(false)}
          onAssigned={load}
        />
      )}
    </>
  );
}
