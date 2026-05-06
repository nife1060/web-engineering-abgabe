# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server on http://localhost:3000
npm run build    # Production build (also validates TypeScript)
npm run lint     # ESLint check
```

There are no tests configured. TypeScript errors surface during `npm run build`.

## Architecture

This is a **prototype** — no backend, no database, no auth. All data is static mock data in `src/lib/data.ts`. Pages navigate freely between roles (student, creator, admin) with no access control.

### Data layer

`src/lib/data.ts` is the single source of truth. It exports:
- `mockCourses` — array of `Course` objects including nested `modules[]` → `lessons[]`
- `mockAnalytics` — creator dashboard KPIs and monthly revenue figures

All pages import directly from this file. To change what appears anywhere in the UI, edit the data here.

### Routing (App Router)

| Route | Purpose |
|---|---|
| `/` | Landing page (Epic 0) |
| `/login`, `/register` | Auth UI — no real logic, links navigate directly |
| `/courses`, `/courses/[id]` | Course catalog and detail |
| `/checkout/[courseId]` | Stripe-style checkout UI, fully mocked |
| `/learn/[courseId]/[lessonId]` | Lesson viewer with sidebar + progress bar |
| `/dashboard` | Student view: enrolled courses, activity, recommendations |
| `/creator` | Creator view: analytics, revenue chart, course table |
| `/creator/courses/new` | Multi-step course builder wizard (client component) |
| `/admin` | Admin panel: user and course management tables |

### Key component constraint

`CourseCard` renders as a `<Link>` (course detail) when used normally, but as a `<div>` when `showProgress={true}` — this avoids a nested `<a>` violation caused by the "Continue Learning" link inside the card. Do not revert this pattern.

### Styling

Tailwind CSS v4 (imported via `@import "tailwindcss"` in `globals.css` — no `tailwind.config.js`). Color theme is purple-600 as primary. No component library is used.

### Client vs Server components

Pages are server components by default. Only `creator/courses/new/page.tsx` and `Navbar.tsx` are client components (`"use client"`), because they use `useState`. Keep new pages as server components unless interactivity requires otherwise.
