"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { locales, localeNames, getPathWithoutLocale, addLocalePrefix, type Locale } from "@/lib/i18n/config";
import { Globe } from "lucide-react";

interface LanguageSwitcherProps {
  currentLocale: Locale;
  className?: string;
  variant?: "compact" | "dropdown";
}

export default function LanguageSwitcher({
  currentLocale,
  className = "",
  variant = "compact",
}: LanguageSwitcherProps) {
  const pathname = usePathname();
  const pathWithoutLocale = getPathWithoutLocale(pathname || "/");

  if (variant === "dropdown") {
    return (
      <div className={`relative group ${className}`}>
        <button
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          aria-haspopup="true"
          aria-expanded="false"
          aria-label="Change language"
        >
          <Globe className="w-4 h-4" />
          <span className="text-sm font-medium hidden sm:inline">{localeNames[currentLocale]}</span>
          <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div className="absolute right-0 top-full mt-1 py-2 w-40 rounded-lg bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
          {locales.map((locale) => {
            const href = addLocalePrefix(pathWithoutLocale, locale);
            const isActive = locale === currentLocale;
            return (
              <Link
                key={locale}
                href={href}
                className={`block px-4 py-2 text-sm transition ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {localeNames[locale]}
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  // Compact: inline links
  return (
    <div className={`flex items-center gap-1 ${className}`} role="navigation" aria-label="Language selection">
      {locales.map((locale) => {
        const href = addLocalePrefix(pathWithoutLocale, locale);
        const isActive = locale === currentLocale;
        return (
          <Link
            key={locale}
            href={href}
            className={`px-2.5 py-1 text-sm rounded transition ${
              isActive
                ? "font-semibold text-primary bg-primary/10"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            {localeNames[locale]}
          </Link>
        );
      })}
    </div>
  );
}
