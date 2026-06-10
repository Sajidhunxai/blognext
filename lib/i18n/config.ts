/**
 * Single-language configuration — English only.
 * Urdu (/ur) and Hindi (/hi) URL variants were removed because they served
 * identical English content, causing duplicate content issues and wasted crawl budget.
 * The middleware 301-redirects any legacy /ur/* and /hi/* URLs to their English equivalents.
 */

export const locales = ["en"] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: "English",
};

export const prefixedLocales: string[] = [];

export function isLocalePrefix(segment: string): boolean {
  return false;
}

export const defaultLocale: Locale = "en";

export function getLocaleFromPath(_pathname: string): Locale {
  return "en";
}

export function getPathWithoutLocale(pathname: string): string {
  // Strip legacy /ur or /hi prefix if still present in any stored URL
  const m = pathname.match(/^\/(ur|hi)(\/.*)?$/);
  if (m) return m[2] || "/";
  return pathname || "/";
}

export function addLocalePrefix(path: string, _locale: Locale): string {
  return path;
}

export const htmlLang: Record<Locale, string> = {
  en: "en",
};
