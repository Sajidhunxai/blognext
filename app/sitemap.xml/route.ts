import { prisma } from '@/lib/prisma';
import { getSettings } from '@/lib/settings';
import { locales } from '@/lib/i18n/config';

export const dynamic = 'force-dynamic';
export const revalidate = 7200; // 2 hours

// ── helpers ────────────────────────────────────────────────────────────────

function siteBase(raw: string) {
  return raw.replace(/\/+$/, '');
}

function toISODate(date: Date | string | null | undefined): string {
  if (!date) return new Date().toISOString().split('T')[0];
  const d = new Date(date);
  return isNaN(d.getTime()) ? new Date().toISOString().split('T')[0] : d.toISOString().split('T')[0];
}

/** Escape XML special characters in attribute values / text nodes. */
function xmlEsc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function localeUrl(base: string, path: string, locale: (typeof locales)[number]): string {
  const prefixed = locale === 'en' ? path : `/${locale}${path}`;
  return `${base}${prefixed}`;
}

function hreflangTags(base: string, path: string): string {
  const lines = locales.map(
    (l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${xmlEsc(localeUrl(base, path, l))}"/>`,
  );
  // Add x-default pointing to the English URL
  lines.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${xmlEsc(localeUrl(base, path, 'en'))}"/>`);
  return lines.join('\n');
}

interface ImageEntry {
  loc: string;
  title?: string;
  caption?: string;
}

function buildUrl(opts: {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
  hreflang: string;
  images?: ImageEntry[];
}): string {
  const imageTags =
    opts.images && opts.images.length
      ? opts.images
          .map(
            (img) =>
              `    <image:image>\n      <image:loc>${xmlEsc(img.loc)}</image:loc>${
                img.title ? `\n      <image:title>${xmlEsc(img.title)}</image:title>` : ''
              }${img.caption ? `\n      <image:caption>${xmlEsc(img.caption)}</image:caption>` : ''}\n    </image:image>`,
          )
          .join('\n')
      : '';

  return `  <url>
    <loc>${xmlEsc(opts.loc)}</loc>
    <lastmod>${opts.lastmod}</lastmod>
    <changefreq>${opts.changefreq}</changefreq>
    <priority>${opts.priority}</priority>
${opts.hreflang}${imageTags ? '\n' + imageTags : ''}
  </url>`;
}

// ── Route handler ───────────────────────────────────────────────────────────

export async function GET(): Promise<Response> {
  const rawBase =
    process.env.NEXT_PUBLIC_CANONICAL_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://www.appmarka.com';
  const base = siteBase(rawBase);
  const today = toISODate(new Date());

  // ── Fetch all data in parallel ──────────────────────────────────────────
  const timeout = <T>(ms: number, fallback: T) =>
    new Promise<T>((res) => setTimeout(() => res(fallback), ms));

  const [posts, pages, categoriesRaw, redirectsRaw] = await Promise.all([
    Promise.race([
      prisma.post.findMany({
        where: { published: true },
        select: {
          slug: true,
          title: true,
          updatedAt: true,
          createdAt: true,
          featuredImage: true,
          metaDescription: true,
          categoryId: true,
        },
        orderBy: { updatedAt: 'desc' },
      }),
      timeout(5000, [] as any[]),
    ]).catch(() => [] as any[]),

    Promise.race([
      'page' in prisma
        ? (prisma as any).page.findMany({
            where: { published: true },
            select: { slug: true, title: true, updatedAt: true, createdAt: true },
            orderBy: { updatedAt: 'desc' },
          })
        : Promise.resolve([] as any[]),
      timeout(5000, [] as any[]),
    ]).catch(() => [] as any[]),

    Promise.race([
      'category' in prisma
        ? (prisma as any).category.findMany({
            select: {
              slug: true,
              name: true,
              posts: {
                where: { published: true },
                select: { updatedAt: true },
                orderBy: { updatedAt: 'desc' },
                take: 1,
              },
            },
          })
        : Promise.resolve([] as any[]),
      timeout(5000, [] as any[]),
    ]).catch(() => [] as any[]),

    Promise.race([
      'redirect' in prisma
        ? (prisma as any).redirect.findMany({
            where: { active: true },
            select: { from: true },
          })
        : Promise.resolve([] as any[]),
      timeout(3000, [] as any[]),
    ]).catch(() => [] as any[]),
  ]);

  await getSettings().catch(() => null);

  // ── Build redirect exclusion set ────────────────────────────────────────
  const excluded = new Set<string>();
  for (const { from } of redirectsRaw) {
    const norm = from.startsWith('/') ? from : `/${from}`;
    const trim = norm.replace(/\/+$/, '');
    excluded.add(norm);
    excluded.add(trim);
    excluded.add(`${trim}/`);
  }
  const isExcluded = (path: string) => {
    const n = path.startsWith('/') ? path : `/${path}`;
    const t = n.replace(/\/+$/, '');
    return excluded.has(n) || excluded.has(t) || excluded.has(`${t}/`);
  };

  const entries: string[] = [];

  // ── 1. Homepage ──────────────────────────────────────────────────────────
  if (!isExcluded('/')) {
    entries.push(
      buildUrl({
        loc: localeUrl(base, '/', 'en'),
        lastmod: today,
        changefreq: 'daily',
        priority: '1.0',
        hreflang: hreflangTags(base, '/'),
      }),
    );
  }

  // ── 2. Posts ─────────────────────────────────────────────────────────────
  for (const post of posts) {
    const path = `/post/${post.slug}`;
    if (isExcluded(path)) continue;

    const lastmod = toISODate(post.updatedAt || post.createdAt);

    // Collect images: featured image first, then og image if different
    const images: ImageEntry[] = [];
    if (post.featuredImage) {
      const imgUrl = post.featuredImage.startsWith('http')
        ? post.featuredImage
        : `${base}${post.featuredImage}`;
      images.push({
        loc: imgUrl,
        title: post.title || undefined,
        caption: post.metaDescription?.slice(0, 200) || post.title || undefined,
      });
    }

    for (const locale of locales) {
      const localePath = locale === 'en' ? path : `/${locale}${path}`;
      if (isExcluded(localePath)) continue;
      entries.push(
        buildUrl({
          loc: localeUrl(base, path, locale),
          lastmod,
          changefreq: 'weekly',
          priority: '0.8',
          hreflang: hreflangTags(base, path),
          images: locale === 'en' ? images : [], // images only on canonical (en)
        }),
      );
    }
  }

  // ── 3. Categories ────────────────────────────────────────────────────────
  for (const cat of categoriesRaw) {
    // Skip categories with no published posts
    if (!cat.posts || cat.posts.length === 0) continue;

    const path = `/category/${cat.slug}`;
    if (isExcluded(path)) continue;

    // Use the most recently updated post as category lastmod
    const lastmod = cat.posts[0]?.updatedAt ? toISODate(cat.posts[0].updatedAt) : today;

    for (const locale of locales) {
      const localePath = locale === 'en' ? path : `/${locale}${path}`;
      if (isExcluded(localePath)) continue;
      entries.push(
        buildUrl({
          loc: localeUrl(base, path, locale),
          lastmod,
          changefreq: 'weekly',
          priority: '0.7',
          hreflang: hreflangTags(base, path),
        }),
      );
    }
  }

  // ── 4. Static pages ──────────────────────────────────────────────────────
  for (const page of pages) {
    const path = `/pages/${page.slug}`;
    if (isExcluded(path)) continue;

    const lastmod = toISODate(page.updatedAt || page.createdAt);

    for (const locale of locales) {
      const localePath = locale === 'en' ? path : `/${locale}${path}`;
      if (isExcluded(localePath)) continue;
      entries.push(
        buildUrl({
          loc: localeUrl(base, path, locale),
          lastmod,
          changefreq: 'monthly',
          priority: '0.5',
          hreflang: hreflangTags(base, path),
        }),
      );
    }
  }

  // ── Assemble XML ─────────────────────────────────────────────────────────
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
>
${entries.join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=7200, s-maxage=7200, stale-while-revalidate=3600',
      'X-Robots-Tag': 'noindex', // sitemap itself should not be indexed
    },
  });
}
