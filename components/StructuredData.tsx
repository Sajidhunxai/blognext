interface StructuredDataProps {
  post: {
    title: string;
    content: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
    metaDescription?: string | null;
    keywords?: string[];
    featuredImage?: string | null;
    ogImage?: string | null;
    downloadLink?: string | null;
    author: {
      name: string | null;
      email: string;
    };
    category?: {
      name: string;
      slug: string;
    } | null;
  };
  siteUrl: string;
}

export default function StructuredData({ post, siteUrl }: StructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${siteUrl}/posts/${post.slug}`,
    headline: post.title,
    description: post.metaDescription || post.content.substring(0, 200),
    image: post.featuredImage || post.ogImage || `${siteUrl}/og-default.jpg`,
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: post.author.name || post.author.email,
      email: post.author.email,
    },
    publisher: {
      "@type": "Organization",
      name: "PKR Games",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/posts/${post.slug}`,
    },
    keywords: post.keywords?.join(", ") || "",
    articleSection: post.category?.name || "General",
    ...(post.downloadLink && {
      offers: {
        "@type": "Offer",
        url: post.downloadLink,
        availability: "https://schema.org/InStock",
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

