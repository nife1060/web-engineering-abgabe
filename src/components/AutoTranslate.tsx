"use client";

/**
 * Übersetzt die UI zur Laufzeit mit Hilfe eines Wörterbuchs.
 *
 * Wir schreiben alle Components auf Englisch, statt überall `t()`-Aufrufe
 * einzubauen. Stattdessen geht dieses Modul nach dem Rendern einmal durch
 * den ganzen DOM, schaut bei jedem Text in `uiTranslations` (`@/lib/i18n`)
 * nach einer Übersetzung und tauscht den Text direkt aus. Vorteil: Die
 * Components bleiben sauber. Nachteil: Der Compiler merkt nicht, wenn man
 * vergisst einen neuen Text auch ins Wörterbuch einzutragen.
 *
 * Wird einmal im Root-Layout eingebaut. Läuft beim ersten Laden, dann
 * immer wieder wenn sich der DOM ändert (MutationObserver), und auch wenn
 * der Nutzer im LanguageSwitcher die Sprache wechselt.
 */

import { useEffect } from "react";
import { defaultLocale, normalizeLocale, uiTranslations, type Locale } from "@/lib/i18n";

type AutoTranslateProps = {
  initialLocale: Locale;
};

const ATTRIBUTES = ["placeholder", "aria-label", "title"] as const;

/**
 * Dreht `uiTranslations` einmal um, damit man auch von Deutsch zurück auf
 * Englisch kommt. Brauchen wir, weil im DOM manchmal schon deutscher Text
 * steht (z.B. wenn React ein Re-Render macht und den Originaltext aus dem
 * JSX wieder reinschreibt) — um "Kurse entdecken" neu zu übersetzen,
 * müssen wir erstmal wissen, dass das die deutsche Version von "Browse
 * Courses" ist.
 */
function buildReverseDictionary() {
  const reverse: Record<string, string> = {};

  Object.values(uiTranslations).forEach((dictionary) => {
    Object.entries(dictionary).forEach(([english, translated]) => {
      reverse[translated] = english;
    });
  });

  return reverse;
}

const reverseDictionary = buildReverseDictionary();

/**
 * Übersetzt Texte mit Zahlen drin (z.B. "12 lessons completed"), die man
 * nicht einfach 1:1 im Wörterbuch nachschlagen kann, weil sich die Zahl
 * ja ständig ändert.
 *
 * Ist ehrlich gesagt ein bisschen ein Hack: Für jeden dynamischen Text in
 * der App haben wir hier von Hand ein Regex-Paar ergänzt (eine Richtung
 * für Deutsch, eine zurück). Wenn jemand einen neuen Text mit Zahl
 * einbaut, muss er nicht vergessen das hier nachzutragen — der Code
 * erinnert einen daran leider nicht.
 */
