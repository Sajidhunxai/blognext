import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getPostWithLocale, getSettingsWithLocale } from "@/lib/i18n/content";
import { addLocalePrefix, type Locale } from "@/lib/i18n/config";
import { buildCanonicalUrl } from "@/lib/url";
import Link from "next/link";
import StructuredData from "@/components/StructuredData";
import SmartImage from "@/components/SmartImage";
import StarRating from "@/components/StarRating";
import PostFAQSection from "@/components/PostFAQSection";
import { extractFAQsFromContent } from "@/lib/faq";
import dynamic from "next/dynamic";
import FrontendLayout from "@/components/FrontendLayout";
import { getPostsWithLocale } from "@/lib/i18n/content";

const DESCRIPTION_WORD_LIMIT = 100;

function getWordCount(html: string): number {
  const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text ? text.split(/\s+/).length : 0;
}

function getExpandableMaxHeight(wordLimit: number): string {
  return `${Math.max(6, wordLimit * 0.125)}rem`;
}

const CommentsSection = dynamic(() => import("@/components/CommentsSection"), { ssr: false });
const ColoredLink = dynamic(() => import("@/components/ColoredLink"), { ssr: false });
const ColoredAnchor = dynamic(() => import("@/components/ColoredAnchor"), { ssr: false });
const SocialShareButtons = dynamic(() => import("@/components/SocialShareButtons"), { ssr: false });

type Props = {
  params: { locale: string; slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = params.locale as Locale;
  const post = await getPostWithLocale(params.slug, locale);
  if (!post) {
    return { title: "Post Not Found", robots: { index: false, follow: false } };
  }

  const settings = await getSettingsWithLocale(locale);
  const siteUrl = process.env.NEXT_PUBLIC_CANONICAL_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
  const metaTitle = post.metaTitle || post.title;
  const metaDescription = post.metaDescription || String(post.content).substring(0, 160);
  const ogImage = post.ogImage || post.featuredImage || `${siteUrl}/og-default.jpg`;
  const postUrl = buildCanonicalUrl(siteUrl, addLocalePrefix(`/post/${post.slug}`, locale));

  return {
    metadataBase: new URL(siteUrl),
    title: metaTitle,
    description: metaDescription,
    keywords: (post.keywords as string[])?.join(", "),
    authors: [{ name: (post.author as any)?.name || (post.author as any)?.email }],
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: postUrl,
      siteName: settings?.siteName,
      images: [{ url: ogImage, alt: (post as any).ogImageAlt || (post as any).featuredImageAlt || post.title }],
      locale: locale === "ur" ? "ur_PK" : locale === "hi" ? "hi_IN" : "en_US",
      type: "article",
      publishedTime: (post as any).createdAt?.toISOString?.(),
      modifiedTime: (post as any).updatedAt?.toISOString?.(),
    },
    alternates: { canonical: postUrl },
    robots: { index: (post as any).published !== false && !(post as any).noIndex, follow: true },
  };
}

