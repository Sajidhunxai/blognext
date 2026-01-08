"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface LogoProps {
  lightLogo: string;
  darkLogo?: string | null;
  siteName: string;
  height?: number;
  width?: number;
  className?: string;
}

export default function Logo({ 
  lightLogo, 
  darkLogo, 
  siteName,
  height = 48,
  width = 160,
  className = "rounded"
}: LogoProps) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check initial theme
    const checkTheme = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      setIsDark(isDarkMode);
    };
    
    checkTheme();

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // Show light logo during SSR and initial render
  if (!mounted) {
    return (
      <Image
        src={lightLogo}
        alt={siteName}
        height={height}
        width={width}
        className={className}
      />
    );
  }

  // Show appropriate logo based on theme
  const logoSrc = isDark && darkLogo ? darkLogo : lightLogo;
  
  return (
    <Image
      src={logoSrc}
      alt={siteName}
      height={height}
      width={width}
      className={className}
      key={logoSrc} // Force re-render when logo changes
    />
  );
}

