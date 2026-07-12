"use client";

import { useEffect, useState } from "react";
import { LayoutDashboard } from "lucide-react";
import NavLink from "@/components/NavLink";
import { getTranslation } from "@/lib/i18n/translations";
import type { Locale } from "@/lib/i18n/config";

function hasSessionCookie(): boolean {
  if (typeof document === "undefined") return false;
  return (
    document.cookie.includes("next-auth.session-token") ||
    document.cookie.includes("__Secure-next-auth.session-token")
  );
}

/** Desktop nav: show Dashboard only for logged-in admins (client-side, no SSR cookies). */
export default function DashboardNavLink({ locale = "en" }: { locale?: Locale }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!hasSessionCookie()) return;
    let cancelled = false;
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((session) => {
        if (!cancelled && session?.user) setShow(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!show) return null;

  return <NavLink href="/dashboard">{getTranslation(locale, "dashboard")}</NavLink>;
}

/** Mobile menu item: same cookie-gated session check. */
export function DashboardMobileLink({
  locale = "en",
  onNavigate,
  colors,
}: {
  locale?: Locale;
  onNavigate?: () => void;
  colors: { secondary: string; text: string };
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!hasSessionCookie()) return;
    let cancelled = false;
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((session) => {
        if (!cancelled && session?.user) setShow(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!show) return null;

  return (
    <a
      href="/dashboard"
      className="group flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 mt-4"
      style={{
        backgroundColor: colors.secondary + "20",
        color: colors.text,
        border: `1px solid ${colors.secondary + "40"}`,
      }}
      onClick={onNavigate}
    >
      <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
      <span className="text-lg font-semibold">{getTranslation(locale, "dashboard")}</span>
    </a>
  );
}
