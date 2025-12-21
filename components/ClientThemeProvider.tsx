"use client";

import { useEffect, useState } from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useSettings } from "@/hooks/useSettings";

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
  const [cacheInitialized, setCacheInitialized] = useState(false);
  
  // Initialize settings cache in localStorage
  // This will fetch settings on first load and cache them for future use
  const { settings, loading, error } = useSettings();

  // Direct cache initialization as fallback
  useEffect(() => {
    if (typeof window === "undefined" || cacheInitialized) return;
    
    // Check if cache already exists
    const existingCache = localStorage.getItem("app_settings");
    if (existingCache) {
      setCacheInitialized(true);
      return;
    }
    
    // If no cache and hook hasn't loaded yet, fetch directly
    if (!settings || loading) {
      fetch("/api/settings")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch");
          return res.json();
        })
        .then((data) => {
          if (data && data.siteName) {
            localStorage.setItem("app_settings", JSON.stringify(data));
            if (data.updatedAt) {
              localStorage.setItem("app_settings_version", data.updatedAt);
            }
            setCacheInitialized(true);
          }
        })
        .catch((err) => {
          console.error("Failed to initialize settings cache:", err);
        });
    } else if (settings) {
      // Settings loaded from hook, ensure they're cached
      try {
        localStorage.setItem("app_settings", JSON.stringify(settings));
        if (settings.updatedAt) {
          localStorage.setItem("app_settings_version", settings.updatedAt);
        }
        setCacheInitialized(true);
      } catch (err) {
        console.error("Failed to cache settings:", err);
      }
    }
  }, [settings, loading, cacheInitialized]);

  return <ThemeProvider initialColors={initialColors}>{children}</ThemeProvider>;
}

