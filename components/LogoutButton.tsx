"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition text-sm"
    >
      Logout
    </button>
  );
}

