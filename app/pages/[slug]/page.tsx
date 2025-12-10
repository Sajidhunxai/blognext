import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import FrontendLayout from "@/components/FrontendLayout";
import SmartImage from "@/components/SmartImage";

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  let page = null;
  try {
    if (prisma && 'page' in prisma) {
      page = await (prisma as any).page.findUnique({
        where: { slug: params.slug },
      });
    }
  } catch (error) {
    console.error("Error fetching page:", error);
  }

  if (!page || !page.published) {
    return {
      title: "Page Not Found",
    };
  }

  const siteUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const settings = await getSettings();
  const metaTitle = page.metaTitle || page.title;
  const metaDescription = page.metaDescription || page.content.substring(0, 160);
  const ogImage = page.featuredImage || `${siteUrl}/og-default.jpg`;

  return {
    title: metaTitle,
    description: metaDescription,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: `${siteUrl}/pages/${page.slug}`,
      siteName: settings.siteName || "PKR Games",
      type: "website",
      images: page.featuredImage ? [
        {
          url: page.featuredImage,
          alt: page.featuredImageAlt || page.title,
          width: 1200,
          height: 630,
        },
      ] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: page.featuredImage ? [page.featuredImage] : [],
    },
    alternates: {
      canonical: `${siteUrl}/pages/${page.slug}`,
    },
  };
}

export default async function PagePage({ params }: Props) {
  let page = null;
  try {
    if (prisma && 'page' in prisma) {
      page = await (prisma as any).page.findUnique({
        where: { slug: params.slug },
      });
    }
  } catch (error) {
    console.error("Error fetching page:", error);
  }

  if (!page || !page.published) {
    notFound();
  }

  const settings = await getSettings();

  return (
    <FrontendLayout>
      {/* Featured Image Banner */}
      {page.featuredImage ? (
        <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
          <SmartImage
            src={page.featuredImage}
            alt={page.featuredImageAlt || page.title}
            width={1920}
            height={600}
            className="w-full h-full object-cover"
            priority
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
          {/* Centered Title */}
          <div className="absolute inset-0 flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center drop-shadow-2xl max-w-4xl">
              {page.title}
            </h1>
          </div>
        </div>
      ) : (
        /* Fallback Banner without Image */
        <div className="relative w-full h-[300px] md:h-[400px] bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white text-center drop-shadow-lg max-w-4xl">
            {page.title}
          </h1>
        </div>
      )}

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="bg-white rounded-lg shadow-sm p-6 sm:p-8 md:p-10">
          <div 
            className="content-area text-base sm:text-lg"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </article>
      </div>
    </FrontendLayout>
  );
}

