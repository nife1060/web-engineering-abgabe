/**
 * Kleine Helfer, um hochgeladene Dateien (Kursanhänge, Medienbibliothek)
 * einheitlich darzustellen. Wird vom Course Builder und von der
 * Medienbibliotheks-Seite gemeinsam verwendet.
 */

/** Tailwind-Farbe für das Badge je nach Medientyp (in den Upload-Listen). */
export const mediaTypeColors: Record<string, string> = {
  IMAGE: "bg-blue-100 text-blue-700",
  VIDEO: "bg-purple-100 text-purple-700",
  PDF: "bg-red-100 text-red-700",
  AUDIO: "bg-green-100 text-green-700",
  TEXT: "bg-yellow-100 text-yellow-700",
  OTHER: "bg-gray-100 text-gray-500",
};

// Sollte zu den MIME-Types passen, die die Upload-API akzeptiert (siehe
// IMAGE_TYPES/VIDEO_TYPES/.../TEXT_TYPES in api/media/upload/route.ts).
// Ist hier nur ein Hinweis für den Datei-Dialog im Browser, der Server
// prüft trotzdem nochmal selbst — die beiden Listen müssen also von Hand
// synchron gehalten werden.
export const acceptedMediaFileTypes =
  "image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,application/pdf,audio/mpeg,audio/wav,audio/ogg,text/plain,text/markdown,text/javascript,text/typescript,text/x-python,text/x-sh";

/** Wandelt eine Byte-Zahl in eine lesbare Größe um (B/KB/MB). */
export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
