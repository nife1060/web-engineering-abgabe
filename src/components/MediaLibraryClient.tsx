"use client";

import { useRef, useState } from "react";

type MediaItem = {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  type: string;
  size: number;
  createdAt: string;
};

type Props = {
  initialMedia: MediaItem[];
};

const TYPE_LABELS: Record<string, string> = {
  IMAGE: "Bild",
  VIDEO: "Video",
  PDF: "PDF",
  AUDIO: "Audio",
  TEXT: "Text",
  OTHER: "Sonstige",
};

const TYPE_COLORS: Record<string, string> = {
  IMAGE: "bg-blue-100 text-blue-700",
  VIDEO: "bg-purple-100 text-purple-700",
  PDF: "bg-red-100 text-red-700",
  AUDIO: "bg-green-100 text-green-700",
  TEXT: "bg-yellow-100 text-yellow-700",
  OTHER: "bg-gray-100 text-gray-500",
};

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function MediaIcon({ type, url, filename }: { type: string; url: string; filename: string }) {
  if (type === "IMAGE") {
    return (
      <img
        src={url}
        alt={filename}
        className="w-full h-full object-cover"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
    );
  }

  const icons: Record<string, string> = {
    VIDEO: "▶",
    PDF: "PDF",
    AUDIO: "♪",
    TEXT: "</>",
    OTHER: "📄",
  };

  const colors: Record<string, string> = {
    VIDEO: "bg-purple-100 text-purple-600",
    PDF: "bg-red-100 text-red-600",
    AUDIO: "bg-green-100 text-green-600",
    TEXT: "bg-yellow-100 text-yellow-700",
    OTHER: "bg-gray-100 text-gray-500",
  };

  return (
    <div className={`w-full h-full flex items-center justify-center text-xl font-bold rounded-t-xl ${colors[type] ?? colors.OTHER}`}>
      {icons[type] ?? icons.OTHER}
    </div>
  );
}

export default function MediaLibraryClient({ initialMedia }: Props) {
  const [media, setMedia] = useState<MediaItem[]>(initialMedia);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(file: File) {
    setError("");
    setSuccess("");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/media/upload", { method: "POST", body: formData });
      const data = (await res.json()) as MediaItem & { error?: string };

      if (!res.ok) {
        setError(data.error ?? "Upload fehlgeschlagen.");
        return;
      }

      setMedia((prev) => [{ ...data, createdAt: data.createdAt ?? new Date().toISOString() }, ...prev]);
      setSuccess(`"${file.name}" wurde hochgeladen.`);
    } catch {
      setError("Upload fehlgeschlagen. Bitte versuche es erneut.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleDelete(id: string, filename: string) {
    if (!window.confirm(`"${filename}" wirklich löschen?`)) return;

    setDeletingId(id);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Löschen fehlgeschlagen.");
        return;
      }
      setMedia((prev) => prev.filter((item) => item.id !== id));
      setSuccess(`"${filename}" wurde gelöscht.`);
    } catch {
      setError("Löschen fehlgeschlagen. Bitte versuche es erneut.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      {error && (
        <p className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
      {success && (
        <p className="mb-5 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {success}
        </p>
      )}

      {/* Upload area */}
      <label className="block mb-8 border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-purple-400 transition cursor-pointer group">
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
            <p className="text-sm text-purple-600 font-semibold">Wird hochgeladen…</p>
          </div>
        ) : (
          <>
            <div className="mx-auto mb-3 w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-xl font-bold group-hover:bg-purple-200 transition">
              +
            </div>
            <p className="text-sm font-semibold text-gray-700 group-hover:text-purple-700">
              Datei hochladen
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Bilder, Videos (max. 100 MB), PDFs, Audio, Textdateien (max. 20 MB)
            </p>
          </>
        )}
        <input
          ref={fileRef}
          type="file"
          className="sr-only"
          disabled={uploading}
          accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,application/pdf,audio/mpeg,audio/wav,audio/ogg,text/plain,text/markdown,text/javascript,text/typescript,text/x-python,text/x-sh"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
          }}
        />
      </label>

      {/* Media grid */}
      {media.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
          <p className="text-gray-500 text-sm">Noch keine Mediendateien. Lade deine erste Datei hoch.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {media.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition group">
              <div className="h-36 bg-gray-50 overflow-hidden rounded-t-2xl">
                <MediaIcon type={item.type} url={item.url} filename={item.filename} />
              </div>
              <div className="p-3">
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-1.5 ${TYPE_COLORS[item.type] ?? TYPE_COLORS.OTHER}`}>
                  {TYPE_LABELS[item.type] ?? item.type}
                </span>
                <p className="text-xs font-semibold text-gray-900 truncate" title={item.filename}>
                  {item.filename}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {formatFileSize(item.size)} · {new Date(item.createdAt).toLocaleDateString("de-DE")}
                </p>
                <div className="mt-2 flex gap-2">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 text-center text-xs text-purple-600 border border-purple-200 rounded-lg py-1 hover:bg-purple-50 transition font-semibold"
                  >
                    Ansehen
                  </a>
                  <button
                    type="button"
                    disabled={deletingId === item.id}
                    onClick={() => handleDelete(item.id, item.filename)}
                    className="flex-1 text-xs text-red-500 border border-red-200 rounded-lg py-1 hover:bg-red-50 transition font-semibold disabled:opacity-50"
                  >
                    {deletingId === item.id ? "…" : "Löschen"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
