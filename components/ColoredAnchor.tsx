"use client";

import { useTheme } from "@/contexts/ThemeContext";

interface ColoredAnchorProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  defaultColor?: string;
  hoverColor?: string;
  target?: string;
  rel?: string;
}

export default function ColoredAnchor({ 
  href, 
  children, 
  className = "",
  defaultColor,
  hoverColor,
  target,
  rel
}: ColoredAnchorProps) {
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

  const defaultTextColor = defaultColor || (colors.text === "#ffffff" ? "#6b7280" : "#6b7280");
  const hoverTextColor = hoverColor || colors.text;

  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className={`transition ${className}`}
      style={{ color: defaultTextColor }}
      onMouseEnter={(e) => e.currentTarget.style.color = hoverTextColor}
      onMouseLeave={(e) => e.currentTarget.style.color = defaultTextColor}
    >
      {children}
    </a>
  );
}

