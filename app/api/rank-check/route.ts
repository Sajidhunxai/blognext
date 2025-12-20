import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { secureResponse } from "@/lib/api-security";

export const dynamic = 'force-dynamic';

// GET - Fetch all rank checks
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return secureResponse({ error: "Unauthorized" }, 401);
  }

  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");
    const keyword = searchParams.get("keyword");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const where: any = {};
    if (postId) {
      where.postId = postId;
    }
    if (keyword) {
      // Simple keyword search - for exact match or contains, you can extend this
      where.keyword = keyword;
    }

    const rankChecks = await prisma.rankCheck.findMany({
      where,
      take: limit,
      orderBy: { checkedAt: "desc" },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    });

    return secureResponse(rankChecks);
  } catch (error: any) {
    return secureResponse(
      { error: error.message || "Failed to fetch rank checks" },
      500
    );
  }
}

// POST - Check ranking for a keyword
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return secureResponse({ error: "Unauthorized" }, 401);
  }

  try {
    const { keyword, postId, siteUrl } = await req.json();

    if (!keyword) {
      return secureResponse(
        { error: "Keyword is required" },
        400
      );
    }

    // Use provided siteUrl or default to environment variable
    const finalSiteUrl = siteUrl || process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "localhost:3000";

    // Get Google API credentials
    const googleApiKey = process.env.GOOGLE_API_KEY?.replace(/^["']|["']$/g, "");
    const googleCx = process.env.GOOGLE_CX?.replace(/^["']|["']$/g, "");

    if (!googleApiKey || !googleCx) {
      return secureResponse(
        { error: "Google API credentials not configured. Please set GOOGLE_API_KEY and GOOGLE_CX environment variables." },
        500
      );
    }

    // Log for debugging (without exposing the full key)
    console.log("Using Google API Key (first 15 chars):", googleApiKey.substring(0, 15) + "...");
    console.log("Using Google CX:", googleCx);

    // Normalize site URL (remove protocol and www)
    const normalizedSiteUrl = finalSiteUrl
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0];

    // Search Google using Custom Search API
    // Note: The 'num' parameter has a maximum value of 10 per request
    // To get more results, we need to paginate using the 'start' parameter
    const maxResultsToCheck = 100; // Total results we want to check
    const resultsPerPage = 10; // Maximum allowed by Google API
    let ranking: number | null = null;
    let currentStart = 1; // Start position (1-indexed)
    let totalChecked = 0;

    // Search through pages until we find the site or reach maxResultsToCheck
    while (ranking === null && totalChecked < maxResultsToCheck) {
      const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${googleApiKey}&cx=${googleCx}&q=${encodeURIComponent(keyword)}&num=${resultsPerPage}&start=${currentStart}`;

      const response = await fetch(searchUrl);
      const data = await response.json();

      if (!response.ok) {
        console.error("Google API Error:", data);
        const errorMessage = data.error?.message || "Google API request failed";
        const errorDetails = data.error?.errors ? JSON.stringify(data.error.errors) : "";
        
        // Provide helpful message for referer errors
        if (errorMessage.includes("referer") || errorMessage.includes("referrer")) {
          throw new Error(
            `${errorMessage}. Please verify in Google Cloud Console that your API key's "Application restrictions" is set to "None" (not "HTTP referrers"). Changes may take up to 5 minutes to take effect.`
          );
        }
        
        throw new Error(`${errorMessage} ${errorDetails ? `- ${errorDetails}` : ""}`);
      }

      // Find the ranking for the site in this page of results
      const items = data.items || [];
      
      for (let i = 0; i < items.length; i++) {
        const itemUrl = items[i].link;
        const normalizedItemUrl = itemUrl
          .replace(/^https?:\/\//, "")
          .replace(/^www\./, "")
          .split("/")[0];

        if (normalizedItemUrl === normalizedSiteUrl) {
          ranking = totalChecked + i + 1; // Calculate absolute position
          break;
        }
      }

      totalChecked += items.length;

      // Check if there are more results available
      const totalResults = data.searchInformation?.totalResults ? parseInt(data.searchInformation.totalResults) : 0;
      if (items.length < resultsPerPage || totalChecked >= totalResults || totalChecked >= maxResultsToCheck) {
        break; // No more results
      }

      currentStart += resultsPerPage;
    }

    // Save rank check to database
    let rankCheck;
    try {
      rankCheck = await prisma.rankCheck.create({
        data: {
          keyword,
          postId: postId || null,
          siteUrl: normalizedSiteUrl,
          ranking,
          checkedAt: new Date(),
        },
        include: {
          post: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      });
    } catch (dbError: any) {
      console.error("Database error saving rank check:", dbError);
      // Still return the ranking result even if DB save fails
      return secureResponse({
        success: true,
        rankCheck: {
          keyword,
          siteUrl: normalizedSiteUrl,
          ranking,
          checkedAt: new Date().toISOString(),
        },
        message: ranking
          ? `Found at position ${ranking} (but failed to save to database)`
          : `Not found in top 100 results (but failed to save to database)`,
        warning: dbError.message || "Failed to save rank check to database",
      });
    }

    return secureResponse({
      success: true,
      rankCheck,
      message: ranking
        ? `Found at position ${ranking}`
        : `Not found in top 100 results`,
    });
  } catch (error: any) {
    console.error("Rank check error:", error);
    // Log more details for debugging
    if (error.message) {
      console.error("Error message:", error.message);
    }
    if (error.stack) {
      console.error("Error stack:", error.stack);
    }
    return secureResponse(
      { 
        error: error.message || "Failed to check ranking",
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      500
    );
  }
}

// DELETE - Delete a rank check
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return secureResponse({ error: "Unauthorized" }, 401);
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return secureResponse({ error: "Rank check ID is required" }, 400);
    }

    await prisma.rankCheck.delete({
      where: { id },
    });

    return secureResponse({ success: true, message: "Rank check deleted" });
  } catch (error: any) {
    return secureResponse(
      { error: error.message || "Failed to delete rank check" },
      500
    );
  }
}

