import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const pages = await prisma.page.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(pages);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch pages" },
      { status: 500 }
    );
  }
}

