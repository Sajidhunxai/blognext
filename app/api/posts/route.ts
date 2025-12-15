import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const categoryId = searchParams.get("categoryId");
    const published = searchParams.get("published");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (published !== null) {
      where.published = published === "true";
    }

    // Get total count
    const total = await prisma.post.count({ where });

    // Get posts
    const posts = await prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch posts" },
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
        rating: rating !== undefined && rating !== null ? parseFloat(rating) : null,
        ratingCount: ratingCount !== undefined ? parseInt(ratingCount) : 0,
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

