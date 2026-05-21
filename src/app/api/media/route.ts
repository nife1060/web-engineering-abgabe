import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireRole(["CREATOR", "ADMIN"]);

  if (!session) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const media = await prisma.media.findMany({
    where: { uploadedById: session.userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(media);
}
