import { extractFAQsFromContent } from "@/lib/faq";

interface StructuredDataProps {
  post: {
    title: string;
    content: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
    metaDescription?: string | null;
    keywords?: string[] | null;
    featuredImage?: string | null;
    screenshots?: string[] | null;
    ogImage?: string | null;
    downloadLink?: string | null;
    rating?: number | null;
    ratingCount?: number | null;
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
  /** Actual logo URL from settings */
  logoUrl?: string | null;
}

// ── helpers ────────────────────────────────────────────────────────────────

function stripHtml(html: string, maxLen = 250): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, maxLen)
    .trimEnd();
}

/**
 * Map a freeform category name to a Schema.org applicationCategory value.
 * https://schema.org/applicationCategory
 */
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

function buildImage(url: string | null | undefined, fallback: string): object | string {
  const src = url || fallback;
  return { "@type": "ImageObject", url: src };
}

// ── Component ──────────────────────────────────────────────────────────────

export default function StructuredData({
  post,
  siteUrl,
  siteName = "AppMarka",
  logoUrl,
}: StructuredDataProps) {
  const base = siteUrl.replace(/\/+$/, "");
  const postUrl = `${base}/post/${post.slug}`;
  const defaultImg = logoUrl || `${base}/og-default.jpg`;

  const description =
    post.metaDescription?.trim() || stripHtml(post.content);

  const faqsFromDb =
    Array.isArray(post.faqs) && post.faqs.length > 0 ? post.faqs : null;
  const faqs = faqsFromDb ?? extractFAQsFromContent(post.content);

  // ── 1. SoftwareApplication (only when post has a download link) ──────────
  const softwareSchema = post.downloadLink
    ? {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        // Distinct @id — use #software to separate from the Article node
        "@id": `${postUrl}#software`,
        name: post.title,
        description,
        // ImageObject, not a plain string
        image: buildImage(post.featuredImage || post.ogImage, defaultImg),
        ...(Array.isArray(post.screenshots) &&
          post.screenshots.length > 0 && { screenshot: post.screenshots[0] }),
        url: postUrl,
        // Validated Schema.org applicationCategory value
        applicationCategory: toAppCategory(post.category?.name),
        // Always "Android" — requirements string goes into description
        operatingSystem: "Android",
        ...(post.appVersion && { softwareVersion: post.appVersion }),
        // fileSize expects MB as a number string, e.g. "12.5"
        ...(post.appSize && { fileSize: `${post.appSize} MB` }),
        ...(post.developer && {
          author: { "@type": "Organization", name: post.developer },
        }),
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: `${base}/download/${post.slug}`,
        },
        ...(post.googlePlayLink && { installUrl: post.googlePlayLink }),
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
        ...(post.downloads &&
          (() => {
            const n = parseInt(post.downloads!.replace(/\D/g, ""), 10);
            return n > 0
              ? {
                  interactionStatistic: {
                    "@type": "InteractionCounter",
                    interactionType: "https://schema.org/DownloadAction",
                    userInteractionCount: n,
                  },
                }
              : {};
          })()),
      }
    : null;

  // ── 2. Article / BlogPosting (review/editorial content) ─────────────────
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    // Different @id from softwareSchema — no collision
    "@id": `${postUrl}#article`,
    headline: post.title,
    description,
    image: buildImage(post.featuredImage || post.ogImage, defaultImg),
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: post.author.name || post.author.email,
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: base,
      ...(logoUrl && {
        logo: { "@type": "ImageObject", url: logoUrl },
      }),
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
    ...(post.keywords && post.keywords.length > 0 && {
      keywords: post.keywords,
    }),
    ...(post.category && { articleSection: post.category.name }),
    // Include aggregateRating on Article only when no separate SoftwareApplication schema
    ...(!post.downloadLink &&
      post.rating &&
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
  };

  // ── 3. Review schema — only emitted when there are rated comments ────────
  // Attached directly to SoftwareApplication via `review` property to avoid
  // orphaned Product nodes that confuse Google's parser.
  const ratedComments = (post.comments ?? []).filter(
    (c) => c.rating && c.rating > 0,
  );
  const reviewNodes =
    ratedComments.length > 0
      ? ratedComments.slice(0, 10).map((c) => ({
          "@type": "Review",
          reviewRating: {
            "@type": "Rating",
            ratingValue: String(c.rating),
            bestRating: "5",
            worstRating: "1",
          },
          author: { "@type": "Person", name: c.author },
          datePublished: c.createdAt.toISOString(),
          reviewBody: c.content.substring(0, 500),
        }))
      : null;

  // Inject reviews into softwareSchema if it exists, else into articleSchema
  if (reviewNodes) {
    if (softwareSchema) {
      (softwareSchema as any).review = reviewNodes;
    } else {
      (articleSchema as any).review = reviewNodes;
    }
  }

  // ── 4. FAQPage ───────────────────────────────────────────────────────────
  const validFaqs = faqs.filter((f) => f.question?.trim() && f.answer?.trim());
  const faqSchema =
    validFaqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "@id": `${postUrl}#faq`,
          mainEntity: validFaqs.map((f) => ({
            "@type": "Question",
            name: f.question.trim(),
            acceptedAnswer: {
              "@type": "Answer",
              text: f.answer.trim(),
            },
          })),
        }
      : null;

  // ── 5. BreadcrumbList ────────────────────────────────────────────────────
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${postUrl}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: base },
      ...(post.category
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: post.category.name,
              item: `${base}/category/${post.category.slug}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: post.category ? 3 : 2,
        name: post.title,
        item: postUrl,
      },
    ],
  };

  const schemas = [
    articleSchema,
    ...(softwareSchema ? [softwareSchema] : []),
    ...(faqSchema ? [faqSchema] : []),
    breadcrumbSchema,
  ];

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
