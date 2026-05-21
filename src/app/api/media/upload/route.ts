import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { NextResponse } from "next/server";
import type { MediaType } from "@/generated/prisma/enums";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm"]);
const PDF_TYPES = new Set(["application/pdf"]);
const AUDIO_TYPES = new Set(["audio/mpeg", "audio/wav", "audio/ogg"]);
const TEXT_TYPES = new Set([
  "text/plain",
  "text/markdown",
  "text/javascript",
  "application/javascript",
  "text/typescript",
  "text/x-python",
  "text/x-sh",
  "application/x-python",
  "application/x-sh",
]);

const VIDEO_MAX_BYTES = 100 * 1024 * 1024;
const OTHER_MAX_BYTES = 20 * 1024 * 1024;

function resolveMediaType(mimeType: string): MediaType {
  if (IMAGE_TYPES.has(mimeType)) return "IMAGE";
  if (VIDEO_TYPES.has(mimeType)) return "VIDEO";
  if (PDF_TYPES.has(mimeType)) return "PDF";
  if (AUDIO_TYPES.has(mimeType)) return "AUDIO";
  if (TEXT_TYPES.has(mimeType)) return "TEXT";
  return "OTHER";
}

function isAllowed(mimeType: string) {
  return (
    IMAGE_TYPES.has(mimeType) ||
    VIDEO_TYPES.has(mimeType) ||
    PDF_TYPES.has(mimeType) ||
    AUDIO_TYPES.has(mimeType) ||
    TEXT_TYPES.has(mimeType)
  );
}

function fileExtension(filename: string) {
  const dotIndex = filename.lastIndexOf(".");
  return dotIndex >= 0 ? filename.slice(dotIndex) : "";
}

export async function POST(request: Request) {
  const session = await requireRole(["CREATOR", "ADMIN"]);

  if (!session) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Keine Datei hochgeladen." }, { status: 400 });
  }

  if (!isAllowed(file.type)) {
    return NextResponse.json(
      {
        error: `Dateityp nicht erlaubt: ${file.type}. Erlaubt sind Bilder (JPG, PNG, GIF, WebP), Videos (MP4, WebM), PDF, Audio (MP3, WAV, OGG) und Textdateien.`,
      },
      { status: 400 },
    );
  }

  const isVideo = VIDEO_TYPES.has(file.type);
  const maxSize = isVideo ? VIDEO_MAX_BYTES : OTHER_MAX_BYTES;

  if (file.size > maxSize) {
    const limitMB = Math.round(maxSize / (1024 * 1024));
    return NextResponse.json(
      { error: `Datei zu groß. Maximum: ${limitMB} MB für diesen Dateityp.` },
      { status: 400 },
    );
  }

  const ext = fileExtension(file.name);
  const storedName = `${randomUUID()}${ext}`;
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const filePath = path.join(uploadsDir, storedName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  const mediaType = resolveMediaType(file.type);

  const media = await prisma.media.create({
    data: {
      filename: file.name,
      storedName,
      url: `/uploads/${storedName}`,
      mimeType: file.type,
      size: file.size,
      type: mediaType,
      uploadedById: session.userId,
    },
  });

  return NextResponse.json(media, { status: 201 });
}
