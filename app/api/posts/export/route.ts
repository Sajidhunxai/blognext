import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { secureResponse } from "@/lib/api-security";

export const dynamic = 'force-dynamic';

// GET - Export posts as XML (WordPress format) or JSON
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return secureResponse({ error: "Unauthorized" }, 401);
  }

  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "xml"; // xml or json

    // Fetch all posts with related data
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (format === "json") {
      // Export as JSON
      const jsonData = posts.map((post) => ({
        title: post.title,
        content: post.content,
        slug: post.slug,
        published: post.published,
        metaTitle: post.metaTitle,
        metaDescription: post.metaDescription,
        keywords: post.keywords,
        featuredImage: post.featuredImage,
        featuredImageAlt: post.featuredImageAlt,
        ogImage: post.ogImage,
        ogImageAlt: post.ogImageAlt,
        downloadLink: post.downloadLink,
        developer: post.developer,
        appSize: post.appSize,
        appVersion: post.appVersion,
        requirements: post.requirements,
        downloads: post.downloads,
        googlePlayLink: post.googlePlayLink,
        rating: post.rating,
        ratingCount: post.ratingCount,
        allowComments: post.allowComments,
        category: post.category ? {
          name: post.category.name,
          slug: post.category.slug,
        } : null,
        author: {
          name: post.author.name,
          email: post.author.email,
        },
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
      }));

      return new NextResponse(JSON.stringify(jsonData, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="posts-export-${new Date().toISOString().split('T')[0]}.json"`,
        },
      });
    }

    // Export as WordPress XML format
    const xmlHeader = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:excerpt="http://wordpress.org/export/1.2/excerpt/"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:wfw="http://wellformedweb.org/CommentAPI/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:wp="http://wordpress.org/export/1.2/"
>
  <channel>
    <title>Posts Export</title>
    <link>${process.env.NEXTAUTH_URL || "http://localhost:3000"}</link>
    <description>Exported posts</description>
    <pubDate>${new Date().toUTCString()}</pubDate>
    <language>en-US</language>
    <wp:wxr_version>1.2</wp:wxr_version>
`;

    const xmlItems = posts.map((post) => {
      const pubDate = new Date(post.createdAt).toUTCString();
      const modifiedDate = new Date(post.updatedAt).toUTCString();
      
      // Escape XML special characters
      const escapeXml = (str: string | null | undefined) => {
        if (!str) return "";
        return str
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&apos;");
      };

      const categoryName = post.category?.name || "Uncategorized";
      const categorySlug = post.category?.slug || "uncategorized";

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${process.env.NEXTAUTH_URL || "http://localhost:3000"}/posts/${post.slug}</link>
      <pubDate>${pubDate}</pubDate>
      <dc:creator><![CDATA[${escapeXml(post.author.name || post.author.email)}]]></dc:creator>
      <guid isPermaLink="false">${process.env.NEXTAUTH_URL || "http://localhost:3000"}/posts/${post.slug}</guid>
      <description></description>
      <content:encoded><![CDATA[${post.content}]]></content:encoded>
      <excerpt:encoded><![CDATA[${escapeXml(post.metaDescription || "")}]]></excerpt:encoded>
      <wp:post_id>${post.id}</wp:post_id>
      <wp:post_date><![CDATA[${new Date(post.createdAt).toISOString()}]]></wp:post_date>
      <wp:post_date_gmt><![CDATA[${new Date(post.createdAt).toISOString()}]]></wp:post_date_gmt>
      <wp:post_modified><![CDATA[${new Date(post.updatedAt).toISOString()}]]></wp:post_modified>
      <wp:post_modified_gmt><![CDATA[${new Date(post.updatedAt).toISOString()}]]></wp:post_modified_gmt>
      <wp:comment_status>${post.allowComments ? "open" : "closed"}</wp:comment_status>
      <wp:ping_status>open</wp:ping_status>
      <wp:post_name><![CDATA[${post.slug}]]></wp:post_name>
      <wp:status><![CDATA[${post.published ? "publish" : "draft"}]]></wp:status>
      <wp:post_parent>0</wp:post_parent>
      <wp:menu_order>0</wp:menu_order>
      <wp:post_type><![CDATA[post]]></wp:post_type>
      <wp:post_password></wp:post_password>
      <wp:is_sticky>0</wp:is_sticky>
      <category domain="category" nicename="${categorySlug}"><![CDATA[${categoryName}]]></category>
      ${post.metaTitle ? `<wp:postmeta>
        <wp:meta_key><![CDATA[_yoast_wpseo_title]]></wp:meta_key>
        <wp:meta_value><![CDATA[${escapeXml(post.metaTitle)}]]></wp:meta_value>
      </wp:postmeta>` : ""}
      ${post.metaDescription ? `<wp:postmeta>
        <wp:meta_key><![CDATA[_yoast_wpseo_metadesc]]></wp:meta_key>
        <wp:meta_value><![CDATA[${escapeXml(post.metaDescription)}]]></wp:meta_value>
      </wp:postmeta>` : ""}
      ${post.featuredImage ? `<wp:postmeta>
        <wp:meta_key><![CDATA[_thumbnail_id]]></wp:meta_key>
        <wp:meta_value><![CDATA[${escapeXml(post.featuredImage)}]]></wp:meta_value>
      </wp:postmeta>` : ""}
      ${post.downloadLink ? `<wp:postmeta>
        <wp:meta_key><![CDATA[download_link]]></wp:meta_key>
        <wp:meta_value><![CDATA[${escapeXml(post.downloadLink)}]]></wp:meta_value>
      </wp:postmeta>` : ""}
      ${post.developer ? `<wp:postmeta>
        <wp:meta_key><![CDATA[developer]]></wp:meta_key>
        <wp:meta_value><![CDATA[${escapeXml(post.developer)}]]></wp:meta_value>
      </wp:postmeta>` : ""}
      ${post.appVersion ? `<wp:postmeta>
        <wp:meta_key><![CDATA[app_version]]></wp:meta_key>
        <wp:meta_value><![CDATA[${escapeXml(post.appVersion)}]]></wp:meta_value>
      </wp:postmeta>` : ""}
      ${post.appSize ? `<wp:postmeta>
        <wp:meta_key><![CDATA[app_size]]></wp:meta_key>
        <wp:meta_value><![CDATA[${escapeXml(post.appSize)}]]></wp:meta_value>
      </wp:postmeta>` : ""}
      ${post.rating ? `<wp:postmeta>
        <wp:meta_key><![CDATA[rating]]></wp:meta_key>
        <wp:meta_value><![CDATA[${post.rating}]]></wp:meta_value>
      </wp:postmeta>` : ""}
      ${post.ratingCount ? `<wp:postmeta>
        <wp:meta_key><![CDATA[rating_count]]></wp:meta_key>
        <wp:meta_value><![CDATA[${post.ratingCount}]]></wp:meta_value>
      </wp:postmeta>` : ""}
    </item>`;
    }).join("\n");

    const xmlFooter = `  </channel>
</rss>`;

    const xmlContent = xmlHeader + xmlItems + "\n" + xmlFooter;

    return new NextResponse(xmlContent, {
      headers: {
        "Content-Type": "application/xml",
        "Content-Disposition": `attachment; filename="posts-export-${new Date().toISOString().split('T')[0]}.xml"`,
      },
    });
  } catch (error: any) {
    console.error("Export error:", error);
    return secureResponse(
      { error: error.message || "Failed to export posts" },
      500
    );
  }
}
