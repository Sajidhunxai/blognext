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

    // Paths with only one non-empty segment are "root-like" (/, /ur, /hi)
    // and should only match exactly — never via startsWith.
    const hrefDepth = normalizedHref.split("/").filter(Boolean).length;
    const isRootLike = hrefDepth <= 1;

    if (normalizedPathname === normalizedHref) {
      active = true;
    } else if (!isRootLike && normalizedPathname.startsWith(normalizedHref + "/")) {
      // Only use prefix matching for deeper paths (e.g. /category matching /category/apps)
      active = true;
    } else {
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

