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
    const translations = await (prisma as any).categoryTranslation.findMany({
      where: { categoryId: params.id },
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
    const { locale, name, description } = body;

    if (!locale || !LOCALES.includes(locale)) {
      return NextResponse.json(
        { error: "locale must be 'ur' or 'hi'" },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: "name is required" },
        { status: 400 }
      );
    }

    const category = await (prisma as any).category.findUnique({
      where: { id: params.id },
    });
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const data = {
      categoryId: params.id,
      locale,
      name,
      description: description ?? null,
    };

    const translation = await (prisma as any).categoryTranslation.upsert({
      where: { categoryId_locale: { categoryId: params.id, locale } },
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
