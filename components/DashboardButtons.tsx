"use client";

import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";

export default function DashboardButtons() {
  const { colors } = useTheme();

  return (
    <div className="flex gap-4">
      <Link
        href="/dashboard/settings"
        className="bg-button text-button hover:bg-secondary px-6 py-3 rounded-lg font-medium transition"
      >
        Settings
      </Link>
      <Link
        href="/dashboard/pages"
        className="bg-button text-button hover:bg-secondary px-6 py-3 rounded-lg font-medium transition"
      >
        Pages
      </Link>
      <Link
        href="/dashboard/posts/new"
        className="bg-button text-button hover:bg-secondary px-6 py-3 rounded-lg font-medium transition"
      >
        New Post
      </Link>
      <Link
        href="/dashboard/comments"
        className="bg-button text-button hover:bg-secondary px-6 py-3 rounded-lg font-medium transition"
      >
        Comments
      </Link>
      <Link
        href="/dashboard/categories"
        className="bg-button text-button hover:bg-secondary px-6 py-3 rounded-lg font-medium transition"
      >
        Categories
      </Link>
    </div>
  );
}

