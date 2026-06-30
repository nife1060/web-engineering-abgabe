/**
 * Füllt die SQLite-Datenbank mit ein paar Beispiel-Kursen (inkl.
 * Instructors, Modulen und Lektionen), damit Katalog und Landingpage
 * nicht komplett leer aussehen.
 *
 * Kann man mehrmals laufen lassen, ohne dass es Probleme gibt: Instructors
 * und Kurse, die es schon gibt (über E-Mail/Titel erkannt), werden einfach übersprungen.
 *
 *   node prisma/seed-courses.cjs
 */
const path = require("path");
const Database = require("better-sqlite3");

const db = new Database(path.join(__dirname, "..", "dev.db"));

// Prisma speichert Datum/Zeit als ISO-8601 mit +00:00 am Ende, das machen wir hier genauso nach.
function now() {
  return new Date().toISOString().replace("Z", "+00:00");
}

let counter = 0;
function genId(prefix) {
  counter += 1;
  return `seed${prefix}${Date.now().toString(36)}${counter}${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

const categoryByName = new Map(
  db.prepare("SELECT id, name FROM Category").all().map((c) => [c.name, c.id]),
);

const instructors = [
  { name: "Sarah Mitchell", email: "sarah.mitchell@learnify.demo" },
  { name: "David Chen", email: "david.chen@learnify.demo" },
  { name: "Elena Rossi", email: "elena.rossi@learnify.demo" },
];

const findUser = db.prepare("SELECT id FROM User WHERE email = ?");
const insertUser = db.prepare(
  "INSERT INTO User (id, name, email, password, role, createdAt) VALUES (?, ?, ?, ?, 'CREATOR', ?)",
);

const instructorIdByName = new Map();
for (const instructor of instructors) {
  const existing = findUser.get(instructor.email);
  if (existing) {
    instructorIdByName.set(instructor.name, existing.id);
    continue;
  }
  const id = genId("usr");
  insertUser.run(id, instructor.name, instructor.email, "learnify-demo", now());
  instructorIdByName.set(instructor.name, id);
}

const T = (w, content, videoUrl) => ({ title: w, type: "TEXT", content, videoUrl: videoUrl ?? null });
const V = (title, videoUrl, content) => ({ title, type: "VIDEO", videoUrl, content: content ?? "" });

const courses = [
  {
    title: "Modern JavaScript from Scratch",
    description:
      "Learn JavaScript the right way. Master variables, functions, the DOM, asynchronous code and ES2023+ features by building real, interactive projects step by step.",
    instructor: "Sarah Mitchell",
    category: "Web Development",
    level: "Beginner",
    pricingModel: "FREE",
    price: 0,
    thumbnail: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800&h=450&fit=crop",
    modules: [
      {
        title: "JavaScript Fundamentals",
        lessons: [
          V("Welcome & How to Use This Course", "https://www.youtube.com/watch?v=W6NZfCO5SIk"),
          T(
            "Variables, Constants & Data Types",
            "JavaScript has three ways to declare variables: let, const and var. In modern code you'll almost always use const by default and let when a value needs to change. We'll cover strings, numbers, booleans, null, undefined and objects.",
          ),
          V("Functions & Arrow Functions", "https://www.youtube.com/watch?v=W6NZfCO5SIk"),
        ],
      },
      {
        title: "Working with the DOM",
        lessons: [
          T(
            "Selecting & Changing Elements",
            "The Document Object Model (DOM) is how JavaScript sees your HTML. Use document.querySelector to grab elements and change their textContent, classes and styles to make pages interactive.",
          ),
          V("Handling Events & Building a To-Do App", "https://www.youtube.com/watch?v=W6NZfCO5SIk"),
        ],
      },
    ],
  },
  {
    title: "React & Next.js: Build Production-Ready Apps",
    description:
      "Go beyond the basics. Build fast, modern web applications with React 19, the Next.js App Router, server components, data fetching and deployment best practices.",
    instructor: "David Chen",
    category: "Web Development",
    level: "Intermediate",
    pricingModel: "PAID",
    price: 49.99,
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop",
    modules: [
      {
        title: "React Foundations",
        lessons: [
          V("Components, Props & JSX", "https://www.youtube.com/watch?v=Tn6-PIqc4UM"),
          V("State & the useState Hook", "https://www.youtube.com/watch?v=Tn6-PIqc4UM"),
          T(
            "Thinking in Components",
            "Great React apps are built from small, reusable components. We'll look at how to break a UI into a component tree and pass data down through props while keeping state where it belongs.",
          ),
        ],
      },
      {
        title: "Next.js App Router",
        lessons: [
          T(
            "Routing & Layouts",
            "The Next.js App Router uses the file system for routing. Folders become routes, page.tsx renders the UI, and layout.tsx wraps nested routes with shared chrome like navigation.",
          ),
          V("Server Components & Data Fetching", "https://www.youtube.com/watch?v=Tn6-PIqc4UM"),
          V("Deploying Your App", "https://www.youtube.com/watch?v=Tn6-PIqc4UM"),
        ],
      },
    ],
  },
  {
    title: "UI/UX Design Foundations with Figma",
    description:
      "Design beautiful, user-friendly interfaces. Learn the core principles of UX, build wireframes and high-fidelity prototypes in Figma, and create a portfolio-ready case study.",
    instructor: "Elena Rossi",
    category: "Design",
    level: "Beginner",
    pricingModel: "PAID",
    price: 39.99,
    thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=450&fit=crop",
    modules: [
      {
        title: "UX Principles",
        lessons: [
          T(
            "What Is UX Design?",
            "User experience design is about understanding people and solving their problems. We'll cover the difference between UX and UI, and the design process from research to delivery.",
          ),
          V("User Research & Personas", "https://www.youtube.com/watch?v=c9Wg6Cb_YlU"),
        ],
      },
      {
        title: "Designing in Figma",
        lessons: [
          V("Frames, Layers & Components", "https://www.youtube.com/watch?v=c9Wg6Cb_YlU"),
          T(
            "Color, Typography & Spacing",
            "Consistent visual systems make products feel professional. Learn to build a simple design system: a type scale, a color palette and an 8-point spacing grid.",
          ),
          V("Building an Interactive Prototype", "https://www.youtube.com/watch?v=c9Wg6Cb_YlU"),
        ],
      },
    ],
  },
  {
    title: "Python for Data Science & Analytics",
    description:
      "Turn raw data into insight with Python. Master pandas, NumPy and data visualization, then run your first analysis on a real dataset from start to finish.",
    instructor: "Sarah Mitchell",
    category: "Data Science",
    level: "Beginner",
    pricingModel: "PAID",
    price: 59.99,
    thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=450&fit=crop",
    modules: [
      {
        title: "Python Essentials",
        lessons: [
          V("Setting Up Python & Jupyter", "https://www.youtube.com/watch?v=LHBE6Q9XlzI"),
          T(
            "Lists, Dictionaries & Loops",
            "Before analyzing data you need a solid grasp of Python's core data structures. We'll work through lists, dictionaries and for-loops with practical examples.",
          ),
        ],
      },
      {
        title: "Data Analysis with pandas",
        lessons: [
          V("DataFrames & Reading CSV Files", "https://www.youtube.com/watch?v=LHBE6Q9XlzI"),
          T(
            "Cleaning & Transforming Data",
            "Real-world data is messy. Learn to handle missing values, rename columns, filter rows and group data to answer questions about your dataset.",
          ),
          V("Visualizing Results with Matplotlib", "https://www.youtube.com/watch?v=LHBE6Q9XlzI"),
        ],
      },
    ],
  },
  {
    title: "Digital Marketing Masterclass 2026",
    description:
      "Grow any business online. Learn SEO, content marketing, social media, email campaigns and paid ads — plus how to measure what actually works with analytics.",
    instructor: "David Chen",
    category: "Marketing",
    level: "Beginner",
    pricingModel: "PAID",
    price: 44.99,
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop",
    modules: [
      {
        title: "Marketing Foundations",
        lessons: [
          T(
            "Understanding Your Audience",
            "Every successful campaign starts with knowing who you're talking to. We'll define target audiences, build customer personas and map the marketing funnel.",
          ),
          V("SEO Basics: Getting Found on Google", "https://www.youtube.com/watch?v=xsVTqzratPs"),
        ],
      },
      {
        title: "Channels That Convert",
        lessons: [
          V("Content & Social Media Strategy", "https://www.youtube.com/watch?v=xsVTqzratPs"),
          T(
            "Email Marketing That Works",
            "Email is still one of the highest-ROI channels. Learn list building, writing subject lines people open, and simple automated sequences that nurture leads.",
          ),
          V("Measuring Results with Analytics", "https://www.youtube.com/watch?v=xsVTqzratPs"),
        ],
      },
    ],
  },
];

const findCourseByTitle = db.prepare("SELECT id FROM Course WHERE title = ?");
const insertCourse = db.prepare(
  `INSERT INTO Course
     (id, title, description, categoryId, categoryName, level, language, pricingModel, price, subscriptionPrice, thumbnailUrl, promoVideoUrl, status, creatorId, createdAt, updatedAt)
   VALUES
     (@id, @title, @description, @categoryId, @categoryName, @level, 'English', @pricingModel, @price, 0, @thumbnailUrl, NULL, 'PUBLISHED', @creatorId, @createdAt, @updatedAt)`,
);
const insertModule = db.prepare(
  "INSERT INTO Module (id, title, \"order\", courseId) VALUES (?, ?, ?, ?)",
);
const insertLesson = db.prepare(
  "INSERT INTO Lesson (id, title, content, type, videoUrl, \"order\", moduleId) VALUES (?, ?, ?, ?, ?, ?, ?)",
);

const seedAll = db.transaction(() => {
  let created = 0;
  for (const course of courses) {
    if (findCourseByTitle.get(course.title)) {
      console.log(`• skip (exists): ${course.title}`);
      continue;
    }
    const creatorId = instructorIdByName.get(course.instructor);
    const courseId = genId("crs");
    const ts = now();
    insertCourse.run({
      id: courseId,
      title: course.title,
      description: course.description,
      categoryId: categoryByName.get(course.category) ?? null,
      categoryName: course.category,
      level: course.level,
      pricingModel: course.pricingModel,
      price: course.price,
      thumbnailUrl: course.thumbnail,
      creatorId,
      createdAt: ts,
      updatedAt: ts,
    });

    course.modules.forEach((module, mIndex) => {
      const moduleId = genId("mod");
      insertModule.run(moduleId, module.title, mIndex, courseId);
      module.lessons.forEach((lesson, lIndex) => {
        insertLesson.run(
          genId("les"),
          lesson.title,
          lesson.content ?? "",
          lesson.type,
          lesson.videoUrl ?? null,
          lIndex,
          moduleId,
        );
      });
    });
    created += 1;
    console.log(`✓ created: ${course.title} (${course.instructor})`);
  }

  // Falls ältere Kurse noch ein anderes Datumsformat haben, hier auf das Prisma-Format bringen.
  db.prepare(
    "UPDATE Course SET updatedAt = ? WHERE updatedAt NOT LIKE '%T%'",
  ).run(now());

  return created;
});

const createdCount = seedAll();
const total = db.prepare("SELECT COUNT(*) n FROM Course WHERE status = 'PUBLISHED'").get().n;
console.log(`\nDone. Created ${createdCount} new course(s). Published courses total: ${total}.`);
