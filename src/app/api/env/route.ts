/**
 * Kleiner Endpunkt, um schnell zu checken, ob die wichtigen
 * Umgebungsvariablen in einem Deployment gesetzt sind. Gibt absichtlich
 * nur true/false zurück (z.B. ob DATABASE_URL existiert), nicht die
 * eigentlichen Werte, damit man den Endpunkt auch ohne Login aufrufen kann.
 */

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    nextPublicBaseUrl: process.env.NEXT_PUBLIC_BASE_URL ?? null,
    databaseUrlSet: !!process.env.DATABASE_URL,
  });
}