export default async function LocalePostPage({ params }: Props) {
  const locale = params.locale as Locale;
  const post = await getPostWithLocale(params.slug, locale);

  if (!post || ((post as any).published === false && process.env.NODE_ENV === "production")) {
    notFound();
  }

  const settings = await getSettingsWithLocale(locale);
  const siteUrl = process.env.NEXT_PUBLIC_CANONICAL_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
  const basePath = addLocalePrefix("", locale);

  const colors = {
    primary: settings?.primaryColor || "#dc2626",
    secondary: settings?.secondaryColor || "#16a34a",
    text: settings?.textColor || "#ffffff",
    link: settings?.linkColor || "#3b82f6",
  };

  const postsByCategory = (post as any).categoryId
    ? await getPostsWithLocale({
        where: { published: true, id: { not: post.id }, categoryId: (post as any).categoryId },
        take: 6,
        locale,
      })
    : [];
  const needMore = 6 - postsByCategory.length;
  const extraPosts =
    needMore > 0
      ? await getPostsWithLocale({
          where: {
            published: true,
            id: { notIn: [post.id, ...postsByCategory.map((p: any) => p.id)] },
          },
          take: needMore,
          locale,
        })
      : [];
  const relatedPosts = [...postsByCategory, ...extraPosts].slice(0, 6);

  const faqs: { question: string; answer: string }[] =
    Array.isArray((post as any).faqs) && (post as any).faqs.length > 0
      ? (post as any).faqs
      : extractFAQsFromContent((post as any).content);

  const postWithAuthor = post as any;
  const category = postWithAuthor.category;

  return (
    <>
      <StructuredData
        post={{
          ...post,
          author: postWithAuthor.author,
          category,
          comments: postWithAuthor.comments?.map((c: any) => ({
            id: c.id,
            content: c.content,
            author: c.authorName,
            createdAt: c.createdAt,
          })),
        }}
        siteUrl={siteUrl}
        siteName={settings?.siteName}
      />
      <FrontendLayout>
        <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <ColoredLink href={basePath || "/"} hoverColor="#111827" className="dark:hover:!text-gray-200">
                  Home
                </ColoredLink>
              </li>
              {category && (
                <>
                  <li aria-hidden className="text-gray-400 dark:text-gray-500">/</li>
                  <li>
                    <ColoredLink
                      href={addLocalePrefix(`/category/${category.slug}`, locale)}
                      hoverColor="#111827"
                      className="dark:hover:!text-gray-200"
                    >
                      {category.name}
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
            <aside className="w-full lg:w-96 flex-shrink-0 order-1 lg:order-1 lg:self-start lg:sticky lg:top-24">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700/50">
                <div className="relative mb-4 sm:mb-6">
                  {post.featuredImage ? (
                    <SmartImage
                      src={post.featuredImage}
                      alt={post.title}
                      width={320}
                      height={320}
                      className="w-full rounded-lg object-contain"
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

                {Array.isArray((post as any).screenshots) && (post as any).screenshots.length > 0 && (
                  <div className="mb-4 space-y-2">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Screenshots</p>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {(post as any).screenshots.map((src: string, idx: number) => (
                        <a
                          key={idx}
                          href={addLocalePrefix(`/download/${post.slug}`, locale)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 hover:opacity-90 transition"
                        >
                          <SmartImage
                            src={src}
                            alt={`${post.title} screenshot ${idx + 1}`}
                            className="h-auto object-contain"
                            height={200}
                            quality={100}
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {(post as any).downloadLink && (
                  <Link
                    href={addLocalePrefix(`/download/${post.slug}`, locale)}
                    className="w-full flex items-center justify-center gap-2 px-4 sm:px-6 py-3 sm:py-4 text-button text-sm sm:text-base font-bold rounded-lg hover:bg-secondary transition mb-4 bg-button dark:bg-button dark:text-button"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    DOWNLOAD
                  </Link>
                )}

                {(post as any).rating && (
                  <div className="mb-4">
                    <StarRating
                      rating={(post as any).rating}
                      showNumber
                      size="lg"
                      ratingCount={(post as any).ratingCount || 0}
                    />
                  </div>
                )}

                {(post as any).googlePlayLink && (
                  <a
                    href={(post as any).googlePlayLink}
                    target="_blank"
                    rel="nofollow noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 border-2 rounded-lg hover:opacity-90 transition mb-6 border-primary dark:border-primary"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Get it on Google Play</span>
                  </a>
                )}

                <div className="space-y-3 mb-4">
                  {post.developer && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Developer:</span>
                      <span className="text-sm text-gray-900 dark:text-gray-100">{post.developer}</span>
                    </div>
                  )}
                  {(post as any).appSize && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Size:</span>
                      <span className="text-sm text-gray-900 dark:text-gray-100">{(post as any).appSize}</span>
                    </div>
                  )}
                  {(post as any).appVersion && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Version:</span>
                      <span className="text-sm text-gray-900 dark:text-gray-100">{(post as any).appVersion}</span>
                    </div>
                  )}
                  {post.requirements && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Requirements:</span>
                      <span className="text-sm text-gray-900 dark:text-gray-100">{post.requirements}</span>
                    </div>
                  )}
                </div>

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

            <div className="flex-1 order-2 lg:order-2 min-w-0">
              <header className="mb-6">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 tracking-tight">
                  {post.title}
                </h1>
                {(post as any).appVersion && (
                  <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-3">v{(post as any).appVersion}</p>
                )}
                {post.keywords && (post.keywords as string[]).length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(post.keywords as string[]).map((keyword, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full text-xs sm:text-sm font-medium text-button"
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

              <section className="mb-8">
                <SocialShareButtons
                  url={buildCanonicalUrl(siteUrl, addLocalePrefix(`/post/${post.slug}`, locale))}
                  title={post.title}
                />
              </section>

              <section aria-labelledby="desc-heading" className="mb-8 sm:mb-10">
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-4 sm:p-6 shadow-sm">
                  <h2 id="desc-heading" className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    Description
                  </h2>
                  {getWordCount((post as any).content) > DESCRIPTION_WORD_LIMIT ? (
                    <div data-expandable-desc style={{ "--expand-desc-max-height": getExpandableMaxHeight(DESCRIPTION_WORD_LIMIT) } as React.CSSProperties}>
                      <div className="overflow-hidden transition-[max-height] duration-300 ease-in-out max-h-[var(--expand-desc-max-height)] [[data-expandable-desc]:has(input:checked)_&]:max-h-none">
                        <div
                          dir="auto"
                          className="content-area text-sm sm:text-base dark:text-gray-300"
                          dangerouslySetInnerHTML={{ __html: (post as any).content }}
                        />
                      </div>
                      <input type="checkbox" id={`expand-desc-${post.slug}`} className="sr-only" aria-hidden />
                      <label
                        htmlFor={`expand-desc-${post.slug}`}
                        className="[[data-expandable-desc]:has(input:checked)_&]:hidden mt-3 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                      >
                        Read full description
                      </label>
                    </div>
                  ) : (
                    <div
                      dir="auto"
                      className="content-area text-sm sm:text-base dark:text-gray-300"
                      dangerouslySetInnerHTML={{ __html: (post as any).content }}
                    />
                  )}
                </div>
              </section>

              <PostFAQSection faqs={faqs} />

              {relatedPosts.length > 0 && (
                <section className="mt-8 sm:mt-12">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    {category && postsByCategory.length > 0 ? `More from ${category.name}` : "Related Apps"}
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    {relatedPosts.map((relatedPost: any) => (
                      <Link
                        key={relatedPost.id}
                        href={addLocalePrefix(`/post/${relatedPost.slug}`, locale)}
                        className="group bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-md transition flex flex-col"
                      >
                        <div className="aspect-[4/3] w-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700/50 mb-3">
                          {relatedPost.featuredImage ? (
                            <SmartImage
                              src={relatedPost.featuredImage}
                              alt={relatedPost.title}
                              width={200}
                              height={150}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              quality={75}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-theme-text text-xl font-bold bg-gradient-primary-error">
                              {relatedPost.title.charAt(0)}
                            </div>
                          )}
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-primary transition-colors">
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

              <section className="mt-8 sm:mt-10">
                <CommentsSection
                  postId={post.id}
                  allowComments={(post as any).allowComments !== false}
                  enableComments={settings?.enableComments !== false}
                />
              </section>
            </div>
          </div>
        </article>
      </FrontendLayout>
    </>
  );
}
