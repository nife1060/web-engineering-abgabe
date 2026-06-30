"use client";

/**
 * Öffnet den Druckdialog des Browsers für die Zertifikatsseite.
 * Die Seite hat extra `@media print`-Styles (siehe printStyles in
 * certificates/[id]/page.tsx), damit man das Zertifikat sauber als PDF speichern kann.
 */
export default function CertificatePrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-purple-700"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 9V2h12v7m-6 4h.01M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2m-12 0v4h12v-4m-12 0h12"
        />
      </svg>
      {label}
    </button>
  );
}
