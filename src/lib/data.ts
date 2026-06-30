/**
 * Typen für Kurse, Module und Lektionen, wie sie in der UI gebraucht werden.
 *
 * Das ist absichtlich nicht 1:1 das Prisma-Schema (`@/generated/prisma/models`):
 * Die Pages wandeln ihre Prisma-Ergebnisse erst in diese Typen um, bevor sie
 * an die Components weitergegeben werden. So müssen die Components nicht
 * wissen, wie die Datenbank aufgebaut ist.
 */

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: "video" | "text";
  completed?: boolean;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  price: number;
  subscriptionPrice?: number;
  pricingModel?: "PAID" | "FREE" | "SUBSCRIPTION";
  rating: number;
  studentsCount: number;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  thumbnail: string;
  modules: Module[];
  enrolled?: boolean;
  progress?: number;
}
