"use client";

import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import { useEffect, useState } from "react";

interface ColoredLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  defaultColor?: string;
  hoverColor?: string;
}

export default function ColoredLink({ 
  href, 
  children, 
  className = "",
  defaultColor,
  hoverColor
}: ColoredLinkProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    return () => observer.disconnect();
  }, []);

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

  // Adjust colors for dark mode if not explicitly provided
  const getDefaultColor = () => {
    if (defaultColor) return defaultColor;
    if (isDark) {
      return colors.text === "#ffffff" ? "#9ca3af" : "#6b7280";
    }
    return colors.text === "#ffffff" ? "#6b7280" : "#6b7280";
  };

  const getHoverColor = () => {
    if (hoverColor) return hoverColor;
    if (isDark) {
      return colors.text === "#ffffff" ? "#ffffff" : "#111827";
    }
    return colors.text === "#ffffff" ? "#111827" : colors.text;
  };

  const defaultTextColor = getDefaultColor();
  const hoverTextColor = getHoverColor();

  return (
    <Link
      href={href}
      className={`transition ${className}`}
      style={{ 
        color: defaultTextColor,
        "--hover-color": hoverTextColor,
      } as React.CSSProperties & { "--hover-color": string }}
      onMouseEnter={(e) => e.currentTarget.style.color = hoverTextColor}
      onMouseLeave={(e) => e.currentTarget.style.color = defaultTextColor}
    >
      {children}
    </Link>
  );
}
