import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { secureResponse } from "@/lib/api-security";

export const dynamic = 'force-dynamic';

// DELETE - Bulk delete posts
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return secureResponse({ error: "Unauthorized" }, 401);
  }

  try {
    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return secureResponse(
        { error: "Post IDs array is required" },
        400
      );
    }

    // Validate all IDs are strings
    const validIds = ids.filter((id: any) => typeof id === "string" && id.length > 0);

    if (validIds.length === 0) {
      return secureResponse(
        { error: "No valid post IDs provided" },
        400
      );
    }

    // Delete all posts
    const result = await prisma.post.deleteMany({
      where: {
        id: {
          in: validIds,
        },
      },
    });

    return secureResponse({
      success: true,
      message: `Deleted ${result.count} post${result.count !== 1 ? "s" : ""} successfully`,
      deletedCount: result.count,
    });
  } catch (error: any) {
    console.error("Bulk delete error:", error);
    return secureResponse(
      { error: error.message || "Failed to delete posts" },
      500
    );
  }
}
