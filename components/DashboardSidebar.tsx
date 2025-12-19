"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

interface DashboardSidebarProps {
  userName: string;
  userEmail: string;
}

export default function DashboardSidebar({ userName, userEmail }: DashboardSidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { icon: "🏠", label: "Dashboard", href: "/dashboard" },
    { icon: "📝", label: "Posts", href: "/dashboard/posts/new" },
    { icon: "📄", label: "Pages", href: "/dashboard/pages" },
    { icon: "📁", label: "Categories", href: "/dashboard/categories" },
    { icon: "💬", label: "Comments", href: "/dashboard/comments" },
    { icon: "🔗", label: "Redirects", href: "/dashboard/redirects" },
    { icon: "🕷️", label: "Scraper", href: "/dashboard/scraper" },
    { icon: "✨", label: "AI Writer", href: "/dashboard/ai-writer" },
    { icon: "⚙️", label: "Settings", href: "/dashboard/settings" },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="h-full w-64 bg-[#1e3a8a] text-white flex flex-col">
      {/* User Profile Section */}
      <div className="p-6 text-center border-b border-blue-700">
        <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-4xl text-[#1e3a8a]">👤</span>
        </div>
        <h2 className="text-lg font-semibold uppercase mb-1">{userName}</h2>
        <p className="text-sm text-blue-200">{userEmail}</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? "bg-blue-600 text-white"
                    : "text-blue-100 hover:bg-blue-700 hover:text-white"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="capitalize">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-blue-700">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full text-blue-100 hover:text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition text-sm text-left"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

