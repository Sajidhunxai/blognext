import { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { resolveMenuItems } from "@/lib/menu";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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

interface FrontendLayoutProps {
  children: ReactNode;
}

export default async function FrontendLayout({ children }: FrontendLayoutProps) {
  const session = await getServerSession(authOptions);
  const settings = await getSettings();
  const menuItems = await resolveMenuItems(settings.headerMenu);
  
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
    <div className="min-h-screen bg-white">
      <NavigationLoader />
      {/* Header */}
      <header style={{ backgroundColor: colors.background, borderColor: colors.primary }} className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
              {settings.logo ? (
                <Image
                  src={settings.logo}
                  alt={settings.siteName}
                  width={48}
                  height={48}
                  className="rounded"
                />
              ) : (
                <div className="text-xl sm:text-2xl font-bold">
                  <span style={{ color: colors.text }}>{settings.siteName.split(" ")[0]}</span>
                  <span style={{ color: colors.secondary }}>{settings.siteName.split(" ")[1] || ""}</span>
                </div>
              )}
            </Link>
            <nav className="hidden md:flex items-center gap-4 lg:gap-6">
              {menuItems.map((item, index) => (
                <NavLink
                  key={index}
                  href={item.url}
                  isActive={index === 0}
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
            {/* Mobile Menu */}
            <MobileMenu menuItems={menuItems} showDashboard={!!session} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t py-6 sm:py-8 mt-8 sm:mt-12" style={{ backgroundColor: colors.background, borderColor: colors.primary }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-6">
            <div className="font-bold text-lg sm:text-xl m-auto" style={{ color: colors.text }}>{settings.siteName}</div>
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
          <div className="text-center text-xs sm:text-sm" style={{ color: colors.text === "#ffffff" ? "#6b7280" : "#9ca3af" }}>
            © {new Date().getFullYear()} | All right reserved | {settings.siteName}
          </div>
        </div>
      </footer>
    </div>
  );
}

