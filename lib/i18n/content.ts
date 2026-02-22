/**
 * Fetches content with locale support.
 * English: uses source Post/Page/Settings
 * Urdu/Hindi: merges PostTranslation/PageTranslation/SettingsTranslation
 */

import { prisma } from "@/lib/prisma";
import type { Locale } from "./config";

export async function getPostWithLocale(slug: string, locale: Locale) {
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      author: { select: { name: true, email: true } },
      category: { select: { name: true, slug: true } },
      comments: {
        where: { approved: true },
        select: { id: true, content: true, authorName: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      ...(locale !== "en" && { translations: { where: { locale } } }),
    },
  });

  if (!post) return null;

  if (locale === "en") {
    return post;
  }

  const t = (post as any).translations?.[0];
  if (!t) return post; // fallback to English

  return {
    ...post,
    title: t.title,
    content: t.content,
    metaTitle: t.metaTitle ?? post.metaTitle,
    metaDescription: t.metaDescription ?? post.metaDescription,
    keywords: t.keywords?.length ? t.keywords : post.keywords,
    focusKeyword: t.focusKeyword ?? post.focusKeyword,
    faqs: t.faqs ?? post.faqs,
    ogImageAlt: t.ogImageAlt ?? post.ogImageAlt,
    featuredImageAlt: t.featuredImageAlt ?? post.featuredImageAlt,
    developer: t.developer ?? post.developer,
    requirements: t.requirements ?? post.requirements,
  };
}

export async function getSettingsWithLocale(locale: Locale) {
  const settings = await prisma.settings.findFirst({
    orderBy: { updatedAt: "desc" },
    ...(locale !== "en" && {
      include: { translations: { where: { locale } } },
    }),
  });

  if (!settings) return null;

  if (locale === "en") return settings;

  const t = (settings as any).translations?.[0];
  if (!t) return settings;

  return {
    ...settings,
    siteName: t.siteName ?? settings.siteName,
    heroTitle: t.heroTitle ?? settings.heroTitle,
    heroSubtitle: t.heroSubtitle ?? settings.heroSubtitle,
    metaTitle: t.metaTitle ?? settings.metaTitle,
    metaDescription: t.metaDescription ?? settings.metaDescription,
    whyChooseTitle: t.whyChooseTitle ?? settings.whyChooseTitle,
    whyChooseSubtitle: t.whyChooseSubtitle ?? settings.whyChooseSubtitle,
    whyChooseFeatures: t.whyChooseFeatures ?? settings.whyChooseFeatures,
    headerMenu: t.headerMenu ?? settings.headerMenu,
    footerLinks: t.footerLinks ?? settings.footerLinks,
  };
}

export async function getPageWithLocale(slug: string, locale: Locale) {
  const page = await prisma.page.findUnique({
    where: { slug },
    ...(locale !== "en" && { include: { translations: { where: { locale } } } }),
  });

  if (!page) return null;

  if (locale === "en") return page;

  const t = (page as any).translations?.[0];
  if (!t) return page;

  return {
    ...page,
    title: t.title,
    content: t.content,
    metaTitle: t.metaTitle ?? page.metaTitle,
    metaDescription: t.metaDescription ?? page.metaDescription,
    featuredImageAlt: t.featuredImageAlt ?? page.featuredImageAlt,
  };
}

export async function getCategoryWithLocale(slug: string, locale: Locale) {
  const category = await prisma.category.findUnique({
    where: { slug },
    ...(locale !== "en" && { include: { translations: { where: { locale } } } }),
  });

  if (!category) return null;

  if (locale === "en") return category;

  const t = (category as any).translations?.[0];
  if (!t) return category;

  return {
    ...category,
    name: t.name,
    description: t.description ?? category.description,
  };
}

/** Fetch categories with locale support */
export async function getCategoriesWithLocale(locale: Locale) {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { posts: true } },
      ...(locale !== "en" && { translations: { where: { locale } } }),
    },
  });

  if (locale === "en") return categories;

  return categories.map((c: any) => {
    const t = c.translations?.[0];
    return {
      ...c,
      name: t?.name ?? c.name,
      description: t?.description ?? c.description,
    };
  });
}

/** Fetch posts for listing (home, category) with optional translation titles */
export async function getPostsWithLocale(opts: {
  where?: any;
  skip?: number;
  take?: number;
  orderBy?: any;
  includeCategory?: boolean;
  locale: Locale;
}) {
  const { where = { published: true }, skip = 0, take = 12, orderBy = { createdAt: "desc" }, includeCategory = true, locale } = opts;
  const posts = await prisma.post.findMany({
    where,
    skip,
    take,
    orderBy,
    include: {
      ...(includeCategory && { category: { select: { name: true, slug: true } } }),
      ...(locale !== "en" && { translations: { where: { locale } } }),
    },
  });

  if (locale === "en") return posts;

  return posts.map((p: any) => {
    const t = p.translations?.[0];
    return {
      ...p,
      title: t?.title ?? p.title,
    };
  });
}
