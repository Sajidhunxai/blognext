import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const LOCALES = ["ur", "hi"];

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const translations = await (prisma as any).pageTranslation.findMany({
      where: { pageId: params.id },
    });
    return NextResponse.json(translations);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch translations" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { locale, title, content, metaTitle, metaDescription, featuredImageAlt } = body;

    if (!locale || !LOCALES.includes(locale)) {
      return NextResponse.json(
        { error: "locale must be 'ur' or 'hi'" },
        { status: 400 }
      );
    }

    if (!title || !content) {
      return NextResponse.json(
        { error: "title and content are required" },
        { status: 400 }
      );
    }

    const page = await (prisma as any).page.findUnique({ where: { id: params.id } });
    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const data = {
      pageId: params.id,
      locale,
      title,
      content,
      metaTitle: metaTitle ?? null,
      metaDescription: metaDescription ?? null,
      featuredImageAlt: featuredImageAlt ?? null,
    };

    const translation = await (prisma as any).pageTranslation.upsert({
      where: { pageId_locale: { pageId: params.id, locale } },
      create: data,
      update: data,
    });

    return NextResponse.json(translation);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to save translation" },
      { status: 500 }
    );
  }
}
