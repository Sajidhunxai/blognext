import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

/**
 * Locale-prefixed routes (/en/*, /ur/*, /hi/*) were removed.
 * The middleware handles 301 redirects, but this layout is a safety net
 * in case a request bypasses the middleware.
 */
export default async function LocaleLayout({ params }: Props) {
  const { locale } = params;

  // Reconstruct the path without the locale prefix from the referer or pathname
  const headersList = await headers();
  const invokedPath = (headersList as any).get?.("x-invoke-path") as string | null;

  if (invokedPath) {
    const withoutLocale = invokedPath.replace(new RegExp(`^/${locale}`), "") || "/";
    redirect(withoutLocale);
  }

  // Fallback: 404 if we can't determine the path
  notFound();
}
