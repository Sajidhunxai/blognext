import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { buildCanonicalUrl } from "@/lib/url";
import FrontendLayout from "@/components/FrontendLayout";
import Image from "next/image";
import SmartImage from "@/components/SmartImage";
import StarRating from "@/components/StarRating";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import CategoryStructuredData from "@/components/CategoryStructuredData";
import PaginationWrapper from "@/components/PaginationWrapper";

const CategoryFilter = dynamic(() => import("@/components/CategoryFilter"), {
  ssr: false,
  loading: () => null,
});

type Props = {
  params: { slug: string };
  searchParams?: { page?: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  let category = null;
  try {
    if (prisma && "category" in prisma) {
      category = await (prisma as any).category.findUnique({
        where: { slug: params.slug },
      });
    }
  } catch (error) {
    console.error("Error fetching category:", error);
  }

  if (!category) {
    return {
      title: "Category Not Found",
      robots: { index: false, follow: false },
    };
  }

  const settings = await getSettings();
  const siteUrl =
    process.env.NEXT_PUBLIC_CANONICAL_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";
  const title = category.name;
  const description =
    category.description ||
    `Browse and download the best ${category.name.toLowerCase()} apps and games. Find the latest ${category.name.toLowerCase()} applications with reviews, ratings, and direct download links.`;

  // Get post count for better description
  let postCount = 0;
  try {
    if (prisma && "post" in prisma) {
      postCount = await (prisma as any).post.count({
        where: {
          published: true,
          categoryId: category.id,
        },
      });
    }
  } catch (error) {
    console.error("Error counting posts:", error);
  }

  const enhancedDescription =
    postCount > 0
      ? `${description} Browse our collection of ${postCount}+ ${category.name.toLowerCase()} apps.`
      : description;

  return {
    metadataBase: new URL(siteUrl),
    title,
    description: enhancedDescription,
    keywords: [
      category.name.toLowerCase(),
      `${category.name.toLowerCase()} apps`,
      `${category.name.toLowerCase()} games`,
      "download",
      "android apps",
      "mobile apps",
      "free apps",
    ],
    authors: [{ name: settings.siteName }],
    creator: settings.siteName,
    publisher: settings.siteName,
    openGraph: {
      title,
      description: enhancedDescription,
      url: buildCanonicalUrl(siteUrl, `/category/${category.slug}`),
      siteName: settings.siteName,
      type: "website",
      locale: "en_US",
      images: settings.logo ? [{ url: settings.logo }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: enhancedDescription,
      images: settings.logo ? [settings.logo] : [],
    },
    alternates: {
      canonical: buildCanonicalUrl(siteUrl, `/category/${category.slug}`),
    },
    robots: {
      index: true,
      follow: true,
    },
    category: category.name,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  let category = null;
  try {
    if (prisma && "category" in prisma) {
      category = await (prisma as any).category.findUnique({
        where: { slug: params.slug },
      });
    }
  } catch (error) {
    console.error("Error fetching category:", error);
  }

  if (!category) {
    notFound();
  }

  const settings = await getSettings();

  // Fetch all categories for filter
  let categories: any[] = [];
  try {
    if (prisma && "category" in prisma) {
      categories = await (prisma as any).category.findMany({
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

  // Pagination for category posts
  const page = parseInt(searchParams?.page || "1", 10);
  
  const limit = 12;
  const skip = (page - 1) * limit;

  const [posts, totalPosts] = await Promise.all([
    prisma.post.findMany({
      where: {
        published: true,
        categoryId: category.id,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        featuredImage: true,
        appVersion: true,
        downloadLink: true,
        rating: true,
        ratingCount: true,
        createdAt: true,
        category: {
          select: { name: true, slug: true },
        },
      },
    }),
    prisma.post.count({
      where: {
        published: true,
        categoryId: category.id,
      },
    }),
  ]);

  const totalPages = Math.ceil(totalPosts / limit);

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

  const siteUrl =
    process.env.NEXT_PUBLIC_CANONICAL_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  return (
    <>
      <CategoryStructuredData
        category={category}
        posts={posts.map((post) => ({
          title: post.title,
          slug: post.slug,
          featuredImage: post.featuredImage,
          createdAt: post.createdAt,
          rating: post.rating,
          ratingCount: post.ratingCount,
          appVersion: post.appVersion,
        }))}
        siteUrl={siteUrl}
        siteName={settings.siteName}
        totalPosts={totalPosts}
      />
      <FrontendLayout>
        <div className="bg-theme-background">
          {/* Hero Section */}
          <section
            className="relative py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-primary"
          >
            <div className="max-w-7xl mx-auto text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-theme-text mb-4">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
                  {category.description}
                </p>
              )}
              {totalPosts > 0 && (
                <p className="text-base sm:text-lg text-gray-200 mt-2">
                  {totalPosts} {totalPosts === 1 ? "app" : "apps"} available
                </p>
              )}
            </div>
          </section>
          {/* Breadcrumbs */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
            <Breadcrumbs
              items={[
                { label: "Home", href: "/" },
                { label: category.name, href: `/category/${category.slug}` },
              ]}
              textColor={colors.text === "#ffffff" ? "#9ca3af" : "#6b7280"}
            />
          </div>
          {/* Filter Section */}
          <Suspense fallback={null}>
            <CategoryFilter categories={categories} />
          </Suspense>

          {/* Content Section */}
          <main className="bg-white dark:bg-gray-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">

              {/* Section header */}
              <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
                <div>
                  <h2 className="section-title text-2xl sm:text-3xl text-gray-900 dark:text-white">
                    {category.name} Apps
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    {totalPosts} {totalPosts === 1 ? "app" : "apps"} · updated regularly
                  </p>
                </div>
                {/* Sort/filter hint */}
                <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                  Sorted by latest update
                </span>
              </div>

              {posts.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-5xl mb-4">📭</div>
                  <p className="text-gray-400 text-lg mb-4">
                    No apps in this category yet. Check back soon!
                  </p>
                  <Link href="/"
                    className="inline-block px-6 py-3 text-white rounded-xl font-semibold hover:opacity-90 transition bg-primary">
                    Browse All Apps
                  </Link>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                    {posts.map((post, index) => (
                      <Link
                        key={post.id}
                        href={`/post/${post.slug}`}
                        className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
                      >
                        {/* Thumbnail */}
                        <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
                          {post.featuredImage ? (
                            <SmartImage
                              src={post.featuredImage}
                              alt={post.title}
                              width={200}
                              height={200}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                              quality={85}
                            />
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center text-white text-3xl font-bold"
                              style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
                            >
                              {post.title.charAt(0)}
                            </div>
                          )}
                          {index < 3 && (
                            <span className="absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow bg-primary">
                              {index === 0 ? "🔥 HOT" : "NEW"}
                            </span>
                          )}
                          {post.downloadLink && (
                            <span className="absolute bottom-2 right-2 bg-black/50 rounded-full p-1.5">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </span>
                          )}
                        </div>

                        {/* Card body */}
                        <div className="p-3 flex flex-col flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-xs sm:text-sm line-clamp-2 leading-snug mb-1.5 group-hover:text-primary transition-colors">
                            {post.title}
                          </h3>
                          <div className="flex items-center justify-between mt-auto">
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                              {(post as any).appVersion ? `v${(post as any).appVersion}` : "APK"}
                            </span>
                            {post.rating && (
                              <span className="text-[10px] text-yellow-600 dark:text-yellow-400 font-bold flex items-center gap-0.5">
                                ★ {post.rating}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <PaginationWrapper
                      currentPage={page}
                      totalPages={totalPages}
                      baseUrl={`/category/${category.slug}`}
                    />
                  )}
                </>
              )}

              {/* SEO content block */}
              <hr className="section-divider mt-16 mb-0" />
              <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  About {category.name} Apps
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
                  {category.description ||
                    `Explore our complete collection of ${category.name.toLowerCase()} apps and games. We curate only safe, tested APK files so you can download with confidence. Every app listed here has been reviewed for compatibility with Android devices.`}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  {[
                    { icon: "✅", title: "Verified Safe", desc: "Every APK is scanned before listing." },
                    { icon: "⚡", title: "Latest Versions", desc: "We update files as soon as new releases drop." },
                    { icon: "📲", title: "Easy Install", desc: "Step-by-step guides included with every app." },
                  ].map(({ icon, title, desc }) => (
                    <div key={title} className="flex gap-3 items-start">
                      <span className="text-2xl">{icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </main>
        </div>
      </FrontendLayout>
    </>
  );
}
