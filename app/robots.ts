import { MetadataRoute } from 'next';

function getSiteOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_CANONICAL_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'http://localhost:3000'
  ).replace(/\/+$/, '');
}

/** Host directive must be hostname only — no scheme (https://). Google ignores it; Yandex uses it. */
function getHost(hostname: string): string {
  try {
    if (hostname.startsWith('http')) {
      return new URL(hostname).hostname;
    }
    return hostname.split('/')[0];
  } catch {
    return hostname;
  }
}

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteOrigin();
  const host = getHost(siteUrl);

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/api/',
          '/login/',
        ],
      },
      // Googlebot-Extended: AI training crawler (not normal search indexing)
      {
        userAgent: 'Googlebot-Extended',
        allow: '/',
        disallow: ['/dashboard/', '/api/', '/login/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host,
  };
}
