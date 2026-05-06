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
  rating: number;
  studentsCount: number;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  thumbnail: string;
  modules: Module[];
  enrolled?: boolean;
  progress?: number;
}

export const mockCourses: Course[] = [
  {
    id: "1",
    title: "Complete Web Development Bootcamp",
    description:
      "Learn HTML, CSS, JavaScript, React, Node.js and more in this comprehensive bootcamp. Go from zero to full-stack developer.",
    instructor: "Dr. Angela Yu",
    price: 89.99,
    rating: 4.8,
    studentsCount: 12450,
    category: "Web Development",
    level: "Beginner",
    thumbnail: "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=400&h=225&fit=crop",
    enrolled: true,
    progress: 35,
    modules: [
      {
        id: "m1",
        title: "Getting Started with HTML",
        lessons: [
          { id: "l1", title: "Introduction to HTML", duration: "8:23", type: "video", completed: true },
          { id: "l2", title: "HTML Structure & Tags", duration: "12:45", type: "video", completed: true },
          { id: "l3", title: "Forms and Inputs", duration: "15:10", type: "video", completed: false },
        ],
      },
      {
        id: "m2",
        title: "CSS Fundamentals",
        lessons: [
          { id: "l4", title: "Selectors & Properties", duration: "10:30", type: "video", completed: false },
          { id: "l5", title: "Flexbox Layout", duration: "18:20", type: "video", completed: false },
          { id: "l6", title: "CSS Grid", duration: "20:15", type: "video", completed: false },
        ],
      },
      {
        id: "m3",
        title: "JavaScript Basics",
        lessons: [
          { id: "l7", title: "Variables & Data Types", duration: "11:00", type: "video", completed: false },
          { id: "l8", title: "Functions & Scope", duration: "14:35", type: "video", completed: false },
          { id: "l9", title: "DOM Manipulation", duration: "22:10", type: "video", completed: false },
        ],
      },
    ],
  },
  {
    id: "2",
    title: "React & Next.js Masterclass",
    description:
      "Master React and Next.js from scratch. Build real-world applications with hooks, context, and server components.",
    instructor: "Maximilian Schwarzmüller",
    price: 79.99,
    rating: 4.7,
    studentsCount: 8320,
    category: "Frontend",
    level: "Intermediate",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=225&fit=crop",
    enrolled: true,
    progress: 60,
    modules: [
      {
        id: "m1",
        title: "React Fundamentals",
        lessons: [
          { id: "l1", title: "What is React?", duration: "9:15", type: "video", completed: true },
          { id: "l2", title: "Components & Props", duration: "13:40", type: "video", completed: true },
          { id: "l3", title: "State & useState", duration: "16:55", type: "video", completed: true },
        ],
      },
      {
        id: "m2",
        title: "Next.js App Router",
        lessons: [
          { id: "l4", title: "Pages & Routing", duration: "11:20", type: "video", completed: true },
          { id: "l5", title: "Server Components", duration: "19:05", type: "video", completed: false },
          { id: "l6", title: "Data Fetching", duration: "21:30", type: "video", completed: false },
        ],
      },
    ],
  },
  {
    id: "3",
    title: "Python for Data Science",
    description:
      "Learn Python programming for data analysis, visualization, and machine learning with pandas, numpy and matplotlib.",
    instructor: "Jose Portilla",
    price: 94.99,
    rating: 4.9,
    studentsCount: 21000,
    category: "Data Science",
    level: "Beginner",
    thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=225&fit=crop",
    enrolled: false,
    modules: [
      {
        id: "m1",
        title: "Python Basics",
        lessons: [
          { id: "l1", title: "Setting Up Python", duration: "7:30", type: "video", completed: false },
          { id: "l2", title: "Variables & Types", duration: "10:20", type: "video", completed: false },
        ],
      },
      {
        id: "m2",
        title: "Data Analysis with Pandas",
        lessons: [
          { id: "l3", title: "DataFrames", duration: "15:45", type: "video", completed: false },
          { id: "l4", title: "Data Cleaning", duration: "18:10", type: "video", completed: false },
        ],
      },
    ],
  },
  {
    id: "4",
    title: "UI/UX Design Fundamentals",
    description:
      "Learn design principles, user research, wireframing, and prototyping with Figma. Build a professional design portfolio.",
    instructor: "Sara Chen",
    price: 69.99,
    rating: 4.6,
    studentsCount: 5870,
    category: "Design",
    level: "Beginner",
    thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=225&fit=crop",
    enrolled: false,
    modules: [
      {
        id: "m1",
        title: "Design Thinking",
        lessons: [
          { id: "l1", title: "What is UX?", duration: "8:00", type: "video", completed: false },
          { id: "l2", title: "User Research Methods", duration: "14:30", type: "video", completed: false },
        ],
      },
    ],
  },
  {
    id: "5",
    title: "Node.js & Express Backend",
    description:
      "Build scalable REST APIs and web servers with Node.js, Express, MongoDB and authentication best practices.",
    instructor: "Andrew Mead",
    price: 84.99,
    rating: 4.7,
    studentsCount: 9120,
    category: "Backend",
    level: "Intermediate",
    thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=225&fit=crop",
    enrolled: false,
    modules: [
      {
        id: "m1",
        title: "Node.js Basics",
        lessons: [
          { id: "l1", title: "Node.js Overview", duration: "9:40", type: "video", completed: false },
          { id: "l2", title: "Modules & npm", duration: "12:15", type: "video", completed: false },
        ],
      },
    ],
  },
  {
    id: "6",
    title: "TypeScript Deep Dive",
    description:
      "Master TypeScript from basics to advanced patterns. Generics, decorators, utility types and real-world architecture.",
    instructor: "Matt Pocock",
    price: 74.99,
    rating: 4.8,
    studentsCount: 6340,
    category: "Web Development",
    level: "Advanced",
    thumbnail: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&h=225&fit=crop",
    enrolled: false,
    modules: [
      {
        id: "m1",
        title: "TypeScript Basics",
        lessons: [
          { id: "l1", title: "Types & Interfaces", duration: "11:30", type: "video", completed: false },
          { id: "l2", title: "Generics", duration: "17:50", type: "video", completed: false },
        ],
      },
    ],
  },
];

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
