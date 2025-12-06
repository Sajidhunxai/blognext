import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("postId");
  const approved = searchParams.get("approved");

  try {
    const where: any = {};
    
    if (postId) {
      where.postId = postId;
    }

    // Only show approved comments to non-admins
    if (!session || session.user.role !== "admin") {
      where.approved = true;
    } else if (approved !== null) {
      where.approved = approved === "true";
    }

    const comments = await prisma.comment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        post: {
          select: {
            title: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(comments);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const settings = await getSettings();
    
    if (!settings.enableComments) {
      return NextResponse.json(
        { error: "Comments are disabled" },
        { status: 403 }
      );
    }

    const { postId, authorName, authorEmail, authorWebsite, content } = await req.json();

    if (!postId || !authorName || !authorEmail || !content) {
      return NextResponse.json(
        { error: "Post ID, name, email, and content are required" },
        { status: 400 }
      );
    }

    // Check if post exists and allows comments
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { allowComments: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (!post.allowComments) {
      return NextResponse.json(
        { error: "Comments are disabled for this post" },
        { status: 403 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        authorName,
        authorEmail,
        authorWebsite,
        content,
        approved: false, // Requires admin approval
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create comment" },
      { status: 500 }
    );
  }
}

