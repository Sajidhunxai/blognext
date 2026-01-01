import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractExistingLinks } from "@/lib/internal-links";

/**
 * GET /api/posts/[id]/links
 * Get all internal links in a post's content
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        content: true,
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Extract existing links
    const links = extractExistingLinks(post.content);

    // Get full post details for each linked post
    const linksWithDetails = await Promise.all(
      links.map(async (link) => {
        const linkedPost = await prisma.post.findUnique({
          where: { slug: link.slug },
          select: {
            id: true,
            title: true,
            slug: true,
            published: true,
          },
        });

        return {
          slug: link.slug,
          anchorText: link.anchorText,
          post: linkedPost,
        };
      })
    );

    return NextResponse.json({
      postId: post.id,
      postTitle: post.title,
      links: linksWithDetails.filter((link) => link.post !== null),
    });
  } catch (error: any) {
    console.error("Error fetching post links:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch post links" },
      { status: 500 }
    );
  }
}
