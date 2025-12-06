import { MetadataRoute } from 'next';
import { getSettings } from '@/lib/settings';

// Mark as dynamic to prevent build-time execution
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const siteUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
  // Get settings with error handling and timeout
  let settings;
  try {
    const settingsPromise = getSettings();
    settings = await Promise.race([
      settingsPromise,
      new Promise<any>((resolve) => 
        setTimeout(() => resolve({
          siteName: 'Blog CMS',
          heroSubtitle: 'Simple and elegant blog content management system',
          backgroundColor: '#111827',
          primaryColor: '#dc2626',
        }), 5000)
      )
    ]);
  } catch (error) {
    console.error('Error fetching settings for manifest:', error);
    settings = {
      siteName: 'Blog CMS',
      heroSubtitle: 'Simple and elegant blog content management system',
      backgroundColor: '#111827',
      primaryColor: '#dc2626',
    };
  }

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

