import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        { error: "Slug parameter is required" },
        { status: 400 }
      );
    }

    const post = await prisma.post.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        downloadLink: true,
        appVersion: true,
        appSize: true,
        requirements: true,
        developer: true,
        downloads: true,
        featuredImage: true,
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch post" },
      { status: 500 }
    );
  }
}

