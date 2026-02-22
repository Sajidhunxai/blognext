import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { translateText } from "@/lib/i18n/translate";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { text, targetLocale } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "text is required and must be a string" },
        { status: 400 }
      );
    }

    const target = targetLocale || "ur";
    if (!["ur", "hi"].includes(target)) {
      return NextResponse.json(
        { error: "targetLocale must be 'ur' or 'hi'" },
        { status: 400 }
      );
    }

    const result = await translateText(text, target);
    if (!result) {
      return NextResponse.json(
        { error: "Translation failed. MyMemory API may be rate-limited or unavailable." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      translatedText: result.translatedText,
      detectedSourceLanguage: result.detectedSourceLanguage,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Translation failed" },
      { status: 500 }
    );
  }
}
