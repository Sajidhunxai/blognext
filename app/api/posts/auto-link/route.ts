import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { findRelatedPosts, addInternalLinks, updateMetaDescription } from "@/lib/internal-links";

/**
 * POST /api/posts/auto-link
 * Automatically find and add internal links to all posts or a specific post
 * 
 * Body: {
 *   postId?: string, // Optional: specific post ID, otherwise processes all posts
 *   maxLinksPerPost?: number // Optional: max links per post (default: 3)
 * }
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { postId, maxLinksPerPost = 3 } = await req.json();

    // Fetch posts to process
    const postsToProcess = postId
      ? await prisma.post.findMany({
          where: { id: postId, published: true },
          select: {
            id: true,
            title: true,
            content: true,
            metaDescription: true,
            published: true,
          },
        })
      : await prisma.post.findMany({
          where: { published: true },
          select: {
            id: true,
            title: true,
            content: true,
            metaDescription: true,
            published: true,
          },
        });

    if (postsToProcess.length === 0) {
      return NextResponse.json(
        { error: "No published posts found to process" },
        { status: 400 }
      );
    }

    // Fetch all published posts for finding related posts
    const allPosts = await prisma.post.findMany({
      where: { published: true },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        published: true,
      },
    });

    const results: Array<{
      postId: string;
      title: string;
      linksAdded: number;
      linkedPosts: Array<{ slug: string; title: string }>;
    }> = [];

    for (const post of postsToProcess) {
      // Find related posts
      const relatedPosts = findRelatedPosts(
        post.content,
        post.title,
        post.id,
        allPosts,
        maxLinksPerPost
      );

      if (relatedPosts.length === 0) {
        continue; // No related posts found
      }

      // Prepare links data
      const linksData = relatedPosts.map((related) => ({
        slug: related.slug,
        title: related.title,
      }));

      // Add internal links to content
      const { updatedContent, linksAdded } = addInternalLinks(
        post.content,
        linksData
      );

      if (linksAdded === 0) {
        continue; // No links were added (probably already exist)
      }

      // Update meta description
      const updatedMetaDescription = updateMetaDescription(
        post.metaDescription,
        relatedPosts,
        post.title
      );

      // Update the post
      await prisma.post.update({
        where: { id: post.id },
        data: {
          content: updatedContent,
          metaDescription: updatedMetaDescription,
        },
      });

      results.push({
        postId: post.id,
        title: post.title,
        linksAdded,
        linkedPosts: relatedPosts.map((p) => ({
          slug: p.slug,
          title: p.title,
        })),
      });
    }

    return NextResponse.json({
      success: true,
      message: `Auto-linked ${results.length} post(s)`,
      results,
    });
  } catch (error: any) {
    console.error("Error auto-linking posts:", error);
    return NextResponse.json(
      { error: error.message || "Failed to auto-link posts" },
      { status: 500 }
    );
  }
}
