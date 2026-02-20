import { NextResponse } from "next/server";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const revalidate = 300;

export async function GET() {
  try {
    const settings = await getSettings();
    const content = (settings as any).footerCSS?.trim() || "";
    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate",
      },
    });
  } catch (error) {
    console.error("Error serving ads.txt:", error);
    return new NextResponse("", {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }
}
