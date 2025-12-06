import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { getSettings } from '@/lib/settings';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const settings = await getSettings();

  // Get all published posts
  let posts: any[] = [];
  try {
    posts = await prisma.post.findMany({
      where: { published: true },
      select: {
        slug: true,
        updatedAt: true,
        createdAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
  } catch (error) {
    console.error('Error fetching posts for sitemap:', error);
  }

  // Get all published pages
  let pages: any[] = [];
  try {
    if (prisma && 'page' in prisma) {
      pages = await (prisma as any).page.findMany({
        where: { published: true },
        select: {
          slug: true,
          updatedAt: true,
          createdAt: true,
        },
        orderBy: { updatedAt: 'desc' },
      });
    }
  } catch (error) {
    console.error('Error fetching pages for sitemap:', error);
  }

  // Get all categories
  let categories: any[] = [];
  try {
    if (prisma && 'category' in prisma) {
      categories = await (prisma as any).category.findMany({
        select: {
          slug: true,
        },
      });
    }
  } catch (error) {
    console.error('Error fetching categories for sitemap:', error);
  }

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];

  // Post routes
  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteUrl}/posts/${post.slug}`,
    lastModified: post.updatedAt || post.createdAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Page routes
  const pageRoutes: MetadataRoute.Sitemap = pages.map((page) => ({
    url: `${siteUrl}/pages/${page.slug}`,
    lastModified: page.updatedAt || page.createdAt,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Category routes
  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${siteUrl}/category/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...postRoutes, ...pageRoutes, ...categoryRoutes];
}

