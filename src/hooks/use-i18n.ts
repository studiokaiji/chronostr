import { en, ja, type Translations } from "@/locales";
import { useCallback, useSyncExternalStore } from "react";

type Locale = "en" | "ja";

const translations: Record<Locale, Translations> = { en, ja };

const getSystemLocale = (): Locale => {
  const lang = navigator.language.split("-")[0];
  return lang === "ja" ? "ja" : "en";
};

const STORAGE_KEY = "chronostr-locale";

let currentLocale: Locale =
  (localStorage.getItem(STORAGE_KEY) as Locale) || getSystemLocale();

const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => currentLocale;

const setLocale = (locale: Locale) => {
  currentLocale = locale;
  localStorage.setItem(STORAGE_KEY, locale);
  for (const listener of listeners) {
    listener();
  }
};

export const useI18n = () => {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const t = translations[locale];

  const changeLocale = useCallback((newLocale: Locale) => {
    setLocale(newLocale);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(currentLocale === "en" ? "ja" : "en");
  }, []);

  return { t, locale, changeLocale, toggleLocale };
};
