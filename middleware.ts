import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip redirect check for API routes, static files, and Next.js internals
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  try {
    // Check if redirect exists for this path
    if (prisma && 'redirect' in prisma) {
      const redirect = await (prisma as any).redirect.findFirst({
        where: {
          from: pathname,
          active: true,
        },
      });

      if (redirect) {
        // Determine if destination is absolute or relative
        const destination = redirect.to.startsWith("http")
          ? redirect.to
          : new URL(redirect.to, request.url).toString();

        // Return redirect response
        return NextResponse.redirect(destination, {
          status: redirect.type || 301,
        });
      }
    }
  } catch (error) {
    // If there's an error checking redirects, continue normally
    console.error("Error checking redirects:", error);
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

