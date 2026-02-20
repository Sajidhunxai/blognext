import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { downloadImage, uploadToCloudinary } from "@/lib/scraper";

const VIEWPORTS = [
  { label: "desktop", width: 1280, height: 720 },
  { label: "tablet", width: 768, height: 1024 },
  { label: "mobile", width: 375, height: 667 },
];

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { url, count = 3 } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    const trimmed = url.trim();
    if (!/^https?:\/\//i.test(trimmed)) {
      return NextResponse.json(
        { error: "URL must start with http:// or https://" },
        { status: 400 }
      );
    }

    const apiKey = process.env.MICROLINK_API_KEY?.replace(/^["']|["']$/g, "");
    const baseUrl = "https://api.microlink.io";
    const screenshots: string[] = [];
    const headers: Record<string, string> = {
      "User-Agent": "Mozilla/5.0 (compatible; APKApp/1.0)",
    };
    if (apiKey) {
      headers["x-api-key"] = apiKey;
    }

    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const takeCount = count === 1 ? 1 : 3;
    const viewportsToUse = VIEWPORTS.slice(0, takeCount);

    for (let i = 0; i < viewportsToUse.length; i++) {
      const vp = viewportsToUse[i];
      if (i > 0) await delay(3000);
      const params = new URLSearchParams({
        url: trimmed,
        screenshot: "true",
        "viewport.width": String(vp.width),
        "viewport.height": String(vp.height),
        meta: "false",
      });

      const mqlUrl = `${baseUrl}?${params.toString()}`;
      const mqlRes = await fetch(mqlUrl, {
        headers,
        signal: AbortSignal.timeout(30000),
      });

      if (!mqlRes.ok) {
        const errText = await mqlRes.text();
        console.error(`Microlink error (${vp.label}):`, mqlRes.status, errText);
        continue;
      }

      const mqlData = await mqlRes.json();
      const screenshotUrl =
        mqlData?.data?.screenshot?.url ||
        mqlData?.screenshot?.url;

      if (!screenshotUrl) {
        console.warn(`No screenshot URL in Microlink response for ${vp.label}`);
        continue;
      }

      const buffer = await downloadImage(screenshotUrl);
      if (!buffer) continue;

      const cloudinaryUrl = await uploadToCloudinary(
        buffer,
        `screenshot-${vp.label}-${Date.now()}.jpg`
      );
      if (cloudinaryUrl) {
        screenshots.push(cloudinaryUrl);
      }
    }

    if (screenshots.length === 0) {
      return NextResponse.json(
        {
          error:
            "Could not capture any screenshots. Check the URL and try again. Microlink free tier: 50 requests/month.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ screenshots });
  } catch (error: any) {
    console.error("Screenshot API error:", error);
    return NextResponse.json(
      {
        error:
          error.message ||
          "Failed to capture screenshots. The page may block automated access.",
      },
      { status: 500 }
    );
  }
}
