import { prisma } from '@/lib/prisma';
import { getSettings } from '@/lib/settings';

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

function xmlEsc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
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
    <priority>${opts.priority}</priority>${imageTags ? '\n' + imageTags : ''}
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

  const timeout = <T>(ms: number, fallback: T) =>
    new Promise<T>((res) => setTimeout(() => res(fallback), ms));

  const [posts, pages, categoriesRaw, redirectsRaw] = await Promise.all([
    Promise.race([
      prisma.post.findMany({
        where: { published: true, noIndex: false },
        select: {
          slug: true,
          title: true,
          updatedAt: true,
          createdAt: true,
          featuredImage: true,
          metaDescription: true,
        },
        orderBy: { updatedAt: 'desc' },
      }),
      timeout(5000, [] as any[]),
    ]).catch(() => [] as any[]),

    Promise.race([
      'page' in prisma
        ? (prisma as any).page.findMany({
            where: { published: true },
            select: { slug: true, updatedAt: true, createdAt: true },
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

  // Build redirect exclusion set
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

  // 1. Homepage
  if (!isExcluded('/')) {
    entries.push(
      buildUrl({
        loc: `${base}/`,
        lastmod: today,
        changefreq: 'daily',
        priority: '1.0',
      }),
    );
  }

  // 2. Posts
  for (const post of posts) {
    const path = `/post/${post.slug}`;
    if (isExcluded(path)) continue;

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

    entries.push(
      buildUrl({
        loc: `${base}${path}`,
        lastmod: toISODate(post.updatedAt || post.createdAt),
        changefreq: 'weekly',
        priority: '0.8',
        images,
      }),
    );
  }

  // 3. Categories
  for (const cat of categoriesRaw) {
    if (!cat.posts || cat.posts.length === 0) continue;
    const path = `/category/${cat.slug}`;
    if (isExcluded(path)) continue;

    entries.push(
      buildUrl({
        loc: `${base}${path}`,
        lastmod: cat.posts[0]?.updatedAt ? toISODate(cat.posts[0].updatedAt) : today,
        changefreq: 'weekly',
        priority: '0.7',
      }),
    );
  }

  // 4. Static pages
  for (const page of pages) {
    const path = `/pages/${page.slug}`;
    if (isExcluded(path)) continue;

    entries.push(
      buildUrl({
        loc: `${base}${path}`,
        lastmod: toISODate(page.updatedAt || page.createdAt),
        changefreq: 'monthly',
        priority: '0.5',
      }),
    );
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
>
${entries.join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=7200, s-maxage=7200, stale-while-revalidate=3600',
      'X-Robots-Tag': 'noindex',
    },
  });
}
