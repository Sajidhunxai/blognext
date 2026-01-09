"use client";

import { useEffect, useState } from "react";

interface NotFoundAnimationProps {
  colors: {
    primary: string;
    secondary: string;
    error: string;
  };
}

export default function NotFoundAnimation({ colors }: NotFoundAnimationProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative">
      {/* Main 404 Text with Glow Effect */}
      <h1 
        className={`text-9xl sm:text-[12rem] font-bold select-none relative z-10 ${mounted ? 'animate-float-404 animate-pulse-glow' : ''}`}
        style={{ 
          color: colors.primary,
          opacity: 0.2,
        }}
      >
        404
      </h1>

      {/* Animated Glow Effect */}
      <div
        className={`absolute inset-0 flex items-center justify-center ${mounted ? 'animate-pulse-glow' : ''}`}
      >
        <h1 
          className="text-9xl sm:text-[12rem] font-bold select-none blur-xl"
          style={{ 
            color: colors.primary,
            opacity: 0.3,
          }}
        >
          404
        </h1>
      </div>

      {/* Floating Particles */}
      {mounted && (
        <>
          <div
            className="absolute top-0 left-1/4 w-2 h-2 rounded-full animate-float-particle"
            style={{
              backgroundColor: colors.primary,
              animationDelay: "0s",
            }}
          />
          <div
            className="absolute top-1/4 right-1/4 w-3 h-3 rounded-full animate-float-particle"
            style={{
              backgroundColor: colors.secondary,
              animationDelay: "1s",
            }}
          />
          <div
            className="absolute bottom-0 left-1/2 w-2 h-2 rounded-full animate-float-particle"
            style={{
              backgroundColor: colors.error,
              animationDelay: "2s",
            }}
          />
          <div
            className="absolute top-1/2 right-0 w-2.5 h-2.5 rounded-full animate-float-particle"
            style={{
              backgroundColor: colors.primary,
              animationDelay: "0.5s",
            }}
          />
        </>
      )}
    </div>
  );
}
