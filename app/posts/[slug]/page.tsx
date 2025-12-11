import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { buildCanonicalUrl } from "@/lib/url";
import Link from "next/link";
import StructuredData from "@/components/StructuredData";
import SmartImage from "@/components/SmartImage";
import StarRating from "@/components/StarRating";
import dynamic from "next/dynamic";
import FrontendLayout from "@/components/FrontendLayout";

const CommentsSection = dynamic(() => import("@/components/CommentsSection"), {
  ssr: false,
});

const ColoredLink = dynamic(() => import("@/components/ColoredLink"), {
  ssr: false,
});

const ColoredAnchor = dynamic(() => import("@/components/ColoredAnchor"), {
  ssr: false,
});

const SocialShareButtons = dynamic(() => import("@/components/SocialShareButtons"), {
  ssr: false,
});

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    include: {
      author: {
        select: {
          name: true,
          email: true,
        },
      },
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  const siteUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const settings = await getSettings();
  const metaTitle = post.metaTitle || post.title;
  const metaDescription = post.metaDescription || post.content.substring(0, 160);
  const ogImage = post.ogImage || post.featuredImage || `${siteUrl}/og-default.jpg`;

  // Preload LCP image for better performance
  const featuredImageUrl = post.featuredImage || ogImage;
  
  return {
    metadataBase: new URL(siteUrl),
    title: metaTitle,
    description: metaDescription,
    keywords: post.keywords?.join(", ") || undefined,
    authors: [{ name: post.author.name || post.author.email }],
    other: featuredImageUrl ? {
      'preload-image': featuredImageUrl,
    } : {},
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: buildCanonicalUrl(siteUrl, `/posts/${post.slug}`),
      siteName: settings.siteName || "PKR Games",
      images: [
        {
          url: ogImage,
          alt: post.ogImageAlt || post.featuredImageAlt || post.title,
          width: 1200,
          height: 630,
        },
      ],
      locale: "en_US",
      type: "article",
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.author.name || post.author.email],
      section: post.category?.name || undefined,
      tags: post.keywords || undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: [ogImage],
      creator: settings.siteName || undefined,
    },
    alternates: {
      canonical: buildCanonicalUrl(siteUrl, `/posts/${post.slug}`),
    },
    robots: {
      index: post.published,
      follow: true,
      googleBot: {
        index: post.published,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function PostPage({ params }: Props) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    include: {
      author: {
        select: {
          name: true,
          email: true,
        },
      },
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!post || (!post.published && process.env.NODE_ENV === "production")) {
    notFound();
  }

  const settings = await getSettings();
  const siteUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const colors = {
    primary: settings.primaryColor || "#dc2626",
    secondary: settings.secondaryColor || "#16a34a",
    background: settings.backgroundColor || "#111827",
    text: settings.textColor || "#ffffff",
    button: settings.buttonColor || "#dc2626",
    link: settings.linkColor || "#3b82f6",
    success: settings.successColor || "#16a34a",
    error: settings.errorColor || "#dc2626",
    warning: settings.warningColor || "#f59e0b",
    info: settings.infoColor || "#3b82f6",
  };
  const socialMedia = settings.socialMedia as any || {};

  // Get related posts
  const relatedPosts = await prisma.post.findMany({
    where: {
      published: true,
      id: { not: post.id },
    },
    take: 6,
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <StructuredData 
        post={{
          ...post,
          category: post.category || null,
        }} 
        siteUrl={siteUrl} 
      />
      <FrontendLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Breadcrumbs */}
          <nav className="text-sm mb-4" style={{ color: "#6b7280" }}>
            <ColoredLink href="/" defaultColor="#6b7280" hoverColor="#111827">
              Home
            </ColoredLink>
            <span className="mx-2">/</span>
            <span>{post.metaTitle}</span>
          </nav>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Left Sidebar - Appears first on mobile */}
            <aside className="w-full lg:w-80 flex-shrink-0 order-1 lg:order-1">
              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                {/* App Icon */}
                <div className="relative mb-4 sm:mb-6">
                  {post.featuredImage ? (
                    <SmartImage
                      src={post.featuredImage}
                      alt={post.title}
                      width={320}
                      height={320}
                      className="w-full rounded-lg"
                      priority
                      quality={90}
                      sizes="(max-width: 768px) 100vw, 320px"
                    />
                  ) : (
                    <div className="w-full aspect-square rounded-lg flex items-center justify-center text-theme-text text-2xl sm:text-4xl font-bold bg-gradient-primary-error">
                      {post.title.charAt(0)}
                    </div>
                  )}
                  <span className="absolute top-2 left-2 text-theme-text text-xs px-2 py-1 rounded font-bold bg-primary">NEW</span>
                </div>

                {/* Download Button */}
                {post.downloadLink && (
                  <Link
                    href={`/download/${post.slug}`}
                    className="w-full flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-4 text-button text-sm sm:text-base font-bold rounded-lg hover:bg-secondary transition mb-4 bg-button"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    DOWNLOAD
                  </Link>
                )}

                {/* Rating */}
                {post.rating && (
                  <div className="mb-4">
                    <StarRating 
                      rating={post.rating} 
                      showNumber 
                      size="lg" 
                      ratingCount={post.ratingCount || 0}
                    />
                  </div>
                )}

                {/* Get it on Google Play Button */}
                {post.googlePlayLink && (
                  <a
                    href={post.googlePlayLink}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 rounded-lg hover:opacity-90 transition mb-6 border-primary"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                    </svg>
                    <span className="text-sm font-medium text-gray-900">Get it on Google Play</span>
                  </a>
                )}

                {/* App Details */}
                <div className="space-y-3 mb-4">
                  {post.developer && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Developer:</span>
                      <span className="text-sm text-gray-900">{post.developer}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Updated:</span>
                    <span className="text-sm text-gray-900">JUST NOW</span>
                  </div>
                  {post.appSize && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Size:</span>
                      <span className="text-sm text-gray-900">{post.appSize}</span>
                    </div>
                  )}
                  {post.appVersion && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Version:</span>
                      <span className="text-sm text-gray-900">{post.appVersion}</span>
                    </div>
                  )}
                  {post.requirements && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Requirements:</span>
                      <span className="text-sm text-gray-900">{post.requirements}</span>
                    </div>
                  )}
                  {post.downloads && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Downloads:</span>
                      <span className="text-sm text-gray-900">{post.downloads}</span>
                    </div>
                  )}
                </div>

                {/* Report Link */}
                <ColoredAnchor 
                  href="#" 
                  className="text-sm flex items-center gap-1"
                  defaultColor={colors.text === "#ffffff" ? "#9ca3af" : "#6b7280"}
                  hoverColor={colors.text === "#ffffff" ? "#ffffff" : "#111827"}
                >
                  <span>⚠</span> Report
                </ColoredAnchor>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 order-2 lg:order-2">
              {/* Title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {post.title}
              </h1>

              {/* Version */}
              {post.appVersion && (
                <p className="text-base sm:text-lg text-gray-600 mb-3">v{post.appVersion}</p>
              )}

              {/* Tags */}
              {post.keywords && post.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-button rounded-full text-xs sm:text-sm font-medium text-button hover:bg-secondary"
                      style={{ 
                        backgroundColor: colors.primary,
                        opacity: 0.9
                      }}
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}

              {/* Short Description / Intro */}
              {post.metaDescription && (
                <p className="text-gray-700 text-base sm:text-lg mb-6 leading-relaxed">
                  {post.metaDescription}
                </p>
              )}

              {/* Social Share Buttons */}
              <SocialShareButtons 
                url={buildCanonicalUrl(siteUrl, `/posts/${post.slug}`)}
                title={post.title}
              />

              {/* Description Section */}
              <div className="mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">DESCRIPTION</h2>
                <div 
                  className="content-area text-sm sm:text-base"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </div>

              {/* Related Apps */}
              {relatedPosts.length > 0 && (
                <div className="mt-8 sm:mt-12">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Related Apps</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                    {relatedPosts.slice(0, 6).map((relatedPost) => (
            <Link
                        key={relatedPost.id}
                        href={`/posts/${relatedPost.slug}`}
                        className="bg-white rounded-lg p-4 hover:shadow-lg transition shadow-sm"
                      >
                        {relatedPost.featuredImage ? (
                          <SmartImage
                            src={relatedPost.featuredImage}
                            alt={relatedPost.title}
                            width={200}
                            height={96}
                            className="w-full h-24 object-cover rounded mb-2"
                            quality={75}
                          />
                        ) : (
                          <div className="w-full h-24 rounded mb-2 flex items-center justify-center text-theme-text font-bold bg-gradient-primary-error"
                      >
                            {relatedPost.title.charAt(0)}
                          </div>
                        )}
                        <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">
                          {relatedPost.title}
                        </h3>
                        {relatedPost.rating && (
                          <StarRating 
                            rating={relatedPost.rating} 
                            size="xs"
                          />
                        )}
            </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments Section */}
              <CommentsSection
                postId={post.id}
                allowComments={post.allowComments !== undefined ? post.allowComments : true}
                enableComments={settings.enableComments !== undefined ? settings.enableComments : true}
              />
            </div>
          </div>
        </div>
      </FrontendLayout>
    </>
  );
}
