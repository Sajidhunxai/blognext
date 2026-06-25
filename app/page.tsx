import { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { normalizeUrl } from "@/lib/url";
import { getTranslation } from "@/lib/i18n/translations";
import Image from "next/image";
import FrontendLayout from "@/components/FrontendLayout";
import StarRating from "@/components/StarRating";
import SmartImage from "@/components/SmartImage";
import HeroBackground from "@/components/HeroBackground";
import PaginationWrapper from "@/components/PaginationWrapper";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Load CategoryFilter only when needed (below the fold)
const CategoryFilter = dynamic(() => import("@/components/CategoryFilter"), {
  ssr: false,
  loading: () => null,
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const siteUrl = process.env.NEXT_PUBLIC_CANONICAL_URL || 
                  process.env.NEXTAUTH_URL || 
                  process.env.NEXT_PUBLIC_SITE_URL || 
                  "http://localhost:3000";
  const title = settings.heroTitle || `${settings.siteName} - Download Best Games`;
  const description = settings.heroSubtitle || `Download the best games and apps from ${settings.siteName}`;

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    keywords: ["apps", "games", "download", "android", "apk"],
    openGraph: {
      title,
      description,
      url: siteUrl,
      siteName: settings.siteName,
      images: settings.logo ? [{ url: settings.logo }] : [],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: settings.logo ? [settings.logo] : [],
    },
    alternates: {
      canonical: normalizeUrl(siteUrl),
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

type SearchParams = {
  category?: string;
  page?: string;
};

// Cache homepage for better performance
export const revalidate = 600; // Revalidate every 10 minutes

export default async function Home({
  searchParams,
}: {
  searchParams?: SearchParams | Promise<SearchParams>;
}) {
  const session = await getServerSession(authOptions);
  const settings = await getSettings();
  
  // Resolve searchParams if it's a Promise
  const resolvedSearchParams = searchParams instanceof Promise ? await searchParams : searchParams;
  
  // Fetch categories
  let categories: any[] = [];
  try {
    if (prisma && 'category' in prisma) {
      categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
        include: {
          _count: {
            select: { posts: true },
          },
        },
      });
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
  }

  // Fetch featured categories
  const featuredCategories = categories.filter(cat => cat.featured && cat._count.posts > 0);

  // Fetch posts for each featured category - limit to reduce requests
  const featuredCategoriesWithPosts = await Promise.all(
    featuredCategories.slice(0, 3).map(async (category) => { // Limit to 3 featured categories
      const posts = await prisma.post.findMany({
        where: {
          published: true,
          categoryId: category.id,
        },
        orderBy: { createdAt: "desc" },
        take: 4, // Reduce from 6 to 4 per category
        include: {
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      });
      return {
        category,
        posts,
      };
    })
  );

  // Build where clause for posts
  const whereClause: any = { published: true };
  if (resolvedSearchParams?.category) {
    // Find category by slug
    const category = categories.find((cat) => cat.slug === resolvedSearchParams.category);
    if (category) {
      whereClause.categoryId = category.id;
    }
  }

  // Pagination for latest posts - reduce initial load
  const page = parseInt(resolvedSearchParams?.page || "1", 10);
  const limit = page === 1 ? 8 : 12; // Show fewer on first page to reduce requests
  const skip = (page - 1) * limit;

  const [posts, totalPosts] = await Promise.all([
    prisma.post.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    }),
    prisma.post.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(totalPosts / limit);

  const siteUrl = process.env.NEXT_PUBLIC_CANONICAL_URL ||
                  process.env.NEXTAUTH_URL ||
                  process.env.NEXT_PUBLIC_SITE_URL ||
                  "http://localhost:3000";

  const socialMedia = settings.socialMedia as any || {};
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

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: settings.siteName || "AppMarka",
    url: siteUrl,
    description: settings.heroSubtitle || `Download the best games and apps from ${settings.siteName}`,
    inLanguage: "en-US",
  };

  return (
    <FrontendLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      {/* Preload hero image for LCP */}
      {settings.heroBackground && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'image';
                link.href = '${settings.heroBackground}';
                link.setAttribute('fetchpriority', 'high');
                document.head.appendChild(link);
              })();
            `,
          }}
        />
      )}
      <div className="bg-theme-background min-h-screen">

      {/* ── Hero Section ── */}
      <HeroBackground backgroundImage={settings.heroBackground}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/30 dark:from-black/70 dark:via-black/50 dark:to-black/40" aria-hidden />
        <div className="relative max-w-4xl mx-auto text-center px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg tracking-tight leading-tight">
            {settings.heroTitle || settings.siteName}
          </h1>
          {settings.heroSubtitle && (
            <p className="text-lg sm:text-xl text-gray-200 mb-8 max-w-2xl mx-auto drop-shadow-md">
              {settings.heroSubtitle}
            </p>
          )}

          {/* CTA buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Link href="#latest-heading"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm shadow-lg hover:shadow-xl transition-all active:scale-95 bg-primary hover:opacity-90">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Browse Apps
            </Link>
            {categories.length > 0 && (
              <Link href={`/category/${categories[0]?.slug || ""}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white text-sm bg-white/20 hover:bg-white/30 border border-white/30 backdrop-blur-sm shadow-lg transition-all active:scale-95">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                View Categories
              </Link>
            )}
          </div>

          {/* Social icons */}
          <div className="flex justify-center gap-3">
            {[
              { href: socialMedia.facebook, bg: "bg-blue-600 hover:bg-blue-700", label: "f" },
              { href: socialMedia.twitter, bg: "bg-sky-500 hover:bg-sky-600", label: "𝕏" },
              { href: socialMedia.instagram, bg: "bg-gradient-to-br from-purple-500 to-pink-500 hover:opacity-90", label: "📷" },
              { href: socialMedia.youtube, bg: "bg-red-600 hover:bg-red-700", label: "▶" },
              { href: socialMedia.telegram, bg: "bg-sky-500 hover:bg-sky-600", label: "✈" },
            ].filter(s => s.href).map(({ href, bg, label }) => (
              <a key={href} href={href} target="_blank" rel="noopener noreferrer"
                className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center text-white font-bold text-sm transition shadow`}>
                {label}
              </a>
            ))}
          </div>
        </div>
      </HeroBackground>

      {/* ── Stats Bar ── */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100 dark:divide-gray-800">
            {[
              { emoji: "📱", bg: "bg-blue-50 dark:bg-blue-900/20", value: `${totalPosts}+`, label: "Total Apps" },
              { emoji: "🗂️", bg: "bg-purple-50 dark:bg-purple-900/20", value: `${categories.length}`, label: "Categories" },
              { emoji: "✅", bg: "bg-green-50 dark:bg-green-900/20", value: "100%", label: "Verified Safe" },
              { emoji: "⚡", bg: "bg-yellow-50 dark:bg-yellow-900/20", value: "Free", label: "Always Free" },
            ].map(({ emoji, bg, value, label }) => (
              <div key={label} className="stat-cell">
                <div className={`stat-icon ${bg}`}>{emoji}</div>
                <div>
                  <p className="font-extrabold text-gray-900 dark:text-white text-xl leading-none tracking-tight">{value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Category Filter ── */}
      <Suspense fallback={null}>
        <CategoryFilter categories={categories} />
      </Suspense>

      {/* ── Browse by Category ── */}
      {categories.length > 0 && (
        <section aria-labelledby="categories-heading" className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 py-10 sm:py-12 bg-dots">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-7">
              <h2 id="categories-heading" className="section-title text-xl sm:text-2xl text-gray-900 dark:text-white">
                Browse by Category
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {categories.filter(c => c._count.posts > 0).map((cat) => (
                <Link key={cat.id} href={`/category/${cat.slug}`}
                  className="cat-card group flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 shadow-sm hover:border-primary/40 dark:hover:border-primary/50 text-center">
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-200 inline-block" role="img" aria-label={cat.name}>
                    {cat.icon || "🎮"}
                  </span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 group-hover:text-primary transition-colors line-clamp-1 w-full">
                    {cat.name}
                  </span>
                  <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700/60 rounded-full px-2.5 py-0.5">
                    {cat._count.posts} apps
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Main Content ── */}
      <main className="relative bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          {/* Featured Categories Sections - Dynamic */}
          {featuredCategoriesWithPosts.map(({ category, posts }) => {
            if (posts.length === 0) return null;
            return (
              <section key={category.id} className="mb-14 sm:mb-16" aria-labelledby={`section-${category.slug}`}>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-7">
                  <h2 id={`section-${category.slug}`} className="section-title text-xl sm:text-2xl text-gray-900 dark:text-gray-100">
                    {category.name} {getTranslation("en", "apps")}
                  </h2>
                  <Link href={`/category/${category.slug}`}
                    className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1 group">
                    {getTranslation("en", "viewAll")}
                    <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
                  {posts.map((post, index) => (
                    <Link key={post.id} href={`/post/${post.slug}`}
                      className="app-card group bg-white dark:bg-gray-800/90 rounded-2xl border border-gray-100 dark:border-gray-700/60 overflow-hidden shadow-sm flex flex-col">
                      <div className="relative card-img-fade aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-700/40">
                        {post.featuredImage ? (
                          <SmartImage src={post.featuredImage} alt={post.title} title={post.title}
                            width={280} height={210}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            quality={85} priority={index < 2}
                            fetchPriority={index < 2 ? "high" : "auto"} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700">
                            {post.title.charAt(0)}
                          </div>
                        )}
                        <span className={`absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow ${index === 0 ? "badge-updated" : "badge-new"}`}>
                          {index === 0 ? getTranslation("en", "updated") : getTranslation("en", "new")}
                        </span>
                      </div>
                      <div className="p-3 sm:p-4 flex flex-col flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 text-sm mb-1.5 group-hover:text-primary transition-colors leading-snug">
                          {post.title}
                        </h3>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-2 flex items-center gap-1">
                          <span className="bg-gray-100 dark:bg-gray-700 rounded px-1.5 py-0.5 font-medium text-gray-600 dark:text-gray-300">
                            v{post.appVersion || "1.0"}
                          </span>
                        </p>
                        {post.rating != null && (
                          <div className="mt-auto pt-1">
                            <StarRating rating={post.rating} showNumber size="xs" ratingCount={post.ratingCount || 0} />
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}

          {/* Latest Apps Section */}
          <section aria-labelledby="latest-heading" className="mb-14 sm:mb-16">
            <h2 id="latest-heading" className="section-title text-xl sm:text-2xl text-gray-900 dark:text-gray-100 mb-7 scroll-mt-24">
              {getTranslation("en", "latestApps")}
            </h2>

            {posts.length === 0 ? (
              <div className="text-center py-16 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40">
                <p className="text-5xl mb-3">📭</p>
                <p className="text-gray-500 dark:text-gray-400">{getTranslation("en", "noAppsCheckBack")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
                {posts.map((post, index) => (
                  <Link key={post.id} href={`/post/${post.slug}`}
                    className="app-card group bg-white dark:bg-gray-800/90 rounded-2xl border border-gray-100 dark:border-gray-700/60 overflow-hidden shadow-sm flex flex-col">
                    <div className="relative card-img-fade aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-700/40">
                      {post.featuredImage ? (
                        <SmartImage src={post.featuredImage} alt={post.title} title={post.title}
                          width={280} height={210}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          quality={85} priority={index < 3}
                          fetchPriority={index < 3 ? "high" : "auto"} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700">
                          {post.title.charAt(0)}
                        </div>
                      )}
                      {index < 2 && (
                        <span className={`absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow ${index === 0 ? "badge-updated" : "badge-new"}`}>
                          {index === 0 ? "UPDATED" : "NEW"}
                        </span>
                      )}
                    </div>
                    <div className="p-3 sm:p-4 flex flex-col flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 text-sm mb-1.5 group-hover:text-primary transition-colors leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-[11px] mb-2">
                        <span className="bg-gray-100 dark:bg-gray-700 rounded px-1.5 py-0.5 font-medium text-gray-600 dark:text-gray-300">
                          v{post.appVersion || "1.0"}
                        </span>
                      </p>
                      {post.rating != null && (
                        <div className="mt-auto pt-1">
                          <StarRating rating={post.rating} showNumber size="xs" ratingCount={post.ratingCount || 0} />
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* ── Why Trust Us ── */}
      <hr className="section-divider" />
      <section className="py-14 sm:py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Why Choose Us</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
              {settings.whyChooseTitle || `Why Download from ${settings.siteName}?`}
            </h2>
            {settings.whyChooseSubtitle && (
              <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-sm">
                {settings.whyChooseSubtitle}
              </p>
            )}
          </div>

          {settings.whyChooseFeatures && Array.isArray(settings.whyChooseFeatures) && settings.whyChooseFeatures.length > 0 ? (
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${settings.whyChooseFeatures.length >= 4 ? 'lg:grid-cols-4' : settings.whyChooseFeatures.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-6`}>
              {settings.whyChooseFeatures.map((feature: any, index: number) => {
                const featureColor = feature.color || 'primary';
                const colorValue = colors[featureColor as keyof typeof colors] || colors.primary;
                const iconPaths: Record<string, string> = {
                  phone: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z",
                  check: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
                  bolt: "M13 10V3L4 14h7v7l9-11h-7z",
                  dollar: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                };
                const iconPath = iconPaths[feature.icon?.toLowerCase()] || iconPaths.phone;
                return (
                  <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: colorValue + '20' }}>
                      <svg className="w-6 h-6" style={{ color: colorValue }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
                      </svg>
                    </div>
                    {feature.title && <h3 className="text-base font-bold mb-1 text-gray-900 dark:text-gray-100">{feature.title}</h3>}
                    {feature.description && <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{feature.description}</p>}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Fallback always-visible trust cards */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { icon: "🛡️", color: "#16a34a", title: "Verified & Safe", desc: "Every APK is manually scanned for malware and hidden trackers before publishing." },
                { icon: "⚡", color: "#f59e0b", title: "Always Updated", desc: "We push new versions as soon as developers release them — no outdated files." },
                { icon: "💸", color: "#3b82f6", title: "100% Free", desc: "All APKs are free to download. No hidden charges, no subscriptions." },
                { icon: "📲", color: colors.primary, title: "Easy Install", desc: "Simple step-by-step guides for every app so anyone can install in minutes." },
              ].map(({ icon, color, title, desc }) => (
                <div key={title} className="trust-card bg-gray-50 dark:bg-gray-800/80 rounded-2xl p-6 border border-gray-100 dark:border-gray-700/50 shadow-sm"
                  style={{ "--tw-before-bg": color } as React.CSSProperties}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-2xl" style={{ backgroundColor: color + "18" }}>
                    {icon}
                  </div>
                  <h3 className="text-base font-bold mb-1.5 text-gray-900 dark:text-gray-100">{title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Homepage FAQ (SEO) ── */}
      <hr className="section-divider" />
      <section aria-labelledby="faq-home-heading" className="py-14 sm:py-16 bg-gray-50 dark:bg-gray-950/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">FAQ</p>
            <h2 id="faq-home-heading" className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: [
                  { "@type": "Question", name: `Is ${settings.siteName} safe to download from?`, acceptedAnswer: { "@type": "Answer", text: `Yes. Every APK on ${settings.siteName} is scanned for malware and verified before publishing. We only list files from trusted sources.` } },
                  { "@type": "Question", name: "Are the apps free to download?", acceptedAnswer: { "@type": "Answer", text: "All APKs listed are free to download. Some apps may contain optional in-app purchases once installed, but downloading from our site is always free." } },
                  { "@type": "Question", name: "How do I install an APK on Android?", acceptedAnswer: { "@type": "Answer", text: "Go to Settings > Security > Enable 'Unknown Sources'. Then download the APK, open your Downloads folder, tap the file, and tap Install." } },
                  { "@type": "Question", name: "Do you support iOS or iPhone?", acceptedAnswer: { "@type": "Answer", text: "Currently we only provide APK files for Android devices. iOS apps are not available for direct download." } },
                  { "@type": "Question", name: "How often are apps updated?", acceptedAnswer: { "@type": "Answer", text: `${settings.siteName} monitors app releases daily and updates files as soon as new versions are available from developers.` } },
                ],
              }),
            }}
          />
          <div className="space-y-3">
            {[
              { q: `Is ${settings.siteName} safe to download from?`, a: `Yes. Every APK is scanned for malware and verified before publishing. We only list files from trusted sources.` },
              { q: "Are the apps free to download?", a: "All APKs listed are free. Some apps may have optional in-app purchases, but downloading is always free." },
              { q: "How do I install an APK on Android?", a: "Enable 'Unknown Sources' in Settings → Security, download the APK, open Downloads, tap the file, then tap Install." },
              { q: "Do you support iOS / iPhone?", a: "Currently we only provide APK files for Android. iOS apps are not available for direct download." },
              { q: "How often are apps updated?", a: `${settings.siteName} monitors releases daily and updates as soon as new versions drop.` },
            ].map(({ q, a }, i) => (
              <details key={i} className="faq-item bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
                <summary className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors">
                  <span className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    {q}
                  </span>
                  <svg className="faq-chevron w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 text-sm text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-100 dark:border-gray-700/60 pt-4 pl-14">
                  {a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      </div>
    </FrontendLayout>
  );
}
