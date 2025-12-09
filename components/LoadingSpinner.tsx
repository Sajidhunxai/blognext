"use client";

import { useTheme } from "@/contexts/ThemeContext";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  fullScreen?: boolean;
  text?: string;
  className?: string;
}

export default function LoadingSpinner({
  size = "md",
  fullScreen = false,
  text,
  className = "",
}: LoadingSpinnerProps) {
  const { colors } = useTheme();

  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-2",
    lg: "w-12 h-12 border-3",
    xl: "w-16 h-16 border-4",
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`${sizeClasses[size]} border-t-transparent border-r-transparent rounded-full animate-spin border-primary`}
      />
      {text && (
        <p className="text-sm font-medium text-theme-text text-theme-text ">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-theme-background/90">
        {spinner}
      </div>
    );
  }

  return spinner;
}

