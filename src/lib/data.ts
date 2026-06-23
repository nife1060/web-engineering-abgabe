export type Role = "admin" | "creator" | "user";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
}

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

// Courses now come exclusively from the database (see prisma + the course
// builder). The previously hardcoded demo courses have been removed so only
// real, created courses appear across the app.
export const mockCourses: Course[] = [];

export const mockAnalytics = {
  totalStudents: 1240,
  totalRevenue: 48320,
  totalCourses: 4,
  avgRating: 4.7,
  monthlySales: [
    { month: "Jan", sales: 3200 },
    { month: "Feb", sales: 4100 },
    { month: "Mar", sales: 3800 },
    { month: "Apr", sales: 5200 },
    { month: "May", sales: 6100 },
    { month: "Jun", sales: 5800 },
  ],
  courseStats: [
    { title: "Web Dev Bootcamp", students: 580, revenue: 22400, rating: 4.8 },
    { title: "React Masterclass", students: 340, revenue: 14200, rating: 4.7 },
    { title: "Node.js Backend", students: 210, revenue: 8100, rating: 4.6 },
    { title: "TypeScript Deep Dive", students: 110, revenue: 3620, rating: 4.9 },
  ],
};
