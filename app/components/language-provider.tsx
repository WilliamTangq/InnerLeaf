"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  languages,
  normalizeLanguage,
  translations,
  type Language,
} from "../lib/i18n";

const storageKey = "innerleaf_language";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (typeof translations)[Language];
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    window.setTimeout(() => {
      setLanguageState(normalizeLanguage(stored));
    }, 0);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-Hans" : "en";
    window.localStorage.setItem(storageKey, language);
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage: setLanguageState,
      t: translations[language],
    }),
    [language]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const value = useContext(LanguageContext);

  if (!value) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return value;
}

export function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={[
        "inline-flex shrink-0 rounded-full border border-[var(--border)] bg-[var(--surface)]",
        compact ? "p-0.5" : "p-1",
      ].join(" ")}
      aria-label="Language"
    >
      {languages.map((item) => {
        const active = language === item.value;

        return (
          <button
            key={item.value}
            type="button"
            onClick={() => setLanguage(item.value)}
            aria-pressed={active}
            className={[
              "rounded-full text-xs font-medium transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-ring)]",
              compact ? "min-w-8 px-1.5 py-1 text-[11px] sm:min-w-0 sm:px-2 sm:text-xs" : "px-3 py-1.5",
              active
                ? "bg-[var(--accent-soft)] text-[var(--brand-teal-deep)]"
                : "text-[var(--foreground-subtle)] hover:text-[var(--foreground)]",
            ].join(" ")}
          >
            {compact ? (
              <>
                <span className="sm:hidden">{item.shortLabel}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </>
            ) : (
              item.label
            )}
          </button>
        );
      })}
    </div>
  );
}
