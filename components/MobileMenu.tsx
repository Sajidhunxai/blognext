"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import { X, Home, LayoutDashboard } from "lucide-react";
import { getTranslation } from "@/lib/i18n/translations";
import { locales, localeNames, getPathWithoutLocale, addLocalePrefix, type Locale } from "@/lib/i18n/config";

interface MenuItem {
  label: string;
  url: string;
}

interface MobileMenuProps {
  menuItems: MenuItem[];
  showDashboard?: boolean;
  locale?: Locale;
}

const defaultColors = {
  primary: "#dc2626",
  secondary: "#16a34a",
  background: "#111827",
  text: "#ffffff",
  button: "#dc2626",
  link: "#3b82f6",
  success: "#16a34a",
  error: "#dc2626",
  warning: "#f59e0b",
  info: "#3b82f6",
};

export default function MobileMenu({ menuItems, showDashboard = false, locale = "en" }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const pathWithoutLocale = getPathWithoutLocale(pathname || "/");
  let colors = defaultColors;
  
  try {
    const theme = useTheme();
    if (theme?.colors) {
      colors = theme.colors;
    }
  } catch (error) {
    // Context not available, use defaults
  }

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      <button
        className="md:hidden p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition focus:outline-none focus:ring-2 focus:ring-offset-2 text-gray-700 dark:text-gray-300 relative"
        style={{ 
          '--tw-ring-color': colors.primary
        } as React.CSSProperties}
        aria-label="Toggle menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Fullscreen Menu Overlay */}
      <div
        className={`fixed inset-0 z-[100] md:hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        style={{ backgroundColor: colors.background }}
      >
        {/* Close Button */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => setIsOpen(false)}
            className="p-3 rounded-full transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ 
              backgroundColor: colors.primary + '20',
              color: colors.text,
              '--tw-ring-color': colors.primary
            } as React.CSSProperties}
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Menu Content */}
        <nav className="flex flex-col h-full justify-start items-center px-6 py-20">
          {/* Language switcher */}
          <div className="flex gap-2 mb-6">
            {locales.map((loc) => {
              const href = addLocalePrefix(pathWithoutLocale, loc);
              const isActive = loc === locale;
              return (
                <Link
                  key={loc}
                  href={href}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    isActive ? "bg-primary text-white" : "bg-white/10 hover:bg-white/20"
                  }`}
                  style={{ color: isActive ? undefined : colors.text }}
                >
                  {localeNames[loc]}
                </Link>
              );
            })}
          </div>
          <div className="w-full max-w-md space-y-3">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.url}
                className={`group flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                  index === 0 ? 'shadow-lg' : ''
                }`}
                style={{ 
                  backgroundColor: index === 0 
                    ? colors.primary 
                    : colors.primary + '15',
                  color: colors.text,
                  border: `1px solid ${index === 0 ? colors.primary : colors.primary + '30'}`
                }}
                onClick={() => setIsOpen(false)}
              >
                {index === 0 ? (
                  <Home className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.text }} />
                  </div>
                )}
                <span className="text-lg font-semibold">{item.label}</span>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
            
            {showDashboard && (
              <Link
                href="/dashboard"
                className="group flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 mt-4"
                style={{ 
                  backgroundColor: colors.secondary + '20',
                  color: colors.text,
                  border: `1px solid ${colors.secondary + '40'}`
                }}
                onClick={() => setIsOpen(false)}
              >
                <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
                <span className="text-lg font-semibold">{getTranslation(locale, "dashboard")}</span>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}

