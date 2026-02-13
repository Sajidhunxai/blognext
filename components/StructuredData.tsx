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
    rating?: number | null;
    ratingCount?: number;
    developer?: string | null;
    appSize?: string | null;
    appVersion?: string | null;
    requirements?: string | null;
    downloads?: string | null;
    googlePlayLink?: string | null;
    author: {
      name: string | null;
      email: string;
    };
    category?: {
      name: string;
      slug: string;
    } | null;
    comments?: Array<{
      id: string;
      content: string;
      author: string;
      createdAt: Date;
      rating?: number;
    }>;
    faqs?: Array<{ question: string; answer: string }> | null;
  };
  siteUrl: string;
  siteName?: string;
}

import { extractFAQsFromContent } from "@/lib/faq";

export default function StructuredData({ post, siteUrl, siteName = "PKR Games" }: StructuredDataProps) {
  const faqsFromDb = Array.isArray(post.faqs) && post.faqs.length > 0 ? post.faqs : null;
  const faqsExtracted = extractFAQsFromContent(post.content);
  const faqs = faqsFromDb ?? faqsExtracted;

  // SoftwareApplication Schema (for apps/games)
  const softwareSchema = post.downloadLink ? {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${siteUrl}/post/${post.slug}`,
    name: post.title,
    description: post.metaDescription || post.content.substring(0, 200).replace(/<[^>]*>/g, ''),
    image: post.featuredImage || post.ogImage || `${siteUrl}/og-default.jpg`,
    url: `${siteUrl}/post/${post.slug}`,
    applicationCategory: post.category?.name || "Game",
    operatingSystem: post.requirements || "Android",
    ...(post.rating && post.ratingCount && post.ratingCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: post.rating,
        ratingCount: post.ratingCount,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${siteUrl}/download/${post.slug}`,
    },
    ...(post.developer && {
      author: {
        "@type": "Organization",
        name: post.developer,
      },
    }),
    ...(post.appVersion && { softwareVersion: post.appVersion }),
    ...(post.appSize && { fileSize: post.appSize }),
    ...(post.downloads && { interactionStatistic: {
      "@type": "InteractionCounter",
      interactionType: "https://schema.org/DownloadAction",
      userInteractionCount: post.downloads.replace(/[^0-9]/g, ''),
    }}),
  } : null;

  // Article/BlogPosting Schema
  // Note: When SoftwareApplication schema exists, we don't include aggregateRating here
  // to avoid conflicts with Google's review snippets requirements
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": post.downloadLink ? "Article" : "BlogPosting",
    "@id": `${siteUrl}/post/${post.slug}`,
    headline: post.title,
    description: post.metaDescription || post.content.substring(0, 200).replace(/<[^>]*>/g, ''),
    image: {
      "@type": "ImageObject",
      url: post.featuredImage || post.ogImage || `${siteUrl}/og-default.jpg`,
      width: 1200,
      height: 630,
    },
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: post.author.name || post.author.email,
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteUrl}/post/${post.slug}`,
    },
    keywords: post.keywords?.join(", ") || "",
    articleSection: post.category?.name || "General",
    // Only include aggregateRating in Article schema if SoftwareApplication schema doesn't exist
    // This prevents conflicts with Google's review snippets for SoftwareApplication
    ...(!post.downloadLink && post.rating && post.ratingCount && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: post.rating,
        ratingCount: post.ratingCount,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };

  // Review Schema (from comments with ratings)
  // Note: Only include aggregateRating here if SoftwareApplication schema doesn't exist
  // to avoid conflicts with Google's review snippets requirements for SoftwareApplication
  const reviewSchema = post.comments && post.comments.length > 0 && post.comments.some(c => c.rating) ? {
    "@context": "https://schema.org",
    "@type": "Product",
    name: post.title,
    image: post.featuredImage || post.ogImage || `${siteUrl}/og-default.jpg`,
    description: post.metaDescription || post.content.substring(0, 200).replace(/<[^>]*>/g, ''),
    // Only include aggregateRating if SoftwareApplication schema doesn't exist
    ...(!post.downloadLink && post.rating && post.ratingCount && post.ratingCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: post.rating,
        ratingCount: post.ratingCount,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    review: post.comments
      .filter(comment => comment.rating && comment.rating > 0)
      .slice(0, 10) // Limit to top 10 reviews
      .map(comment => ({
        "@type": "Review",
        reviewRating: {
          "@type": "Rating",
          ratingValue: comment.rating,
          bestRating: 5,
          worstRating: 1,
        },
        author: {
          "@type": "Person",
          name: comment.author,
        },
        datePublished: comment.createdAt.toISOString(),
        reviewBody: comment.content.substring(0, 500),
      })),
  } : null;

  // FAQ Schema
  const faqSchema = faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  } : null;

  // BreadcrumbList Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      ...(post.category ? [{
        "@type": "ListItem",
        position: 2,
        name: post.category.name,
        item: `${siteUrl}/category/${post.category.slug}`,
      }] : []),
      {
        "@type": "ListItem",
        position: post.category ? 3 : 2,
        name: post.title,
        item: `${siteUrl}/post/${post.slug}`,
      },
    ],
  };

  // Combine all schemas
  const schemas = [
    articleSchema,
    ...(softwareSchema ? [softwareSchema] : []),
    ...(reviewSchema ? [reviewSchema] : []),
    ...(faqSchema ? [faqSchema] : []),
    breadcrumbSchema,
  ];

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}

