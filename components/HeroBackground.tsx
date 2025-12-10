"use client";

import { useEffect } from "react";

interface HeroBackgroundProps {
  backgroundImage?: string | null;
  children: React.ReactNode;
}

export default function HeroBackground({ backgroundImage, children }: HeroBackgroundProps) {
  useEffect(() => {
    // Preload hero background image for LCP optimization
    if (backgroundImage && typeof window !== "undefined") {
      // Check if link already exists
      const existingLink = document.querySelector(`link[href="${backgroundImage}"]`);
      if (!existingLink) {
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "image";
        link.href = backgroundImage;
        link.setAttribute("fetchpriority", "high");
        // Insert at the beginning of head for early loading
        document.head.insertBefore(link, document.head.firstChild);
      }
    }
  }, [backgroundImage]);

  return (
    <section
      className="relative py-20 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundImage: backgroundImage
          ? `url(${backgroundImage})`
          : "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {children}
    </section>
  );
}

