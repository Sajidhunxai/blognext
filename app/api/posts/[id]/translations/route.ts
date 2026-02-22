import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const LOCALES = ["ur", "hi"];

/** GET: Fetch translations for a post */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const translations = await prisma.postTranslation.findMany({
      where: { postId: params.id },
    });

    return NextResponse.json(translations);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch translations" },
      { status: 500 }
    );
  }
}

/** POST: Create or update a translation */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { locale, title, content, metaTitle, metaDescription, keywords, focusKeyword, faqs, ogImageAlt, featuredImageAlt, developer, requirements } = body;

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

    const post = await prisma.post.findUnique({ where: { id: params.id } });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const data = {
      postId: params.id,
      locale,
      title,
      content,
      metaTitle: metaTitle ?? null,
      metaDescription: metaDescription ?? null,
      keywords: Array.isArray(keywords) ? keywords : [],
      focusKeyword: focusKeyword ?? null,
      faqs: faqs ?? null,
      ogImageAlt: ogImageAlt ?? null,
      featuredImageAlt: featuredImageAlt ?? null,
      developer: developer ?? null,
      requirements: requirements ?? null,
    };

    const translation = await prisma.postTranslation.upsert({
      where: {
        postId_locale: { postId: params.id, locale },
      },
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
