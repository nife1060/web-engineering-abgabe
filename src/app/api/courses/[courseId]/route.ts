/** Endpunkt zum Löschen eines Kurses, genutzt von `DeleteCourseButton`. */

import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ courseId: string }>;
};

/**
 * Löscht einen Kurs. Wegen der Cascade-Relationen im Prisma-Schema fliegen
 * dabei automatisch auch alle Module, Lektionen, Fragen, Antworten,
 * Einschreibungen und Bestellungen mit raus. Nur der Creator vom Kurs
 * selbst oder ein Admin dürfen das.
 */
export async function DELETE(_request: Request, { params }: Props) {
  const session = await requireRole(["CREATOR", "ADMIN"]);

  if (!session) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const { courseId } = await params;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, creatorId: true },
  });

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  if (session.role !== "ADMIN" && course.creatorId !== session.userId) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  await prisma.course.delete({ where: { id: courseId } });

  return NextResponse.json({ success: true });
}
