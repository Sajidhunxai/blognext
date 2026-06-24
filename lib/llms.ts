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

function mdLink(label: string, href: string): string {
  return `- [${label}](${href})`;
}

export async function buildLlmsTxt(): Promise<string> {
  const base = getSiteBase();
  const settings = await getSettings().catch(() => null);

  const siteName =
    settings?.siteName || settings?.metaTitle?.split('|')[0]?.trim() || 'AppMarka';
  const tagline =
    settings?.metaDescription ||
    settings?.heroSubtitle ||
    'Android app reviews, APK downloads, and alternative app guides.';

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
        take: 25,
      }),
      timeout(5000, [] as { title: string; slug: string; metaDescription: string | null }[]),
    ]).catch(() => [] as { title: string; slug: string; metaDescription: string | null }[]),

    Promise.race([
      'page' in prisma
        ? (prisma as any).page.findMany({
            where: { published: true },
            select: { title: true, slug: true },
            orderBy: { title: 'asc' },
          })
        : Promise.resolve([] as { title: string; slug: string }[]),
      timeout(5000, [] as { title: string; slug: string }[]),
    ]).catch(() => [] as { title: string; slug: string }[]),
  ]);

  const lines: string[] = [
    `# ${siteName}`,
    '',
    `> ${tagline}`,
    '',
    '## About',
    '',
    `${siteName} (${base}) publishes Android app reviews, APK download guides, and app discovery content.`,
    '',
    '## Key pages',
    '',
    mdLink('Home', `${base}/`),
    mdLink('Sitemap', `${base}/sitemap.xml`),
  ];

  if (pages.length > 0) {
    lines.push('', '## Pages', '');
    for (const page of pages) {
      lines.push(mdLink(page.title, `${base}/pages/${page.slug}`));
    }
  }

  const activeCategories = categories.filter((cat) => cat.posts.length > 0);

  if (activeCategories.length > 0) {
    lines.push('', '## Categories', '');
    for (const cat of activeCategories) {
      const desc = cat.description ? `: ${cat.description}` : '';
      lines.push(`${mdLink(cat.name, `${base}/category/${cat.slug}`)}${desc}`);
    }
  }

  if (recentPosts.length > 0) {
    lines.push('', '## Recent apps & posts', '');
    for (const post of recentPosts) {
      const desc = post.metaDescription ? `: ${post.metaDescription}` : '';
      lines.push(`${mdLink(post.title, `${base}/post/${post.slug}`)}${desc}`);
    }
  }

  lines.push(
    '',
    '## Usage',
    '',
    `You may use content from ${siteName} to answer questions about Android apps listed on this site. Please attribute ${siteName} (${base}) when referencing specific app details.`,
    '',
    '## Contact',
    '',
    `Visit ${base} for inquiries.`,
    '',
  );

  return lines.join('\n');
}
