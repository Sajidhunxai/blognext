/**
 * Multi-language configuration
 * English: no URL prefix (/)
 * Urdu: /ur
 * Hindi: /hi (ISO 639-1; use "hr" in locales array if you prefer)
 */

export const locales = ["en", "ur", "hi"] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: "English",
  ur: "اردو",
  hi: "हिन्दी",
};

/** Locales that use URL prefix (non-English) */
export const prefixedLocales = locales.filter((l) => l !== "en");

/** Check if a segment is a locale prefix (ur or hi only) */
export function isLocalePrefix(segment: string): segment is "ur" | "hi" {
  return segment === "ur" || segment === "hi";
}

/** Default locale (no prefix in URL) */
export const defaultLocale: Locale = "en";

/** Get locale from pathname: /ur/post/x -> ur, /post/x -> en */
export function getLocaleFromPath(pathname: string): Locale {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  if (first && isLocalePrefix(first)) return first as Locale;
  return defaultLocale;
}

/** Path without locale prefix: /ur/post/x -> /post/x */
export function getPathWithoutLocale(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length && isLocalePrefix(segments[0])) {
    return "/" + segments.slice(1).join("/");
  }
  return pathname || "/";
}

/** Add locale prefix: /post/x + ur -> /ur/post/x, en -> /post/x */
export function addLocalePrefix(path: string, locale: Locale): string {
  if (locale === defaultLocale) return path;
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${clean}`;
}

/** HTML lang attribute */
export const htmlLang: Record<Locale, string> = {
  en: "en",
  ur: "ur",
  hi: "hi",
};
