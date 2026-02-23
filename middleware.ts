import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isLocalePrefix } from "@/lib/i18n/config";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip redirect check for API routes, static files, and Next.js internals
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/login")
  ) {
    return NextResponse.next();
  }

  // Detect locale: /ur/*, /hi/* use prefix; everything else is English
  const segments = pathname.split("/").filter(Boolean);
  const locale =
    segments.length > 0 && isLocalePrefix(segments[0]) ? segments[0] : "en";

  // Skip redirect check for locale-prefixed known content routes
  const innerPath = locale !== "en" ? "/" + segments.slice(1).join("/") : pathname;
  const isContentRoute =
    innerPath === "/" ||
    innerPath.startsWith("/post/") ||
    innerPath.startsWith("/posts/") ||
    innerPath.startsWith("/pages/") ||
    innerPath.startsWith("/category/") ||
    innerPath.startsWith("/download/");

  const forwardLocale = (loc: string) => {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-locale", loc);
    return NextResponse.next({ request: { headers: requestHeaders } });
  };

  if (isContentRoute && locale !== "en") {
    return forwardLocale(locale);
  }

  // Skip if it matches known routes (post, posts, pages, category, download)
  if (
    pathname.startsWith("/post/") ||
    pathname.startsWith("/posts/") ||
    pathname.startsWith("/pages/") ||
    pathname.startsWith("/category/") ||
    pathname.startsWith("/download/")
  ) {
    return forwardLocale("en");
  }

  // Skip root path
  if (pathname === "/") {
    return forwardLocale("en");
  }

  // Skip redirect API for bot/noise paths to reduce CPU
  const isLikelyBotNoise =
    pathname.includes("wp-") ||
    pathname.includes("wp/") ||
    pathname.includes(".php") ||
    pathname.includes("xmlrpc") ||
    pathname.includes("wp-content") ||
    pathname.includes("wp-includes") ||
    pathname.includes("administrator") ||
    pathname.includes(".env") ||
    pathname.includes("config.") ||
    pathname.length > 120;
  if (isLikelyBotNoise) {
    return forwardLocale(locale);
  }

  // Check redirect via API route
  try {
    const baseUrl = request.nextUrl.origin;
    const redirectUrl = new URL("/api/check-redirect", baseUrl);
    redirectUrl.searchParams.set("from", pathname);

    // Use a timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

    try {
      const redirectResponse = await fetch(redirectUrl.toString(), {
        cache: 'no-store',
        signal: controller.signal,
        headers: {
          'x-middleware-request': 'true',
        },
      });

      clearTimeout(timeoutId);

      if (redirectResponse.ok) {
        const data = await redirectResponse.json();
        if (data.redirect) {
          // Determine if destination is absolute or relative
          let destination = data.redirect.to;
          
          if (!destination.startsWith("http")) {
            if (!destination.startsWith("/")) {
              destination = `/${destination}`;
            }
            // Make it absolute URL
            destination = new URL(destination, baseUrl).toString();
          }

          // Return redirect response
          return NextResponse.redirect(destination, {
            status: data.redirect.type || 301,
          });
        }
      }
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name !== 'AbortError') {
        console.error("Error fetching redirect in middleware:", fetchError);
      }
    }
  } catch (error) {
    // If there's an error checking redirects, continue normally
    console.error("Error checking redirects in middleware:", error);
  }

  return forwardLocale(locale);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api, _next/static, _next/image, favicon.ico
     * - Static files: sitemap.xml, robots.txt, manifest, ads.txt, llms.txt
     */
    "/((?!api|_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|manifest\\.webmanifest|ads\\.txt|llms\\.txt).*)",
  ],
};

