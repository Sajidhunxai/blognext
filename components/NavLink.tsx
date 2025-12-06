"use client";

import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
  className?: string;
}

export default function NavLink({ href, children, isActive = false, className = "" }: NavLinkProps) {
  let colors = {
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

  try {
    const theme = useTheme();
    if (theme?.colors) {
      colors = theme.colors;
    }
  } catch (error) {
    // Context not available, use defaults
  }

  if (isActive) {
    return (
      <Link
        href={href}
        className={`px-4 py-2 rounded-full text-sm font-medium transition ${className}`}
        style={{ backgroundColor: colors.primary, color: colors.text }}
      >
        {children}
      </Link>
    );
  }

  const defaultColor = colors.text === "#ffffff" ? "#d1d5db" : "#6b7280";

  return (
    <Link
      href={href}
      className={`px-4 py-2 rounded-full text-sm font-medium transition ${className}`}
      style={{ color: defaultColor }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = colors.text;
        e.currentTarget.style.backgroundColor = colors.primary + "40";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = defaultColor;
        e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      {children}
    </Link>
  );
}

