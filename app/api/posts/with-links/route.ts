import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractExistingLinks } from "@/lib/internal-links";

/**
 * GET /api/posts/with-links
 * Get all published posts with their internal links in a single query
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch all published posts
    const posts = await prisma.post.findMany({
      where: {
        published: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        published: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // First, extract all links from all posts and collect unique slugs
    const allLinksByPost = posts.map((post) => ({
      postId: post.id,
      postTitle: post.title,
      postSlug: post.slug,
      published: post.published,
      links: extractExistingLinks(post.content),
    }));

    // Collect all unique slugs
    const allUniqueSlugs = Array.from(
      new Set(
        allLinksByPost.flatMap((item) => item.links.map((link) => link.slug))
      )
    );

    // Fetch all linked posts in a single query
    const linkedPosts = await prisma.post.findMany({
      where: {
        slug: { in: allUniqueSlugs },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        published: true,
      },
    });

    // Create a map for quick lookup
    const linkedPostsMap = new Map(linkedPosts.map((p) => [p.slug, p]));

    // Map posts with their links
    const postsWithLinks = allLinksByPost.map((item) => {
      const linksWithDetails = item.links
        .map((link) => {
          const linkedPost = linkedPostsMap.get(link.slug);
          return {
            slug: link.slug,
            anchorText: link.anchorText,
            post: linkedPost || null,
          };
        })
        .filter((link) => link.post !== null);

      return {
        id: item.postId,
        title: item.postTitle,
        slug: item.postSlug,
        published: item.published,
        links: linksWithDetails,
      };
    });

    return NextResponse.json({
      posts: postsWithLinks,
    });
  } catch (error: any) {
    console.error("Error fetching posts with links:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch posts with links" },
      { status: 500 }
    );
  }
}

