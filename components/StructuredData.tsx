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
  };
  siteUrl: string;
  siteName?: string;
}

export default function StructuredData({ post, siteUrl, siteName = "PKR Games" }: StructuredDataProps) {
  // Extract FAQs from content (looking for common FAQ patterns)
  const extractFAQs = (content: string) => {
    const faqs: Array<{ question: string; answer: string }> = [];
    
    // Try to find FAQ sections in HTML
    const faqPatterns = [
      /<h[2-4][^>]*>(.*?faq.*?)<\/h[2-4]>/gi,
      /<h[2-4][^>]*>([^<]*\?[^<]*)<\/h[2-4]>\s*<p[^>]*>([^<]+)<\/p>/gi,
    ];

    // Simple FAQ extraction (can be enhanced based on your content structure)
    const questionRegex = /<h[2-4][^>]*>([^<]*\?[^<]*)<\/h[2-4]>/g;
    let match;
    const questions: string[] = [];
    while ((match = questionRegex.exec(content)) !== null) {
      questions.push(match[1].replace(/<[^>]*>/g, '').trim());
    }

    // For each question, try to find the following paragraph as answer
    questions.forEach((question, index) => {
      const questionIndex = content.indexOf(question);
      if (questionIndex !== -1) {
        const afterQuestion = content.substring(questionIndex + question.length);
        const answerMatch = afterQuestion.match(/<p[^>]*>([^<]+)<\/p>/);
        if (answerMatch && answerMatch[1]) {
          faqs.push({
            question,
            answer: answerMatch[1].replace(/<[^>]*>/g, '').trim().substring(0, 500),
          });
        }
      }
    });

    return faqs;
  };

  const faqs = extractFAQs(post.content);

  // SoftwareApplication Schema (for apps/games)
  const softwareSchema = post.downloadLink ? {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: post.title,
    description: post.metaDescription || post.content.substring(0, 200).replace(/<[^>]*>/g, ''),
    image: post.featuredImage || post.ogImage || `${siteUrl}/og-default.jpg`,
    applicationCategory: post.category?.name || "Game",
    operatingSystem: post.requirements || "Android",
    ...(post.rating && post.ratingCount && {
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
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": post.downloadLink ? "Article" : "BlogPosting",
    "@id": `${siteUrl}/posts/${post.slug}`,
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
      "@id": `${siteUrl}/posts/${post.slug}`,
    },
    keywords: post.keywords?.join(", ") || "",
    articleSection: post.category?.name || "General",
    ...(post.rating && post.ratingCount && {
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
  const reviewSchema = post.comments && post.comments.length > 0 && post.comments.some(c => c.rating) ? {
    "@context": "https://schema.org",
    "@type": "Product",
    name: post.title,
    image: post.featuredImage || post.ogImage || `${siteUrl}/og-default.jpg`,
    description: post.metaDescription || post.content.substring(0, 200).replace(/<[^>]*>/g, ''),
    ...(post.rating && post.ratingCount && {
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
        item: `${siteUrl}/posts/${post.slug}`,
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

