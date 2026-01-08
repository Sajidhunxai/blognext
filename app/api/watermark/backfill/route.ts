import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { secureResponse } from "@/lib/api-security";
import { getSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return secureResponse({ error: "Unauthorized" }, 401);
  }

  // Check if Cloudinary is configured
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.replace(/^["']|["']$/g, '');
  const apiKey = process.env.CLOUDINARY_API_KEY?.replace(/^["']|["']$/g, '');
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.replace(/^["']|["']$/g, '');
  
  if (!cloudName || !apiKey || !apiSecret) {
    return secureResponse(
      { error: "Cloudinary is not configured" },
      500
    );
  }

  // Configure Cloudinary
  const { v2: cloudinary } = require('cloudinary');
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  try {
    // Get watermark settings
    const settings = await getSettings();
    const enableWatermark = (settings as any).enableWatermark || false;
    const watermarkImage = (settings as any).watermarkImage;
    const watermarkPosition = (settings as any).watermarkPosition || "bottom_right";
    const watermarkOpacity = (settings as any).watermarkOpacity || 70;
    const watermarkScale = (settings as any).watermarkScale || 15;

    if (!enableWatermark || !watermarkImage) {
      return secureResponse(
        { error: "Watermark is not enabled or watermark image is not set" },
        400
      );
    }

    // Extract watermark public_id and format it for overlay usage
    let watermarkPublicId = watermarkImage;
    if (watermarkImage.includes('cloudinary.com')) {
      const urlParts = watermarkImage.split('/');
      const uploadIndex = urlParts.findIndex((part: string) => part === 'upload');
      if (uploadIndex !== -1) {
        let pathAfterUpload = urlParts.slice(uploadIndex + 1).join('/');
        // Remove any transformations that might be in the URL
        // Cloudinary URLs can have: /upload/{transformations}/v{version}/{public_id}
        // We need to find the version and get everything after it
        const versionMatch = pathAfterUpload.match(/v\d+\/(.+)/);
        if (versionMatch) {
          pathAfterUpload = versionMatch[1];
        } else {
          // If no version, remove transformation parameters (they come before the path)
          // Transformations are typically comma-separated, so find the last part
          const parts = pathAfterUpload.split('/');
          // The public_id is usually the last part
          pathAfterUpload = parts[parts.length - 1];
        }
        // Remove file extension
        watermarkPublicId = pathAfterUpload.replace(/\.[^.]+$/, '');
      }
    }
    
    console.log(`Watermark public_id (extracted): ${watermarkPublicId}`);

    // Map position to Cloudinary gravity
    const gravityMap: Record<string, string> = {
      'bottom_right': 'south_east',
      'bottom_left': 'south_west',
      'top_right': 'north_east',
      'top_left': 'north_west',
      'center': 'center',
    };

    // Helper function to extract public_id from Cloudinary URL
    // Handles URLs with or without transformations
    const extractPublicId = (url: string): string | null => {
      if (!url || !url.includes('cloudinary.com')) {
        return null;
      }
      
      try {
        // Parse the URL to extract public_id
        // Format: https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/v{version}/{public_id}.{ext}
        // or: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.{ext}
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/');
        const uploadIndex = pathParts.findIndex((part: string) => part === 'upload');
        
        if (uploadIndex === -1) {
          return null;
        }
        
        // Get everything after 'upload'
        const afterUpload = pathParts.slice(uploadIndex + 1).join('/');
        
        // Find the version pattern (v1234) and get everything after it
        const versionMatch = afterUpload.match(/v\d+\/(.+)/);
        if (versionMatch) {
          // Remove file extension
          return versionMatch[1].replace(/\.[^.]+$/, '');
        }
        
        // If no version, try to get the last part (public_id)
        const parts = afterUpload.split('/');
        const lastPart = parts[parts.length - 1];
        return lastPart.replace(/\.[^.]+$/, '');
      } catch (error) {
        // Fallback: simple extraction
        const urlParts = url.split('/');
        const uploadIndex = urlParts.findIndex((part: string) => part === 'upload');
        if (uploadIndex === -1) {
          return null;
        }
        let pathAfterUpload = urlParts.slice(uploadIndex + 1).join('/');
        pathAfterUpload = pathAfterUpload.replace(/^v\d+\//, '');
        return pathAfterUpload.replace(/\.[^.]+$/, '');
      }
    };

    // Helper function to apply watermark to an image by re-uploading with watermark
    const applyWatermarkToImage = async (imageUrl: string): Promise<string | null> => {
      try {
        const publicId = extractPublicId(imageUrl);
        if (!publicId) {
          console.log(`Skipping non-Cloudinary image: ${imageUrl}`);
          return null; // Not a Cloudinary image, skip
        }

        // Check if watermark is already applied (to avoid double-processing)
        // Look for overlay transformation in URL (l_ prefix indicates overlay)
        const formattedWatermarkId = watermarkPublicId.replace(/\//g, ':').replace(/\./g, '_');
        const hasOverlay = imageUrl.includes('l_') && imageUrl.includes(formattedWatermarkId);
        
        if (hasOverlay) {
          console.log(`Watermark already applied to ${imageUrl}, skipping`);
          return null;
        }

        console.log(`Processing image: ${imageUrl}, public_id: ${publicId}`);

        // Build transformation with watermark
        const gravity = gravityMap[watermarkPosition] || 'south_east';
        
        // Format watermark public_id for URL overlay (slashes -> colons, dots -> underscores)
        const overlayId = watermarkPublicId.replace(/\//g, ':').replace(/\./g, '_');
        
        console.log(`Using overlay ID: ${overlayId} (original: ${watermarkPublicId})`);
        
        // Build URL transformation string for watermark
        // Format: l_<watermark_id>,g_<gravity>,o_<opacity>,w_<decimal>,fl_relative,x_<x>,y_<y>
        // For percentage width in overlays, use decimal (0.16 = 16%) with fl_relative flag
        const widthDecimal = watermarkScale / 100; // Convert percentage to decimal (16 -> 0.16)
        const watermarkTransform = `l_${overlayId},g_${gravity},o_${watermarkOpacity},w_${widthDecimal},fl_relative,x_10,y_10`;
        
        // Build the watermarked URL by inserting the transformation
        const urlParts = imageUrl.split('/upload/');
        if (urlParts.length === 2) {
          const [baseUrl, path] = urlParts;
          const watermarkedUrl = `${baseUrl}/upload/${watermarkTransform}/${path}`;
          console.log(`Generated watermarked URL: ${watermarkedUrl}`);
          return watermarkedUrl;
        }
        
        // Fallback: return null if URL structure is invalid
        return null;
      } catch (error: any) {
        console.error(`Error applying watermark to ${imageUrl}:`, error.message);
        console.error(error);
        return null;
      }
    };

    // Helper function to process images in HTML content
    const processContentImages = async (content: string): Promise<string> => {
      if (!content) return content;

      const cheerio = require('cheerio');
      const $ = cheerio.load(content);
      const images = $('img');
      let updated = false;

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const src = $(img).attr('src');
        
        if (src && src.includes('cloudinary.com')) {
          const watermarkedUrl = await applyWatermarkToImage(src);
          if (watermarkedUrl) {
            $(img).attr('src', watermarkedUrl);
            updated = true;
          }
        }
      }

      return updated ? $.html() : content;
    };

    let processedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Process Posts
    const posts = await prisma.post.findMany({
      where: {
        OR: [
          { featuredImage: { not: null } },
          { ogImage: { not: null } },
          { content: { contains: '<img' } },
        ],
      },
      select: {
        id: true,
        featuredImage: true,
        ogImage: true,
        content: true,
      },
    });

    console.log(`Found ${posts.length} posts to process`);

    for (const post of posts) {
      try {
        let updated = false;
        const updates: any = {};

        // Process featuredImage
        if (post.featuredImage) {
          console.log(`Processing featuredImage for post ${post.id}: ${post.featuredImage}`);
          const watermarkedUrl = await applyWatermarkToImage(post.featuredImage);
          if (watermarkedUrl && watermarkedUrl !== post.featuredImage) {
            updates.featuredImage = watermarkedUrl;
            updated = true;
            console.log(`Updated featuredImage for post ${post.id}`);
          }
        }

        // Process ogImage
        if (post.ogImage) {
          console.log(`Processing ogImage for post ${post.id}: ${post.ogImage}`);
          const watermarkedUrl = await applyWatermarkToImage(post.ogImage);
          if (watermarkedUrl && watermarkedUrl !== post.ogImage) {
            updates.ogImage = watermarkedUrl;
            updated = true;
            console.log(`Updated ogImage for post ${post.id}`);
          }
        }

        // Process content images
        if (post.content) {
          const processedContent = await processContentImages(post.content);
          if (processedContent !== post.content) {
            updates.content = processedContent;
            updated = true;
            console.log(`Updated content images for post ${post.id}`);
          }
        }

        // Update post if any changes
        if (updated) {
          await prisma.post.update({
            where: { id: post.id },
            data: updates,
          });
          processedCount++;
          console.log(`Successfully updated post ${post.id}`);
        } else {
          console.log(`No updates needed for post ${post.id}`);
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error: any) {
        errorCount++;
        const errorMsg = `Post ${post.id}: ${error.message}`;
        errors.push(errorMsg);
        console.error(`Error processing post ${post.id}:`, error);
      }
    }

    // Process Pages
    const pages = await prisma.page.findMany({
      where: {
        OR: [
          { featuredImage: { not: null } },
          { content: { contains: '<img' } },
        ],
      },
      select: {
        id: true,
        featuredImage: true,
        content: true,
      },
    });

    console.log(`Found ${pages.length} pages to process`);

    for (const page of pages) {
      try {
        let updated = false;
        const updates: any = {};

        // Process featuredImage
        if (page.featuredImage) {
          const watermarkedUrl = await applyWatermarkToImage(page.featuredImage);
          if (watermarkedUrl) {
            updates.featuredImage = watermarkedUrl;
            updated = true;
          }
        }

        // Process content images
        if (page.content) {
          const processedContent = await processContentImages(page.content);
          if (processedContent !== page.content) {
            updates.content = processedContent;
            updated = true;
          }
        }

        // Update page if any changes
        if (updated) {
          await prisma.page.update({
            where: { id: page.id },
            data: updates,
          });
          processedCount++;
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error: any) {
        errorCount++;
        errors.push(`Page ${page.id}: ${error.message}`);
        console.error(`Error processing page ${page.id}:`, error);
      }
    }

    return secureResponse({
      success: true,
      message: `Watermark backfill completed`,
      processed: processedCount,
      errors: errorCount,
      errorDetails: errors.slice(0, 10), // Return first 10 errors
    });
  } catch (error: any) {
    console.error("Watermark backfill error:", error);
    return secureResponse(
      { error: error.message || "Failed to process watermark backfill" },
      500
    );
  }
}

