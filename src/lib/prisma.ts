/** Der eine Prisma-Client für die ganze App (SQLite). Immer diesen importieren statt selbst `new PrismaClient()` zu machen. */

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

// Im Next.js-Dev-Modus wird bei jedem Speichern per Hot-Reload neu geladen.
// Ohne diesen Trick würde dabei jedes Mal ein neuer PrismaClient (und eine
// neue DB-Verbindung) entstehen. Deswegen speichern wir die Instanz auf
// `globalThis` zwischen. In Produktion brauchen wir das nicht, weil das
// Modul da sowieso nur einmal geladen wird.
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
