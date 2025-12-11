import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT - Update a redirect (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if another redirect with this "from" path exists
    const existingRedirect = await (prisma as any).redirect.findUnique({
      where: { from: normalizedFrom },
    });

    if (existingRedirect && existingRedirect.id !== params.id) {
      return NextResponse.json(
        { error: "A redirect with this 'from' path already exists" },
        { status: 400 }
      );
    }

    const redirect = await (prisma as any).redirect.update({
      where: { id: params.id },
      data: {
        from: normalizedFrom,
        to,
        type: type !== undefined ? type : 301,
        active: active !== undefined ? active : true,
      },
    });

    return NextResponse.json(redirect);
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Redirect not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to update redirect" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a redirect (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    await (prisma as any).redirect.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Redirect not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to delete redirect" },
      { status: 500 }
    );
  }
}

