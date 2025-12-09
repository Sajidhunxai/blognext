"use client";

import Image from "next/image";
import { useMemo } from "react";

interface SmartImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
}

// List of configured hostnames in next.config.js
const CONFIGURED_HOSTNAMES = [
  'res.cloudinary.com',
  // Add other configured hostnames here
];

export default function SmartImage({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  quality = 90,
  sizes,
}: SmartImageProps) {
  const isConfiguredDomain = useMemo(() => {
    try {
      const url = new URL(src);
      return CONFIGURED_HOSTNAMES.includes(url.hostname);
    } catch {
      // If URL parsing fails, assume it's a relative path (configured)
      return true;
    }
  }, [src]);

  // Use Next.js Image for configured domains or relative paths
  if (isConfiguredDomain && width && height) {
    return (
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        priority={priority}
        quality={quality}
        sizes={sizes}
      />
    );
  }

  // Use regular img tag for unconfigured external domains
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
      style={{ width: width ? `${width}px` : '100%', height: height ? `${height}px` : 'auto' }}
    />
  );
}

