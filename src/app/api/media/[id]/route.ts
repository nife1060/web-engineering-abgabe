import { unlink } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, { params }: Props) {
  const session = await requireRole(["CREATOR", "ADMIN"]);

  if (!session) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const { id } = await params;

  const media = await prisma.media.findUnique({
    where: { id },
    select: { id: true, storedName: true, uploadedById: true },
  });

  if (!media) {
    return NextResponse.json({ error: "Medium nicht gefunden." }, { status: 404 });
  }

  if (session.role !== "ADMIN" && media.uploadedById !== session.userId) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const filePath = path.join(process.cwd(), "public", "uploads", media.storedName);
  try {
    await unlink(filePath);
  } catch {
    // file may already be gone — continue with DB deletion
  }

  await prisma.media.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
