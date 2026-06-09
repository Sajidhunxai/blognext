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

export default function CategoryStructuredData({
  category,
  posts,
  siteUrl,
  siteName,
  totalPosts,
}: CategoryStructuredDataProps) {
  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: category.name,
        item: `${siteUrl}/category/${category.slug}`,
      },
    ],
  };

  const collectionStructuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${siteUrl}/category/${category.slug}`,
    name: `${category.name} Apps`,
    description: category.description || `Browse all ${category.name} apps and games`,
    url: `${siteUrl}/category/${category.slug}`,
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
    },
    mainEntity: {
      "@type": "ItemList",
      name: `${category.name} Apps`,
      numberOfItems: totalPosts ?? posts.length,
      itemListElement: posts.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "SoftwareApplication",
          "@id": `${siteUrl}/post/${post.slug}`,
          name: post.title,
          url: `${siteUrl}/post/${post.slug}`,
          applicationCategory: "GameApplication",
          operatingSystem: "Android",
          ...(post.featuredImage && { image: post.featuredImage }),
          ...(post.appVersion && { softwareVersion: post.appVersion }),
          ...(post.developer && {
            author: { "@type": "Organization", name: post.developer },
          }),
          ...(post.rating && post.ratingCount && {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: post.rating,
              ratingCount: post.ratingCount,
              bestRating: 5,
              worstRating: 1,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionStructuredData) }}
      />
    </>
  );
}

