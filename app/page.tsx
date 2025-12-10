import { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import Image from "next/image";
import FrontendLayout from "@/components/FrontendLayout";
import StarRating from "@/components/StarRating";
import SmartImage from "@/components/SmartImage";
import HeroBackground from "@/components/HeroBackground";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const CategoryFilter = dynamic(() => import("@/components/CategoryFilter"), {
  ssr: false,
  loading: () => null,
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const siteUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
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
      canonical: siteUrl,
    },
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
  };
}

type SearchParams = {
  category?: string;
};

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

  // Fetch posts for each featured category
  const featuredCategoriesWithPosts = await Promise.all(
    featuredCategories.map(async (category) => {
      const posts = await prisma.post.findMany({
        where: {
          published: true,
          categoryId: category.id,
        },
        orderBy: { createdAt: "desc" },
        take: 6,
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

  const posts = await prisma.post.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    take: 12,
    include: {
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });

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
      <div className="bg-theme-background">

      {/* Hero Section */}
      <HeroBackground backgroundImage={settings.heroBackground}>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8">
            {settings.heroTitle || settings.siteName}
          </h1>
          {settings.heroSubtitle && (
            <p className="text-xl text-gray-300 mb-8">{settings.heroSubtitle}</p>
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
      <main className="min-h-screen bg-theme-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
      

          {/* Featured Categories Sections - Dynamic */}
          {featuredCategoriesWithPosts.map(({ category, posts }) => {
            if (posts.length === 0) return null;
            
            return (
              <section key={category.id} className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-primary">{category.name} Apps</h2>
                  <Link
                    href={`/category/${category.slug}`}
                    className="text-sm font-medium text-link hover:underline"
                  >
                    View All →
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                  {posts.map((post, index) => (
                    <Link
                      key={post.id}
                      href={`/posts/${post.slug}`}
                      className="bg-white rounded-lg border-2 p-4 hover:shadow-lg transition-shadow "
                    >
                      <div className="relative mb-3">
                        {post.featuredImage ? (
                          <SmartImage
                            src={post.featuredImage}
                            alt={post.title}
                            width={259}
                            height={259}
                            className="w-full h-32 object-cover rounded"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 20vw, 16vw"
                            quality={85}
                          />
                        ) : (
                          <div className="w-full h-32 rounded flex items-center justify-center text-theme-text text-2xl font-bold bg-gradient-secondary">
                            {post.title.charAt(0)}
                          </div>
                        )}
                        {index < 2 && (
                          <span className="absolute top-2 left-2 text-theme-text text-xs px-2 py-1 rounded bg-primary">
                            {index === 0 ? "UPDATED" : "NEW"}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                        {post.title}
                      </h3>
                      <p className="text-xs text-gray-600 mb-2">
                        Version: {post.appVersion || (post.downloadLink ? "V1.0" : "N/A")}
                      </p>
                      <p className="text-xs text-gray-500 mb-2">{settings.siteName}</p>
                      {post.rating && (
                        <StarRating 
                          rating={post.rating} 
                          showNumber 
                          size="xs" 
                          ratingCount={post.ratingCount || 0}
                        />
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}

          {/* Latest Apps Section */}
          <section>
            <h2 className="text-2xl font-bold text-center mb-8 text-primary">Latest Apps</h2>

          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No posts yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {posts.map((post, index) => (
              <Link
                key={post.id}
                href={`/posts/${post.slug}`}
                  className="bg-white rounded-lg border-2 p-4 hover:shadow-lg transition-shadow "
              >
                  <div className="relative mb-3">
                    {post.featuredImage ? (
                      <SmartImage
                        src={post.featuredImage}
                        alt={post.title}
                        width={259}
                        height={259}
                        className="w-full h-32 object-cover rounded"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 20vw, 16vw"
                        quality={85}
                      />
                    ) : (
                      <div className="w-full h-32 rounded flex items-center justify-center text-theme-text text-2xl font-bold bg-gradient-secondary"
                      >
                        {post.title.charAt(0)}
                      </div>
                    )}
                    {index < 2 && (
                      <span className="absolute top-2 left-2 text-theme-text text-xs px-2 py-1 rounded bg-primary"
                      >
                        {index === 0 ? "UPDATED" : "NEW"}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                    {post.title}
                  </h3>
                  <p className="text-xs text-gray-600 mb-2">
                    Version: {post.appVersion || (post.downloadLink ? "V1.0" : "N/A")}
                  </p>
                  <p className="text-xs text-gray-500 mb-2">{settings.siteName}</p>
                  {post.rating && (
                    <StarRating 
                      rating={post.rating} 
                      showNumber 
                      size="xs" 
                      ratingCount={post.ratingCount || 0}
                    />
                  )}
                </Link>
              ))}
                </div>
          )}
          </section>
        </div>
      </main>

      </div>
    </FrontendLayout>
  );
}
