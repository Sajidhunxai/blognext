import { MetadataRoute } from 'next';
import { getSettings } from '@/lib/settings';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getSettings();
  const siteUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return {
    name: settings.siteName || 'Blog CMS',
    short_name: settings.siteName?.split(' ')[0] || 'CMS',
    description: settings.heroSubtitle || 'Simple and elegant blog content management system',
    start_url: '/',
    display: 'standalone',
    background_color: settings.backgroundColor || '#111827',
    theme_color: settings.primaryColor || '#dc2626',
    icons: settings.favicon ? [
      {
        src: settings.favicon,
        sizes: 'any',
        type: 'image/x-icon',
      },
    ] : [],
  };
}

