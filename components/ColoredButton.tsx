"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { ReactNode } from "react";

interface ColoredButtonProps {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
  color?: "primary" | "secondary" | "button" | "success" | "error" | "warning" | "info";
}

export default function ColoredButton({
  children,
  onClick,
  href,
  type = "button",
  disabled = false,
  className = "",
  color = "button",
}: ColoredButtonProps) {
  const { colors } = useTheme();
  
  const colorMap = {
    primary: colors.primary,
    secondary: colors.secondary,
    button: colors.button,
    success: colors.success,
    error: colors.error,
    warning: colors.warning,
    info: colors.info,
  };

  const baseClasses = "px-6 py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed";
  
  // Use CSS classes for primary buttons, inline styles for other colors
  if (color === "button" || color === "primary") {
    return (
      <>
        {href ? (
          <a
            href={href}
            className={`bg-button text-button hover:bg-secondary ${baseClasses} ${className}`}
          >
            {children}
          </a>
        ) : (
          <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`bg-button text-button hover:bg-secondary ${baseClasses} ${className}`}
          >
            {children}
          </button>
        )}
      </>
    );
  }
  
  const style = {
    backgroundColor: colorMap[color],
    color: colors.buttonText,
  };

  if (href) {
    return (
      <a
        href={href}
        className={`${baseClasses} ${className}`}
        style={style}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${className}`}
      style={style}
    >
      {children}
    </button>
  );
}

