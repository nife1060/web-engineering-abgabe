/** /dashboard/media — lädt die Medienbibliothek aus der DB und gibt sie an die interaktive Client-Component weiter. */

import AccessDenied from "@/components/AccessDenied";
import MediaLibraryClient from "@/components/MediaLibraryClient";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MediaLibraryPage() {
  const session = await requireRole(["CREATOR", "ADMIN"]);

  if (!session) {
    return <AccessDenied />;
  }

  const media = await prisma.media.findMany({
    where: { uploadedById: session.userId },
    orderBy: { createdAt: "desc" },
  });

  // Date-Objekte von Prisma kann man nicht einfach so an eine
  // Client-Component weiterreichen, deswegen wandeln wir sie hier erst in
  // normale ISO-Strings um.
  const serialised = media.map((item) => ({
    id: item.id,
    filename: item.filename,
    url: item.url,
    mimeType: item.mimeType,
    type: item.type as string,
    size: item.size,
    createdAt: item.createdAt.toISOString(),
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Media Library</h1>
          <p className="text-gray-500 mt-1">
            {media.length === 0
              ? "Noch keine Dateien hochgeladen."
              : `${media.length} Datei${media.length !== 1 ? "en" : ""} in deiner Bibliothek.`}
          </p>
        </div>
      </div>

      <MediaLibraryClient initialMedia={serialised} />
    </div>
  );
}
