import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getPageWithLocale, getSettingsWithLocale } from "@/lib/i18n/content";
import { addLocalePrefix, type Locale } from "@/lib/i18n/config";
import { buildCanonicalUrl } from "@/lib/url";
import FrontendLayout from "@/components/FrontendLayout";
import SmartImage from "@/components/SmartImage";

type Props = {
  params: { locale: string; slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = params.locale as Locale;
  const page = await getPageWithLocale(params.slug, locale);

  if (!page || !(page as any).published) {
    return { title: "Page Not Found" };
  }

  const settings = await getSettingsWithLocale(locale);
  const siteUrl =
    process.env.NEXT_PUBLIC_CANONICAL_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  const metaTitle = (page as any).metaTitle || page.title;
  const metaDescription =
    (page as any).metaDescription || (page as any).content?.substring(0, 160);
  const ogImage = (page as any).featuredImage || `${siteUrl}/og-default.jpg`;
  const canonicalPath = addLocalePrefix(`/pages/${page.slug}`, locale);

  return {
    metadataBase: new URL(siteUrl),
    title: metaTitle,
    description: metaDescription,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: buildCanonicalUrl(siteUrl, canonicalPath),
      siteName: settings?.siteName,
      type: "website",
      locale: locale === "ur" ? "ur_PK" : locale === "hi" ? "hi_IN" : "en_US",
      images: (page as any).featuredImage
        ? [
            {
              url: (page as any).featuredImage,
              alt:
                (page as any).featuredImageAlt || page.title,
              width: 1200,
              height: 630,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: (page as any).featuredImage ? [(page as any).featuredImage] : [],
    },
    alternates: {
      canonical: buildCanonicalUrl(siteUrl, canonicalPath),
    },
    robots: { index: (page as any).published, follow: true },
  };
}

export default async function LocalePagePage({ params }: Props) {
  const locale = params.locale as Locale;
  const page = await getPageWithLocale(params.slug, locale);

  if (!page || !(page as any).published) {
    notFound();
  }

  return (
    <FrontendLayout>
      {/* Featured Image Banner */}
      {(page as any).featuredImage ? (
        <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
          <SmartImage
            src={(page as any).featuredImage}
            alt={(page as any).featuredImageAlt || page.title}
            width={1920}
            height={600}
            className="w-full h-full object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
          <div className="absolute inset-0 flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center drop-shadow-2xl max-w-4xl">
              {page.title}
            </h1>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-[300px] md:h-[400px] bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center drop-shadow-lg max-w-4xl">
            {page.title}
          </h1>
        </div>
      )}

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8 md:p-10">
          <div
            dir="auto"
            className="content-area text-base sm:text-lg dark:text-gray-300"
            dangerouslySetInnerHTML={{ __html: (page as any).content }}
          />
        </article>
      </div>
    </FrontendLayout>
  );
}
