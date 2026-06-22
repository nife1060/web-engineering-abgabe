"use client";

import { useEffect } from "react";
import { defaultLocale, normalizeLocale, uiTranslations, type Locale } from "@/lib/i18n";

type AutoTranslateProps = {
  initialLocale: Locale;
};

const ATTRIBUTES = ["placeholder", "aria-label", "title"] as const;

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

function translateValue(value: string, locale: Locale) {
  const source = reverseDictionary[value] ?? value;
  const direct = locale === defaultLocale ? source : uiTranslations[locale][source] ?? source;

  if (direct !== source || source !== value) {
    return direct;
  }

  return translateDynamicText(value, locale);
}

function preserveOuterWhitespace(original: string, translated: string) {
  const leading = original.match(/^\s*/)?.[0] ?? "";
  const trailing = original.match(/\s*$/)?.[0] ?? "";

  return `${leading}${translated}${trailing}`;
}

function shouldSkipElement(element: Element | null) {
  if (!element) return true;

  return Boolean(element.closest("script, style, textarea, code, pre, [data-no-translate]"));
}

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

function currentLocale() {
  const storedLocale = window.localStorage.getItem("learnify-locale") ?? undefined;
  const cookieLocale = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith("learnify-locale="))
    ?.split("=")[1];

  return normalizeLocale(storedLocale ?? cookieLocale);
}

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