function translateDynamicText(text: string, locale: Locale) {
  if (locale === "de") {
    return text
      .replace(/^(\d+) courses found$/, "$1 Kurse gefunden")
      .replace(/^(\d+) lessons completed$/, "$1 Lektionen abgeschlossen")
      .replace(/^(\d+) modules - (\d+) lessons$/, "$1 Module - $2 Lektionen")
      .replace(/^(\d+) lessons$/, "$1 Lektionen")
      .replace(/^Lesson (\d+) of (\d+)$/, "Lektion $1 von $2")
      .replace(/^(\d+) open$/, "$1 offen")
      .replace(/^(\d+) of (\d+) completed$/, "$1 von $2 abgeschlossen")
      .replace(/^(\d+)% complete$/, "$1% abgeschlossen")
      .replace(/^(\d+) completed, (\d+) remaining$/, "$1 abgeschlossen, $2 übrig")
      .replace(/^Completed (\d+) lesson$/, "$1 Lektion abgeschlossen")
      .replace(/^Completed (\d+) lessons$/, "$1 Lektionen abgeschlossen")
      .replace(/^(\d+) active$/, "$1 aktiv")
      .replace(/^(\d+) total lessons$/, "$1 Lektionen insgesamt")
      .replace(/^(\d+) completed lessons, (\d+) still open\.$/, "$1 abgeschlossene Lektionen, $2 noch offen.")
      .replace(/^(\d+) minutes ago$/, "vor $1 Minuten")
      .replace(/^(\d+) hours ago$/, "vor $1 Stunden")
      .replace(/^(\d+) days ago$/, "vor $1 Tagen")
      .replace(/^(\d+) paid orders$/, "$1 bezahlte Bestellungen")
      .replace(/^(\d+) active enrollments$/, "$1 aktive Einschreibungen")
      .replace(/^(\d+) in draft$/, "$1 als Entwurf")
      .replace(/^(\d+) files in your library\.$/, "$1 Dateien in deiner Bibliothek.")
      .replace(/^(\d+) file in your library\.$/, "$1 Datei in deiner Bibliothek.");
  }

  return text
      .replace(/^(\d+) Kurse gefunden$/, "$1 courses found")
      .replace(/^(\d+) Lektionen abgeschlossen$/, "$1 lessons completed")
      .replace(/^(\d+) Module - (\d+) Lektionen$/, "$1 modules - $2 lessons")
      .replace(/^(\d+) Lektionen$/, "$1 lessons")
      .replace(/^Lektion (\d+) von (\d+)$/, "Lesson $1 of $2")
      .replace(/^(\d+) offen$/, "$1 open")
      .replace(/^(\d+) von (\d+) abgeschlossen$/, "$1 of $2 completed")
      .replace(/^(\d+)% abgeschlossen$/, "$1% complete")
      .replace(/^(\d+) abgeschlossen, (\d+) übrig$/, "$1 completed, $2 remaining")
      .replace(/^(\d+) Lektion abgeschlossen$/, "Completed $1 lesson")
      .replace(/^(\d+) Lektionen abgeschlossen$/, "Completed $1 lessons")
      .replace(/^(\d+) aktiv$/, "$1 active")
      .replace(/^(\d+) Lektionen insgesamt$/, "$1 total lessons")
      .replace(/^(\d+) abgeschlossene Lektionen, (\d+) noch offen\.$/, "$1 completed lessons, $2 still open.")
      .replace(/^vor (\d+) Minuten$/, "$1 minutes ago")
      .replace(/^vor (\d+) Stunden$/, "$1 hours ago")
      .replace(/^vor (\d+) Tagen$/, "$1 days ago")
      .replace(/^(\d+) bezahlte Bestellungen$/, "$1 paid orders")
      .replace(/^(\d+) aktive Einschreibungen$/, "$1 active enrollments")
      .replace(/^(\d+) als Entwurf$/, "$1 in draft")
      .replace(/^(\d+) Dateien in deiner Bibliothek\.$/, "$1 files in your library.")
      .replace(/^(\d+) Datei in deiner Bibliothek\.$/, "$1 file in your library.");
}

/**
 * Übersetzt ein einzelnes Stück Text. Holt sich bei Bedarf erst die
 * englische Quelle zurück (übers umgekehrte Wörterbuch), schaut dann im
 * normalen Wörterbuch nach, und falls das nichts findet, probiert es noch
 * {@link translateDynamicText} für Texte mit Zahlen.
 */
function translateValue(value: string, locale: Locale) {
  const source = reverseDictionary[value] ?? value;
  const direct = locale === defaultLocale ? source : uiTranslations[locale][source] ?? source;

  if (direct !== source || source !== value) {
    return direct;
  }

  return translateDynamicText(value, locale);
}

// Text-Nodes haben oft Leerzeichen/Zeilenumbrüche drumherum (kommt vom
// JSX), die wir beim Nachschlagen mit .trim() entfernen. Die hängen wir
// hier wieder an, sonst rutscht im DOM alles zusammen.
function preserveOuterWhitespace(original: string, translated: string) {
  const leading = original.match(/^\s*/)?.[0] ?? "";
  const trailing = original.match(/\s*$/)?.[0] ?? "";

  return `${leading}${translated}${trailing}`;
}

