"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { 
  Home, 
  FileText, 
  File, 
  Folder, 
  MessageSquare, 
  Link as LinkIcon, 
  Settings,
  User,
  LogOut,
  Menu,
  X,
  Copy,
  InspectionPanel
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userName: string;
  userEmail: string;
  siteLogo?: string;
}

export default function DashboardLayout({
  children,
  userName,
  userEmail,
  siteLogo,
}: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Handle sidebar collapse on desktop
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const menuItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: FileText, label: "Posts", href: "/dashboard/posts" },
    { icon: File, label: "Pages", href: "/dashboard/pages" },
    { icon: Folder, label: "Categories", href: "/dashboard/categories" },
    { icon: MessageSquare, label: "Comments", href: "/dashboard/comments" },
    { icon: LinkIcon, label: "Redirects", href: "/dashboard/redirects" },
    { icon: Copy, label: "Scraper", href: "/dashboard/scraper" },
    { icon: InspectionPanel, label: "AI Writer", href: "/dashboard/ai-writer" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Mobile */}
      <aside
        className={`lg:hidden fixed left-0 top-0 h-full z-40 transform transition-transform duration-300 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full w-64 bg-[#1e3a8a] text-white flex flex-col">
          {/* User Profile Section */}
          <div className="p-6 text-center border-b border-blue-700">
            <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
              <User className="w-10 h-10 text-[#1e3a8a]" />
            </div>
            <h2 className="text-lg font-semibold uppercase mb-1">{userName}</h2>
            <p className="text-sm text-blue-200">{userEmail}</p>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 overflow-y-auto">
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
                    <item.icon className="w-5 h-5" />
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
              className="w-full text-blue-100 hover:text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition text-sm text-left flex items-center gap-3"
            >
                <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Sidebar - Desktop */}
      <aside
        className={`hidden lg:flex fixed left-0 top-0 h-screen bg-[#1e3a8a] text-white flex-col transition-all duration-300 z-30 ${
          isSidebarOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className={`absolute top-4 bg-[#1e3a8a] text-white p-1.5 rounded-full border-2 border-white shadow-lg hover:bg-blue-600 transition z-50 ${
            isSidebarOpen ? "right-0 -mr-3" : "right-0 -mr-3"
          }`}
          aria-label="Toggle sidebar"
          type="button"
        >
          {isSidebarOpen ? (
            <svg
              className="w-4 h-4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M15 19l-7-7 7-7" />
            </svg>
          ) : (
            <svg
              className="w-4 h-4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>

        {/* User Profile Section */}
        <div className={`p-6 border-b border-blue-700 transition-all ${isSidebarOpen ? "text-center" : "flex items-center justify-center"}`}>
          {isSidebarOpen ? (
            <>
              <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
                <User className="w-10 h-10 text-[#1e3a8a]" />
              </div>
              <h2 className="text-lg font-semibold uppercase mb-1">{userName}</h2>
              <p className="text-sm text-blue-200">{userEmail}</p>
            </>
          ) : (
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-[#1e3a8a]" />
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group ${
                    isActive(item.href)
                      ? "bg-blue-600 text-white"
                      : "text-blue-100 hover:bg-blue-700 hover:text-white"
                  }`}
                  title={!isSidebarOpen ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {isSidebarOpen && (
                    <span className="capitalize whitespace-nowrap">{item.label}</span>
                  )}
                  {!isSidebarOpen && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-blue-700">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className={`w-full text-blue-100 hover:text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition text-sm flex items-center gap-3 ${
              isSidebarOpen ? "text-left" : "justify-center"
            }`}
            title={!isSidebarOpen ? "Logout" : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 min-h-screen transition-all duration-300 bg-gray-50 overflow-x-hidden ${
          isSidebarOpen ? "lg:ml-64" : "lg:ml-20"
        } ml-0`}
      >
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition"
                  aria-label="Toggle menu"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </button>
              </div>
              {/* Site Logo */}
              {siteLogo && (
                <div className="flex items-center">
                  <Link href="/" className="flex items-center">
                    <img
                      src={siteLogo}
                      alt="Site Logo"
                      className="h-12 sm:h-12 w-auto object-contain"
                      onError={(e) => {
                        // Hide image if it fails to load
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-3 sm:p-4 md:p-6 lg:p-8 overflow-x-hidden">{children}</div>
      </main>
    </div>
  );
}

