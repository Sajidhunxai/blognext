"use client";

import { useState, useEffect, useCallback } from "react";

interface Settings {
  id: string;
  siteName: string;
  logo: string | null;
  favicon: string | null;
  headerMenu: any;
  footerLinks: any;
  socialMedia: any;
  heroTitle: string | null;
  heroSubtitle: string | null;
  heroBackground: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  whyChooseTitle: string | null;
  whyChooseSubtitle: string | null;
  whyChooseFeatures: any;
  enableComments: boolean;
  primaryColor: string | null;
  secondaryColor: string | null;
  backgroundColor: string | null;
  textColor: string | null;
  buttonColor: string | null;
  buttonTextColor: string | null;
  linkColor: string | null;
  successColor: string | null;
  errorColor: string | null;
  warningColor: string | null;
  infoColor: string | null;
  darkModeBackgroundColor: string | null;
  darkModeTextColor: string | null;
  headerScript: string | null;
  footerScript: string | null;
  headerCSS: string | null;
  footerCSS: string | null;
  updatedAt: string;
}

const STORAGE_KEY = "app_settings";
const STORAGE_VERSION_KEY = "app_settings_version";

// Default settings fallback
const defaultSettings: Settings = {
  id: "",
  siteName: "App Marka",
  logo: "https://res.cloudinary.com/dogyqmaev/image/upload/v1766218941/apkapp/tckns1cbre8cntlqipzc.png",
  favicon: "https://res.cloudinary.com/dogyqmaev/image/upload/v1766218951/apkapp/awtdtxtoqrtho7b68ez3.png",
  headerMenu: ["Home", "Apps", "Games"],
  footerLinks: [],
  socialMedia: {
    facebook: "",
    twitter: "",
    instagram: "",
    youtube: "",
    pinterest: "",
    telegram: "",
  },
  heroTitle: "Apps, APKs & Alternative App Reviews",
  heroSubtitle: "Your trusted source for alternative apps, APK downloads & app reviews",
  heroBackground: "https://res.cloudinary.com/dogyqmaev/image/upload/v1766219090/apkapp/wogljnipr5b0jjcwinzd.jpg",
  metaTitle: "AppMarka | Apps, APKs & Alternative App Reviews",
  metaDescription: "AppMarka | Apps, APKs & Alternative App Reviews. Discover, download, and explore the latest Android apps and games. Free, safe, and always up-to-date.",
  whyChooseTitle: "Why Choose Appmarka?",
  whyChooseSubtitle: "Your trusted platform for app discovery, reviews, and tech insights beyond the Play Store",
  whyChooseFeatures: null,
  enableComments: true,
  primaryColor: "#5170ff",
  secondaryColor: "#5c76ef",
  backgroundColor: "#faf9f9",
  textColor: "#1a1a1a",
  buttonColor: "#5c76ef",
  buttonTextColor: "#ffffff",
  linkColor: "#2341c7",
  successColor: "#16a34a",
  errorColor: "#dc2626",
  warningColor: "#f59e0b",
  infoColor: "#3b82f6",
  darkModeBackgroundColor: "#272626",
  darkModeTextColor: "#ededed",
  headerScript: null,
  footerScript: null,
  headerCSS: null,
  footerCSS: null,
  updatedAt: new Date().toISOString(),
};

function getCachedSettings(): Settings | null {
  if (typeof window === "undefined") return null;

  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    
    if (!cached) {
      return null;
    }

    const settings = JSON.parse(cached) as Settings;
    
    // Validate that we have a valid settings object (check for siteName instead of id)
    if (!settings || typeof settings !== 'object' || !settings.siteName) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_VERSION_KEY);
      return null;
    }

    return settings;
  } catch (error) {
    console.error("Error reading settings from localStorage:", error);
    // Clear corrupted cache
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_VERSION_KEY);
    return null;
  }
}

function setCachedSettings(settings: Settings): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    // Store the updatedAt timestamp as version to detect changes
    localStorage.setItem(STORAGE_VERSION_KEY, settings.updatedAt || Date.now().toString());
  } catch (error) {
    console.error("Error saving settings to localStorage:", error);
    // If storage is full, try to clear old data
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      localStorage.setItem(STORAGE_VERSION_KEY, settings.updatedAt || Date.now().toString());
    } catch (retryError) {
      console.error("Error retrying save to localStorage:", retryError);
    }
  }
}

function clearCachedSettings(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_VERSION_KEY);
  } catch (error) {
    console.error("Error clearing settings from localStorage:", error);
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async (forceRefresh = false) => {
    // Always check cache first unless forced refresh
    if (!forceRefresh) {
      const cached = getCachedSettings();
      if (cached) {
        setSettings(cached);
        setLoading(false);
        // Return cached settings immediately - no API call needed
        return cached;
      }
    }

    // Only fetch from API if cache is missing or force refresh is requested
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/settings", {
        // Add cache control to prevent unnecessary requests
        cache: 'no-store',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch settings: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Validate response structure
      if (!data || typeof data !== 'object') {
        throw new Error("Invalid settings response format");
      }
      
      const fetchedSettings = data as Settings;
      
      // Validate that we have required fields
      if (!fetchedSettings.siteName) {
        throw new Error("Settings response missing required fields");
      }
      
      // Always cache the settings for future use
      setCachedSettings(fetchedSettings);
      setSettings(fetchedSettings);
      
      return fetchedSettings;
    } catch (err: any) {
      console.error("Error fetching settings:", err);
      setError(err.message || "Failed to fetch settings");
      
      // Fallback to cached settings if available (even if we tried to refresh)
      const cached = getCachedSettings();
      if (cached) {
        setSettings(cached);
      } else {
        // Use defaults as last resort
        setSettings(defaultSettings);
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshSettings = useCallback(() => {
    clearCachedSettings();
    return fetchSettings(true);
  }, [fetchSettings]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings: settings || defaultSettings,
    loading,
    error,
    refreshSettings,
    clearCache: clearCachedSettings,
  };
}

