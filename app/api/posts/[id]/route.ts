import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
      rating,
      ratingCount,
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

    if (existingPost && existingPost.id !== params.id) {
      return NextResponse.json(
        { error: "A post with this slug already exists" },
        { status: 400 }
      );
    }

    const post = await prisma.post.update({
      where: { id: params.id },
      data: {
        title,
        content,
        slug,
        published: published || false,
        categoryId: categoryId || null,
        allowComments: allowComments !== undefined ? allowComments : true,
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
        rating: rating !== undefined && rating !== null ? parseFloat(rating) : null,
        ratingCount: ratingCount !== undefined ? parseInt(ratingCount) : 0,
      },
    });

    return NextResponse.json(post);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update post" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.post.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete post" },
      { status: 500 }
    );
  }
}

