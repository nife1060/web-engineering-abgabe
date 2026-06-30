/**
 * Sprach-Einstellungen und das Wörterbuch für die Übersetzung Englisch -> Deutsch.
 *
 * Wir schreiben den ganzen JSX-Code auf Englisch. `AutoTranslate.tsx` geht
 * dann zur Laufzeit den DOM durch und ersetzt jeden Text, der hier im
 * Wörterbuch (`uiTranslations`) einen Eintrag hat. Das ist nicht der
 * übliche Weg (normalerweise nutzt man `t()`-Funktionen direkt im Code),
 * spart uns aber Übersetzungsaufrufe überall im Code. Nachteil: Wenn man
 * einen neuen englischen Text einbaut, muss man nicht vergessen, ihn auch
 * hier einzutragen — der Compiler merkt das nicht von allein.
 */

export const locales = ["en", "de"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export function isLocale(value: string | undefined): value is Locale {
  return value === "en" || value === "de";
}

/** Gibt {@link defaultLocale} zurück, wenn der Wert kein gültiges Locale ist. */
export function normalizeLocale(value: string | undefined): Locale {
  return isLocale(value) ? value : defaultLocale;
}

export const languageNames: Record<Locale, string> = {
  en: "English",
  de: "Deutsch",
};

// Englischer Text als Key, deutsche Übersetzung als Value. Englisch selbst
// braucht keine Einträge, translatePhrase gibt den Text dann einfach so zurück.
export const uiTranslations: Record<Locale, Record<string, string>> = {
  en: {},
  de: {
    "Browse Courses": "Kurse entdecken",
    "Browse courses": "Kurse entdecken",
    "My Learning": "Mein Lernen",
    "My Orders": "Meine Bestellungen",
    Dashboard: "Dashboard",
    "My Courses": "Meine Kurse",
    "Media Library": "Medienbibliothek",
    Admin: "Admin",
    Logout: "Abmelden",
    "Log in": "Einloggen",
    "Sign up free": "Kostenlos registrieren",
    "Sign up": "Registrieren",
    Language: "Sprache",
    English: "Englisch",
    German: "Deutsch",
    Spanish: "Spanisch",
    Deutsch: "Deutsch",

    "Your Platform for Creating and Selling Courses": "Deine Plattform zum Erstellen und Verkaufen von Kursen",
    "Learn anything.": "Lerne alles.",
    "Teach anyone.": "Unterrichten für alle.",
    "Join thousands of learners and creators on Learnify — the platform that makes it simple to discover, create, and sell online courses.":
      "Werde Teil von Learnify, der Plattform, mit der du Online-Kurse einfach entdecken, erstellen und verkaufen kannst.",
    "Start free trial": "Kostenlos starten",
    "Create Course": "Kurs erstellen",
    "No credit card required · Cancel anytime": "Keine Kreditkarte erforderlich · jederzeit kündbar",
    Students: "Teilnehmende",
    Courses: "Kurse",
    "Expert Creators": "Experten",
    "Avg. Rating": "Durchschn. Bewertung",
    "Everything you need to learn and earn": "Alles, was du zum Lernen und Verdienen brauchst",
    "Learnify brings together learners and creators in one powerful, easy-to-use platform.":
      "Learnify bringt Lernende und Kursanbieter in einer leistungsstarken, einfach nutzbaren Plattform zusammen.",
    "Expert-Led Courses": "Kurse von Experten",
    "Learn from industry professionals with real-world experience in their fields.":
      "Lerne von Fachleuten mit echter Praxiserfahrung.",
    "Easy Course Builder": "Einfacher Kurs-Builder",
    "Create and publish your own courses with our intuitive builder.":
      "Erstelle und veröffentliche eigene Kurse mit unserem intuitiven Builder.",
    "Track Your Progress": "Verfolge deinen Fortschritt",
    "Stay motivated with detailed progress tracking across all your enrolled courses.":
      "Bleib motiviert mit detailliertem Fortschritt in allen belegten Kursen.",
    "Sell Your Knowledge": "Verkaufe dein Wissen",
    "Monetize your expertise. Set your price and earn revenue from every enrollment.":
      "Monetarisiere dein Wissen, lege Preise fest und verdiene mit jeder Einschreibung.",
    "Learn Anywhere": "Lerne überall",
    "Access your courses on any device. Pick up exactly where you left off.":
      "Greife auf jedem Gerät auf deine Kurse zu und mache genau dort weiter.",
    "Creator Analytics": "Creator-Analysen",
    "Understand your audience with detailed analytics on course performance and revenue.":
      "Verstehe deine Zielgruppe mit Analysen zu Kursleistung und Umsatz.",
    "Featured Courses": "Empfohlene Kurse",
    "Hand-picked by our editorial team": "Von unserem Team ausgewählt",
    "View all →": "Alle ansehen →",
    "What our users say": "Was unsere Nutzer sagen",
    "Ready to start your journey?": "Bereit loszulegen?",
    "Continue learning with over 12,000 learners already on Learnify.":
      "Lerne weiter gemeinsam mit über 12.000 Lernenden auf Learnify.",
    "Join over 12,000 learners already on Learnify. Sign up free today.":
      "Schließe dich über 12.000 Lernenden auf Learnify an. Registriere dich kostenlos.",
    "Start now": "Jetzt starten",
    "The SaaS course platform for modern learners and creators.":
      "Die SaaS-Kursplattform für moderne Lernende und Creator.",
    Platform: "Plattform",
    "Teach on Learnify": "Auf Learnify unterrichten",
    Account: "Konto",
    "© 2026 Learnify. Course platform for learners and creators.":
      "© 2026 Learnify. Kursplattform für Lernende und Creator.",

    "Discover your next skill from our library of expert-led courses":
      "Entdecke deine nächste Fähigkeit in unserer Kursbibliothek.",
    Search: "Suche",
    "Search courses...": "Kurse suchen...",
    Category: "Kategorie",
    All: "Alle",
    Level: "Niveau",
    "All Levels": "Alle Niveaus",
    Beginner: "Anfänger",
    Intermediate: "Fortgeschritten",
    Advanced: "Experte",
    "Price Range": "Preisbereich",
    "Any price": "Jeder Preis",
    Free: "Kostenlos",
    "Under EUR50": "Unter 50 EUR",
    "EUR50 - EUR100": "50 EUR - 100 EUR",
    "Over EUR100": "Ueber 100 EUR",
    "Min. Rating": "Mindestbewertung",
    Any: "Alle",
    Rating: "Bewertung",
    Apply: "Anwenden",
    Reset: "Zurücksetzen",
    "Most Popular": "Beliebteste",
    "Highest Rated": "Höchste Bewertung",
    Newest: "Neueste",
    "Price: Low to High": "Preis: niedrig bis hoch",
    "Price: High to Low": "Preis: hoch bis niedrig",
    "No courses found": "Keine Kurse gefunden",
    "Try a broader search or reset the filters.": "Versuche eine breitere Suche oder setze die Filter zurück.",
    "No ratings yet": "Noch keine Bewertungen",
    Completed: "Abgeschlossen",
    "In Progress": "In Bearbeitung",
    "In progress": "In Bearbeitung",
    "Not Started": "Nicht begonnen",
    "Not started": "Nicht begonnen",
    Progress: "Fortschritt",
    "Continue Learning": "Weiterlernen",
    "Course completed": "Kurs abgeschlossen",
    "Back to course": "Zurück zum Kurs",
    "Course Content": "Kursinhalt",
    "Content lesson": "Inhaltslektion",
    "Lesson-Type": "Lektionstyp",
    "Lesson-Type:": "Lektionstyp:",
    "No written lesson content yet. The creator can add content in the Course Builder.":
      "Noch kein schriftlicher Lektionsinhalt vorhanden. Der Creator kann Inhalte im Course Builder hinzufügen.",
    Now: "Jetzt",
    Play: "Abspielen",
    "Previous Lesson": "Vorherige Lektion",
    "Next Lesson": "Nächste Lektion",
    "Finish Course": "Kurs abschließen",
    "Mark as complete": "Als abgeschlossen markieren",
    "Mark as still working": "Als noch in Bearbeitung markieren",
    "No lessons yet": "Noch keine Lektionen",
    "This course does not have any lessons yet.": "Dieser Kurs hat noch keine Lektionen.",
    open: "offen",
    complete: "abgeschlossen",
    completed: "abgeschlossen",
    remaining: "übrig",
    "Recently": "Kürzlich",
    "Enrolled in course": "In Kurs eingeschrieben",
    New: "Neu",
    "Recent Activity": "Letzte Aktivität",
    "Enrolled Courses": "Eingeschriebene Kurse",
    "Lessons Completed": "Abgeschlossene Lektionen",
    "Completed Courses": "Abgeschlossene Kurse",
    "Overall Progress": "Gesamtfortschritt",
    "Across all courses": "Über alle Kurse",
    "Ready for review": "Bereit zur Überprüfung",
    "Lessons done": "Erledigte Lektionen",
    Remaining: "Übrig",
    "Recommended for You": "Für dich empfohlen",
    "All Courses": "Alle Kurse",
    "Just now": "Gerade eben",
    Yesterday: "Gestern",
    active: "aktiv",
    "still open": "noch offen",
    "Total course progress": "Gesamter Kursfortschritt",
    "No enrolled courses yet.": "Noch keine eingeschriebenen Kurse.",
    "Browse our catalog and pick your first course.": "Durchsuche unseren Katalog und wähle deinen ersten Kurs aus.",
    "No courses found.": "Keine Kurse gefunden.",
    "Courses matching this learning status will appear here.":
      "Kurse mit diesem Lernstatus erscheinen hier.",
    "Courses you saved for later.": "Kurse, die du für später gespeichert hast.",
    "Your wishlist is empty.": "Deine Wunschliste ist leer.",
    "Browse courses and save anything you want to revisit.":
      "Durchsuche Kurse und speichere alles, was du später erneut ansehen möchtest.",

    "Welcome back": "Willkommen zurück",
    "Log in to your Learnify account": "Melde dich in deinem Learnify-Konto an",
    "Back to": "Zurück zu",
    "Email address": "E-Mail-Adresse",
    Password: "Passwort",
    "Logging in...": "Einloggen...",
    "Don't have an account?": "Noch kein Konto?",
    "Create your account": "Konto erstellen",
    "Join Learnify for free today": "Registriere dich heute kostenlos bei Learnify",
    Name: "Name",
    "Min. 8 characters": "Mind. 8 Zeichen",
    "I want to join as": "Ich möchte beitreten als",
    User: "Nutzer",
    "Learn skills": "Fähigkeiten lernen",
    Creator: "Creator",
    "Teach & earn": "Unterrichten & verdienen",
    "Manage platform": "Plattform verwalten",
    "Creating account...": "Konto wird erstellt...",
    "Create account": "Konto erstellen",
    "Already have an account?": "Du hast schon ein Konto?",

    "Access denied": "Zugriff verweigert",
    "You do not have permission to access this area. Please log in with a matching role.":
      "Du hast keine Berechtigung für diesen Bereich. Bitte melde dich mit der passenden Rolle an.",
    "Go to courses": "Zu den Kursen",

    "Admin Dashboard": "Admin-Dashboard",
    "Creator Dashboard": "Creator-Dashboard",
    "Platform-wide course, revenue, and engagement overview.":
      "Plattformweite Übersicht über Kurse, Umsatz und Engagement.",
    "Track your courses, revenue, and student engagement.": "Verfolge deine Kurse, Umsätze und das Engagement der Lernenden.",
    "New Course": "Neuer Kurs",
    "Total Students": "Teilnehmende gesamt",
    "Total Revenue": "Gesamtumsatz",
    "Active Courses": "Aktive Kurse",
    "active enrollments": "aktive Einschreibungen",
    "paid orders": "bezahlte Bestellungen",
    "in draft": "als Entwurf",
    "Includes drafts": "Enthält Entwürfe",
    "Monthly Revenue": "Monatlicher Umsatz",
    "Last 6 months": "Letzte 6 Monate",
    "No paid orders yet. Once a student buys one of your courses it will show up here.":
      "Noch keine bezahlten Bestellungen. Sobald jemand einen Kurs kauft, erscheint er hier.",
    "Quick Actions": "Schnellaktionen",
    "Create new course": "Neuen Kurs erstellen",
    "Start building your content": "Beginne mit deinen Inhalten",
    "Manage courses": "Kurse verwalten",
    "Edit content & pricing": "Inhalte & Preise bearbeiten",
    "Media library": "Medienbibliothek",
    "Upload videos & files": "Videos & Dateien hochladen",
    "Course Performance": "Kursleistung",
    Course: "Kurs",
    Status: "Status",
    "Avg. Progress": "Durchschn. Fortschritt",
    Revenue: "Umsatz",
    PUBLISHED: "VERÖFFENTLICHT",
    DRAFT: "ENTWURF",
    "No courses yet. Create your first course to see performance metrics.":
      "Noch keine Kurse. Erstelle deinen ersten Kurs, um Kennzahlen zu sehen.",
    PAID: "BEZAHLT",
    PENDING: "AUSSTEHEND",
    FAILED: "FEHLGESCHLAGEN",
    REFUNDED: "ERSTATTET",
    Date: "Datum",
    Amount: "Betrag",
    Receipt: "Beleg",
    "All your course purchases and their invoices.": "Alle deine Kurskäufe und Rechnungen.",
    "No purchases yet": "Noch keine Käufe",
    "Once you buy a course, it will appear here with its receipt.":
      "Sobald du einen Kurs kaufst, erscheint er hier mit dem Beleg.",
    "View receipt": "Beleg ansehen",

    Wishlist: "Wunschliste",
    Certifications: "Zertifikate",
    "Track your active courses and review completed courses.":
      "Verfolge deine aktiven Kurse und sieh abgeschlossene Kurse an.",
    "Welcome back!": "Willkommen zurück!",
    "Browse more courses": "Weitere Kurse entdecken",
    "No certificates yet.": "Noch keine Zertifikate.",
    "Complete a course to earn your first certificate.":
      "Schließe einen Kurs ab, um dein erstes Zertifikat zu erhalten.",
    "Your Certificates": "Deine Zertifikate",
    "Earn a certificate by completing every lesson in a course. Download or print it as a PDF.":
      "Erhalte ein Zertifikat, indem du jede Lektion eines Kurses abschließt. Lade es als PDF herunter oder drucke es aus.",
    "Almost there": "Fast geschafft",
    "Finish these courses to unlock their certificates.":
      "Schließe diese Kurse ab, um ihre Zertifikate freizuschalten.",
    "View & Download PDF": "Ansehen & als PDF herunterladen",
    "Continue to earn certificate": "Weiterlernen für Zertifikat",
    "🏆 Certified": "🏆 Zertifiziert",
    "🏆 View Certificate": "🏆 Zertifikat ansehen",
    Issued: "Ausgestellt",
    "Certificate ID": "Zertifikat-ID",
    "Review Course": "Kurs ansehen",
    "← Back to My Learning": "← Zurück zu Mein Lernen",
    "Print / Download PDF": "Drucken / als PDF speichern",
    "Use your browser's print dialog and choose \"Save as PDF\" to download this certificate.":
      "Nutze den Druckdialog deines Browsers und wähle „Als PDF speichern“, um dieses Zertifikat herunterzuladen.",
    "Certificate of Completion": "Abschlusszertifikat",
    "This certifies that": "Hiermit wird bestätigt, dass",
    "has successfully completed the course": "den folgenden Kurs erfolgreich abgeschlossen hat",
    Instructor: "Dozent",
    "Date of completion": "Abschlussdatum",
    "Congratulations — course completed!": "Glückwunsch – Kurs abgeschlossen!",
    "You've earned a certificate of completion. Download or print it as a PDF.":
      "Du hast ein Abschlusszertifikat erhalten. Lade es als PDF herunter oder drucke es aus.",
    "View Certificate": "Zertifikat ansehen",
    "No files uploaded yet.": "Noch keine Dateien hochgeladen.",
    "files in your library.": "Dateien in deiner Bibliothek.",
    "file in your library.": "Datei in deiner Bibliothek.",
    Image: "Bild",
    Other: "Sonstige",
    "Uploading...": "Wird hochgeladen…",
    "Upload file": "Datei hochladen",
    "Images, videos (max. 100 MB), PDFs, audio, text files (max. 20 MB)":
      "Bilder, Videos (max. 100 MB), PDFs, Audio, Textdateien (max. 20 MB)",
    "No media files yet. Upload your first file.":
      "Noch keine Mediendateien. Lade deine erste Datei hoch.",
    View: "Ansehen",
    Delete: "Löschen",
    "Upload fehlgeschlagen.": "Upload fehlgeschlagen.",
    "Upload fehlgeschlagen. Bitte versuche es erneut.": "Upload fehlgeschlagen. Bitte versuche es erneut.",
    "Löschen fehlgeschlagen.": "Löschen fehlgeschlagen.",
    "Löschen fehlgeschlagen. Bitte versuche es erneut.": "Löschen fehlgeschlagen. Bitte versuche es erneut.",

    "Basic Info": "Basisinfos",
    Curriculum: "Curriculum",
    Media: "Medien",
    Pricing: "Preise",
    Review: "Prüfung",
    "Edit Course": "Kurs bearbeiten",
    "Create New Course": "Neuen Kurs erstellen",
    "Basic Information": "Basisinformationen",
    "Course Title": "Kurstitel",
    "e.g. Complete Web Development Bootcamp": "z.B. Komplettes Webentwicklung-Bootcamp",
    Description: "Beschreibung",
    "Describe what students will learn...": "Beschreibe, was Lernende lernen werden...",
    "Eigene Kategorie erstellen": "Eigene Kategorie erstellen",
    "Neue Kategorie": "Neue Kategorie",
    "Curriculum Builder": "Curriculum-Builder",
    "+ Add Module": "+ Modul hinzufügen",
    Remove: "Entfernen",
    "Lesson title": "Lektionstitel",
    "Lesson type": "Lektionstyp",
    "Lesson content / description": "Lektionsinhalt / Beschreibung",
    "Video-URL (optional)": "Video-URL (optional)",
    Inhalt: "Inhalt",
    "Do you really want to delete this module?": "Möchtest du dieses Modul wirklich löschen?",
    "Do you really want to delete this lesson?": "Möchtest du diese Lektion wirklich löschen?",
    "Upload failed.": "Upload fehlgeschlagen.",
    "Thumbnail upload failed.": "Thumbnail-Upload fehlgeschlagen.",
    "Course could not be saved.": "Kurs konnte nicht gespeichert werden.",
    "Course saved.": "Kurs gespeichert.",
    "Course published.": "Kurs veröffentlicht.",
    "Draft saved.": "Entwurf gespeichert.",
  },
};

/**
 * Sucht die Übersetzung für einen UI-Text im aktuellen Locale.
 * @returns Den Text unverändert, wenn das Locale Englisch ist oder es
 * keinen passenden Eintrag im Wörterbuch gibt.
 */
export function translatePhrase(text: string, locale: Locale) {
  if (locale === defaultLocale) return text;

  return uiTranslations[locale][text] ?? text;
}
