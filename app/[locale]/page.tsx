import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSettingsWithLocale, getCategoriesWithLocale, getPostsWithLocale } from "@/lib/i18n/content";
import { addLocalePrefix, type Locale } from "@/lib/i18n/config";
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

type Props = {
  params: { locale: string };
  searchParams: { category?: string; page?: string } | Promise<{ category?: string; page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = params.locale as Locale;
  const settings = await getSettingsWithLocale(locale);
  if (!settings) return { title: "Not Found" };

  const siteUrl = process.env.NEXT_PUBLIC_CANONICAL_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
  const title = settings.heroTitle || `${settings.siteName} - Download Best Games`;
  const description = settings.heroSubtitle || `Download the best games and apps from ${settings.siteName}`;

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    openGraph: {
      title,
      description,
      url: siteUrl + addLocalePrefix("/", locale),
      locale: locale === "ur" ? "ur_PK" : locale === "hi" ? "hi_IN" : "en_US",
      type: "website",
    },
    alternates: {
      canonical: siteUrl + addLocalePrefix("/", locale),
    },
  };
}

export const revalidate = 300;

export default async function LocaleHomePage({ params, searchParams }: Props) {
  const locale = params.locale as Locale;
  const resolved = searchParams instanceof Promise ? await searchParams : searchParams;

  const settings = await getSettingsWithLocale(locale);
  if (!settings) return null;

  const categories = await getCategoriesWithLocale(locale);
  const featuredCategories = categories.filter((c: any) => c.featured && c._count?.posts > 0);

  const featuredCategoriesWithPosts = await Promise.all(
    featuredCategories.slice(0, 3).map(async (category: any) => {
      const posts = await getPostsWithLocale({
        where: { published: true, categoryId: category.id },
        take: 4,
        locale,
      });
      return { category, posts };
    })
  );

  const whereClause: any = { published: true };
  if (resolved?.category) {
    const cat = categories.find((c: any) => c.slug === resolved.category);
    if (cat) whereClause.categoryId = cat.id;
  }

  const page = parseInt(resolved?.page || "1", 10);
  const limit = page === 1 ? 8 : 12;
  const skip = (page - 1) * limit;

  const [posts, totalPosts] = await Promise.all([
    getPostsWithLocale({ where: whereClause, skip, take: limit, locale }),
    prisma.post.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(totalPosts / limit);
  const socialMedia = (settings.socialMedia as any) || {};
  const colors = {
    primary: settings.primaryColor || "#dc2626",
    secondary: settings.secondaryColor || "#16a34a",
    text: settings.textColor || "#ffffff",
    link: settings.linkColor || "#3b82f6",
  };

  const basePath = locale === "en" ? "" : `/${locale}`;

  return (
    <FrontendLayout>
      {settings.heroBackground && (
        <link rel="preload" href={settings.heroBackground} as="image" />
      )}
      <div className="bg-theme-background min-h-screen">
        <HeroBackground backgroundImage={settings.heroBackground}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/20" aria-hidden />
          <div className="relative max-w-4xl mx-auto text-center px-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              {settings.heroTitle || settings.siteName}
            </h1>
            {settings.heroSubtitle && (
              <p className="text-lg sm:text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
                {settings.heroSubtitle}
              </p>
            )}
            <div className="flex justify-center gap-4">
              {Object.entries(socialMedia).map(([key, url]) =>
                url ? (
                  <a
                    key={key}
                    href={url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition"
                  >
                    {key.charAt(0).toUpperCase()}
                  </a>
                ) : null
              )}
            </div>
          </div>
        </HeroBackground>

        <Suspense fallback={null}>
          <CategoryFilter categories={categories} basePath={basePath} />
        </Suspense>

        <main className="relative bg-gray-50/30 dark:bg-gray-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            {featuredCategoriesWithPosts.map(({ category, posts }: any) => {
              if (posts.length === 0) return null;
              return (
                <section key={category.id} className="mb-14">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {category.name} Apps
                    </h2>
                    <Link
                      href={addLocalePrefix(`/category/${category.slug}`, locale)}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      View all →
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
                    {posts.map((post: any, index: number) => (
                      <Link
                        key={post.id}
                        href={addLocalePrefix(`/post/${post.slug}`, locale)}
                        className="group bg-white dark:bg-gray-800/90 rounded-xl border border-gray-200 dark:border-gray-600/60 overflow-hidden shadow-sm hover:shadow-lg hover:border-primary/30 transition-all flex flex-col"
                      >
                        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-700/40">
                          {post.featuredImage ? (
                            <SmartImage
                              src={post.featuredImage}
                              alt={post.title}
                              width={280}
                              height={210}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              quality={85}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl font-bold bg-gray-200 dark:bg-gray-600">
                              {post.title.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="p-3 sm:p-4 flex flex-col flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 text-sm sm:text-base group-hover:text-primary transition-colors">
                            {post.title}
                          </h3>
                          {post.rating != null && (
                            <div className="mt-auto pt-1">
                              <StarRating rating={post.rating} size="xs" ratingCount={post.ratingCount || 0} />
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}

            <section className="mb-14">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                Latest Apps
              </h2>
              {posts.length === 0 ? (
                <div className="text-center py-16 rounded-2xl border border-dashed border-gray-300 dark:border-gray-600">
                  <p className="text-gray-500 dark:text-gray-400">No apps yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
                  {posts.map((post: any, index: number) => (
                    <Link
                      key={post.id}
                      href={addLocalePrefix(`/post/${post.slug}`, locale)}
                      className="group bg-white dark:bg-gray-800/90 rounded-xl border overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-700/40">
                        {post.featuredImage ? (
                          <SmartImage
                            src={post.featuredImage}
                            alt={post.title}
                            width={280}
                            height={210}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            quality={85}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl font-bold bg-gray-200 dark:bg-gray-600">
                            {post.title.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="p-3 sm:p-4 flex flex-col flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 text-sm sm:text-base group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        {post.rating != null && (
                          <div className="mt-auto pt-1">
                            <StarRating rating={post.rating} size="xs" ratingCount={post.ratingCount || 0} />
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
      </div>
    </FrontendLayout>
  );
}
