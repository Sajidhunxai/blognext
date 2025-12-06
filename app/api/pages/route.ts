import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const pages = await prisma.page.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(pages);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch pages" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, content, slug, published, metaTitle, metaDescription } = await req.json();

    if (!title || !content || !slug) {
      return NextResponse.json(
        { error: "Title, content, and slug are required" },
        { status: 400 }
      );
    }

    const existingPage = await prisma.page.findUnique({
      where: { slug },
    });

    if (existingPage) {
      return NextResponse.json(
        { error: "A page with this slug already exists" },
        { status: 400 }
      );
    }

    const page = await prisma.page.create({
      data: {
        title,
        content,
        slug,
        published: published !== undefined ? published : true,
        metaTitle: metaTitle || title,
        metaDescription,
      },
    });

    return NextResponse.json(page, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create page" },
      { status: 500 }
    );
  }
}

