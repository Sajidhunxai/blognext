import { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { normalizeUrl } from "@/lib/url";
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
export const revalidate = 300; // Revalidate every 5 minutes

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

  return (
    <FrontendLayout>
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

      {/* Hero Section */}
      <HeroBackground backgroundImage={settings.heroBackground}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/20 dark:from-black/60 dark:via-black/40 dark:to-black/30" aria-hidden />
        <div className="relative max-w-4xl mx-auto text-center px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 drop-shadow-lg tracking-tight">
            {settings.heroTitle || settings.siteName}
          </h1>
          {settings.heroSubtitle && (
            <p className="text-lg sm:text-xl text-gray-200 mb-8 max-w-2xl mx-auto drop-shadow-md">
              {settings.heroSubtitle}
            </p>
          )}

          {/* Social Media Icons */}
          <div className="flex justify-center gap-4">
            {socialMedia.facebook && (
              <a
                href={socialMedia.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-theme-text hover:bg-blue-700 transition"
              >
                <span className="font-bold">f</span>
              </a>
            )}
            {socialMedia.twitter && (
              <a
                href={socialMedia.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-sky-500 flex items-center justify-center text-theme-text hover:bg-sky-600 transition"
              >
                <span className="font-bold">X</span>
              </a>
            )}
            {socialMedia.instagram && (
              <a
                href={socialMedia.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-theme-text hover:opacity-90 transition"
              >
                <span className="text-xl">📷</span>
              </a>
            )}
            {socialMedia.youtube && (
              <a
                href={socialMedia.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-theme-text hover:bg-red-700 transition"
              >
                <span className="text-xl">▶</span>
              </a>
            )}
            {socialMedia.pinterest && (
              <a
                href={socialMedia.pinterest}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-theme-text hover:bg-red-700 transition"
              >
                <span className="font-bold">P</span>
              </a>
            )}
            {socialMedia.telegram && (
              <a
                href={socialMedia.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-sky-500 flex items-center justify-center text-theme-text hover:bg-sky-600 transition"
              >
                <span className="text-xl">✈</span>
              </a>
            )}
          </div>
        </div>
      </HeroBackground>

      {/* Filter Section */}
      <Suspense fallback={null}>
        <CategoryFilter categories={categories} />
      </Suspense>

      {/* Content Section */}
      <main className="relative bg-gray-50/30 dark:bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          {/* Featured Categories Sections - Dynamic */}
          {featuredCategoriesWithPosts.map(({ category, posts }) => {
            if (posts.length === 0) return null;
            return (
              <section key={category.id} className="mb-14 sm:mb-16" aria-labelledby={`section-${category.slug}`}>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                  <h2
                    id={`section-${category.slug}`}
                    className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2"
                  >
                    <span className="w-1 h-6 sm:h-7 rounded-full bg-primary dark:shadow-[0_0_8px_rgba(220,38,38,0.4)]" aria-hidden />
                    {category.name} Apps
                  </h2>
                  <Link
                    href={`/category/${category.slug}`}
                    className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
                  >
                    View all
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
                  {posts.map((post, index) => (
                    <Link
                      key={post.id}
                      href={`/post/${post.slug}`}
                      className="group bg-white dark:bg-gray-800/90 rounded-xl border border-gray-200 dark:border-gray-600/60 overflow-hidden shadow-sm dark:shadow-gray-950/50 hover:shadow-lg dark:hover:shadow-xl dark:hover:shadow-gray-950/30 hover:border-primary/30 dark:hover:border-primary/50 hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-700/40">
                        {post.featuredImage ? (
                          <SmartImage
                            src={post.featuredImage}
                            alt={post.title}
                            title={post.title}
                            width={280}
                            height={210}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            quality={85}
                            priority={index < 2}
                            fetchPriority={index < 2 ? "high" : "auto"}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-theme-text text-2xl font-bold bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700">
                            {post.title.charAt(0)}
                          </div>
                        )}
                        {index < 2 && (
                          <span className="absolute top-2 left-2 text-white text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-md bg-primary shadow-sm">
                            {index === 0 ? "UPDATED" : "NEW"}
                          </span>
                        )}
                      </div>
                      <div className="p-3 sm:p-4 flex flex-col flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 text-sm sm:text-base mb-1 group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          v{post.appVersion || (post.downloadLink ? "1.0" : "—")} · {settings.siteName}
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
            <h2
              id="latest-heading"
              className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-6"
            >
              <span className="w-1 h-6 sm:h-7 rounded-full bg-primary dark:shadow-[0_0_8px_rgba(220,38,38,0.4)]" aria-hidden />
              Latest Apps
            </h2>

            {posts.length === 0 ? (
              <div className="text-center py-16 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600/80 bg-gray-50/50 dark:bg-gray-800/40">
                <p className="text-gray-500 dark:text-gray-400 text-base">No apps yet. Check back soon!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
                {posts.map((post, index) => (
                  <Link
                    key={post.id}
                    href={`/post/${post.slug}`}
                    className="group bg-white dark:bg-gray-800/90 rounded-xl border border-gray-200 dark:border-gray-600/60 overflow-hidden shadow-sm dark:shadow-gray-950/50 hover:shadow-lg dark:hover:shadow-xl dark:hover:shadow-gray-950/30 hover:border-primary/30 dark:hover:border-primary/50 hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-700/40">
                      {post.featuredImage ? (
                        <SmartImage
                          src={post.featuredImage}
                          alt={post.title}
                          title={post.title}
                          width={280}
                          height={210}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          quality={85}
                          priority={index < 3}
                          fetchPriority={index < 3 ? "high" : "auto"}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-theme-text text-2xl font-bold bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700">
                          {post.title.charAt(0)}
                        </div>
                      )}
                      {index < 2 && (
                        <span className="absolute top-2 left-2 text-white text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-md bg-primary shadow-sm">
                          {index === 0 ? "UPDATED" : "NEW"}
                        </span>
                      )}
                    </div>
                    <div className="p-3 sm:p-4 flex flex-col flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 text-sm sm:text-base mb-1 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        v{post.appVersion || (post.downloadLink ? "1.0" : "—")} · {settings.siteName}
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

      {/* Why Choose Us Section - Before Footer */}
      {(settings.whyChooseTitle || (settings.whyChooseFeatures && Array.isArray(settings.whyChooseFeatures) && settings.whyChooseFeatures.length > 0)) && (
        <section className="py-12 sm:py-16 bg-gray-50/50 dark:bg-gray-900/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {(settings.whyChooseTitle || settings.whyChooseSubtitle) && (
              <div className="text-center mb-10 sm:mb-12">
                {settings.whyChooseTitle && (
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: colors.primary }}>
                    {settings.whyChooseTitle}
                  </h2>
                )}
                {settings.whyChooseSubtitle && (
                  <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    {settings.whyChooseSubtitle}
                  </p>
                )}
              </div>
            )}
            
            {settings.whyChooseFeatures && Array.isArray(settings.whyChooseFeatures) && settings.whyChooseFeatures.length > 0 && (
              <div className={`grid grid-cols-1 sm:grid-cols-2 ${settings.whyChooseFeatures.length >= 4 ? 'lg:grid-cols-4' : settings.whyChooseFeatures.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-6 sm:gap-8`}>
                {settings.whyChooseFeatures.map((feature: any, index: number) => {
                  const featureColor = feature.color || 'primary';
                  const colorValue = colors[featureColor as keyof typeof colors] || colors.primary;
                  
                  // Icon mapping
                  const getIcon = () => {
                    const iconType = feature.icon?.toLowerCase() || 'phone';
                    switch (iconType) {
                      case 'phone':
                        return (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        );
                      case 'check':
                        return (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        );
                      case 'bolt':
                        return (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        );
                      case 'dollar':
                        return (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        );
                      default:
                        return (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        );
                    }
                  };

                  return (
                    <div key={index} className="bg-white dark:bg-gray-800/90 dark:border dark:border-gray-600/50 rounded-xl p-6 shadow-md dark:shadow-gray-950/50 hover:shadow-lg dark:hover:shadow-xl dark:hover:shadow-gray-950/30 transition-shadow">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: colorValue + '20' }}>
                        <svg className="w-6 h-6" style={{ color: colorValue }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {getIcon()}
                        </svg>
                      </div>
                      {feature.title && (
                        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">{feature.title}</h3>
                      )}
                      {feature.description && (
                        <p className="text-gray-600 dark:text-gray-300 text-sm">{feature.description}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      </div>
    </FrontendLayout>
  );
}
