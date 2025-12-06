"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";

interface MenuItem {
  label: string;
  url: string;
}

interface MobileMenuProps {
  menuItems: MenuItem[];
  showDashboard?: boolean;
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

export default function MobileMenu({ menuItems, showDashboard = false }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  let colors = defaultColors;
  
  try {
    const theme = useTheme();
    if (theme?.colors) {
      colors = theme.colors;
    }
  } catch (error) {
    // Context not available, use defaults
  }

  return (
    <>
      <button
        className="md:hidden p-2 rounded-lg hover:bg-black/10 transition focus:outline-none focus:ring-2 focus:ring-offset-2"
        style={{ 
          color: colors.text,
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

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
          <nav 
            className="fixed top-16 left-0 right-0 z-50 md:hidden shadow-lg"
            style={{ backgroundColor: colors.background }}
          >
            <div className="px-4 py-4 space-y-2">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.url}
                  className="block px-4 py-3 rounded-lg transition hover:opacity-80"
                  style={{ 
                    backgroundColor: index === 0 ? colors.primary + "40" : "transparent",
                    color: colors.text
                  }}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {showDashboard && (
                <Link
                  href="/dashboard"
                  className="block px-4 py-3 rounded-lg transition hover:opacity-80"
                  style={{ color: colors.text }}
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
              )}
            </div>
          </nav>
        </>
      )}
    </>
  );
}

