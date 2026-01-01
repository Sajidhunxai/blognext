import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addInternalLinks, updateMetaDescription } from "@/lib/internal-links";

/**
 * POST /api/posts/[id]/internal-links
 * Add internal links to a post
 * 
 * Body: {
 *   linkIds: string[], // Array of post IDs to link to
 *   anchorTexts?: { [postId: string]: string } // Optional custom anchor text for each link
 * }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { linkIds, anchorTexts = {} } = await req.json();

    if (!Array.isArray(linkIds) || linkIds.length === 0) {
      return NextResponse.json(
        { error: "linkIds must be a non-empty array" },
        { status: 400 }
      );
    }

    // Fetch the target post
    const targetPost = await prisma.post.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        content: true,
        metaDescription: true,
      },
    });

    if (!targetPost) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Fetch the posts to link to
    const linkedPosts = await prisma.post.findMany({
      where: {
        id: { in: linkIds },
      },
      select: {
        id: true,
        slug: true,
        title: true,
      },
    });

    if (linkedPosts.length === 0) {
      return NextResponse.json(
        { error: "No valid posts found to link to" },
        { status: 400 }
      );
    }

    // Prepare links data
    const linksData = linkedPosts.map((post) => ({
      slug: post.slug,
      title: post.title,
      anchorText: anchorTexts[post.id],
    }));

    // Add internal links to content
    const { updatedContent, linksAdded } = addInternalLinks(
      targetPost.content,
      linksData
    );

    // Update meta description
    const updatedMetaDescription = updateMetaDescription(
      targetPost.metaDescription,
      linkedPosts,
      targetPost.title
    );

    // Update the post
    const updatedPost = await prisma.post.update({
      where: { id: params.id },
      data: {
        content: updatedContent,
        metaDescription: updatedMetaDescription,
      },
      select: {
        id: true,
        title: true,
        slug: true,
      },
    });

    return NextResponse.json({
      success: true,
      post: updatedPost,
      linksAdded,
      message: `Successfully added ${linksAdded} internal link(s) to the post`,
    });
  } catch (error: any) {
    console.error("Error adding internal links:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add internal links" },
      { status: 500 }
    );
  }
}
