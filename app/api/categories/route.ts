import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    if (!prisma) {
      return NextResponse.json(
        { error: "Prisma client not initialized" },
        { status: 500 }
      );
    }

    // Check if Category model exists
    if (!('category' in prisma)) {
      console.error("Category model not found. Run: npx prisma generate && restart server");
      return NextResponse.json(
        { 
          error: "Category model not found in Prisma Client. Please run 'npx prisma generate' and restart the dev server.",
        },
        { status: 500 }
      );
    }

    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });
    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (!prisma) {
      return NextResponse.json(
        { error: "Prisma client not initialized" },
        { status: 500 }
      );
    }

    // Check if Category model exists
    if (!('category' in prisma)) {
      console.error("Category model not found. Run: npx prisma generate && restart server");
      return NextResponse.json(
        { 
          error: "Category model not found in Prisma Client. Please run 'npx prisma generate' and restart the dev server.",
        },
        { status: 500 }
      );
    }

    const { name, slug, description, featured } = await req.json();

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        featured: featured || false,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create category" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (!prisma) {
      return NextResponse.json(
        { error: "Prisma client not initialized" },
        { status: 500 }
      );
    }

    if (!('category' in prisma)) {
      return NextResponse.json(
        { error: "Category model not found in Prisma Client." },
        { status: 500 }
      );
    }

    const { id, name, slug, description, featured } = await req.json();

    if (!id || !name || !slug) {
      return NextResponse.json(
        { error: "ID, name, and slug are required" },
        { status: 400 }
      );
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        featured: featured !== undefined ? featured : false,
      },
    });

    return NextResponse.json(category);
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (!prisma) {
      return NextResponse.json(
        { error: "Prisma client not initialized" },
        { status: 500 }
      );
    }

    if (!('category' in prisma)) {
      return NextResponse.json(
        { error: "Category model not found in Prisma Client." },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    // Check if category has posts
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    if (category._count.posts > 0) {
      return NextResponse.json(
        { error: `Cannot delete category with ${category._count.posts} post(s). Please remove or reassign posts first.` },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Category deleted successfully" });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to delete category" },
      { status: 500 }
    );
  }
}

