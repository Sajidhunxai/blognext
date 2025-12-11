import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Get all redirects (admin only) or check a specific redirect
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");

  // If checking a specific redirect, allow public access
  if (from) {
    try {
      if (!prisma || !('redirect' in prisma)) {
        return NextResponse.json({ redirect: null });
      }

      const redirect = await (prisma as any).redirect.findFirst({
        where: {
          from: from,
          active: true,
        },
      });

      if (redirect) {
        return NextResponse.json({
          redirect: {
            to: redirect.to,
            type: redirect.type,
          },
        });
      }

      return NextResponse.json({ redirect: null });
    } catch (error: any) {
      console.error("Error checking redirect:", error);
      return NextResponse.json({ redirect: null });
    }
  }

  // Otherwise, require admin authentication
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (!prisma || !('redirect' in prisma)) {
      return NextResponse.json(
        { error: "Redirect model not found. Please run 'npx prisma generate' and restart the server." },
        { status: 500 }
      );
    }

    const redirects = await (prisma as any).redirect.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(redirects);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch redirects" },
      { status: 500 }
    );
  }
}

// POST - Create a new redirect (admin only)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (!prisma || !('redirect' in prisma)) {
      return NextResponse.json(
        { error: "Redirect model not found. Please run 'npx prisma generate' and restart the server." },
        { status: 500 }
      );
    }

    const { from, to, type, active } = await req.json();

    if (!from || !to) {
      return NextResponse.json(
        { error: "From and To are required" },
        { status: 400 }
      );
    }

    // Normalize the "from" path
    const normalizedFrom = from.startsWith("/") ? from : `/${from}`;

    // Check if redirect already exists
    const existingRedirect = await (prisma as any).redirect.findUnique({
      where: { from: normalizedFrom },
    });

    if (existingRedirect) {
      return NextResponse.json(
        { error: "A redirect with this 'from' path already exists" },
        { status: 400 }
      );
    }

    const redirect = await (prisma as any).redirect.create({
      data: {
        from: normalizedFrom,
        to,
        type: type || 301,
        active: active !== undefined ? active : true,
      },
    });

    return NextResponse.json(redirect, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create redirect" },
      { status: 500 }
    );
  }
}

