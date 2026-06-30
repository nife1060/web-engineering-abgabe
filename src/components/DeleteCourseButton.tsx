"use client";

/** Button zum Löschen eines Kurses, mit Bestätigungs-Dialog vorher. Wird auf den Kurskarten des Creators benutzt. */

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  courseId: string;
  courseTitle: string;
};

export default function DeleteCourseButton({ courseId, courseTitle }: Props) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Kurs "${courseTitle || "Untitled course"}" wirklich löschen? Alle Module, Lektionen und Einschreibungen werden entfernt. Das kann nicht rückgängig gemacht werden.`,
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/courses/${courseId}`, { method: "DELETE" });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Kurs konnte nicht gelöscht werden.");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kurs konnte nicht gelöscht werden.");
      setIsDeleting(false);
    }
  }

  return (
    <div className="relative z-30 pointer-events-auto">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="w-full text-center border border-red-200 text-red-600 font-semibold py-2.5 rounded-xl hover:bg-red-50 transition text-sm disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isDeleting ? "Deleting..." : "Delete Course"}
      </button>
      {error ? <p className="text-xs text-red-600 mt-2">{error}</p> : null}
    </div>
  );
}
