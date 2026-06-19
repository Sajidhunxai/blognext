import { MetadataRoute } from 'next';

function getSiteOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_CANONICAL_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'http://localhost:3000'
  ).replace(/\/+$/, '');
}



export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteOrigin();

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
  };
}
