"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
  className?: string;
}

export default function NavLink({ href, children, isActive, className = "" }: NavLinkProps) {
  const pathname = usePathname();
  
  // Normalize paths by removing trailing slashes (except for root)
  const normalizePath = (path: string) => {
    if (!path || path === "/") return "/";
    return path.replace(/\/$/, "");
  };
  
  // If isActive is explicitly provided, use it; otherwise calculate from pathname
  let active: boolean;
  if (isActive !== undefined) {
    active = isActive;
  } else {
    const normalizedPathname = normalizePath(pathname || "");
    const normalizedHref = normalizePath(href);
    
    // Check for exact match
    if (normalizedPathname === normalizedHref) {
      active = true;
    } 
    // For non-root paths, check if pathname starts with href + "/"
    // This handles cases like /category/apps matching /category
    else if (normalizedHref !== "/" && normalizedPathname.startsWith(normalizedHref + "/")) {
      active = true;
    }
    // Special case: if href is "/" and pathname is also "/"
    else if (normalizedHref === "/" && normalizedPathname === "/") {
      active = true;
    }
    else {
      active = false;
    }
  }
  
  if (active) {
    return (
      <Link
        href={href}
        className={`px-4 py-2 rounded-full text-sm font-medium btn-primary ${className}`}
      >
        {children}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`px-4 py-2 rounded-full text-sm font-medium btn-link ${className}`}
    >
      {children}
    </Link>
  );
}

