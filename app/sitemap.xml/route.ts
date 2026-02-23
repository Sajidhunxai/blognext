import { prisma } from '@/lib/prisma';
import { getSettings } from '@/lib/settings';
import { locales } from '@/lib/i18n/config';

export const dynamic = 'force-dynamic';
export const revalidate = 7200;

/** Get full URL for a given locale (en = no prefix, others get /{locale} prefix). */
function localeUrl(siteUrl: string, basePath: string, locale: (typeof locales)[number]): string {
  const path = locale === 'en' ? basePath : `/${locale}${basePath}`;
  return `${siteUrl}${path}`;
}

/** Build the <xhtml:link> hreflang tags for all locales for a given base path. */
function buildHreflangTags(siteUrl: string, basePath: string): string {
  return locales
    .map((locale) => {
      const href = localeUrl(siteUrl, basePath, locale);
      return `    <xhtml:link rel="alternate" hreflang="${locale}" href="${href}"/>`;
    })
    .join('\n');
}

/** Build a single <url> XML block. */
function buildUrlEntry(
  url: string,
  lastmod: string,
  changefreq: string,
  priority: string,
  hreflangTags: string,
): string {
  return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${hreflangTags}
  </url>`;
}

function toISODate(date: Date | string | null | undefined): string {
  if (!date) return new Date().toISOString().split('T')[0];
  return new Date(date).toISOString().split('T')[0];
}

export async function GET(): Promise<Response> {
  const rawSiteUrl =
    process.env.NEXT_PUBLIC_CANONICAL_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://www.appmarka.com';
  const siteUrl = rawSiteUrl.replace(/\/+$/, '');

  try {
    await getSettings();
  } catch (error) {
    console.error('Error fetching settings for sitemap:', error);
  }

  let posts: any[] = [];
  try {
    posts = await Promise.race([
      prisma.post.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true, createdAt: true },
        orderBy: { updatedAt: 'desc' },
      }),
      new Promise<any[]>((resolve) => setTimeout(() => resolve([]), 5000)),
    ]);
  } catch (error) {
    console.error('Error fetching posts for sitemap:', error);
  }

  let pages: any[] = [];
  try {
    if ('page' in prisma) {
      pages = await Promise.race([
        (prisma as any).page.findMany({
          where: { published: true },
          select: { slug: true, updatedAt: true, createdAt: true },
          orderBy: { updatedAt: 'desc' },
        }),
        new Promise<any[]>((resolve) => setTimeout(() => resolve([]), 5000)),
      ]);
    }
  } catch (error) {
    console.error('Error fetching pages for sitemap:', error);
  }

  let categories: any[] = [];
  try {
    if ('category' in prisma) {
      categories = await Promise.race([
        (prisma as any).category.findMany({ select: { slug: true } }),
        new Promise<any[]>((resolve) => setTimeout(() => resolve([]), 5000)),
      ]);
    }
  } catch (error) {
    console.error('Error fetching categories for sitemap:', error);
  }

  const activeRedirects = new Set<string>();
  try {
    if ('redirect' in prisma) {
      const redirects: any[] = await Promise.race([
        (prisma as any).redirect.findMany({ where: { active: true }, select: { from: true } }),
        new Promise<any[]>((resolve) => setTimeout(() => resolve([]), 3000)),
      ]);
      redirects.forEach(({ from }: { from: string }) => {
        const normalized = from.startsWith('/') ? from : `/${from}`;
        const trimmed = normalized.replace(/\/+$/, '');
        activeRedirects.add(normalized);
        activeRedirects.add(trimmed);
        activeRedirects.add(`${trimmed}/`);
      });
      console.log(`Sitemap: Found ${activeRedirects.size} redirect paths to exclude`);
    }
  } catch (error) {
    console.error('Error fetching redirects for sitemap:', error);
  }

  const hasRedirect = (path: string): boolean => {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    const trimmed = normalized.replace(/\/+$/, '');
    return (
      activeRedirects.has(normalized) ||
      activeRedirects.has(trimmed) ||
      activeRedirects.has(`${trimmed}/`)
    );
  };

  const urlEntries: string[] = [];
  const today = toISODate(new Date());

  // Homepage — one entry per locale
  for (const locale of locales) {
    const path = locale === 'en' ? '/' : `/${locale}/`;
    if (hasRedirect(path)) continue;
    urlEntries.push(
      buildUrlEntry(
        localeUrl(siteUrl, '/', locale),
        today,
        'daily',
        '1.0',
        buildHreflangTags(siteUrl, '/'),
      ),
    );
  }

  // Post routes — one entry per locale per post
  for (const post of posts) {
    const basePath = `/post/${post.slug}`;
    if (
      hasRedirect(basePath) ||
      hasRedirect(`/ur${basePath}`) ||
      hasRedirect(`/hi${basePath}`)
    )
      continue;
    const lastmod = toISODate(post.updatedAt || post.createdAt);
    const hreflangTags = buildHreflangTags(siteUrl, basePath);
    for (const locale of locales) {
      const path = locale === 'en' ? basePath : `/${locale}${basePath}`;
      if (hasRedirect(path)) continue;
      urlEntries.push(
        buildUrlEntry(localeUrl(siteUrl, basePath, locale), lastmod, 'weekly', '0.8', hreflangTags),
      );
    }
  }

  // Page routes — one entry per locale per page
  for (const page of pages) {
    const basePath = `/pages/${page.slug}`;
    if (
      hasRedirect(basePath) ||
      hasRedirect(`/ur${basePath}`) ||
      hasRedirect(`/hi${basePath}`)
    )
      continue;
    const lastmod = toISODate(page.updatedAt || page.createdAt);
    const hreflangTags = buildHreflangTags(siteUrl, basePath);
    for (const locale of locales) {
      const path = locale === 'en' ? basePath : `/${locale}${basePath}`;
      if (hasRedirect(path)) continue;
      urlEntries.push(
        buildUrlEntry(
          localeUrl(siteUrl, basePath, locale),
          lastmod,
          'monthly',
          '0.6',
          hreflangTags,
        ),
      );
    }
  }

  // Category routes — one entry per locale per category
  for (const category of categories) {
    const basePath = `/category/${category.slug}`;
    if (
      hasRedirect(basePath) ||
      hasRedirect(`/ur${basePath}`) ||
      hasRedirect(`/hi${basePath}`)
    )
      continue;
    const hreflangTags = buildHreflangTags(siteUrl, basePath);
    for (const locale of locales) {
      const path = locale === 'en' ? basePath : `/${locale}${basePath}`;
      if (hasRedirect(path)) continue;
      urlEntries.push(
        buildUrlEntry(
          localeUrl(siteUrl, basePath, locale),
          today,
          'daily',
          '0.7',
          hreflangTags,
        ),
      );
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
>
${urlEntries.join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=7200, stale-while-revalidate=3600',
    },
  });
}
