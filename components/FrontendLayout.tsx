import { ReactNode } from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { getSettings } from "@/lib/settings";
import { resolveMenuItems } from "@/lib/menu";
import { getSafeServerSession } from "@/lib/session";
import { addLocalePrefix, type Locale } from "@/lib/i18n/config";
import { getTranslation } from "@/lib/i18n/translations";
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
  const headersList = await headers();
  const locale = (headersList.get("x-locale") || "en") as Locale;

  const session = await getSafeServerSession();
  const settings = await getSettings();
  const headerMenu = Array.isArray(settings.headerMenu) ? settings.headerMenu : (settings.headerMenu ? [settings.headerMenu] : []);
  const resolvedItems = await resolveMenuItems(headerMenu);

  /** Normalise a menu URL to a relative path, then add locale prefix. */
  const normaliseMenuUrl = (url: string): string => {
    if (!url) return addLocalePrefix("/", locale);
    // Absolute URL — extract just the pathname so locale prefix works correctly
    if (url.startsWith("http://") || url.startsWith("https://")) {
      try {
        const { pathname } = new URL(url);
        return addLocalePrefix(pathname || "/", locale);
      } catch {
        return addLocalePrefix("/", locale);
      }
    }
    // Relative path — ensure it starts with /
    return addLocalePrefix(url.startsWith("/") ? url : `/${url}`, locale);
  };

  const menuItems = resolvedItems.map((item) => ({
    ...item,
    url: normaliseMenuUrl(item.url),
  }));
  
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
            <Link href={addLocalePrefix("/", locale)} className="flex  items-center gap-3 hover:opacity-80 transition">
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
                    {getTranslation(locale, "dashboard")}
                  </NavLink>
                )}
              </nav>
              <ThemeToggle />
              {/* Mobile Menu */}
              <MobileMenu menuItems={menuItems} showDashboard={!!session} locale={locale} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-900 dark:bg-gray-950 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-10">

            {/* Brand column */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="font-extrabold text-xl text-white mb-3">{settings.siteName}</div>
              <p className="text-sm text-gray-400 leading-relaxed mb-5">
                {settings.heroSubtitle ||
                  `Your trusted source for safe, free Android APK downloads. Verified apps updated daily.`}
              </p>
              {/* Social icons */}
              {(() => {
                const sm = settings.socialMedia as any || {};
                const socials = [
                  { href: sm.facebook, bg: "#1877f2", label: "f" },
                  { href: sm.twitter, bg: "#1d9bf0", label: "𝕏" },
                  { href: sm.instagram, bg: "#e1306c", label: "📷" },
                  { href: sm.youtube, bg: "#ff0000", label: "▶" },
                  { href: sm.telegram, bg: "#26a5e4", label: "✈" },
                ].filter(s => s.href);
                if (!socials.length) return null;
                return (
                  <div className="flex gap-2">
                    {socials.map(({ href, bg, label }) => (
                      <a key={href} href={href!} target="_blank" rel="noopener noreferrer"
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold hover:opacity-80 transition"
                        style={{ backgroundColor: bg }}>
                        {label}
                      </a>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Quick links */}
            <div>
              <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Quick Links</h3>
              <ul className="space-y-2.5">
                {[
                  { label: "Home", href: "/" },
                  ...(menuItems.slice(0, 5).map(item => ({ label: item.label, href: item.url }))),
                ].map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href}
                      className="text-sm text-gray-400 hover:text-white hover:underline transition-colors inline-flex items-center gap-1">
                      <span className="text-primary text-xs">›</span> {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer links (privacy, about etc.) */}
            <div>
              <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Information</h3>
              <ul className="space-y-2.5">
                {settings.footerLinks.length > 0
                  ? settings.footerLinks.map((link: string | { label: string; url: string }, index: number) => {
                      const linkObj = typeof link === "string" ? { label: link, url: "#" } : link;
                      return (
                        <li key={index}>
                          <Link href={linkObj.url}
                            className="text-sm text-gray-400 hover:text-white hover:underline transition-colors inline-flex items-center gap-1">
                            <span className="text-primary text-xs">›</span> {linkObj.label}
                          </Link>
                        </li>
                      );
                    })
                  : [
                      { label: "Privacy Policy", href: "/privacy-policy" },
                      { label: "Terms of Service", href: "/terms" },
                      { label: "DMCA", href: "/dmca" },
                      { label: "Contact Us", href: "/contact" },
                    ].map(({ label, href }) => (
                      <li key={label}>
                        <Link href={href}
                          className="text-sm text-gray-400 hover:text-white hover:underline transition-colors inline-flex items-center gap-1">
                          <span className="text-primary text-xs">›</span> {label}
                        </Link>
                      </li>
                    ))
                }
              </ul>
            </div>

            {/* Trust signals */}
            <div>
              <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Why Choose Us</h3>
              <ul className="space-y-3">
                {[
                  { icon: "✅", text: "Verified safe APKs" },
                  { icon: "⚡", text: "Daily updates" },
                  { icon: "💸", text: "Always 100% free" },
                  { icon: "📲", text: "Easy install guides" },
                  { icon: "🔒", text: "No hidden trackers" },
                ].map(({ icon, text }) => (
                  <li key={text} className="flex items-center gap-2.5 text-sm text-gray-400">
                    <span className="text-base">{icon}</span> {text}
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-700/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-500 text-center sm:text-left">
              © {new Date().getFullYear()} {settings.siteName}. {getTranslation(locale, "allRightsReserved")}.
            </p>
            <p className="text-xs text-gray-600 text-center sm:text-right">
              APK files are provided for informational and educational purposes only.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

