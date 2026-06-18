import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buildAbsoluteUrl,
  buildPostIndexNowUrl,
  getIndexNowConfig,
  submitIndexNowUrls,
} from "@/lib/indexnow";

export const dynamic = "force-dynamic";

/**
 * POST /api/indexnow/submit
 * Admin-only: submit URLs to IndexNow manually or in bulk.
 *
 * Body:
 *   { urls?: string[] }           — specific absolute URLs
 *   { paths?: string[] }         — site paths, e.g. ["/post/slug"]
 *   { allPublished?: boolean }   — submit every published post
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = getIndexNowConfig();
  if (!config) {
    return NextResponse.json(
      {
        error: "IndexNow is not configured. Set INDEXNOW_KEY in environment variables.",
        keyFileUrl: null,
      },
      { status: 503 },
    );
  }

  try {
    const body = await req.json();
    const urls: string[] = [];

    if (Array.isArray(body.urls)) {
      urls.push(...body.urls.filter((u: unknown) => typeof u === "string"));
    }

    if (Array.isArray(body.paths)) {
      for (const path of body.paths) {
        if (typeof path !== "string") continue;
        const url = buildAbsoluteUrl(path);
        if (url) urls.push(url);
      }
    }

    if (body.allPublished === true) {
      const posts = await prisma.post.findMany({
        where: { published: true },
        select: { slug: true },
      });
      for (const post of posts) {
        const url = buildPostIndexNowUrl(post.slug);
        if (url) urls.push(url);
      }
      // Include homepage and sitemap as freshness signals
      const home = buildAbsoluteUrl("/");
      const sitemap = buildAbsoluteUrl("/sitemap.xml");
      if (home) urls.push(home);
      if (sitemap) urls.push(sitemap);
    }

    const result = await submitIndexNowUrls(urls);

    if (!result.ok) {
      return NextResponse.json(
        {
          error: result.error,
          status: result.status,
          keyLocation: config.keyLocation,
        },
        { status: result.status && result.status >= 400 ? result.status : 502 },
      );
    }

    return NextResponse.json({
      success: true,
      submitted: result.submitted,
      keyLocation: config.keyLocation,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to submit URLs" },
      { status: 500 },
    );
  }
}

/** GET — show setup status (admin only) */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = getIndexNowConfig();
  if (!config) {
    return NextResponse.json({
      configured: false,
      message: "Set INDEXNOW_KEY in environment variables to enable IndexNow.",
    });
  }

  return NextResponse.json({
    configured: true,
    host: config.host,
    keyLocation: config.keyLocation,
    keyFileUrl: config.keyLocation,
  });
}
