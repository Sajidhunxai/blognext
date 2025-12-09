import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { secureResponse } from "@/lib/api-security";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return secureResponse({ error: "Unauthorized" }, 401);
  }

  try {
    const {
      title,
      content,
      slug,
      published,
      metaTitle,
      metaDescription,
      featuredImage,
      featuredImageAlt,
    } = await req.json();

    if (!title || !content || !slug) {
      return secureResponse(
        { error: "Title, content, and slug are required" },
        400
      );
    }

    // Check if slug already exists for a different page
    const existingPage = await prisma.page.findUnique({
      where: { slug },
    });

    if (existingPage && existingPage.id !== params.id) {
      return secureResponse(
        { error: "A page with this slug already exists" },
        400
      );
    }

    const page = await prisma.page.update({
      where: { id: params.id },
      data: {
        title,
        content,
        slug,
        published: published || false,
        metaTitle: metaTitle || title,
        metaDescription,
        featuredImage,
        featuredImageAlt,
      },
    });

    return secureResponse(page);
  } catch (error: any) {
    return secureResponse(
      { error: error.message || "Failed to update page" },
      500
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return secureResponse({ error: "Unauthorized" }, 401);
  }

  try {
    await prisma.page.delete({
      where: { id: params.id },
    });

    return secureResponse({ success: true });
  } catch (error: any) {
    return secureResponse(
      { error: error.message || "Failed to delete page" },
      500
    );
  }
}

