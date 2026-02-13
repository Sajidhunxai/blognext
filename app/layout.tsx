import type { Metadata } from "next";
import "./globals.css";
import { getSettings } from "@/lib/settings";
import { normalizeUrl } from "@/lib/url";
import ClientThemeProvider from "@/components/ClientThemeProvider";
import CustomScripts from "@/components/CustomScripts";
import dynamic from "next/dynamic";

const NavigationLoader = dynamic(() => import("@/components/NavigationLoader"), {
  ssr: false,
});

// Cache metadata for better performance
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  // Use canonical domain: https://www.appmarka.com
  // Fallback to env vars for local development
  const canonicalUrl = process.env.NEXT_PUBLIC_CANONICAL_URL || 
                       process.env.NEXTAUTH_URL || 
                       process.env.NEXT_PUBLIC_SITE_URL || 
                       'https://www.appmarka.com';
  const siteUrl = canonicalUrl;
  
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: settings.siteName || "Blog CMS",
      template: `%s | ${settings.siteName || "Blog CMS"}`,
    },
    description: settings.heroSubtitle || "Simple and elegant blog content management system",
    keywords: ["blog", "cms", "content management", "apps", "games"],
    authors: [{ name: settings.siteName || "Blog CMS" }],
    creator: settings.siteName || "Blog CMS",
    publisher: settings.siteName || "Blog CMS",
    // Only set icons if custom favicon is configured, otherwise let Next.js handle /favicon.ico automatically
    ...(settings.favicon && {
      icons: {
        icon: settings.favicon,
        shortcut: settings.favicon,
        apple: settings.favicon,
      },
    }),
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: siteUrl,
      siteName: settings.siteName || "Blog CMS",
      title: settings.siteName || "Blog CMS",
      description: settings.heroSubtitle || "Simple and elegant blog content management system",
      images: settings.logo ? [{ url: settings.logo }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: settings.siteName || "Blog CMS",
      description: settings.heroSubtitle || "Simple and elegant blog content management system",
      images: settings.logo ? [settings.logo] : [],
    },
    alternates: {
      canonical: normalizeUrl(siteUrl) || '/',
    },
    verification: {
      // Add Google Search Console verification if needed
      // google: 'your-google-verification-code',
    },
    other: {
      'theme-color': settings.primaryColor || "#dc2626",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();
  
  const initialColors = {
    primary: settings.primaryColor || undefined,
    secondary: settings.secondaryColor || undefined,
    background: settings.backgroundColor || undefined,
    text: settings.textColor || undefined,
    button: settings.buttonColor || undefined,
    buttonText: settings.buttonTextColor || undefined,
    link: settings.linkColor || undefined,
    success: settings.successColor || undefined,
    error: settings.errorColor || undefined,
    warning: settings.warningColor || undefined,
    info: settings.infoColor || undefined,
    darkModeBackground: settings.darkModeBackgroundColor || undefined,
    darkModeText: settings.darkModeTextColor || undefined,
  };

  const headerCSS = (settings as any).headerCSS;
  const headerScript = (settings as any).headerScript;
  const footerCSS = (settings as any).footerCSS;
  const footerScript = (settings as any).footerScript;

  // Use canonical domain for preconnect/dns-prefetch
  const siteUrl = process.env.NEXT_PUBLIC_CANONICAL_URL || 
                  process.env.NEXTAUTH_URL || 
                  process.env.NEXT_PUBLIC_SITE_URL || 
                  'https://www.appmarka.com';
  let siteDomain = siteUrl;
  try {
    if (siteUrl.startsWith('http')) {
      siteDomain = new URL(siteUrl).origin;
    }
  } catch (e) {
    // If URL parsing fails, use the original siteUrl
    siteDomain = siteUrl;
  }
  
  return (
    <html lang="en">
      <head>
        {/* Preconnect to critical origins for faster loading */}
        {siteDomain && (
          <>
            <link rel="preconnect" href={siteDomain} />
            <link rel="dns-prefetch" href={siteDomain} />
          </>
        )}
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        {/* Defer font loading if not critical */}
        {false && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
            <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
          </>
        )}
      </head>
      <body>
        <ClientThemeProvider initialColors={initialColors}>
          <CustomScripts
            headerScript={headerScript}
            footerScript={footerScript}
            headerCSS={headerCSS}
            footerCSS={footerCSS}
          />
          <NavigationLoader />
          {children}
        </ClientThemeProvider>
      </body>
    </html>
  );
}
