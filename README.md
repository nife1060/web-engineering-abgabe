# Learnify

Learnify ist eine SaaS-Kursplattform, auf der **Creator** Online-Kurse erstellen und verkaufen und **User** sie kaufen, lernen und Zertifikate sammeln können. Gebaut mit Next.js (App Router), Prisma/SQLite und Stripe.

## Tech-Stack

| Bereich | Technologie |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, React 19, Server Components & Server Actions) |
| Sprache | TypeScript |
| Styling | Tailwind CSS v4 (`@import "tailwindcss"`, kein `tailwind.config.js`) |
| Datenbank | SQLite über [Prisma 7](https://www.prisma.io) (`@prisma/adapter-better-sqlite3`) |
| Zahlungen | [Stripe](https://stripe.com) (Checkout, Subscriptions, Webhooks) |
| Internationalisierung | Eigenes Laufzeit-Übersetzungssystem (Englisch im JSX → Deutsch via DOM-Übersetzung, siehe `src/components/AutoTranslate.tsx` + `src/lib/i18n.ts`) |

## Features

**Für alle Besucher**
- Landingpage, Kurskatalog mit Such-/Filter-/Sortierfunktionen, öffentliche Kursdetailseiten

**Für eingeloggte Nutzer (Rolle `USER`)**
- Kurskauf (einmalig, kostenlos oder Abo) über Stripe Checkout
- Lesson-Player mit Video-/Text-/Quiz-Inhalten und Fortschritts-Tracking
- "My Learning"-Dashboard: laufende Kurse, Wunschliste (lokal im Browser gespeichert), Bestellhistorie
- Automatisch vergebene, druckbare Zertifikate nach Kursabschluss

**Für Creator (Rolle `CREATOR`)**
- Mehrstufiger Course Builder (Basisdaten, Curriculum mit Modulen/Lektionen/Quizfragen, Medien, Preisgestaltung, Review)
- Medienbibliothek für Uploads (Bilder, Videos, PDFs, Audio, Textdateien)
- Analytics-Dashboard: Umsatz, Einschreibungen, Kurs-Performance

**Für Admins (Rolle `ADMIN`)**
- Plattformweite Sicht auf Dashboard und Kursverwaltung, Nutzerliste im Admin-Panel
- *Hinweis:* Der Admin-Login ist aktuell deaktiviert (`loginUser` weist `ADMIN`-Logins bewusst zurück) — diese Bereiche sind im normalen Betrieb noch nicht erreichbar.

## Projektstruktur

```
src/
  app/
    actions/        Server Actions (Auth, Checkout, Lesson-Fortschritt)
    api/             Route Handler (Courses, Media, Uploads, Stripe-Webhook, ...)
    courses/         Kurskatalog & Kursdetailseite
    learn/           Lesson-Player
    dashboard/       Creator-/Admin-Bereich (Analytics, Kursliste, Medienbibliothek)
    creator/         Course Builder (neu erstellen / bearbeiten)
    mylearning/       "My Learning"-Seite für User
    admin/           Admin-Panel
    certificates/    Druckbare Zertifikatsseite
    checkout/        Stripe-Success-Seite
    account/         Bestellhistorie
  components/        Wiederverwendbare UI-Komponenten
  lib/                Geteilte Geschäftslogik (Auth, Prisma-Client, Stripe, Checkout, Zertifikate, i18n, ...)
  generated/prisma/   Von Prisma generierter Client (nicht editieren)
prisma/
  schema.prisma       Datenmodell
  migrations/          Migrationsverlauf
  seed-courses.cjs     Seed-Skript für Demo-Kurse
```

## Datenmodell (Auszug)

`User` (Rollen `USER`/`CREATOR`/`ADMIN`) · `Course` → `Module` → `Lesson` → `Question` → `Answer` · `Media` · `Enrollment` · `Order` · `Subscription` · `Certificate` · `Progress` · `Wishlist` · `Category`

Details siehe [`prisma/schema.prisma`](prisma/schema.prisma).

## Setup

### Voraussetzungen

- Node.js gemäß [`.nvmrc`](.nvmrc) (Version 22)
- Ein [Stripe](https://dashboard.stripe.com)-Testaccount für Zahlungsfunktionen

### 1. Abhängigkeiten installieren

```bash
npm install
```

### 2. Umgebungsvariablen einrichten

```bash
cp .env.example .env
```

| Variable | Beschreibung |
|---|---|
| `DATABASE_URL` | Pfad zur SQLite-Datenbankdatei, z. B. `file:./dev.db` |
| `STRIPE_SECRET_KEY` | Stripe Secret Key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Publishable Key |
| `STRIPE_WEBHOOK_SECRET` | Signing Secret für den Stripe-Webhook |

### 3. Datenbank initialisieren

```bash
npx prisma generate
npx prisma migrate dev
```

Optional: Demo-Kurse einspielen (idempotent, mehrfach ausführbar):

```bash
node prisma/seed-courses.cjs
```

### 4. Entwicklungsserver starten

```bash
npm run dev
```

Die App läuft anschließend unter [http://localhost:3000](http://localhost:3000).

### 5. (Optional) Stripe-Webhooks lokal testen

Mit der [Stripe CLI](https://stripe.com/docs/stripe-cli) Events an den lokalen Webhook-Endpunkt weiterleiten:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Der ausgegebene Webhook-Signing-Secret muss als `STRIPE_WEBHOOK_SECRET` in der `.env` hinterlegt werden.

## Verfügbare Skripte

| Befehl | Beschreibung |
|---|---|
| `npm run dev` | Entwicklungsserver (Webpack) |
| `npm run dev:turbo` | Entwicklungsserver mit Turbopack |
| `npm run build` | Produktions-Build (validiert auch TypeScript) |
| `npm run start` | Produktionsserver starten (nach `build`) |
| `npm run lint` | ESLint-Check |

Es sind aktuell keine automatisierten Tests konfiguriert.

## Architekturhinweise

- **Authentifizierung & Rollen**: Sessions sind einfache httpOnly-Cookies (`userId` + `role`). Die gesamte Zugriffslogik läuft über `getSession()`/`requireRole()` in [`src/lib/auth.ts`](src/lib/auth.ts) — siehe dort für Details zur Rollen-Weiterleitung nach dem Login.
- **Zahlungen**: `src/lib/checkout.ts` startet die Stripe-Checkout-Session; der eigentliche Zugriff (Einschreibung) wird erst durch den Webhook in [`src/app/api/webhooks/stripe/route.ts`](src/app/api/webhooks/stripe/route.ts) gewährt, sobald Stripe die Zahlung bestätigt.
- **Internationalisierung**: Die UI ist auf Englisch geschrieben; `AutoTranslate` übersetzt sichtbaren Text zur Laufzeit anhand des Wörterbuchs in `src/lib/i18n.ts` ins Deutsche, wenn der Nutzer Deutsch wählt.
- **Course-Builder-Speicherung**: Beim Speichern eines Kurses wird das komplette Curriculum (Module/Lektionen/Fragen/Antworten) ersetzt statt abgeglichen — siehe Kommentar in [`src/app/api/courses/route.ts`](src/app/api/courses/route.ts).
