import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { getSettings } from '@/lib/settings';
import { locales } from '@/lib/i18n/config';

// Mark as dynamic to prevent build-time execution
export const dynamic = 'force-dynamic';
export const revalidate = 7200; // Revalidate every 2 hours

/** Build hreflang alternates for a base path (e.g. /post/slug). English has no prefix. */
function buildAlternates(siteUrl: string, basePath: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const locale of locales) {
    const path = locale === 'en' ? basePath : `/${locale}${basePath}`;
    result[locale] = `${siteUrl}${path}`;
  }
  return result;
}

/** Get full URL for a locale (en = no prefix, ur/hi = /ur, /hi) */
function localeUrl(siteUrl: string, basePath: string, locale: (typeof locales)[number]): string {
  const path = locale === 'en' ? basePath : `/${locale}${basePath}`;
  return `${siteUrl}${path}`;
}

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

  // Get all active redirects to exclude from sitemap
  let activeRedirects: Set<string> = new Set();
  try {
    if (prisma && 'redirect' in prisma) {
      const redirectsPromise = (prisma as any).redirect.findMany({
        where: { active: true },
        select: { from: true },
      });
      
      const redirects = await Promise.race([
        redirectsPromise,
        new Promise<any[]>((resolve) => setTimeout(() => resolve([]), 3000))
      ]);
      
      // Normalize and store redirect paths (accounting for trailing slashes)
      redirects.forEach((redirect: any) => {
        const path = redirect.from;
        // Normalize: ensure leading slash, remove trailing slash for comparison
        const normalized = path.startsWith('/') ? path : `/${path}`;
        const withoutTrailing = normalized.replace(/\/+$/, '');
        activeRedirects.add(normalized);
        activeRedirects.add(withoutTrailing);
        activeRedirects.add(`${withoutTrailing}/`);
      });
      
      console.log(`Sitemap: Found ${activeRedirects.size} redirect paths to exclude`);
    }
  } catch (error) {
    console.error('Error fetching redirects for sitemap:', error);
  }

  // Helper function to check if a URL path has a redirect
  const hasRedirect = (path: string): boolean => {
    // Normalize the path for comparison
    const normalized = path.startsWith('/') ? path : `/${path}`;
    const withoutTrailing = normalized.replace(/\/+$/, '');
    
    return activeRedirects.has(normalized) || 
           activeRedirects.has(withoutTrailing) ||
           activeRedirects.has(`${withoutTrailing}/`);
  };

  // Homepage routes - one entry per locale with hreflang alternates
  const homepageBase = '/';
  const staticRoutes: MetadataRoute.Sitemap = [];
  const alternatesHome = buildAlternates(siteUrl, homepageBase);
  for (const locale of locales) {
    const path = locale === 'en' ? homepageBase : `/${locale}${homepageBase}`;
    if (!hasRedirect(path)) {
      staticRoutes.push({
        url: localeUrl(siteUrl, homepageBase, locale),
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
        alternates: { languages: alternatesHome },
      });
    }
  }

  // Post routes - one entry per locale per post, with hreflang alternates
  const postRoutes: MetadataRoute.Sitemap = [];
  for (const post of posts) {
    const basePath = `/post/${post.slug}`;
    if (hasRedirect(basePath) || hasRedirect(`/ur${basePath}`) || hasRedirect(`/hi${basePath}`)) continue;
    const alternates = buildAlternates(siteUrl, basePath);
    const lastMod = post.updatedAt || post.createdAt;
    for (const locale of locales) {
      const path = locale === 'en' ? basePath : `/${locale}${basePath}`;
      if (hasRedirect(path)) continue;
      postRoutes.push({
        url: localeUrl(siteUrl, basePath, locale),
        lastModified: lastMod,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
        alternates: { languages: alternates },
      });
    }
  }

  // Page routes - one entry per locale per page, with hreflang alternates
  const pageRoutes: MetadataRoute.Sitemap = [];
  for (const page of pages) {
    const basePath = `/pages/${page.slug}`;
    if (hasRedirect(basePath) || hasRedirect(`/ur${basePath}`) || hasRedirect(`/hi${basePath}`)) continue;
    const alternates = buildAlternates(siteUrl, basePath);
    const lastMod = page.updatedAt || page.createdAt;
    for (const locale of locales) {
      const path = locale === 'en' ? basePath : `/${locale}${basePath}`;
      if (hasRedirect(path)) continue;
      pageRoutes.push({
        url: localeUrl(siteUrl, basePath, locale),
        lastModified: lastMod,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
        alternates: { languages: alternates },
      });
    }
  }

  // Category routes - one entry per locale per category, with hreflang alternates
  const categoryRoutes: MetadataRoute.Sitemap = [];
  for (const category of categories) {
    const basePath = `/category/${category.slug}`;
    if (hasRedirect(basePath) || hasRedirect(`/ur${basePath}`) || hasRedirect(`/hi${basePath}`)) continue;
    const alternates = buildAlternates(siteUrl, basePath);
    for (const locale of locales) {
      const path = locale === 'en' ? basePath : `/${locale}${basePath}`;
      if (hasRedirect(path)) continue;
      categoryRoutes.push({
        url: localeUrl(siteUrl, basePath, locale),
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.7,
        alternates: { languages: alternates },
      });
    }
  }

  return [...staticRoutes, ...postRoutes, ...pageRoutes, ...categoryRoutes];
}

