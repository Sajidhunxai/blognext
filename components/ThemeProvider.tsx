"use client";

import { createContext, useContext, ReactNode } from "react";
 
interface ThemeColors {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  linkColor: string;
  successColor: string;
  errorColor: string;
  warningColor: string;
  infoColor: string;
}

const defaultColors: ThemeColors = {
  primaryColor: "#dc2626",
  secondaryColor: "#16a34a",
  backgroundColor: "#111827",
  textColor: "#ffffff",
  buttonColor: "#dc2626",
  linkColor: "#3b82f6",
  successColor: "#16a34a",
  errorColor: "#dc2626",
  warningColor: "#f59e0b",
  infoColor: "#3b82f6",
};

const ThemeContext = createContext<ThemeColors>(defaultColors);

export function ThemeProvider({
  children,
  colors,
}: {
  children: ReactNode;
  colors: Partial<ThemeColors>;
}) {
  const themeColors = { ...defaultColors, ...colors };

  return (
    <ThemeContext.Provider value={themeColors}>
      <style jsx global>{`
        :root {
          --color-primary: ${themeColors.primaryColor};
          --color-secondary: ${themeColors.secondaryColor};
          --color-background: ${themeColors.backgroundColor};
          --color-text: ${themeColors.textColor};
          --color-button: ${themeColors.buttonColor};
          --color-link: ${themeColors.linkColor};
          --color-success: ${themeColors.successColor};
          --color-error: ${themeColors.errorColor};
          --color-warning: ${themeColors.warningColor};
          --color-info: ${themeColors.infoColor};
        }
      `}</style>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

