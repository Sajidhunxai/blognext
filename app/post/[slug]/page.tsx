import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { buildCanonicalUrl } from "@/lib/url";
import Link from "next/link";
import StructuredData from "@/components/StructuredData";
import SmartImage from "@/components/SmartImage";
import StarRating from "@/components/StarRating";
import PostFAQSection from "@/components/PostFAQSection";
import { extractFAQsFromContent } from "@/lib/faq";
import dynamic from "next/dynamic";
import FrontendLayout from "@/components/FrontendLayout";

const DESCRIPTION_WORD_LIMIT = 100;

function getWordCount(html: string): number {
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text ? text.split(/\s+/).length : 0;
}

/** Collapsed max-height scales with word limit (~0.125rem per word, min 6rem) */
function getExpandableMaxHeight(wordLimit: number): string {
  return `${Math.max(6, wordLimit * 0.125)}rem`;
}

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
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_CANONICAL_URL || 
                  process.env.NEXTAUTH_URL || 
                  process.env.NEXT_PUBLIC_SITE_URL || 
                  "http://localhost:3000";
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
      url: buildCanonicalUrl(siteUrl, `/post/${post.slug}`),
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
      canonical: buildCanonicalUrl(siteUrl, `/post/${post.slug}`),
    },
    robots: {
      index: post.published === true,
      follow: true,
      googleBot: {
        index: post.published === true,
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
      comments: {
        where: {
          approved: true,
        },
        select: {
          id: true,
          content: true,
          authorName: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 20, // Limit to most recent 20 comments for schema
      },
    },
  });

  if (!post || (!post.published && process.env.NODE_ENV === "production")) {
    notFound();
  }

  const settings = await getSettings();
  const siteUrl = process.env.NEXT_PUBLIC_CANONICAL_URL || 
                  process.env.NEXTAUTH_URL || 
                  process.env.NEXT_PUBLIC_SITE_URL || 
                  "http://localhost:3000";
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

  // Related posts: prefer same category for SEO ("More from X"); fill with latest if needed
  const postsByCategory = post.categoryId
    ? await prisma.post.findMany({
        where: { published: true, id: { not: post.id }, categoryId: post.categoryId },
        take: 6,
        orderBy: { createdAt: "desc" },
      })
    : [];
  const needMore = 6 - postsByCategory.length;
  const extraPosts =
    needMore > 0
      ? await prisma.post.findMany({
          where: {
            published: true,
            id: { notIn: [post.id, ...postsByCategory.map((p) => p.id)] },
          },
          take: needMore,
          orderBy: { createdAt: "desc" },
        })
      : [];
  const relatedPosts = [...postsByCategory, ...extraPosts].slice(0, 6);
  const faqs = extractFAQsFromContent(post.content);

  return (
    <>
      <StructuredData 
        post={{
          title: post.title,
          content: post.content,
          slug: post.slug,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          metaDescription: post.metaDescription,
          keywords: post.keywords,
          featuredImage: post.featuredImage,
          ogImage: post.ogImage,
          downloadLink: post.downloadLink,
          rating: post.rating,
          ratingCount: post.ratingCount,
          developer: post.developer,
          appSize: post.appSize,
          appVersion: post.appVersion,
          requirements: post.requirements,
          downloads: post.downloads,
          googlePlayLink: post.googlePlayLink,
          author: {
            name: post.author.name,
            email: post.author.email,
          },
          category: post.category || null,
          comments: post.comments.map((comment: any) => ({
            id: comment.id,
            content: comment.content,
            author: comment.authorName,
            createdAt: comment.createdAt,
            rating: undefined,
          })),
        }} 
        siteUrl={siteUrl}
        siteName={settings.siteName}
      />
      <FrontendLayout>
        <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Breadcrumb - SEO friendly with category */}
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <ColoredLink href="/" hoverColor="#111827" className="dark:hover:!text-gray-200">
                  Home
                </ColoredLink>
              </li>
              {post.category && (
                <>
                  <li aria-hidden className="text-gray-400 dark:text-gray-500">/</li>
                  <li>
                    <ColoredLink
                      href={`/category/${post.category.slug}`}
                      hoverColor="#111827"
                      className="dark:hover:!text-gray-200"
                    >
                      {post.category.name}
                    </ColoredLink>
                  </li>
                </>
              )}
              <li aria-hidden className="text-gray-400 dark:text-gray-500">/</li>
              <li className="text-gray-900 dark:text-gray-200 font-medium truncate max-w-[12rem] sm:max-w-xs" aria-current="page">
                {post.metaTitle || post.title}
              </li>
            </ol>
          </nav>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Left Sidebar - Sticky on desktop for better CTA visibility */}
            <aside className="w-full lg:w-80 flex-shrink-0 order-1 lg:order-1 lg:self-start lg:sticky lg:top-24">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700/50">
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
                    className="w-full flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-4 text-button text-sm sm:text-base font-bold rounded-lg hover:bg-secondary transition mb-4 bg-button dark:bg-button dark:text-button"
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
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-lg hover:opacity-90 transition mb-6 border-primary dark:border-primary"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                    </svg>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Get it on Google Play</span>
                  </a>
                )}

                {/* App Details */}
                <div className="space-y-3 mb-4">
                  {post.developer && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Developer:</span>
                      <span className="text-sm text-gray-900 dark:text-gray-100">{post.developer}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Updated:</span>
                    <span className="text-sm text-gray-900 dark:text-gray-100">JUST NOW</span>
                  </div>
                  {post.appSize && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Size:</span>
                      <span className="text-sm text-gray-900 dark:text-gray-100">{post.appSize}</span>
                    </div>
                  )}
                  {post.appVersion && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Version:</span>
                      <span className="text-sm text-gray-900 dark:text-gray-100">{post.appVersion}</span>
                    </div>
                  )}
                  {post.requirements && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Requirements:</span>
                      <span className="text-sm text-gray-900 dark:text-gray-100">{post.requirements}</span>
                    </div>
                  )}
                  {post.downloads && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Downloads:</span>
                      <span className="text-sm text-gray-900 dark:text-gray-100">{post.downloads}</span>
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
            <div className="flex-1 order-2 lg:order-2 min-w-0">
              {/* Title & meta */}
              <header className="mb-6">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 tracking-tight">
                  {post.title}
                </h1>
                {post.appVersion && (
                  <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-3">v{post.appVersion}</p>
                )}
                {post.keywords && post.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full text-xs sm:text-sm font-medium text-button hover:bg-secondary"
                        style={{ backgroundColor: colors.primary, opacity: 0.9 }}
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
                {post.metaDescription && (
                  <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg leading-relaxed">
                    {post.metaDescription}
                  </p>
                )}
              </header>

              {/* At a glance - SEO & scannability (dynamic from DB) */}
              {/* {(post.developer || post.appSize || post.appVersion || post.requirements || post.downloads) && (
                <section aria-label="App details" className="mb-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/40 p-4 sm:p-5">
                  <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                    {post.developer && (
                      <>
                        <dt className="text-gray-500 dark:text-gray-400 font-medium">Developer</dt>
                        <dd className="text-gray-900 dark:text-gray-100 sm:col-span-2">{post.developer}</dd>
                      </>
                    )}
                    {post.appVersion && (
                      <>
                        <dt className="text-gray-500 dark:text-gray-400 font-medium">Version</dt>
                        <dd className="text-gray-900 dark:text-gray-100 sm:col-span-2">{post.appVersion}</dd>
                      </>
                    )}
                    {post.appSize && (
                      <>
                        <dt className="text-gray-500 dark:text-gray-400 font-medium">Size</dt>
                        <dd className="text-gray-900 dark:text-gray-100 sm:col-span-2">{post.appSize}</dd>
                      </>
                    )}
                    {post.requirements && (
                      <>
                        <dt className="text-gray-500 dark:text-gray-400 font-medium">Requirements</dt>
                        <dd className="text-gray-900 dark:text-gray-100 sm:col-span-2">{post.requirements}</dd>
                      </>
                    )}
                    {post.downloads && (
                      <>
                        <dt className="text-gray-500 dark:text-gray-400 font-medium">Downloads</dt>
                        <dd className="text-gray-900 dark:text-gray-100 sm:col-span-2">{post.downloads}</dd>
                      </>
                    )}
                  </dl>
                </section>
              )} */}

              {/* Social Share */}
              <section aria-label="Share" className="mb-8">
                <SocialShareButtons
                  url={buildCanonicalUrl(siteUrl, `/post/${post.slug}`)}
                  title={post.title}
                />
              </section>

              {/* Description - card style */}
              <section aria-labelledby="desc-heading" className="mb-8 sm:mb-10">
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-4 sm:p-6 shadow-sm">
                  <h2 id="desc-heading" className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    Description
                  </h2>
                  {getWordCount(post.content) > DESCRIPTION_WORD_LIMIT ? (
                    <div
                      data-expandable-desc
                      style={{ "--expand-desc-max-height": getExpandableMaxHeight(DESCRIPTION_WORD_LIMIT) } as React.CSSProperties}
                    >
                      <div className="overflow-hidden transition-[max-height] duration-300 ease-in-out max-h-[var(--expand-desc-max-height)] [[data-expandable-desc]:has(input:checked)_&]:max-h-none">
                        <div
                          className="content-area text-sm sm:text-base dark:text-gray-300"
                          dangerouslySetInnerHTML={{ __html: post.content }}
                        />
                      </div>
                      <div
                        className="h-24 -mt-24 relative z-10 pointer-events-none bg-gradient-to-t from-white to-transparent dark:from-gray-800/50 [[data-expandable-desc]:has(input:checked)_&]:hidden"
                        aria-hidden
                      />
                      <input type="checkbox" id={`expand-desc-${post.slug}`} className="sr-only" aria-hidden />
                      <label
                        htmlFor={`expand-desc-${post.slug}`}
                        className="[[data-expandable-desc]:has(input:checked)_&]:hidden mt-3 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-primary/10 dark:bg-primary/20 text-primary hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors cursor-pointer"
                      >
                        Read full description
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </label>
                      <label
                        htmlFor={`expand-desc-${post.slug}`}
                        className="hidden [[data-expandable-desc]:has(input:checked)_&]:inline-flex mt-3 items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                      >
                        Read less
                      </label>
                    </div>
                  ) : (
                    <div
                      className="content-area text-sm sm:text-base dark:text-gray-300"
                      dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                  )}
                </div>
              </section>

              {/* FAQ from content - SEO + UX */}
              <PostFAQSection faqs={faqs} />

              {/* Related / More from category - dynamic from DB */}
              {relatedPosts.length > 0 && (
                <section aria-labelledby="related-heading" className="mt-8 sm:mt-12">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-6">
                    <h2 id="related-heading" className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {post.category && postsByCategory.length > 0
                        ? `More from ${post.category.name}`
                        : "Related Apps"}
                    </h2>
                    {post.category && (
                      <Link
                        href={`/category/${post.category.slug}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        View all in {post.category.name} →
                      </Link>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4">
                    {relatedPosts.map((relatedPost) => (
                      <Link
                        key={relatedPost.id}
                        href={`/post/${relatedPost.slug}`}
                        className="group bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-md hover:border-primary/30 dark:hover:border-primary/40 transition-all duration-200 flex flex-col"
                      >
                        <div className="aspect-[4/3] w-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700/50 mb-3">
                          {relatedPost.featuredImage ? (
                            <SmartImage
                              src={relatedPost.featuredImage}
                              alt={relatedPost.title}
                              width={200}
                              height={150}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              quality={75}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-theme-text text-xl font-bold bg-gradient-primary-error">
                              {relatedPost.title.charAt(0)}
                            </div>
                          )}
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                          {relatedPost.title}
                        </h3>
                        {relatedPost.rating != null && (
                          <div className="mt-auto pt-2">
                            <StarRating rating={relatedPost.rating} size="xs" />
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Comments Section */}
              <section aria-label="Comments" className="mt-8 sm:mt-10">
                <CommentsSection
                  postId={post.id}
                  allowComments={post.allowComments !== undefined ? post.allowComments : true}
                  enableComments={settings.enableComments !== undefined ? settings.enableComments : true}
                />
              </section>
            </div>
          </div>
        </article>
      </FrontendLayout>
    </>
  );
}
