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
  }>;
  siteUrl: string;
  siteName: string;
}

export default function CategoryStructuredData({
  category,
  posts,
  siteUrl,
  siteName,
}: CategoryStructuredDataProps) {
  // Breadcrumb structured data
  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: category.name,
        item: `${siteUrl}/category/${category.slug}`,
      },
    ],
  };

  // CollectionPage structured data
  const collectionStructuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${siteUrl}/category/${category.slug}`,
    name: category.name,
    description: category.description || `Browse all ${category.name} apps and games`,
    url: `${siteUrl}/category/${category.slug}`,
    publisher: {
      "@type": "Organization",
      name: siteName,
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: posts.length,
      itemListElement: posts.map((post, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "SoftwareApplication",
          name: post.title,
          url: `${siteUrl}/posts/${post.slug}`,
          image: post.featuredImage || undefined,
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

