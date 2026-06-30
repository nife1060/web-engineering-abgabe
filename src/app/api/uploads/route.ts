/**
 * Einfacher Upload nur für das Kurs-Thumbnail (Media-Schritt im
 * `CourseBuilder`). Im Gegensatz zu `@/app/api/media/upload` wird hier
 * kein `Media`-Eintrag angelegt — die Datei wird nur gespeichert und die
 * URL zurückgegeben, ein Thumbnail braucht ja keinen Bibliothekseintrag.
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";

const allowedTypes = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "video/mp4",
  "video/quicktime",
]);

// Anders als bei api/media/upload (zufällige UUID als Name) behalten wir
// hier eine Version vom Originalnamen, damit man ihn noch erkennt. Unsichere
// Zeichen wie Pfadtrenner werden rausgefiltert, damit nichts kaputtgeht.
function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
}

export async function POST(request: Request) {
  const session = await requireRole(["CREATOR", "ADMIN"]);

  if (!session) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  if (!allowedTypes.has(file.type)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const fileName = `${Date.now()}-${safeFileName(file.name)}`;
  const filePath = path.join(uploadsDir, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  return NextResponse.json({
    fileName: file.name,
    url: `/uploads/${fileName}`,
  });
}
