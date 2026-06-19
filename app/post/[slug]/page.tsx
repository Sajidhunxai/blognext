import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { buildCanonicalUrl } from "@/lib/url";
import { optimizeCloudinaryUrl } from "@/lib/cloudinary";
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

const TableOfContents = dynamic(() => import("@/components/TableOfContents"), {
  ssr: false,
});

// Cache post pages — rebuild every 6 h; stale pages still served instantly
export const revalidate = 21600;

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
  const plainText = post.content
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const metaDescription = post.metaDescription || plainText.substring(0, 158).trimEnd() + "…";
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
      siteName: settings.siteName || settings.siteTitle || "AppMarka",
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
      index: post.published === true && !post.noIndex,
      follow: true,
      // Allow AI Overviews / rich snippets to use full content
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
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
  const faqs: { question: string; answer: string }[] =
    Array.isArray(post.faqs) && post.faqs.length > 0
      ? (post.faqs as { question: string; answer: string }[])
      : extractFAQsFromContent(post.content);

  // Compute the LCP image URL server-side so React 18 can hoist the
  // <link rel="preload"> into <head> before any JS runs.
  // This eliminates the 1,800 ms+ "resource load delay" reported by Lighthouse.
  const lcpImageUrl = post.featuredImage
    ? optimizeCloudinaryUrl(post.featuredImage, 400, 280, 85)
    : null;

  return (
    <>
      {/* Server-side preload for LCP image — visible to the browser preload scanner */}
      {lcpImageUrl && (
        <link
          rel="preload"
          as="image"
          href={lcpImageUrl}
          // @ts-ignore — fetchpriority is valid HTML; TypeScript types lag behind
          fetchpriority="high"
        />
      )}
      <StructuredData 
        post={{
          title: post.title,
          content: post.content,
          slug: post.slug,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          metaDescription: post.metaDescription,
          keywords: post.keywords,
          faqs: post.faqs as Array<{ question: string; answer: string }> | null,
          featuredImage: post.featuredImage,
          screenshots: post.screenshots,
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
        siteName={settings.siteName || undefined}
        logoUrl={settings.logo || null}
      />
      <FrontendLayout>
        <article className="bg-white dark:bg-gray-950 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
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
            {/* ── Left Sidebar ── */}
            <aside className="w-full lg:w-80 xl:w-96 flex-shrink-0 order-1 lg:order-1 lg:self-start lg:sticky lg:top-4 space-y-4">

              {/* App Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow border border-gray-100 dark:border-gray-700/50">
                {/* Featured image */}
                <div className="relative">
                  {post.featuredImage ? (
                    <SmartImage
                      src={post.featuredImage}
                      alt={post.featuredImageAlt || post.title}
                      width={400}
                      height={280}
                      className="w-full object-cover"
                      priority
                      quality={90}
                      sizes="(max-width: 768px) 100vw, 400px"
                    />
                  ) : (
                    <div className="w-full h-44 flex items-center justify-center text-white text-5xl font-bold bg-gradient-primary-error">
                      {post.title.charAt(0)}
                    </div>
                  )}
                  <span className="absolute top-3 left-3 bg-primary text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow">
                    ✓ UPDATED
                  </span>
                  {post.rating && (
                    <span className="absolute top-3 right-3 bg-black/60 text-yellow-400 text-[11px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      ★ {post.rating}
                    </span>
                  )}
                </div>

                <div className="p-4 sm:p-5 space-y-4">
                  {/* Rating row */}
                  {post.rating && (
                    <StarRating rating={post.rating} showNumber size="md" ratingCount={post.ratingCount || 0} />
                  )}

                  {/* Download button */}
                  {post.downloadLink && (
                    <Link
                      href={`/download/${post.slug}`}
                      className="btn-download w-full flex items-center justify-center gap-2.5 px-5 py-3.5 text-white text-base font-bold rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95 bg-primary hover:opacity-90"
                    >
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download APK
                    </Link>
                  )}

                  {/* Google Play */}
                  {post.googlePlayLink && (
                    <a
                      href={post.googlePlayLink}
                      target="_blank"
                      rel="nofollow noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-primary rounded-xl text-sm font-semibold text-gray-900 dark:text-gray-100 hover:bg-primary/5 transition"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                      </svg>
                      Get on Google Play
                    </a>
                  )}

                  {/* App info table */}
                  {(post.developer || post.appVersion || post.appSize || post.requirements || post.downloads) && (
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-2.5">
                      {[
                        { label: "Developer", value: post.developer, icon: "👤" },
                        { label: "Version", value: post.appVersion ? `v${post.appVersion}` : null, icon: "🔖" },
                        { label: "Size", value: post.appSize ? `${post.appSize} MB` : null, icon: "📦" },
                        { label: "Requires", value: post.requirements, icon: "📱" },
                        { label: "Downloads", value: post.downloads ? Number(post.downloads).toLocaleString() : null, icon: "⬇️" },
                        { label: "Updated", value: new Date(post.updatedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }), icon: "🔄" },
                      ].filter(r => r.value).map(({ label, value, icon }) => (
                        <div key={label} className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                            <span>{icon}</span>{label}
                          </span>
                          <span className="font-medium text-gray-800 dark:text-gray-200 text-right max-w-[55%] truncate">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Screenshots */}
              {Array.isArray(post.screenshots) && post.screenshots.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow border border-gray-100 dark:border-gray-700/50">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Screenshots</p>
                  <div className="grid grid-cols-3 gap-2">
                    {post.screenshots.map((src, idx) => (
                      <a key={idx} href={`/download/${post.slug}`} rel="noopener noreferrer"
                        className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 hover:opacity-80 transition aspect-[9/16]">
                        <SmartImage src={src} alt={`${post.title} screenshot ${idx + 1}`}
                          width={90} height={160} className="w-full h-full object-cover" quality={80} />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Trust badges */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/40 rounded-2xl p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-green-700 dark:text-green-400 mb-3">Safety & Trust</p>
                <ul className="space-y-2">
                  {[
                    "✅ Verified APK source",
                    "✅ Malware scan checked",
                    "✅ No hidden permissions",
                    "✅ Regular updates",
                  ].map(t => (
                    <li key={t} className="text-sm text-green-800 dark:text-green-300">{t}</li>
                  ))}
                </ul>
              </div>

              {/* Report */}
              <ColoredAnchor
                href="#"
                className="text-sm flex items-center gap-1.5 justify-center py-2"
                defaultColor="#9ca3af"
                hoverColor="#6b7280"
              >
                <span>⚠️</span> Report broken link
              </ColoredAnchor>
            </aside>

            {/* ── Main Content ── */}
            <div className="flex-1 order-2 lg:order-2 min-w-0 space-y-6">

              {/* ① Title + meta header */}
              <header>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 tracking-tight leading-tight">
                  {post.title}
                </h1>
                {/* Keyword tags */}
                {post.keywords && post.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {post.keywords.slice(0, 5).map((keyword, index) => (
                      <span key={index}
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-white"
                        style={{ backgroundColor: colors.primary }}
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
                {/* Meta description as lead paragraph */}
                {post.metaDescription && (
                  <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed border-l-4 border-primary pl-4 bg-gray-50 dark:bg-gray-800/40 rounded-r-lg py-2 pr-3">
                    {post.metaDescription}
                  </p>
                )}
              </header>

              {/* ② E-E-A-T bar */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-gray-500 dark:text-gray-400 py-3 border-y border-gray-100 dark:border-gray-700/50">
                <span className="flex items-center gap-1.5 font-medium">
                  <svg className="w-3.5 h-3.5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                  </svg>
                  By {post.author.name || "AppMarka Team"}
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(post.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                </span>
                <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-semibold">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Updated {new Date(post.updatedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                </span>
                {post.category && (
                  <ColoredLink href={`/category/${post.category.slug}`} hoverColor={colors.primary}
                    className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {post.category.name}
                  </ColoredLink>
                )}
              </div>

              {/* ③ App Specifications grid (rich structured data for Google) */}
              {(post.developer || post.appVersion || post.appSize || post.requirements || post.downloads) && (
                <section aria-label="App specifications"
                  className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 overflow-hidden shadow-sm">
                  <div className="px-5 py-3 bg-gray-50 dark:bg-gray-700/40 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h2 className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide">App Information</h2>
                  </div>
                  <dl className="grid grid-cols-2 sm:grid-cols-3 divide-x-0 divide-gray-100 dark:divide-gray-700">
                    {[
                      { label: "Version", value: post.appVersion, icon: "🔖" },
                      { label: "Size", value: post.appSize ? `${post.appSize} MB` : null, icon: "📦" },
                      { label: "Downloads", value: post.downloads ? Number(post.downloads).toLocaleString() : null, icon: "⬇️" },
                      { label: "Developer", value: post.developer, icon: "👤" },
                      { label: "Requires", value: post.requirements, icon: "📱" },
                      { label: "Category", value: post.category?.name, icon: "🗂️" },
                    ].filter(r => r.value).map(({ label, value, icon }) => (
                      <div key={label} className="flex flex-col items-center justify-center p-4 text-center border border-gray-100 dark:border-gray-700/50">
                        <span className="text-xl mb-1">{icon}</span>
                        <dd className="font-bold text-gray-900 dark:text-gray-100 text-sm truncate max-w-full">{value}</dd>
                        <dt className="text-[11px] text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-0.5">{label}</dt>
                      </div>
                    ))}
                  </dl>
                </section>
              )}

              {/* ④ Social share */}
              <section aria-label="Share">
                <SocialShareButtons
                  url={buildCanonicalUrl(siteUrl, `/post/${post.slug}`)}
                  title={post.title}
                />
              </section>

              {/* ⑤ Description card */}
              <section aria-labelledby="desc-heading"
                className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-5 sm:p-7 shadow-sm">
                <h2 id="desc-heading" className="section-title text-xl text-gray-900 dark:text-gray-100 mb-4">
                  About {post.title}
                </h2>
                <TableOfContents content={post.content} />

                {getWordCount(post.content) > DESCRIPTION_WORD_LIMIT ? (
                  <div data-expandable-desc
                    style={{ "--expand-desc-max-height": getExpandableMaxHeight(DESCRIPTION_WORD_LIMIT) } as React.CSSProperties}>
                    <div className="overflow-hidden transition-[max-height] duration-300 ease-in-out max-h-[var(--expand-desc-max-height)] [[data-expandable-desc]:has(input:checked)_&]:max-h-none">
                      <div dir="auto" className="content-area text-sm sm:text-base dark:text-gray-300"
                        dangerouslySetInnerHTML={{ __html: post.content }} />
                    </div>
                    <div className="h-24 -mt-24 relative z-10 pointer-events-none bg-gradient-to-t from-white to-transparent dark:from-gray-800/50 [[data-expandable-desc]:has(input:checked)_&]:hidden" aria-hidden />
                    <input type="checkbox" id={`expand-desc-${post.slug}`} className="sr-only" aria-hidden />
                    <label htmlFor={`expand-desc-${post.slug}`}
                      className="[[data-expandable-desc]:has(input:checked)_&]:hidden mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-secondary transition cursor-pointer">
                      Read full description
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </label>
                    <label htmlFor={`expand-desc-${post.slug}`}
                      className="hidden [[data-expandable-desc]:has(input:checked)_&]:inline-flex mt-4 items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 cursor-pointer">
                      Show less ↑
                    </label>
                  </div>
                ) : (
                  <div dir="auto" className="content-area text-sm sm:text-base dark:text-gray-300"
                    dangerouslySetInnerHTML={{ __html: post.content }} />
                )}
              </section>

              {/* ⑥ How to Install — appears when there's a download link */}
              {post.downloadLink && (
                <section aria-labelledby="install-heading"
                  className="rounded-2xl border border-blue-200 dark:border-blue-700/40 bg-blue-50 dark:bg-blue-900/20 p-5 sm:p-7">
                  <h2 id="install-heading" className="text-lg font-bold text-blue-900 dark:text-blue-200 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    How to Download &amp; Install
                  </h2>
                  <ol className="space-y-3">
                    {[
                      { step: 1, text: `Tap the Download button above or click the link on this page.` },
                      { step: 2, text: `On your Android device go to Settings → Security and enable "Install from Unknown Sources".` },
                      { step: 3, text: `Open your Downloads folder and tap the APK file.` },
                      { step: 4, text: `Tap Install and wait a few seconds.` },
                      { step: 5, text: `Open the app, register your account, and start playing!` },
                    ].map(({ step, text }) => (
                      <li key={step} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">
                          {step}
                        </span>
                        <span className="text-sm text-blue-800 dark:text-blue-200 pt-1">{text}</span>
                      </li>
                    ))}
                  </ol>
                  <Link href={`/download/${post.slug}`}
                    className="btn-download mt-5 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition shadow-md hover:shadow-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download {post.title}
                  </Link>
                </section>
              )}

              {/* ⑦ FAQ */}
              <PostFAQSection faqs={faqs} />

              {/* ⑧ Related apps */}
              {relatedPosts.length > 0 && (
                <section aria-labelledby="related-heading">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <h2 id="related-heading" className="section-title text-xl text-gray-900 dark:text-gray-100">
                      {post.category && postsByCategory.length > 0
                        ? `More ${post.category.name} Apps`
                        : "You May Also Like"}
                    </h2>
                    {post.category && (
                      <Link href={`/category/${post.category.slug}`}
                        className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1">
                        View all →
                      </Link>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    {relatedPosts.map((relatedPost) => (
                      <Link key={relatedPost.id} href={`/post/${relatedPost.slug}`}
                        className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 flex flex-col">
                        <div className="aspect-[16/9] w-full overflow-hidden bg-gray-100 dark:bg-gray-700/50">
                          {relatedPost.featuredImage ? (
                            <SmartImage src={relatedPost.featuredImage} alt={relatedPost.title}
                              width={220} height={124}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              quality={75} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold bg-gradient-primary-error">
                              {relatedPost.title.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="p-3 flex flex-col flex-1">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-primary transition-colors mb-1">
                            {relatedPost.title}
                          </h3>
                          {relatedPost.rating != null && (
                            <div className="mt-auto pt-1">
                              <StarRating rating={relatedPost.rating} size="xs" showNumber />
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* ⑨ Comments */}
              <section aria-label="Comments">
                <CommentsSection
                  postId={post.id}
                  allowComments={post.allowComments !== undefined ? post.allowComments : true}
                  enableComments={settings.enableComments !== undefined ? settings.enableComments : true}
                />
              </section>
            </div>
          </div>
        </div>
        </article>
      </FrontendLayout>
    </>
  );
}
