"use client";

import React, { createContext, useContext, ReactNode, useEffect, useState } from "react";

interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  button: string;
  buttonText: string;
  link: string;
  success: string;
  error: string;
  warning: string;
  info: string;
  darkModeBackground: string;
  darkModeText: string;
}

interface ThemeContextType {
  colors: ThemeColors;
  updateColors: (newColors: Partial<ThemeColors>) => void;
  loading: boolean;
}

const defaultColors: ThemeColors = {
  primary: "#dc2626",
  secondary: "#16a34a",
  background: "#111827",
  text: "#ffffff",
  button: "#dc2626",
  buttonText: "#ffffff",
  link: "#3b82f6",
  success: "#16a34a",
  error: "#dc2626",
  warning: "#f59e0b",
  info: "#3b82f6",
  darkModeBackground: "#0a0a0a",
  darkModeText: "#ededed",
};

const ThemeContext = createContext<ThemeContextType>({
  colors: defaultColors,
  updateColors: () => {},
  loading: true,
});

// Helper function to convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 220, g: 38, b: 38 }; // Default red fallback
}

export function ThemeProvider({ children, initialColors }: { children: ReactNode; initialColors?: Partial<ThemeColors> }) {
  const [colors, setColors] = useState<ThemeColors>({ ...defaultColors, ...initialColors });
  const [loading, setLoading] = useState(false);

  // Colors are now passed from Server Component, no client-side fetch needed
  useEffect(() => {
    if (initialColors) {
      setColors((prev) => ({ ...prev, ...initialColors }));
    }
  }, [initialColors]);

  const updateColors = (newColors: Partial<ThemeColors>) => {
    setColors((prev) => ({ ...prev, ...newColors }));
  };

  const primaryRgb = hexToRgb(colors.primary);

  return (
    <ThemeContext.Provider value={{ colors, updateColors, loading }}>
      <style jsx global>{`
        :root {
          --color-primary: ${colors.primary};
          --color-secondary: ${colors.secondary};
          --color-background: ${colors.background};
          --color-text: ${colors.text};
          --color-button: ${colors.button};
          --color-button-text: ${colors.buttonText};
          --color-link: ${colors.link};
          --color-success: ${colors.success};
          --color-error: ${colors.error};
          --color-warning: ${colors.warning};
          --color-info: ${colors.info};
          --input-text-color: #000000;
        }
        
        .dark {
          --color-dark-background: ${colors.darkModeBackground};
          --color-dark-text: ${colors.darkModeText};
        }
        
        /* Convert hex to RGB for rgba usage */
        :root {
          --color-primary-r: ${primaryRgb.r};
          --color-primary-g: ${primaryRgb.g};
          --color-primary-b: ${primaryRgb.b};
        }
        input[type="text"],
        input[type="email"],
        input[type="url"],
        input[type="password"],
        input[type="number"],
        input[type="search"],
        input[type="tel"],
        textarea,
        select {
          color: var(--input-text-color) !important;
        }
      `}</style>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  try {
    const context = useContext(ThemeContext);
    if (!context) {
      return {
        colors: defaultColors,
        updateColors: () => {},
        loading: false,
      };
    }
    return context;
  } catch (error) {
    // Fallback if context is not available
    return {
      colors: defaultColors,
      updateColors: () => {},
      loading: false,
    };
  }
}