/** Diese Elemente fassen wir nicht an: Scripts, Styles, Code-Blöcke und alles mit `data-no-translate`. */
function shouldSkipElement(element: Element | null) {
  if (!element) return true;

  return Boolean(element.closest("script, style, textarea, code, pre, [data-no-translate]"));
}

/** Übersetzt einen einzelnen Text-Node, falls nötig. */
function translateTextNode(node: Text, locale: Locale) {
  if (shouldSkipElement(node.parentElement)) return;

  const raw = node.nodeValue ?? "";
  const trimmed = raw.trim();
  if (!trimmed) return;

  const translated = translateValue(trimmed, locale);
  if (translated !== trimmed) {
    node.nodeValue = preserveOuterWhitespace(raw, translated);
  }
}

/** Übersetzt die sichtbaren Attribute eines Elements (placeholder, aria-label, title). */
function translateElementAttributes(element: Element, locale: Locale) {
  if (shouldSkipElement(element)) return;

  ATTRIBUTES.forEach((attribute) => {
    const value = element.getAttribute(attribute);
    if (!value) return;

    const translated = translateValue(value, locale);
    if (translated !== value) {
      element.setAttribute(attribute, translated);
    }
  });
}

/** Geht `root` (und alles darin) durch und übersetzt jeden Text-Node und jedes relevante Attribut. */
function translateTree(root: ParentNode, locale: Locale) {
  if (root instanceof Element) {
    translateElementAttributes(root, locale);
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let current = walker.nextNode();

  while (current) {
    translateTextNode(current as Text, locale);
    current = walker.nextNode();
  }

  if ("querySelectorAll" in root) {
    root.querySelectorAll("*").forEach((element) => translateElementAttributes(element, locale));
  }
}

/**
 * Holt sich die bevorzugte Sprache des Nutzers aus dem localStorage, oder
 * falls da nichts steht aus dem `learnify-locale`-Cookie (das setzt der
 * LanguageSwitcher). localStorage kommt beim ersten Request vom Server ja
 * noch nicht mit, deswegen nutzt der Server für `initialLocale` nur das Cookie.
 */
function currentLocale() {
  const storedLocale = window.localStorage.getItem("learnify-locale") ?? undefined;
  const cookieLocale = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith("learnify-locale="))
    ?.split("=")[1];

  return normalizeLocale(storedLocale ?? cookieLocale);
}

/**
 * Startet die Übersetzung und hält sie am Laufen, solange die Seite offen
 * ist: erst einmal alles übersetzen, dann mit einem MutationObserver auch
 * neuen Inhalt erwischen (z.B. bei Routenwechseln), und außerdem auf
 * Sprachwechsel reagieren ohne dass die Seite neu geladen werden muss.
 */
export default function AutoTranslate({ initialLocale }: AutoTranslateProps) {
  useEffect(() => {
    let locale = normalizeLocale(initialLocale);
    const storedLocale = currentLocale();
    if (storedLocale !== locale) {
      locale = storedLocale;
    }

    document.documentElement.lang = locale;
    translateTree(document.body, locale);

    const observer = new MutationObserver((mutations) => {
      const activeLocale = currentLocale();
      document.documentElement.lang = activeLocale;

      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            translateTextNode(node as Text, activeLocale);
          }

          if (node.nodeType === Node.ELEMENT_NODE) {
            translateTree(node as Element, activeLocale);
          }
        });

        if (mutation.type === "characterData" && mutation.target.nodeType === Node.TEXT_NODE) {
          translateTextNode(mutation.target as Text, activeLocale);
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      characterData: true,
      subtree: true,
    });

    function handleLocaleChange() {
      const activeLocale = currentLocale();
      document.documentElement.lang = activeLocale;
      translateTree(document.body, activeLocale);
    }

    window.addEventListener("learnify:locale-change", handleLocaleChange);

    return () => {
      observer.disconnect();
      window.removeEventListener("learnify:locale-change", handleLocaleChange);
    };
  }, [initialLocale]);

  return null;
}
