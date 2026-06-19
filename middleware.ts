import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ── IndexNow key file: /{INDEXNOW_KEY}.txt ───────────────────────────────
  const indexNowKey = process.env.INDEXNOW_KEY?.trim();
  if (indexNowKey && pathname === `/${indexNowKey}.txt`) {
    return new NextResponse(indexNowKey, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=86400",
      },
    });
  }

  // ── Skip internals ────────────────────────────────────────────────────────
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

  // ── 301 /posts/slug → /post/slug (real HTTP redirect, not meta refresh) ───
  const postsMatch = pathname.match(/^\/posts\/([^/]+)\/?$/);
  if (postsMatch) {
    const destination = new URL(`/post/${postsMatch[1]}`, request.url);
    return NextResponse.redirect(destination, { status: 301 });
  }

  // ── 301 redirect all locale-prefixed paths to their English equivalents ───
  // /ur/post/x → /post/x, /hi/post/x → /post/x, /en/post/x → /post/x
  const localeMatch = pathname.match(/^\/(en|ur|hi)(\/.*)?$/);
  if (localeMatch) {
    const rest = localeMatch[2] || "/";
    const destination = new URL(rest, request.nextUrl.origin).toString();
    return NextResponse.redirect(destination, { status: 301 });
  }

  // ── Skip redirect check for known content routes ──────────────────────────
  const isContentRoute =
    pathname === "/" ||
    pathname.startsWith("/post/") ||
    pathname.startsWith("/pages/") ||
    pathname.startsWith("/category/") ||
    pathname.startsWith("/download/");

  if (isContentRoute) {
    return NextResponse.next();
  }

  // ── Skip bot-noise paths to save CPU ─────────────────────────────────────
  const isLikelyBotNoise =
    pathname.includes("wp-") ||
    pathname.includes(".php") ||
    pathname.includes("xmlrpc") ||
    pathname.includes("administrator") ||
    pathname.includes(".env") ||
    pathname.length > 120;

  if (isLikelyBotNoise) {
    return NextResponse.next();
  }

  // ── Check redirect table ──────────────────────────────────────────────────
  try {
    const redirectUrl = new URL("/api/check-redirect", request.nextUrl.origin);
    redirectUrl.searchParams.set("from", pathname);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    try {
      const res = await fetch(redirectUrl.toString(), {
        cache: "no-store",
        signal: controller.signal,
        headers: { "x-middleware-request": "true" },
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.redirect) {
          let destination = data.redirect.to;
          if (!destination.startsWith("http")) {
            if (!destination.startsWith("/")) destination = `/${destination}`;
            destination = new URL(destination, request.nextUrl.origin).toString();
          }
          return NextResponse.redirect(destination, {
            status: data.redirect.type || 301,
          });
        }
      }
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name !== "AbortError") {
        console.error("Middleware redirect fetch error:", fetchError);
      }
    }
  } catch (error) {
    console.error("Middleware error:", error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|manifest\\.webmanifest|ads\\.txt|llms\\.txt).*)",
  ],
};
