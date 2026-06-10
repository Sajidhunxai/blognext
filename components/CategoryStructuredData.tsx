interface CategoryStructuredDataProps {
  category: {
    name: string;
    slug: string;
    description?: string | null;
  };
  posts: Array<{
    title: string;
    slug: string;
    featuredImage?: string | null;
    createdAt: Date;
    rating?: number | null;
    ratingCount?: number | null;
    appVersion?: string | null;
    developer?: string | null;
  }>;
  siteUrl: string;
  siteName: string;
  totalPosts?: number;
}

function toAppCategory(name?: string | null): string {
  if (!name) return "GameApplication";
  const n = name.toLowerCase();
  if (n.includes("game") || n.includes("gaming") || n.includes("action") ||
      n.includes("sport") || n.includes("racing") || n.includes("puzzle") ||
      n.includes("casino") || n.includes("card") || n.includes("strategy") ||
      n.includes("arcade") || n.includes("shooting")) return "GameApplication";
  if (n.includes("photo") || n.includes("image") || n.includes("camera")) return "GraphicsApplication";
  if (n.includes("music") || n.includes("audio") || n.includes("sound")) return "MultimediaApplication";
  if (n.includes("video") || n.includes("media") || n.includes("player")) return "MultimediaApplication";
  if (n.includes("social") || n.includes("chat") || n.includes("message")) return "SocialNetworkingApplication";
  if (n.includes("finance") || n.includes("bank") || n.includes("money")) return "FinanceApplication";
  if (n.includes("health") || n.includes("medical") || n.includes("fitness")) return "HealthApplication";
  if (n.includes("education") || n.includes("learn") || n.includes("study")) return "EducationalApplication";
  if (n.includes("utility") || n.includes("tool") || n.includes("system")) return "UtilitiesApplication";
  if (n.includes("travel") || n.includes("map") || n.includes("navigation")) return "TravelApplication";
  if (n.includes("news") || n.includes("magazine") || n.includes("reader")) return "NewsApplication";
  if (n.includes("shopping") || n.includes("store") || n.includes("commerce")) return "ShoppingApplication";
  if (n.includes("food") || n.includes("recipe") || n.includes("cook")) return "FoodApplication";
  if (n.includes("business") || n.includes("office") || n.includes("productivity")) return "BusinessApplication";
  return "MobileApplication";
}

export default function CategoryStructuredData({
  category,
  posts,
  siteUrl,
  siteName,
  totalPosts,
}: CategoryStructuredDataProps) {
  const base = siteUrl.replace(/\/+$/, "");
  const catUrl = `${base}/category/${category.slug}`;
  const appCategory = toAppCategory(category.name);

  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${catUrl}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: base },
      { "@type": "ListItem", position: 2, name: category.name, item: catUrl },
    ],
  };

  const collectionStructuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": catUrl,
    name: `${category.name} Apps`,
    description:
      category.description || `Browse all ${category.name} apps and games`,
    url: catUrl,
    publisher: { "@type": "Organization", name: siteName, url: base },
    mainEntity: {
      "@type": "ItemList",
      name: `${category.name} Apps`,
      numberOfItems: totalPosts ?? posts.length,
      itemListElement: posts.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "SoftwareApplication",
          "@id": `${base}/post/${post.slug}#software`,
          name: post.title,
          url: `${base}/post/${post.slug}`,
          applicationCategory: appCategory,
          operatingSystem: "Android",
          ...(post.featuredImage && {
            image: { "@type": "ImageObject", url: post.featuredImage },
          }),
          ...(post.appVersion && { softwareVersion: post.appVersion }),
          ...(post.developer && {
            author: { "@type": "Organization", name: post.developer },
          }),
          ...(post.rating &&
            post.ratingCount &&
            post.ratingCount > 0 && {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: String(post.rating),
                ratingCount: post.ratingCount,
                bestRating: "5",
                worstRating: "1",
              },
            }),
          datePublished: post.createdAt.toISOString(),
        },
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionStructuredData),
        }}
      />
    </>
  );
}
