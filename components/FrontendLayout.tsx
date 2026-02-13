import { ReactNode } from "react";
import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { resolveMenuItems } from "@/lib/menu";
import { getSafeServerSession } from "@/lib/session";
import dynamic from "next/dynamic";

const NavigationLoader = dynamic(() => import("@/components/NavigationLoader"), {
  ssr: false,
});

const NavLink = dynamic(() => import("@/components/NavLink"), {
  ssr: false,
});

const ColoredLink = dynamic(() => import("@/components/ColoredLink"), {
  ssr: false,
});

const MobileMenu = dynamic(() => import("@/components/MobileMenu"), {
  ssr: false,
});

const ThemeToggle = dynamic(() => import("@/components/ThemeToggle"), {
  ssr: false,
});

const Logo = dynamic(() => import("@/components/Logo"), {
  ssr: false,
  loading: () => null,
});

interface FrontendLayoutProps {
  children: ReactNode;
}

export default async function FrontendLayout({ children }: FrontendLayoutProps) {
  // Use safe session retrieval that handles JWT decryption errors gracefully
  // This prevents crashes when NEXTAUTH_SECRET changes or cookies are corrupted
  const session = await getSafeServerSession();
  const settings = await getSettings();
  const headerMenu = Array.isArray(settings.headerMenu) ? settings.headerMenu : (settings.headerMenu ? [settings.headerMenu] : []);
  const menuItems = await resolveMenuItems(headerMenu);
  
  const colors = {
    primary: settings.primaryColor || "#dc2626",
    secondary: settings.secondaryColor || "#16a34a",
    background: settings.backgroundColor || "#111827",
    text: settings.textColor || "#ffffff",
    button: settings.buttonColor || "#dc2626",
    link: settings.linkColor || "#3b82f6",
    success: settings.successColor || "#16a34a",
    error: settings.errorColor || "#dc2626",
    warning: settings.warningColor || "#f59e0b",
    info: settings.infoColor || "#3b82f6",
  };

  return (
    <div className="min-h-screen bg-theme-background ">
      <NavigationLoader />
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/95">
        <div className="max-w-7xl p-2  mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex  items-center gap-3 hover:opacity-80 transition">
              {settings.logo ? (
                <Logo
                  lightLogo={settings.logo}
                  darkLogo={(settings as any).darkModeLogo}
                  siteName={settings.siteName}
                  height={48}
                  width={160}
                  className="rounded"
                />
              ) : (
                <div className="text-xl sm:text-2xl font-bold">
                  <span style={{ color: colors.text }}>{settings.siteName.split(" ")[0]}</span>
                  <span style={{ color: colors.secondary }}>{settings.siteName.split(" ")[1] || ""}</span>
                </div>
              )}
            </Link>
            <div className="flex items-center gap-3 sm:gap-4">
              <nav className="hidden md:flex items-center gap-4 lg:gap-6">
                {menuItems.map((item, index) => (
                  <NavLink
                    key={index}
                    href={item.url}
                  >
                    {item.label}
                  </NavLink>
                ))}
                {session && (
                  <NavLink href="/dashboard">
                    Dashboard
                  </NavLink>
                )}
              </nav>
              {/* Theme Toggle */}
              <ThemeToggle />
              {/* Mobile Menu */}
              <MobileMenu menuItems={menuItems} showDashboard={!!session} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-6 sm:py-8  bg-gray-50/50 mt-0 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-6">
            <div className="font-bold text-lg sm:text-xl m-auto sm:m-0 text-black dark:text-gray-300" >{settings.siteName}</div>
            <div className="flex flex-wrap gap-4 sm:gap-6">
              {settings.footerLinks.map((link: string | { label: string; url: string }, index: number) => {
                const linkObj = typeof link === "string" ? { label: link, url: "#" } : link;
                return (
                  <ColoredLink
                    key={index}
                    href={linkObj.url}
                    defaultColor={colors.text === "#ffffff" ? "#9ca3af" : "#6b7280"}
                    hoverColor={colors.text}
                    className="text-sm"
                  >
                    {linkObj.label}
                  </ColoredLink>
                );
              })}
            </div>
          </div>
          <div className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} | All right reserved | {settings.siteName}
          </div>
        </div>
      </footer>
    </div>
  );
}

