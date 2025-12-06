import type { Metadata } from "next";
import "./globals.css";
import { getSettings } from "@/lib/settings";
import ClientThemeProvider from "@/components/ClientThemeProvider";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const siteUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  
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
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
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
      canonical: siteUrl,
    },
    verification: {
      // Add Google Search Console verification if needed
      // google: 'your-google-verification-code',
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
    link: settings.linkColor || undefined,
    success: settings.successColor || undefined,
    error: settings.errorColor || undefined,
    warning: settings.warningColor || undefined,
    info: settings.infoColor || undefined,
  };

  const headerCSS = (settings as any).headerCSS;
  const headerScript = (settings as any).headerScript;
  const footerCSS = (settings as any).footerCSS;
  const footerScript = (settings as any).footerScript;

  return (
    <html lang="en">
      <head>
        {settings.favicon && (
          <link rel="icon" href={settings.favicon} />
        )}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content={settings.primaryColor || "#dc2626"} />
        {headerCSS && (
          <style dangerouslySetInnerHTML={{ __html: headerCSS }} />
        )}
        {headerScript && (
          <div dangerouslySetInnerHTML={{ __html: headerScript }} />
        )}
      </head>
      <body>
        <ClientThemeProvider initialColors={initialColors}>
          {children}
        </ClientThemeProvider>
        {footerCSS && (
          <style dangerouslySetInnerHTML={{ __html: footerCSS }} />
        )}
        {footerScript && (
          <div dangerouslySetInnerHTML={{ __html: footerScript }} />
        )}
      </body>
    </html>
  );
}
