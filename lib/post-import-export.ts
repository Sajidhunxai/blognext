import { prisma } from "@/lib/prisma";
import type { Post } from "@prisma/client";

export type ImportMode = "append" | "update";

export interface ImportPostData {
  id?: string;
  title?: string;
  content?: string;
  slug?: string;
  published?: boolean;
  categoryId?: string | null;
  category?: { name?: string; slug?: string } | null;
  allowComments?: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  keywords?: string[];
  focusKeyword?: string | null;
  noIndex?: boolean;
  faqs?: unknown;
  ogImage?: string | null;
  ogImageAlt?: string | null;
  featuredImage?: string | null;
  featuredImageAlt?: string | null;
  screenshots?: string[];
  downloadLink?: string | null;
  developer?: string | null;
  appSize?: string | null;
  appVersion?: string | null;
  requirements?: string | null;
  downloads?: string | null;
  googlePlayLink?: string | null;
  rating?: number | null;
  ratingCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export async function resolveCategoryId(
  postData: ImportPostData
): Promise<string | null> {
  if (postData.categoryId) {
    const existing = await prisma.category.findUnique({
      where: { id: postData.categoryId },
    });
    if (existing) return existing.id;
  }

  if (!postData.category) return null;

  const slug =
    postData.category.slug ||
    postData.category.name?.toLowerCase().replace(/\s+/g, "-") ||
    "uncategorized";

  const category = await prisma.category.upsert({
    where: { slug },
    update: {},
    create: {
      name: postData.category.name || "Uncategorized",
      slug,
      description: `Imported category: ${postData.category.name || "Uncategorized"}`,
    },
  });

  return category.id;
}

export function buildPostFields(postData: ImportPostData, categoryId: string | null) {
  return {
    title: postData.title!,
    content: postData.content ?? "",
    slug: postData.slug!,
    published: postData.published !== undefined ? postData.published : true,
    categoryId,
    allowComments:
      postData.allowComments !== undefined ? postData.allowComments : true,
    metaTitle: postData.metaTitle ?? null,
    metaDescription: postData.metaDescription ?? null,
    keywords: postData.keywords ?? [],
    focusKeyword: postData.focusKeyword ?? null,
    noIndex: postData.noIndex ?? false,
    faqs: postData.faqs ?? undefined,
    featuredImage: postData.featuredImage ?? null,
    featuredImageAlt: postData.featuredImageAlt ?? null,
    ogImage: postData.ogImage ?? null,
    ogImageAlt: postData.ogImageAlt ?? null,
    screenshots: postData.screenshots ?? [],
    downloadLink: postData.downloadLink ?? null,
    developer: postData.developer ?? null,
    appSize: postData.appSize ?? null,
    appVersion: postData.appVersion ?? null,
    requirements: postData.requirements ?? null,
    downloads: postData.downloads ?? null,
    googlePlayLink: postData.googlePlayLink ?? null,
    rating: postData.rating ?? null,
    ratingCount: postData.ratingCount ?? 0,
  };
}

export async function findExistingPost(
  id?: string,
  slug?: string
): Promise<Post | null> {
  if (id) {
    const byId = await prisma.post.findUnique({ where: { id } });
    if (byId) return byId;
  }

  if (slug) {
    return prisma.post.findUnique({ where: { slug } });
  }

  return null;
}

export async function validateSlugForUpdate(
  slug: string,
  existingPostId: string
): Promise<string | null> {
  const conflict = await prisma.post.findUnique({ where: { slug } });
  if (conflict && conflict.id !== existingPostId) {
    return `A post with slug "${slug}" already exists`;
  }
  return null;
}
