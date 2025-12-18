"use client";

import Link from "next/link";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
  className?: string;
}

export default function NavLink({ href, children, isActive = false, className = "" }: NavLinkProps) {
  if (isActive) {
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

