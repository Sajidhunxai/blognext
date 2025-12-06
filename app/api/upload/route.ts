import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { secureResponse } from "@/lib/api-security";

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

    // Upload to Cloudinary
    const result = await cloudinaryUploader.uploader.upload(
      `data:${file.type};base64,${buffer.toString('base64')}`,
      {
        folder: "apkapp",
        resource_type: "auto",
        transformation: [
          {
            quality: "auto:good",
            fetch_format: "auto",
          },
        ],
      }
    );

    // Return the secure URL with security headers
    return secureResponse({
      url: result.secure_url,
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

