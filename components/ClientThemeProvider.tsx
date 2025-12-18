"use client";

import { ThemeProvider } from "@/contexts/ThemeContext";

export default function ClientThemeProvider({
  children,
  initialColors,
}: {
  children: React.ReactNode;
  initialColors?: {
    primary?: string;
    secondary?: string;
    background?: string;
    text?: string;
    button?: string;
    link?: string;
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
    darkModeBackground?: string;
    darkModeText?: string;
  };
}) {
  return <ThemeProvider initialColors={initialColors}>{children}</ThemeProvider>;
}

