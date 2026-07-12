import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

const postDetailInclude = {
  author: {
    select: {
      name: true,
      email: true,
    },
  },
  category: {
    select: {
      name: true,
      slug: true,
    },
  },
  comments: {
    where: {
      approved: true,
    },
    select: {
      id: true,
      content: true,
      authorName: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc" as const,
    },
    take: 20,
  },
};

/** `unstable_cache` serializes Dates as strings — revive for callers. */
function revivePostDates<T extends Record<string, any> | null>(post: T): T {
  if (!post) return post;
  if (typeof post.createdAt === "string") post.createdAt = new Date(post.createdAt);
  if (typeof post.updatedAt === "string") post.updatedAt = new Date(post.updatedAt);
  if (Array.isArray(post.comments)) {
    post.comments = post.comments.map((c: any) => ({
      ...c,
      createdAt: typeof c.createdAt === "string" ? new Date(c.createdAt) : c.createdAt,
    }));
  }
  return post;
}

/**
 * Cached post-by-slug. React `cache` dedupes within a single request
 * (metadata + page). `unstable_cache` shares across requests for ISR.
 */
export const getPostBySlug = cache(async (slug: string) => {
  const post = await unstable_cache(
    async () => {
      return prisma.post.findUnique({
        where: { slug },
        include: postDetailInclude,
      });
    },
    ["post-by-slug", slug],
    { revalidate: 21600, tags: ["posts", `post-${slug}`] }
  )();
  return revivePostDates(post);
});

/** Related posts for a post page — same-category first, then latest fill. */
export const getRelatedPosts = cache(
  async (postId: string, categoryId: string | null | undefined) => {
    const cacheKey = categoryId || "none";
    return unstable_cache(
      async () => {
        const postsByCategory = categoryId
          ? await prisma.post.findMany({
              where: {
                published: true,
                id: { not: postId },
                categoryId,
              },
              take: 6,
              orderBy: { createdAt: "desc" },
              select: {
                id: true,
                title: true,
                slug: true,
                featuredImage: true,
                rating: true,
              },
            })
          : [];

        const needMore = 6 - postsByCategory.length;
        const extraPosts =
          needMore > 0
            ? await prisma.post.findMany({
                where: {
                  published: true,
                  id: {
                    notIn: [postId, ...postsByCategory.map((p) => p.id)],
                  },
                },
                take: needMore,
                orderBy: { createdAt: "desc" },
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  featuredImage: true,
                  rating: true,
                },
              })
            : [];

        return [...postsByCategory, ...extraPosts].slice(0, 6);
      },
      ["related-posts", postId, cacheKey],
      { revalidate: 21600, tags: ["posts", `related-${postId}`] }
    )();
  }
);
