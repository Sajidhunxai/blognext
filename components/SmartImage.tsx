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

function isCloudinaryUrl(src: string): boolean {
  try {
    return new URL(src).hostname === "res.cloudinary.com";
  } catch {
    return false;
  }
}

export default function SmartImage({
  src,
  alt,
  title,
  width,
  height,
  className = "",
  priority = false,
  quality = 85,
  sizes,
  fetchPriority,
}: SmartImageProps) {
  const cloudinary = useMemo(() => isCloudinaryUrl(src), [src]);

  const optimizedSrc = useMemo(() => {
    if (cloudinary && width) {
      return optimizeCloudinaryUrl(src, width, height, quality);
    }
    return src;
  }, [src, width, height, quality, cloudinary]);

  const srcSet = useMemo(() => {
    if (cloudinary && width) {
      const doubles = [width, width * 2].filter((w) => w <= 3000);
      return getCloudinarySrcSet(src, doubles);
    }
    return undefined;
  }, [src, width, cloudinary]);

  // ── Cloudinary images: bypass /_next/image proxy entirely.
  // Cloudinary already handles f_auto (AVIF/WebP), q_auto, w_, h_ on its CDN.
  // Routing through /_next/image adds an extra server hop and a very short
  // cache TTL that causes slow LCP "resource load duration".
  if (cloudinary && width && height) {
    return (
      <img
        src={optimizedSrc}
        srcSet={srcSet}
        alt={alt}
        title={title}
        width={width}
        height={height}
        className={className}
        loading={priority ? "eager" : "lazy"}
        // fetchpriority is lowercase in HTML; React accepts the camelCase prop
        fetchPriority={priority ? "high" : (fetchPriority ?? "auto")}
        decoding={priority ? "sync" : "async"}
        sizes={sizes ?? `${width}px`}
        style={{ color: "transparent" }}
      />
    );
  }

  // ── Cloudinary images without explicit height ───────────────────────────
  if (cloudinary && width) {
    return (
      <img
        src={optimizedSrc}
        srcSet={srcSet}
        alt={alt}
        title={title}
        className={className}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : (fetchPriority ?? "auto")}
        decoding={priority ? "sync" : "async"}
        sizes={sizes ?? `${width}px`}
        style={{ width: "100%", height: "auto", color: "transparent" }}
      />
    );
  }

  // ── Non-Cloudinary configured domains: use next/image ──────────────────
  if (width && height) {
    return (
      <Image
        src={src}
        alt={alt}
        {...(title ? { title } : {})}
        width={width}
        height={height}
        className={className}
        priority={priority}
        quality={quality}
        sizes={sizes ?? `${width}px`}
      />
    );
  }

  // ── Fallback: plain img ─────────────────────────────────────────────────
  return (
    <img
      src={src}
      alt={alt}
      title={title}
      className={className}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : (fetchPriority ?? "auto")}
      style={{ width: width ? `${width}px` : "100%", height: "auto" }}
    />
  );
}
