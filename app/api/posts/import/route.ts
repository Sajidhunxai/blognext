import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { secureResponse } from "@/lib/api-security";
import { parseString } from "xml2js";

export const dynamic = 'force-dynamic';

// POST - Import posts from WordPress XML or JSON
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return secureResponse({ error: "Unauthorized" }, 401);
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return secureResponse({ error: "No file provided" }, 400);
    }

    const fileContent = await file.text();
    const fileName = file.name.toLowerCase();
    const isXml = fileName.endsWith(".xml");
    const isJson = fileName.endsWith(".json");

    if (!isXml && !isJson) {
      return secureResponse(
        { error: "Unsupported file format. Please upload XML or JSON file." },
        400
      );
    }

    // Get or create admin user
    let admin = await prisma.user.findFirst({
      where: { role: "admin" },
    });

    if (!admin) {
      admin = await prisma.user.findFirst();
      if (!admin) {
        return secureResponse(
          { error: "No admin user found. Please create an admin user first." },
          400
        );
      }
    }

    const results = {
      total: 0,
      success: 0,
      failed: 0,
      skipped: 0,
      posts: [] as Array<{ title: string; slug: string; status: string; error?: string }>,
    };

    if (isJson) {
      // Parse JSON
      try {
        const posts = JSON.parse(fileContent);
        if (!Array.isArray(posts)) {
          return secureResponse(
            { error: "JSON file must contain an array of posts" },
            400
          );
        }

        results.total = posts.length;

        for (const postData of posts) {
          try {
            if (!postData.title || !postData.slug) {
              results.failed++;
              results.posts.push({
                title: postData.title || "Unknown",
                slug: postData.slug || "",
                status: "failed",
                error: "Missing title or slug",
              });
              continue;
            }

            // Check if post already exists
            const existingPost = await prisma.post.findUnique({
              where: { slug: postData.slug },
            });

            if (existingPost) {
              results.skipped++;
              results.posts.push({
                title: postData.title,
                slug: postData.slug,
                status: "skipped",
              });
              continue;
            }

            // Get or create category
            let categoryId = null;
            if (postData.category) {
              const category = await prisma.category.upsert({
                where: { slug: postData.category.slug || postData.category.name?.toLowerCase().replace(/\s+/g, "-") || "uncategorized" },
                update: {},
                create: {
                  name: postData.category.name || "Uncategorized",
                  slug: postData.category.slug || postData.category.name?.toLowerCase().replace(/\s+/g, "-") || "uncategorized",
                  description: `Imported category: ${postData.category.name || "Uncategorized"}`,
                },
              });
              categoryId = category.id;
            }

            // Create post
            await prisma.post.create({
              data: {
                title: postData.title,
                content: postData.content || "",
                slug: postData.slug,
                published: postData.published !== undefined ? postData.published : true,
                authorId: admin.id,
                categoryId,
                allowComments: postData.allowComments !== undefined ? postData.allowComments : true,
                metaTitle: postData.metaTitle || null,
                metaDescription: postData.metaDescription || null,
                keywords: postData.keywords || [],
                featuredImage: postData.featuredImage || null,
                featuredImageAlt: postData.featuredImageAlt || null,
                ogImage: postData.ogImage || null,
                ogImageAlt: postData.ogImageAlt || null,
                downloadLink: postData.downloadLink || null,
                developer: postData.developer || null,
                appSize: postData.appSize || null,
                appVersion: postData.appVersion || null,
                requirements: postData.requirements || null,
                downloads: postData.downloads || null,
                googlePlayLink: postData.googlePlayLink || null,
                rating: postData.rating || null,
                ratingCount: postData.ratingCount || 0,
                createdAt: postData.createdAt ? new Date(postData.createdAt) : new Date(),
                updatedAt: postData.updatedAt ? new Date(postData.updatedAt) : new Date(),
              },
            });

            results.success++;
            results.posts.push({
              title: postData.title,
              slug: postData.slug,
              status: "imported",
            });
          } catch (error: any) {
            results.failed++;
            results.posts.push({
              title: postData.title || "Unknown",
              slug: postData.slug || "",
              status: "failed",
              error: error.message || "Unknown error",
            });
          }
        }
      } catch (error: any) {
        return secureResponse(
          { error: `Failed to parse JSON: ${error.message}` },
          400
        );
      }
    } else {
      // Parse WordPress XML
      try {
        // Use explicitCharkey to properly handle CDATA sections
        const parsedXml: any = await new Promise((resolve, reject) => {
          parseString(
            fileContent,
            {
              explicitArray: false,
              mergeAttrs: true,
              explicitCharkey: true,
              trim: true,
              normalize: true,
              explicitRoot: false,
              ignoreAttrs: false,
              charkey: "_",
            },
            (err, result) => {
              if (err) reject(err);
              else resolve(result);
            }
          );
        });

        const channel = parsedXml.rss?.channel || parsedXml.channel;
        if (!channel) {
          return secureResponse(
            { error: "Invalid WordPress XML format. Missing RSS channel." },
            400
          );
        }

        const items = Array.isArray(channel.item) ? channel.item : [channel.item].filter(Boolean);
        
        console.log(`Parsed ${items.length} items from WordPress XML`);
        
        // Build attachment map: attachment ID -> URL
        // WordPress stores attachments as separate items with wp:post_type = "attachment"
        const attachmentMap: { [key: string]: string } = {};
        for (const item of items) {
          const postType = item["wp:post_type"]?._ || item["wp:post_type"] || 
                          (typeof item["wp:post_type"] === "string" ? item["wp:post_type"] : null);
          if (postType === "attachment") {
            const attachmentId = item["wp:post_id"]?._ || item["wp:post_id"] || 
                                (typeof item["wp:post_id"] === "string" ? item["wp:post_id"] : null);
            
            // Try multiple ways to get the attachment URL
            let attachmentUrl = "";
            
            // Try guid (most common)
            if (item.guid) {
              if (typeof item.guid === "string") {
                attachmentUrl = item.guid;
              } else if (item.guid._) {
                attachmentUrl = item.guid._;
              } else if (item.guid.$.isPermaLink === "false" && item.guid._) {
                attachmentUrl = item.guid._;
              }
            }
            
            // Try enclosure
            if (!attachmentUrl && item.enclosure) {
              if (item.enclosure.$) {
                attachmentUrl = item.enclosure.$.url || "";
              } else if (typeof item.enclosure === "string") {
                attachmentUrl = item.enclosure;
              }
            }
            
            // Try link
            if (!attachmentUrl && item.link) {
              if (typeof item.link === "string") {
                attachmentUrl = item.link;
              } else if (item.link._) {
                attachmentUrl = item.link._;
              }
            }
            
            if (attachmentId && attachmentUrl) {
              attachmentMap[String(attachmentId)] = attachmentUrl;
            }
          }
        }

        // Filter to only process posts (not attachments, pages, etc.)
        const posts = items.filter((item: any) => {
          const postType = item["wp:post_type"]?._ || item["wp:post_type"] || 
                          (typeof item["wp:post_type"] === "string" ? item["wp:post_type"] : null);
          return !postType || postType === "post";
        });

        console.log(`Found ${posts.length} posts to import (${Object.keys(attachmentMap).length} attachments mapped)`);
        results.total = posts.length;

        for (const item of posts) {
          try {
            // Extract title - handle different XML structures
            let title = "";
            if (typeof item.title === "string") {
              title = item.title.trim();
            } else if (item.title?._) {
              title = String(item.title._).trim();
            } else if (Array.isArray(item.title) && item.title[0]) {
              const firstTitle = item.title[0];
              title = typeof firstTitle === "string" ? firstTitle.trim() : String(firstTitle._ || "").trim();
            }

            // Extract slug
            let slug = "";
            if (typeof item["wp:post_name"] === "string") {
              slug = item["wp:post_name"];
            } else if (item["wp:post_name"]?._) {
              slug = String(item["wp:post_name"]._);
            } else if (Array.isArray(item["wp:post_name"]) && item["wp:post_name"][0]) {
              const firstSlug = item["wp:post_name"][0];
              slug = typeof firstSlug === "string" ? firstSlug : String(firstSlug._ || "");
            }
            
            if (!slug && title) {
              slug = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
            }

            // Extract content - handle different XML structures and namespaces
            let content = "";
            
            // Try content:encoded first (most reliable for WordPress)
            const contentEncoded = item["content:encoded"];
            if (contentEncoded) {
              if (typeof contentEncoded === "string") {
                content = contentEncoded.trim();
              } else if (contentEncoded._) {
                content = String(contentEncoded._).trim();
              } else if (Array.isArray(contentEncoded) && contentEncoded[0]) {
                const firstContent = contentEncoded[0];
                content = typeof firstContent === "string" ? firstContent.trim() : String(firstContent._ || "").trim();
              }
            }
            
            // Try description as fallback
            if (!content || content.length < 50) {
              if (item.description) {
                if (typeof item.description === "string") {
                  content = item.description.trim();
                } else if (item.description._) {
                  content = String(item.description._).trim();
                } else if (Array.isArray(item.description) && item.description[0]) {
                  const firstDesc = item.description[0];
                  content = typeof firstDesc === "string" ? firstDesc.trim() : String(firstDesc._ || "").trim();
                }
              }
            }

            const status = item["wp:status"]?._ || item["wp:status"] || "publish";
            const published = status === "publish";

            if (!title || !slug) {
              results.failed++;
              results.posts.push({
                title: title || "Unknown",
                slug: slug || "",
                status: "failed",
                error: `Missing title or slug. Title: "${title}", Slug: "${slug}"`,
              });
              continue;
            }

            // Validate that we have content
            if (!content || content.trim().length === 0) {
              console.warn(`Post "${title}" has no content. Title exists but content:encoded is empty.`);
              // Continue anyway - some posts might not have content initially
            }

            // Check if post already exists
            const existingPost = await prisma.post.findUnique({
              where: { slug },
            });

            if (existingPost) {
              results.skipped++;
              results.posts.push({
                title,
                slug,
                status: "skipped",
              });
              continue;
            }

            // Get category from XML
            let categoryId = null;
            const categoryItem = Array.isArray(item.category) ? item.category[0] : item.category;
            if (categoryItem) {
              const categoryName = categoryItem._ || categoryItem || "Uncategorized";
              const categorySlug = categoryItem.$.nicename || categoryName.toLowerCase().replace(/\s+/g, "-");

              const category = await prisma.category.upsert({
                where: { slug: categorySlug },
                update: {},
                create: {
                  name: categoryName,
                  slug: categorySlug,
                  description: `Imported category: ${categoryName}`,
                },
              });
              categoryId = category.id;
            }

            // Extract custom fields from wp:postmeta
            const postmeta = Array.isArray(item["wp:postmeta"]) 
              ? item["wp:postmeta"] 
              : item["wp:postmeta"] 
                ? [item["wp:postmeta"]] 
                : [];
            const metaFields: any = {};
            postmeta.forEach((meta: any) => {
              const key = meta["wp:meta_key"]?._ || meta["wp:meta_key"] || 
                         (typeof meta["wp:meta_key"] === "string" ? meta["wp:meta_key"] : null);
              let value = meta["wp:meta_value"]?._ || meta["wp:meta_value"] || 
                         (typeof meta["wp:meta_value"] === "string" ? meta["wp:meta_value"] : null);
              if (key && value) {
                metaFields[String(key)] = String(value);
              }
            });

            // Extract featured image URL from attachment map
            let featuredImage: string | null = null;
            
            // Try _thumbnail_id first (most common WordPress method)
            const thumbnailId = metaFields._thumbnail_id || metaFields["_thumbnail_id"];
            if (thumbnailId && attachmentMap[String(thumbnailId)]) {
              featuredImage = attachmentMap[String(thumbnailId)];
            }
            
            // Try _wp_attached_file
            if (!featuredImage && (metaFields._wp_attached_file || metaFields["_wp_attached_file"])) {
              const attachedFile = metaFields._wp_attached_file || metaFields["_wp_attached_file"];
              // If it's a relative path, try to construct full URL from guid
              if (attachedFile && !attachedFile.startsWith("http")) {
                // Try to find the attachment in the attachmentMap by matching file path
                for (const [id, url] of Object.entries(attachmentMap)) {
                  if (String(url).includes(attachedFile) || String(url).endsWith(attachedFile)) {
                    featuredImage = url;
                    break;
                  }
                }
              } else {
                featuredImage = attachedFile;
              }
            }
            
            // Try _featured_image
            if (!featuredImage && (metaFields._featured_image || metaFields["_featured_image"])) {
              featuredImage = metaFields._featured_image || metaFields["_featured_image"];
            }
            
            // Try to extract first image from content if no featured image found
            if (!featuredImage && content) {
              const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
              if (imgMatch && imgMatch[1]) {
                featuredImage = imgMatch[1];
              }
            }
            
            // Try enclosure if available
            if (!featuredImage && item.enclosure) {
              const enclosureUrl = item.enclosure.$?.url || 
                                  (typeof item.enclosure === "object" && item.enclosure.url) ||
                                  (typeof item.enclosure === "string" ? item.enclosure : null);
              if (enclosureUrl && /\.(jpg|jpeg|png|gif|webp|svg)/i.test(enclosureUrl)) {
                featuredImage = enclosureUrl;
              }
            }

            // Parse dates
            const postDate = item["wp:post_date"]?._ || item["wp:post_date"] || new Date().toISOString();
            const postModified = item["wp:post_modified"]?._ || item["wp:post_modified"] || postDate;

            // Extract excerpt/description for meta description
            let metaDescription = metaFields._yoast_wpseo_metadesc || null;
            if (!metaDescription) {
              const excerptEncoded = item["excerpt:encoded"];
              if (excerptEncoded) {
                if (typeof excerptEncoded === "string") {
                  metaDescription = excerptEncoded.trim();
                } else if (excerptEncoded._) {
                  metaDescription = String(excerptEncoded._).trim();
                } else if (Array.isArray(excerptEncoded) && excerptEncoded[0]) {
                  const firstExcerpt = excerptEncoded[0];
                  metaDescription = typeof firstExcerpt === "string" ? firstExcerpt.trim() : String(firstExcerpt._ || "").trim();
                }
              }
            }
            
            // If still no meta description, use first 160 chars of content
            if (!metaDescription && content) {
              const plainText = content.replace(/<[^>]+>/g, "").trim();
              metaDescription = plainText.substring(0, 160);
            }

            // Create post
            await prisma.post.create({
              data: {
                title,
                content: content || "",
                slug,
                published,
                authorId: admin.id,
                categoryId,
                allowComments: item["wp:comment_status"]?._ !== "closed",
                metaTitle: metaFields._yoast_wpseo_title || null,
                metaDescription: metaDescription || null,
                keywords: [],
                featuredImage: featuredImage || null,
                featuredImageAlt: title || null,
                downloadLink: metaFields.download_link || null,
                developer: metaFields.developer || null,
                appVersion: metaFields.app_version || null,
                appSize: metaFields.app_size || null,
                rating: metaFields.rating ? parseFloat(metaFields.rating) : null,
                ratingCount: metaFields.rating_count ? parseInt(metaFields.rating_count) : 0,
                createdAt: new Date(postDate),
                updatedAt: new Date(postModified),
              },
            });

            results.success++;
            results.posts.push({
              title,
              slug,
              status: "imported",
            });
            
            // Log successful import for debugging
            console.log(`✓ Imported: "${title}" (${slug}) - Content: ${content.length} chars, Featured Image: ${featuredImage ? "Yes" : "No"}`);
          } catch (error: any) {
            results.failed++;
            const errorTitle = typeof item.title === "string" ? item.title : item.title?._ || "Unknown";
            const errorSlug = typeof item["wp:post_name"] === "string" ? item["wp:post_name"] : item["wp:post_name"]?._ || "";
            const errorMsg = error.message || "Unknown error";
            console.error(`✗ Failed to import "${errorTitle}":`, errorMsg, error.stack);
            results.posts.push({
              title: errorTitle,
              slug: errorSlug,
              status: "failed",
              error: errorMsg,
            });
          }
        }
      } catch (error: any) {
        return secureResponse(
          { error: `Failed to parse XML: ${error.message}` },
          400
        );
      }
    }

    return secureResponse({
      success: true,
      message: `Imported ${results.success} posts successfully`,
      results,
    });
  } catch (error: any) {
    console.error("Import error:", error);
    return secureResponse(
      { error: error.message || "Failed to import posts" },
      500
    );
  }
}
