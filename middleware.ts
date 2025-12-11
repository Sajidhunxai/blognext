import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

  // Skip if it matches known routes (posts, pages, category, download)
  if (
    pathname.startsWith("/posts/") ||
    pathname.startsWith("/pages/") ||
    pathname.startsWith("/category/") ||
    pathname.startsWith("/download/")
  ) {
    return NextResponse.next();
  }

  // Skip root path
  if (pathname === "/") {
    return NextResponse.next();
  }

  // Check redirect via API route
  try {
    const baseUrl = request.nextUrl.origin;
    const redirectUrl = new URL("/api/check-redirect", baseUrl);
    redirectUrl.searchParams.set("from", pathname);

    const redirectResponse = await fetch(redirectUrl.toString(), {
      cache: 'no-store',
      headers: {
        'x-middleware-request': 'true',
      },
    });

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
  } catch (error) {
    // If there's an error checking redirects, continue normally
    console.error("Error checking redirects in middleware:", error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

