"use client";

import { signOut } from "next-auth/react";

interface LogoutButtonProps {
  className?: string;
}

export default function LogoutButton({ className }: LogoutButtonProps) {
  const defaultClassName = className || "text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition text-sm";
  
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className={defaultClassName}
    >
      Logout
    </button>
  );
}

