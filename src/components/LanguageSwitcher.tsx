"use client";

import { useState } from "react";
import { languageNames, locales, normalizeLocale, type Locale } from "@/lib/i18n";

type LanguageSwitcherProps = {
  initialLocale: Locale;
};

export default function LanguageSwitcher({ initialLocale }: LanguageSwitcherProps) {
  const [locale, setLocale] = useState(initialLocale);

  function handleChange(nextLocale: Locale) {
    setLocale(nextLocale);
    document.cookie = `learnify-locale=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    window.localStorage.setItem("learnify-locale", nextLocale);
    window.dispatchEvent(new Event("learnify:locale-change"));
  }

  return (
    <label className="flex items-center gap-2 text-xs font-semibold text-gray-600">
      <span className="hidden sm:inline">Language</span>
      <select
        aria-label="Language"
        value={locale}
        onChange={(event) => handleChange(normalizeLocale(event.target.value))}
        className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs font-semibold text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        {locales.map((entry) => (
          <option key={entry} value={entry}>
            {languageNames[entry]}
          </option>
        ))}
      </select>
    </label>
  );
}
