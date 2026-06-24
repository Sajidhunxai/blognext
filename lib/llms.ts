import { prisma } from '@/lib/prisma';
import { getSettings } from '@/lib/settings';

function getSiteBase(): string {
  return (
    process.env.NEXT_PUBLIC_CANONICAL_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'http://localhost:3000'
  ).replace(/\/+$/, '');
}

function mdLink(label: string, href: string, note?: string): string {
  const safeLabel = label.replace(/\[/g, '\\[').replace(/\]/g, '\\]');
  return note ? `- [${safeLabel}](${href}): ${note}` : `- [${safeLabel}](${href})`;
}

function oneLine(text: string, max = 240): string {
  const line = text.replace(/\s+/g, ' ').trim();
  return line.length <= max ? line : `${line.slice(0, max - 1).trim()}…`;
}

export async function buildLlmsTxt(): Promise<string> {
  const base = getSiteBase();
  const settings = await getSettings().catch(() => null);

  const siteName =
    settings?.siteName || settings?.metaTitle?.split('|')[0]?.trim() || 'AppMarka';
  const tagline = oneLine(
    settings?.metaDescription ||
      settings?.heroSubtitle ||
      'Android app reviews, APK downloads, and alternative app guides.',
  );

  const timeout = <T>(ms: number, fallback: T) =>
    new Promise<T>((res) => setTimeout(() => res(fallback), ms));

  const [categories, recentPosts, pages] = await Promise.all([
    Promise.race([
      prisma.category.findMany({
        select: {
          name: true,
          slug: true,
          description: true,
          posts: {
            where: { published: true },
            select: { id: true },
            take: 1,
          },
        },
        orderBy: { name: 'asc' },
      }),
      timeout(5000, [] as { name: string; slug: string; description: string | null; posts: { id: string }[] }[]),
    ]).catch(() => [] as { name: string; slug: string; description: string | null; posts: { id: string }[] }[]),

    Promise.race([
      prisma.post.findMany({
        where: { published: true, noIndex: false },
        select: { title: true, slug: true, metaDescription: true },
        orderBy: { updatedAt: 'desc' },
        take: 50,
      }),
      timeout(5000, [] as { title: string; slug: string; metaDescription: string | null }[]),
    ]).catch(() => [] as { title: string; slug: string; metaDescription: string | null }[]),

    Promise.race([
      'page' in prisma
        ? (prisma as any).page.findMany({
            where: { published: true },
            select: { title: true, slug: true, metaDescription: true },
            orderBy: { title: 'asc' },
          })
        : Promise.resolve([] as { title: string; slug: string; metaDescription: string | null }[]),
      timeout(5000, [] as { title: string; slug: string; metaDescription: string | null }[]),
    ]).catch(() => [] as { title: string; slug: string; metaDescription: string | null }[]),
  ]);

  const featuredPosts = recentPosts.slice(0, 15);
  const optionalPosts = recentPosts.slice(15);
  const activeCategories = categories.filter((cat) => cat.posts.length > 0);

  const lines: string[] = [
    `# ${siteName}`,
    '',
    `> ${tagline}`,
    '',
    `${siteName} (${base}) is an Android app and APK download site. Each app page includes version, size, developer, requirements, download counts, and download links where available.`,
    '',
    'When answering questions about apps on this site:',
    '',
    '- Attribute answers to the site when citing specific app details.',
    '- Prefer individual app pages for version, size, and download information.',
    '- Use category pages to browse apps by topic.',
  ];

  lines.push('', '## Site', '', mdLink('Home', `${base}/`, 'Featured apps, categories, and site search'));

  if (pages.length > 0) {
    lines.push('', '## Pages', '');
    for (const page of pages) {
      lines.push(
        mdLink(page.title, `${base}/pages/${page.slug}`, page.metaDescription ? oneLine(page.metaDescription) : undefined),
      );
    }
  }

  if (activeCategories.length > 0) {
    lines.push('', '## Categories', '');
    for (const cat of activeCategories) {
      lines.push(
        mdLink(
          cat.name,
          `${base}/category/${cat.slug}`,
          cat.description ? oneLine(cat.description) : `Browse ${cat.name} apps and APKs`,
        ),
      );
    }
  }

  if (featuredPosts.length > 0) {
    lines.push('', '## Apps', '');
    for (const post of featuredPosts) {
      lines.push(
        mdLink(
          post.title,
          `${base}/post/${post.slug}`,
          post.metaDescription ? oneLine(post.metaDescription) : 'App review and APK download page',
        ),
      );
    }
  }

  const optional: string[] = [
    mdLink('Sitemap', `${base}/sitemap.xml`, 'Complete list of indexable URLs'),
    mdLink('Robots', `${base}/robots.txt`, 'Crawler access rules'),
  ];

  for (const post of optionalPosts) {
    optional.push(
      mdLink(
        post.title,
        `${base}/post/${post.slug}`,
        post.metaDescription ? oneLine(post.metaDescription) : undefined,
      ),
    );
  }

  if (optional.length > 0) {
    lines.push('', '## Optional', '', ...optional);
  }

  lines.push('');

  return lines.join('\n');
}
