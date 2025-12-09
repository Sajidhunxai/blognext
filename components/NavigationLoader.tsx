"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";

export default function NavigationLoader() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const { colors } = useTheme();

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 200);

    return () => {
      clearTimeout(timer);
      setLoading(false);
    };
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-primary/20">
      <div
        className="h-full bg-primary"
        style={{
          width: "30%",
          animation: "loading-bar 1s ease-in-out infinite",
        }}
      />
      <style jsx>{`
        @keyframes loading-bar {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(300%);
          }
          100% {
            transform: translateX(500%);
          }
        }
      `}</style>
    </div>
  );
}

