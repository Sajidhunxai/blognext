import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { secureResponse } from "@/lib/api-security";
import { getSettings } from "@/lib/settings";

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
  const { v2: cloudinaryUploader } = require('cloudinary');
  cloudinaryUploader.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return secureResponse({ error: "No file provided" }, 400);
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return secureResponse(
        { error: "Invalid file type. Only images are allowed." },
        400
      );
    }

    // Validate file size (max 10MB for Cloudinary free tier)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return secureResponse(
        { error: "File size exceeds 10MB limit" },
        400
      );
    }

    // Convert file to buffer for upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Get watermark settings
    const settings = await getSettings();
    const enableWatermark = (settings as any).enableWatermark || false;
    const watermarkImage = (settings as any).watermarkImage;
    const watermarkPosition = (settings as any).watermarkPosition || "bottom_right";
    const watermarkOpacity = (settings as any).watermarkOpacity || 70;
    const watermarkScale = (settings as any).watermarkScale || 15;

    // Map position to Cloudinary gravity (define outside if block for later use)
    const gravityMap: Record<string, string> = {
      'bottom_right': 'south_east',
      'bottom_left': 'south_west',
      'top_right': 'north_east',
      'top_left': 'north_west',
      'center': 'center',
    };

    // Build transformation array
    const transformations: any[] = [
      {
        quality: "auto:good",
        fetch_format: "auto",
      },
    ];

    // Extract and format watermark public_id (define outside if block for later use)
    let watermarkPublicId = '';
    if (enableWatermark && watermarkImage) {
      // Extract public_id from Cloudinary URL or use the URL directly
      watermarkPublicId = watermarkImage;
      
      // If it's a Cloudinary URL, extract the public_id
      if (watermarkImage.includes('cloudinary.com')) {
        const urlParts = watermarkImage.split('/');
        const uploadIndex = urlParts.findIndex((part: string) => part === 'upload');
        if (uploadIndex !== -1) {
          let pathAfterUpload = urlParts.slice(uploadIndex + 1).join('/');
          // Remove any transformations that might be in the URL
          const versionMatch = pathAfterUpload.match(/v\d+\/(.+)/);
          if (versionMatch) {
            pathAfterUpload = versionMatch[1];
          } else {
            // If no version, get the last part (public_id)
            const parts = pathAfterUpload.split('/');
            pathAfterUpload = parts[parts.length - 1];
          }
          // Remove file extension
          watermarkPublicId = pathAfterUpload.replace(/\.[^.]+$/, '');
        }
      }
      
      // Format for overlay: replace slashes with colons, dots with underscores
      // This is required for Cloudinary overlay syntax in transformations
      watermarkPublicId = watermarkPublicId.replace(/\//g, ':').replace(/\./g, '_');

      // For overlay width as percentage in Cloudinary SDK transformation objects:
      // We can use width as a number representing pixels, or calculate percentage
      // For percentage-based overlay, we'll use a calculated approach or fixed size
      // Cloudinary accepts width as pixels, so we'll use a reasonable default or calculate
      // Note: For true percentage, we might need to apply via URL transformation after upload
      
      // Try using a calculated pixel width based on a standard image size (e.g., 1920px base)
      // Or use a fixed reasonable size that scales well
      // For now, let's use the percentage as a multiplier approach
      const overlayTransformation = {
        overlay: watermarkPublicId,
        gravity: gravityMap[watermarkPosition] || 'south_east',
        opacity: watermarkOpacity,
        // Use width as pixels - calculate from a base width (e.g., 1000px base = 15% = 150px)
        // Or use a reasonable fixed size that works for most images
        width: Math.max(50, Math.round(1000 * (watermarkScale / 100))), // Calculate pixel width from percentage
        crop: 'scale',
        x: 10,
        y: 10,
      };
      
      // Add overlay transformation before quality transformation
      transformations.unshift(overlayTransformation);
      
      console.log(`Applying watermark: overlay=${watermarkPublicId}, position=${gravityMap[watermarkPosition]}, opacity=${watermarkOpacity}, calculated width=${overlayTransformation.width}px (from ${watermarkScale}%)`);
      console.log('Full transformations:', JSON.stringify(transformations, null, 2));
    }

    // Upload to Cloudinary
    console.log('Uploading with transformations:', JSON.stringify(transformations, null, 2));
    
    const result = await cloudinaryUploader.uploader.upload(
      `data:${file.type};base64,${buffer.toString('base64')}`,
      {
        folder: "apkapp",
        resource_type: "auto",
        transformation: transformations,
      }
    );
    
    console.log('Upload result URL:', result.secure_url);
    
    // If watermark is enabled, apply it via URL transformation to ensure it works correctly
    // This creates a new derived image with the watermark
    let finalUrl = result.secure_url;
    if (enableWatermark && watermarkImage) {
      // Define gravity map for URL transformation
      const gravityMapUrl: Record<string, string> = {
        'bottom_right': 'south_east',
        'bottom_left': 'south_west',
        'top_right': 'north_east',
        'top_left': 'north_west',
        'center': 'center',
      };
      
      // Extract and format watermark ID for URL
      let formattedWatermarkId = watermarkImage;
      if (watermarkImage.includes('cloudinary.com')) {
        const urlParts = watermarkImage.split('/');
        const uploadIndex = urlParts.findIndex((part: string) => part === 'upload');
        if (uploadIndex !== -1) {
          let pathAfterUpload = urlParts.slice(uploadIndex + 1).join('/');
          const versionMatch = pathAfterUpload.match(/v\d+\/(.+)/);
          if (versionMatch) {
            pathAfterUpload = versionMatch[1];
          } else {
            const parts = pathAfterUpload.split('/');
            pathAfterUpload = parts[parts.length - 1];
          }
          formattedWatermarkId = pathAfterUpload.replace(/\.[^.]+$/, '');
        }
      }
      formattedWatermarkId = formattedWatermarkId.replace(/\//g, ':').replace(/\./g, '_');
      
      const gravity = gravityMapUrl[watermarkPosition] || 'south_east';
      
      // Build URL transformation string for watermark
      // Format: l_<watermark_id>,g_<gravity>,o_<opacity>,w_<decimal>,fl_relative,x_<x>,y_<y>
      // For percentage width in overlays, use decimal (0.16 = 16%) with fl_relative flag
      const widthDecimal = watermarkScale / 100; // Convert percentage to decimal (16 -> 0.16)
      const watermarkTransform = `l_${formattedWatermarkId},g_${gravity},o_${watermarkOpacity},w_${widthDecimal},fl_relative,x_10,y_10`;
      
      // Apply watermark transformation to the URL
      const urlParts = result.secure_url.split('/upload/');
      if (urlParts.length === 2) {
        const [baseUrl, path] = urlParts;
        finalUrl = `${baseUrl}/upload/${watermarkTransform}/${path}`;
        console.log('Watermarked URL:', finalUrl);
      }
    }

    // Return the secure URL with security headers (use watermarked URL if watermark was applied)
    return secureResponse({
      url: finalUrl,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return secureResponse(
      { error: error.message || "Failed to upload file" },
      error.http_code || 500
    );
  }
}

// Optional: Add DELETE endpoint to remove images from Cloudinary
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return secureResponse({ error: "Unauthorized" }, 401);
  }

  // Configure Cloudinary
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.replace(/^["']|["']$/g, '');
  const apiKey = process.env.CLOUDINARY_API_KEY?.replace(/^["']|["']$/g, '');
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.replace(/^["']|["']$/g, '');
  
  if (!cloudName || !apiKey || !apiSecret) {
    return secureResponse(
      { error: "Cloudinary is not configured" },
      500
    );
  }

  const { v2: cloudinaryDelete } = require('cloudinary');
  cloudinaryDelete.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  try {
    const { searchParams } = new URL(req.url);
    const publicId = searchParams.get("publicId");

    if (!publicId) {
      return secureResponse(
        { error: "Public ID is required" },
        400
      );
    }

    // Delete from Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinaryDelete.uploader.destroy(publicId, (error: any, result: any) => {
        if (error) reject(error);
        else resolve(result);
      });
    });

    return secureResponse(
      { success: true, message: "Image deleted successfully" }
    );
  } catch (error: any) {
    console.error("Delete error:", error);
    return secureResponse(
      { error: error.message || "Failed to delete file" },
      500
    );
  }
}

