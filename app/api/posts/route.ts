import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      title,
      content,
      slug,
      published,
      categoryId,
      allowComments,
      metaTitle,
      metaDescription,
      keywords,
      featuredImage,
      featuredImageAlt,
      downloadLink,
      developer,
      appSize,
      appVersion,
      requirements,
      downloads,
      googlePlayLink,
    } = await req.json();

    if (!title || !content || !slug) {
      return NextResponse.json(
        { error: "Title, content, and slug are required" },
        { status: 400 }
      );
    }

    const existingPost = await prisma.post.findUnique({
      where: { slug },
    });

    if (existingPost) {
      return NextResponse.json(
        { error: "A post with this slug already exists" },
        { status: 400 }
      );
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        slug,
        published: published || false,
        categoryId: categoryId || null,
        allowComments: allowComments !== undefined ? allowComments : true,
        authorId: session.user.id,
        metaTitle: metaTitle || title,
        metaDescription,
        keywords: keywords || [],
        featuredImage,
        featuredImageAlt,
        ogImage: featuredImage, // Open Graph image uses featured image
        ogImageAlt: featuredImageAlt, // Open Graph alt uses featured image alt
        downloadLink,
        developer,
        appSize,
        appVersion,
        requirements,
        downloads,
        googlePlayLink,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create post" },
      { status: 500 }
    );
  }
}

