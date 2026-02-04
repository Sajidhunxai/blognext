"use client";

import Image from "next/image";
import { useMemo } from "react";
import { optimizeCloudinaryUrl, getCloudinarySrcSet } from "@/lib/cloudinary";

interface SmartImageProps {
  src: string;
  alt: string;
  title?: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  fetchPriority?: "high" | "low" | "auto";
}

// List of configured hostnames in next.config.js
const CONFIGURED_HOSTNAMES = [
  'res.cloudinary.com',
  // Add other configured hostnames here
];

export default function SmartImage({
  src,
  alt,
  title,
  width,
  height,
  className = "",
  priority = false,
  quality = 90,
  sizes,
  fetchPriority,
}: SmartImageProps) {
  const isCloudinary = useMemo(() => {
    try {
      const url = new URL(src);
      return CONFIGURED_HOSTNAMES.includes(url.hostname);
    } catch {
      return false;
    }
  }, [src]);

  const isConfiguredDomain = useMemo(() => {
    try {
      const url = new URL(src);
      return CONFIGURED_HOSTNAMES.includes(url.hostname);
    } catch {
      // If URL parsing fails, assume it's a relative path (configured)
      return true;
    }
  }, [src]);

  // Optimize Cloudinary URLs with transformations
  const optimizedSrc = useMemo(() => {
    if (isCloudinary && width) {
      return optimizeCloudinaryUrl(src, width, height, quality);
    }
    return src;
  }, [src, width, height, quality, isCloudinary]);

  // Use Next.js Image for configured domains or relative paths
  if (isConfiguredDomain && width && height) {
    return (
      <Image
        src={optimizedSrc}
        alt={alt}
        {...(title ? { title } : {})}
        width={width}
        height={height}
        className={className}
        priority={priority}
        quality={typeof quality === 'number' ? quality : undefined}
        sizes={sizes || (width ? `${width}px` : '100vw')}
      />
    );
  }

  // For Cloudinary images without width/height, use optimized img tag
  if (isCloudinary && width) {
    const srcSet = sizes 
      ? getCloudinarySrcSet(src, [width, width * 2, width * 3])
      : undefined;
    
    return (
      <img
        src={optimizedSrc}
        srcSet={srcSet}
        alt={alt}
        title={title}
        className={className}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={fetchPriority}
        sizes={sizes || (width ? `${width}px` : '100vw')}
        style={{ 
          width: width ? `${width}px` : '100%', 
          height: height ? `${height}px` : 'auto',
          ...(width && !height ? { height: 'auto' } : {})
        }}
      />
    );
  }

  // Use regular img tag for unconfigured external domains
  return (
    <img
      src={src}
      alt={alt}
      title={title}
      className={className}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={fetchPriority}
      style={{ 
        width: width ? `${width}px` : '100%', 
        height: height ? `${height}px` : 'auto',
        ...(width && !height ? { height: 'auto' } : {})
      }}
    />
  );
}

