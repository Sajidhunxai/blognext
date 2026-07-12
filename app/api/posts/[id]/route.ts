import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyIndexNowPost } from "@/lib/indexnow";

function invalidatePostCache(slug: string, postId?: string) {
  revalidateTag("posts");
  revalidateTag(`post-${slug}`);
  if (postId) revalidateTag(`related-${postId}`);
  revalidatePath(`/post/${slug}`);
}

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
      focusKeyword,
      noIndex,
      faqs,
      featuredImage,
      featuredImageAlt,
      screenshots,
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
      where: { id: params.id },
    });

    if (!existingPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const slugConflict = await prisma.post.findUnique({
      where: { slug },
    });

    if (slugConflict && slugConflict.id !== params.id) {
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
        focusKeyword: focusKeyword ?? undefined,
        noIndex: noIndex === true,
        faqs: Array.isArray(faqs) ? faqs : undefined,
        featuredImage,
        featuredImageAlt,
        screenshots: Array.isArray(screenshots) ? screenshots : undefined,
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

    if (post.published) {
      notifyIndexNowPost(post.slug, true);
      // If slug changed, also ping the old URL so search engines recrawl redirects
      if (existingPost.slug !== post.slug) {
        notifyIndexNowPost(existingPost.slug, true);
      }
    }

    invalidatePostCache(post.slug, post.id);
    if (existingPost.slug !== post.slug) {
      invalidatePostCache(existingPost.slug, existingPost.id);
    }

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
    const existing = await prisma.post.findUnique({
      where: { id: params.id },
      select: { slug: true, id: true },
    });

    await prisma.post.delete({
      where: { id: params.id },
    });

    if (existing) {
      invalidatePostCache(existing.slug, existing.id);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete post" },
      { status: 500 }
    );
  }
}

