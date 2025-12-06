import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import FrontendLayout from "@/components/FrontendLayout";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import CategoryStructuredData from "@/components/CategoryStructuredData";

const CategoryFilter = dynamic(() => import("@/components/CategoryFilter"), {
  ssr: false,
  loading: () => null,
});

type Props = {
  params: { slug: string };
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
    };
  }

  const settings = await getSettings();
  const siteUrl =
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";
  const title = `${category.name} - ${settings.siteName}`;
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
      url: `${siteUrl}/category/${category.slug}`,
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
      canonical: `${siteUrl}/category/${category.slug}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    category: category.name,
  };
}

export default async function CategoryPage({ params }: Props) {
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

  // Fetch posts for this category
  const posts = await prisma.post.findMany({
    where: {
      published: true,
      categoryId: category.id,
    },
    orderBy: { createdAt: "desc" },
    include: {
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
  });

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
        }))}
        siteUrl={siteUrl}
        siteName={settings.siteName}
      />
      <FrontendLayout>
        <div style={{ backgroundColor: colors.background }}>
          {/* Hero Section */}
          <section
            className="relative py-12 sm:py-16 px-4 sm:px-6 lg:px-8"
            style={{ backgroundColor: colors.primary }}
          >
            <div className="max-w-7xl mx-auto text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
                  {category.description}
                </p>
              )}
              {posts.length > 0 && (
                <p className="text-base sm:text-lg text-gray-200 mt-2">
                  {posts.length} {posts.length === 1 ? "app" : "apps"} available
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
          <main
            className="min-h-screen"
            style={{ backgroundColor: colors.background }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    {category.name} Apps
                  </h2>
                  <p className="text-gray-400 text-sm sm:text-base">
                    Browse our collection of {posts.length}{" "}
                    {posts.length === 1 ? "app" : "apps"} in {category.name}
                  </p>
                </div>
              </div>

              {posts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg">
                    No posts in this category yet. Check back soon!
                  </p>
                  <Link
                    href="/"
                    className="mt-4 inline-block px-6 py-3 text-white rounded-lg font-medium hover:opacity-90 transition"
                    style={{ backgroundColor: colors.primary }}
                  >
                    Browse All Apps
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                  {posts.map((post, index) => (
                    <Link
                      key={post.id}
                      href={`/posts/${post.slug}`}
                      className="bg-white rounded-lg border-2 p-4 hover:shadow-lg transition-shadow"
                      style={{ borderColor: colors.primary }}
                    >
                      <div className="relative mb-3">
                        {post.featuredImage ? (
                          <img
                            src={post.featuredImage}
                            alt={post.title}
                            className="w-full h-32 object-cover rounded"
                          />
                        ) : (
                          <div
                            className="w-full h-32 rounded flex items-center justify-center text-white text-2xl font-bold"
                            style={{
                              background: `linear-gradient(to bottom right, ${colors.secondary}, ${colors.secondary}dd)`,
                            }}
                          >
                            {post.title.charAt(0)}
                          </div>
                        )}
                        {index < 2 && (
                          <span
                            className="absolute top-2 left-2 text-white text-xs px-2 py-1 rounded"
                            style={{ backgroundColor: colors.primary }}
                          >
                            {index === 0 ? "UPDATED" : "NEW"}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                        {post.title}
                      </h3>
                      <p className="text-xs text-gray-600 mb-2">
                        Version:{" "}
                        {post.appVersion ||
                          (post.downloadLink ? "V1.0" : "N/A")}
                      </p>
                      <p className="text-xs text-gray-500 mb-2">
                        {settings.siteName}
                      </p>
                      <div className="flex items-center gap-1">
                        {[...Array(4)].map((_, i) => (
                          <span key={i} className="text-yellow-400 text-xs">
                            ★
                          </span>
                        ))}
                        <span className="text-gray-400 text-xs">★</span>
                        <span className="text-xs text-gray-600 ml-1">4.0</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </FrontendLayout>
    </>
  );
}
