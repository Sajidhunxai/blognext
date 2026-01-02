import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { getSettings } from '@/lib/settings';

// Mark as dynamic to prevent build-time execution
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Use canonical domain: https://www.appmarka.com
  // Fallback to env vars for local development
  const rawSiteUrl = process.env.NEXT_PUBLIC_CANONICAL_URL || 
                     process.env.NEXTAUTH_URL || 
                     process.env.NEXT_PUBLIC_SITE_URL || 
                     'https://www.appmarka.com';
  const siteUrl = rawSiteUrl.replace(/\/+$/, ''); // Remove trailing slashes
  
  // Get settings with error handling
  let settings;
  try {
    settings = await getSettings();
  } catch (error) {
    console.error('Error fetching settings for sitemap:', error);
    settings = { siteName: 'Blog CMS' };
  }

  // Get all published posts with timeout and error handling
  let posts: any[] = [];
  try {
    const postsPromise = prisma.post.findMany({
      where: { published: true },
      select: {
        slug: true,
        updatedAt: true,
        createdAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });
    
    // Add timeout to prevent hanging
    posts = await Promise.race([
      postsPromise,
      new Promise<any[]>((resolve) => setTimeout(() => resolve([]), 5000))
    ]);
  } catch (error) {
    console.error('Error fetching posts for sitemap:', error);
    posts = [];
  }

  // Get all published pages with timeout and error handling
  let pages: any[] = [];
  try {
    if (prisma && 'page' in prisma) {
      const pagesPromise = (prisma as any).page.findMany({
        where: { published: true },
        select: {
          slug: true,
          updatedAt: true,
          createdAt: true,
        },
        orderBy: { updatedAt: 'desc' },
      });
      
      pages = await Promise.race([
        pagesPromise,
        new Promise<any[]>((resolve) => setTimeout(() => resolve([]), 5000))
      ]);
    }
  } catch (error) {
    console.error('Error fetching pages for sitemap:', error);
    pages = [];
  }

  // Get all categories with timeout and error handling
  let categories: any[] = [];
  try {
    if (prisma && 'category' in prisma) {
      const categoriesPromise = (prisma as any).category.findMany({
        select: {
          slug: true,
        },
      });
      
      categories = await Promise.race([
        categoriesPromise,
        new Promise<any[]>((resolve) => setTimeout(() => resolve([]), 5000))
      ]);
    }
  } catch (error) {
    console.error('Error fetching categories for sitemap:', error);
    categories = [];
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

