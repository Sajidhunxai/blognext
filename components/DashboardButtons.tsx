"use client";

import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";

export default function DashboardButtons() {
  const { colors } = useTheme();

  return (
    <div className="flex gap-4">
      <Link
        href="/dashboard/settings"
        className="text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition"
        style={{ backgroundColor: colors.warning }}
      >
        Settings
      </Link>
      <Link
        href="/dashboard/pages"
        className="text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition"
        style={{ backgroundColor: colors.primary }}
      >
        Pages
      </Link>
      <Link
        href="/dashboard/posts/new"
        className="text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition"
        style={{ backgroundColor: colors.primary }}
      >
        New Post
      </Link>
      <Link
        href="/dashboard/comments"
        className="text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition"
        style={{ backgroundColor: colors.primary }}
      >
        Comments
      </Link>
      <Link
        href="/dashboard/categories"
        className="text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition"
        style={{ backgroundColor: colors.primary }}
      >
        Categories
      </Link>
    </div>
  );
}

